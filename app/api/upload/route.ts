import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configurable upload directory (Default VPS production path: /var/www/manhattan/uploads)
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === 'production'
    ? '/var/www/manhattan/uploads'
    : path.join(process.cwd(), 'uploads'));

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form-data' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, WEBP, MP4, PDF` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum limit of 50MB (size: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const targetDir = path.join(UPLOAD_DIR, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate safe randomized filename
    const ext = path.extname(file.name).toLowerCase() || '.bin';
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeFilename = `${category}_${timestamp}_${randomHex}${ext}`;
    const destinationPath = path.join(targetDir, safeFilename);

    // Write file buffer to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(destinationPath, buffer);

    console.log(`[VPS Storage] File saved locally: ${destinationPath} (${buffer.length} bytes)`);

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      category,
      size: file.size,
      mimeType: file.type,
      url: `/api/files/${category}/${safeFilename}`,
      localPath: destinationPath,
      message: 'File stored locally on Hostinger VPS disk.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
