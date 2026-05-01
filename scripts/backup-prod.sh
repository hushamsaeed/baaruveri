#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-/opt/baaruveri/backups}
RETENTION_DAYS=${RETENTION_DAYS:-14}
CONTAINER=${CONTAINER:-baaruveri-postgres}
DB_NAME=${DB_NAME:-baaruveri}
DB_USER=${DB_USER:-baaruveri}

mkdir -p "$BACKUP_DIR"

stamp=$(date +%Y-%m-%d_%H%M%S)
out="$BACKUP_DIR/baaruveri_${stamp}.sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges \
  | gzip -9 > "$out"

# Sanity-check the dump isn't empty (gzip header alone is ~20 bytes).
size=$(wc -c < "$out")
if [ "$size" -lt 1024 ]; then
  echo "backup-prod: dump $out is suspiciously small ($size bytes); aborting rotation" >&2
  exit 1
fi

find "$BACKUP_DIR" -maxdepth 1 -type f -name 'baaruveri_*.sql.gz' -mtime +"$RETENTION_DAYS" -print -delete

echo "backup-prod: $(basename "$out") ($(numfmt --to=iec --suffix=B "$size" 2>/dev/null || echo "${size} bytes"))"
