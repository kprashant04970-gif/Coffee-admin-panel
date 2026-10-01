#!/bin/bash
# ==============================================================================
# Manhattan Coffee Admin Panel — Complete Hostinger VPS Deployment Script
# File: scripts/deploy.sh
# Target OS: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "☕ Starting Manhattan Coffee VPS Deployment Setup"
echo "=========================================================="

APP_DIR="/var/www/manhattan/app"
UPLOAD_DIR="/var/www/manhattan/uploads"
BACKUP_DIR="/var/backups/postgresql/manhattan"
DB_NAME="manhattan_coffee"
DB_USER="manhattan_user"
DB_PASS="manhattan_secure_pass"

# 1. Update OS & Install Core Dependencies
echo "📦 Step 1: Installing System Dependencies (PostgreSQL, Nginx, Node.js 20, PM2)..."
sudo apt-get update -y
sudo apt-get install -y curl git build-essential nginx postgresql postgresql-contrib ufw certbot python3-certbot-nginx

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
sudo npm install -g pm2

# 2. Configure UFW Firewall
echo "🛡️ Step 2: Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 3. Setup PostgreSQL Database & User
echo "🐘 Step 3: Setting up PostgreSQL Database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Run Schema Initialization
echo "🗄️ Initializing tables and initial seeds..."
sudo -u postgres psql -d "$DB_NAME" -f "$APP_DIR/scripts/init-db.sql" || true

# 4. Create Directories & Permissions
echo "📁 Step 4: Creating Directories & Setting Permissions..."
sudo mkdir -p "$UPLOAD_DIR/cctv"
sudo mkdir -p "$UPLOAD_DIR/banners"
sudo mkdir -p "$BACKUP_DIR/daily"
sudo mkdir -p "$BACKUP_DIR/weekly"
sudo mkdir -p /var/log/pm2

sudo chown -R www-data:www-data /var/www/manhattan
sudo chmod -R 775 "$UPLOAD_DIR"

# 5. Build Next.js Application
echo "🏗️ Step 5: Building Next.js Application..."
cd "$APP_DIR"
npm install --production=false
npm run build

# 6. Setup PM2 Process Manager
echo "🚀 Step 6: Launching Application with PM2..."
pm2 delete manhattan-admin 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | sudo bash || true

# 7. Configure Nginx
echo "🌐 Step 7: Configuring Nginx Reverse Proxy..."
sudo cp "$APP_DIR/nginx/manhattan.conf" /etc/nginx/sites-available/manhattan.conf
sudo ln -sf /etc/nginx/sites-available/manhattan.conf /etc/nginx/sites-enabled/manhattan.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 8. Setup Automated Cron Jobs (Backups & 7-day CCTV cleanup)
echo "⏰ Step 8: Configuring Automated Cron Jobs..."
CRON_JOB_FILE="/tmp/manhattan_cron"
crontab -l 2>/dev/null > "$CRON_JOB_FILE" || true

# Add Daily Database Backup at 02:00 AM if not already registered
if ! grep -q "backup-postgres.sh" "$CRON_JOB_FILE"; then
    echo "0 2 * * * /bin/bash $APP_DIR/scripts/backup-postgres.sh >> /var/log/manhattan-db-backup.log 2>&1" >> "$CRON_JOB_FILE"
fi

# Add Daily CCTV Footage Cleanup at 03:30 AM if not already registered
if ! grep -q "cleanup-camera-clips.sh" "$CRON_JOB_FILE"; then
    echo "30 3 * * * /bin/bash $APP_DIR/scripts/cleanup-camera-clips.sh >> /var/log/manhattan-cctv-cleanup.log 2>&1" >> "$CRON_JOB_FILE"
fi

crontab "$CRON_JOB_FILE"
rm -f "$CRON_JOB_FILE"

echo "=========================================================="
echo "✅ Manhattan Coffee VPS Deployment Completed Successfully!"
echo "➡️ Application running on http://127.0.0.1:3000 via PM2"
echo "➡️ Nginx reverse proxy active on Ports 80 & 443"
echo "➡️ Automated backups scheduled daily at 02:00 AM"
echo "=========================================================="
