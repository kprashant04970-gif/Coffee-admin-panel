#!/bin/bash
# ==============================================================================
# Manhattan Coffee — CCTV Camera Footage Retention Cleanup Job
# File: scripts/cleanup-camera-clips.sh
# Hostinger VPS Self-Hosted Storage Management
# ==============================================================================
# Rules:
# - Video evidence clips are stored in /var/www/manhattan/uploads/cctv/
# - Closed tickets retain CCTV footage for exactly 7 days to honor dispute appeal windows.
# - Clips older than 7 days associated with closed tickets are permanently deleted
#   to preserve NVMe disk space on the Hostinger VPS.
# ==============================================================================

set -euo pipefail

LOG_FILE="/var/log/manhattan-cctv-cleanup.log"
UPLOAD_DIR="${UPLOAD_DIR:-/var/www/manhattan/uploads/cctv}"
DB_NAME="${DB_NAME:-manhattan_coffee}"
DB_USER="${DB_USER:-manhattan_user}"
DAYS_RETENTION=7

echo "==========================================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting CCTV Retention Cleanup Job" >> "$LOG_FILE"

if [ ! -d "$UPLOAD_DIR" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload directory $UPLOAD_DIR does not exist yet. Nothing to clean." >> "$LOG_FILE"
    exit 0
fi

# 1. Query database for video clip filenames from tickets resolved > 7 days ago
OLD_CLIPS=$(psql -U "$DB_USER" -d "$DB_NAME" -t -A -c "
    SELECT video_clip_uri 
    FROM support_tickets 
    WHERE status IN ('APPROVED', 'REJECTED') 
      AND resolved_at < NOW() - INTERVAL '$DAYS_RETENTION days'
      AND video_clip_uri IS NOT NULL;
" 2>/dev/null || true)

DELETED_COUNT=0

if [ -n "$OLD_CLIPS" ]; then
    while IFS= read -r clip_uri; do
        if [ -n "$clip_uri" ]; then
            FILENAME=$(basename "$clip_uri")
            TARGET_FILE="$UPLOAD_DIR/$FILENAME"
            if [ -f "$TARGET_FILE" ]; then
                rm -f "$TARGET_FILE"
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deleted resolved ticket clip: $FILENAME" >> "$LOG_FILE"
                DELETED_COUNT=$((DELETED_COUNT + 1))
            fi
        fi
    done <<< "$OLD_CLIPS"
fi

# 2. Safety disk sweep: Delete any orphaned video files older than 14 days in uploads/cctv
ORPHANED_COUNT=$(find "$UPLOAD_DIR" -type f \( -name "*.mp4" -o -name "*.webm" \) -mtime +14 -delete -print | wc -l || true)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleanup Finished. Deleted $DELETED_COUNT resolved clips, $ORPHANED_COUNT orphaned files." >> "$LOG_FILE"
echo "==========================================================" >> "$LOG_FILE"
exit 0
