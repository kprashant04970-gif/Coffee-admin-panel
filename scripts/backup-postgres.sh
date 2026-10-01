#!/bin/bash
# ==============================================================================
# Manhattan Coffee — Automated PostgreSQL Backup & Retention Policy
# File: scripts/backup-postgres.sh
# Hostinger VPS Self-Hosted Database Protection
# ==============================================================================
# Strategy:
# - Daily Backups: Full pg_dump gzipped daily, retained for 7 days.
# - Weekly Backups: Full pg_dump every Sunday, retained for 4 weeks (28 days).
# ==============================================================================

set -euo pipefail

# Configuration
DB_NAME="${DB_NAME:-manhattan_coffee}"
DB_USER="${DB_USER:-manhattan_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/postgresql/manhattan}"
DAILY_DIR="$BACKUP_ROOT/daily"
WEEKLY_DIR="$BACKUP_ROOT/weekly"
LOG_FILE="/var/log/manhattan-db-backup.log"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DAY_OF_WEEK=$(date +%u) # 1 = Mon, 7 = Sun

# Ensure directories exist
mkdir -p "$DAILY_DIR"
mkdir -p "$WEEKLY_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "==========================================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting PostgreSQL Dump for '$DB_NAME'" >> "$LOG_FILE"

DAILY_FILE="$DAILY_DIR/manhattan_${TIMESTAMP}.sql.gz"

# 1. Execute Daily Backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip -9 > "$DAILY_FILE"; then
    FILE_SIZE=$(du -h "$DAILY_FILE" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Daily backup successful: $DAILY_FILE ($FILE_SIZE)" >> "$LOG_FILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: pg_dump failed!" >> "$LOG_FILE"
    exit 1
fi

# 2. Check if today is Sunday (Day 7) for Weekly Retention
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    WEEKLY_FILE="$WEEKLY_DIR/manhattan_weekly_${TIMESTAMP}.sql.gz"
    cp "$DAILY_FILE" "$WEEKLY_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Created weekly snapshot: $WEEKLY_FILE" >> "$LOG_FILE"
fi

# 3. Retention Cleanup: Keep 7 daily backups
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruning daily backups older than 7 days..." >> "$LOG_FILE"
find "$DAILY_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

# 4. Retention Cleanup: Keep 4 weekly backups (28 days)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruning weekly backups older than 28 days..." >> "$LOG_FILE"
find "$WEEKLY_DIR" -type f -name "*.sql.gz" -mtime +28 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup & Retention Cycle Completed Successfully." >> "$LOG_FILE"
echo "==========================================================" >> "$LOG_FILE"

exit 0
