#!/bin/bash
# ==============================================================================
# PDHPSYCO Database & Application Automated Backup Script
# Pluak Daeng Hospital (โรงพยาบาลปลวกแดง)
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/pdhpsyco"
DATE=$(date +'%Y%m%d_%H%M%S')
DAYS_TO_KEEP=30

# Read database credentials from environment or config
DB_NAME=${DB_NAME:-"pdhpsyco"}
DB_USER=${DB_USER:-"pdh_user"}
DB_PASS=${DB_PASS:-""}
DB_HOST=${DB_HOST:-"127.0.0.1"}

mkdir -p "${BACKUP_DIR}/db"
mkdir -p "${BACKUP_DIR}/logs"

echo "[$(date)] Starting PDHPSYCO database backup..."

# 1. MySQL Dump with gzip compression
if [ -n "$DB_PASS" ]; then
  mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" --single-transaction --routines --triggers "${DB_NAME}" | gzip > "${BACKUP_DIR}/db/db_backup_${DATE}.sql.gz"
else
  mysqldump -h "${DB_HOST}" -u "${DB_USER}" --single-transaction --routines --triggers "${DB_NAME}" | gzip > "${BACKUP_DIR}/db/db_backup_${DATE}.sql.gz"
fi

# Set strict permissions (readable only by root)
chmod 600 "${BACKUP_DIR}/db/db_backup_${DATE}.sql.gz"
echo "[$(date)] Database backup completed: ${BACKUP_DIR}/db/db_backup_${DATE}.sql.gz"

# 2. Cleanup old backups (older than 30 days)
find "${BACKUP_DIR}/db" -type f -name "*.sql.gz" -mtime +${DAYS_TO_KEEP} -delete
echo "[$(date)] Cleaned up backups older than ${DAYS_TO_KEEP} days."
echo "[$(date)] Backup process finished successfully."
