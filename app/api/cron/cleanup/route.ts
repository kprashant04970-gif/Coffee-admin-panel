import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db/client';

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === 'production'
    ? '/var/www/manhattan/uploads'
    : path.join(process.cwd(), 'uploads'));

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'manhattan_internal_cron_secret';

  // Guard cron endpoint
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  const cctvDir = path.join(UPLOAD_DIR, 'cctv');
  let deletedCount = 0;

  try {
    // 1. Query PostgreSQL for closed tickets resolved > 7 days ago
    const res = await query<{ video_clip_uri: string }>(
      `SELECT video_clip_uri 
       FROM support_tickets 
       WHERE status IN ('APPROVED', 'REJECTED') 
         AND resolved_at < NOW() - INTERVAL '7 days'
         AND video_clip_uri IS NOT NULL`
    );

    for (const row of res.rows) {
      if (row.video_clip_uri) {
        const filename = path.basename(row.video_clip_uri);
        const targetPath = path.join(cctvDir, filename);
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
          deletedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedClipsCount: deletedCount,
      timestamp: new Date().toISOString(),
      message: 'Automated 7-day retention cleanup executed.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Cleanup error' }, { status: 500 });
  }
}
