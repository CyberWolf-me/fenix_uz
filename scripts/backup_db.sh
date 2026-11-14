#!/bin/bash
set -euo pipefail

# Directory where backups are archived
BACKUP_DIR="/var/backups/fenix"
mkdir -p "$BACKUP_DIR"

# Resolve database path (relative to repo root or standard deployment directory)
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${REPO_DIR}/bot/fenix_restaurant.db"

if [ ! -f "$DB_PATH" ]; then
  # Fallback to standard production path if running from an external cron job
  DB_PATH="/var/www/fenix/bot/fenix_restaurant.db"
fi

if [ ! -f "$DB_PATH" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Error: Database file not found at $DB_PATH" >&2
  exit 1
fi

TIMESTAMP="$(date +%F_%H%M)"
BACKUP_FILE="${BACKUP_DIR}/fenix_restaurant_${TIMESTAMP}.db"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Creating SQLite backup: $BACKUP_FILE from $DB_PATH"
# Using sqlite3 .backup is atomic and safe with WAL mode enabled
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Verify backup was created and has non-zero size
if [ -s "$BACKUP_FILE" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created successfully ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Error: Backup file is empty or missing" >&2
  exit 1
fi

# Retention policy: Prune backups older than 14 days
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruning backups older than 14 days in $BACKUP_DIR"
find "$BACKUP_DIR" -name "fenix_restaurant_*.db" -mtime +14 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup procedure completed."
