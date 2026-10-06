#!/usr/bin/env bash
# Load a prod SQL dump (phpMyAdmin export) into the local XAMPP database.
# Usage: bash scripts/load-prod-db.sh db-backups/<dump>.sql
set -euo pipefail

DUMP="${1:?Usage: $0 <dump.sql>}"
MYSQL="${MYSQL:-/f/xampp/mysql/bin/mysql.exe}"
DB="${DB_NAME:-rto_tracker_local}"

# Drop any CREATE DATABASE / USE lines so the dump can never target another schema.
sed -E '/^(CREATE DATABASE|USE )/Id' "$DUMP" \
  | "$MYSQL" -u root --default-character-set=utf8mb4 "$DB"

"$MYSQL" -u root "$DB" -e "
  SELECT 'users' AS tbl, COUNT(*) AS n FROM users
  UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
  UNION ALL SELECT 'holidays',   COUNT(*) FROM holidays;"
