# Manhattan Coffee Admin Panel — Self-Hosted VPS Deployment Guide

This guide details the complete deployment process for running the **Manhattan Coffee Admin Panel** entirely on a single **Hostinger VPS** (or any Ubuntu 22.04/24.04 LTS instance). 

This setup has **zero dependency on Supabase Pro** or any third-party cloud database. It uses native **PostgreSQL**, **local NVMe storage**, **custom cryptographic JWT authentication with MFA/OTP**, **PM2 process clustering**, and **Nginx reverse proxy with automated SSL**.

---

## 1. System Architecture

| Component | Technology | Purpose |
|---|---|---|
| **Operating System** | Ubuntu 22.04 or 24.04 LTS | Hostinger VPS Base OS |
| **Runtime** | Node.js 20 LTS + Next.js 15 App Router | Full-stack Admin Application |
| **Process Manager**| PM2 (Cluster Mode) | Zero-downtime restarts, auto-healing |
| **Database** | PostgreSQL 16 (Native `pg.Pool`) | Local relational storage & JSONB audit logs |
| **Reverse Proxy** | Nginx with HTTP/2 & Gzip | SSL termination, static cache, rate-limiting |
| **File Storage** | Local Disk (`/var/www/manhattan/uploads`) | CCTV video clips, dispute footage, banners |
| **Security & Auth** | HS256 JWT + MFA/OTP + HTTP-Only Cookies | Self-hosted session validation |
| **SSL / TLS** | Let's Encrypt (Certbot) | Automated A+ SSL renewal |

---

## 2. Environment Variables Configuration

Create `/var/www/manhattan/app/.env.production`:

```env
# Node Environment
NODE_ENV=production
PORT=3000

# PostgreSQL Self-Hosted Connection String
DATABASE_URL=postgresql://manhattan_user:manhattan_secure_pass@localhost:5432/manhattan_coffee

# Cryptographic Master JWT Secret (HS256)
JWT_SECRET=c8f8b03e4812a64c5188bf28198f24419ad24f796c3426e25dc9fa6bb2dc8e84

# Local VPS Storage Directory
UPLOAD_DIR=/var/www/manhattan/uploads

# Cron / Automation Secret
CRON_SECRET=internal_super_secure_cron_secret_2026
```

---

## 3. Database Setup (PostgreSQL)

Run the following commands on your VPS terminal:

```bash
# 1. Access PostgreSQL as superuser
sudo -u postgres psql

# 2. Create database user and database
CREATE USER manhattan_user WITH ENCRYPTED PASSWORD 'manhattan_secure_pass';
CREATE DATABASE manhattan_coffee OWNER manhattan_user;
GRANT ALL PRIVILEGES ON DATABASE manhattan_coffee TO manhattan_user;
\q

# 3. Initialize tables, schemas, and seeds
sudo -u postgres psql -d manhattan_coffee -f /var/www/manhattan/app/scripts/init-db.sql
```

---

## 4. Firewall Setup (UFW)

Protect your VPS by restricting open ports to SSH, HTTP, and HTTPS:

```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow standard web and management ports
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

*Note: PostgreSQL port `5432` remains bound only to `localhost` (`127.0.0.1`) and is NOT exposed publicly.*

---

## 5. Nginx Reverse Proxy & SSL Setup

### Step 5.1: Copy Nginx Config
```bash
sudo cp /var/www/manhattan/app/nginx/manhattan.conf /etc/nginx/sites-available/manhattan.conf
sudo ln -sf /etc/nginx/sites-available/manhattan.conf /etc/nginx/sites-enabled/manhattan.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5.2: Issue Free Let's Encrypt SSL via Certbot
```bash
# Obtain and install SSL certificate automatically
sudo certbot --nginx -d admin.manhattancoffee.in

# Verify automated renewal timer
sudo systemctl status certbot.timer
```

---

## 6. PM2 Process Manager Setup

PM2 ensures the Next.js production build runs across all CPU cores in cluster mode with automatic restart on crash or server reboot:

```bash
cd /var/www/manhattan/app

# Build Next.js
npm run build

# Start cluster
pm2 start ecosystem.config.js --env production

# Save process list and register startup service
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u www-data --hp /var/www
```

---

## 7. Automated Cron Jobs (Backups & Retention)

Edit the root crontab using `sudo crontab -e` and add the following two tasks:

```crontab
# 1. Daily PostgreSQL Full Backup at 02:00 AM (Retains 7 daily + 4 weekly archives)
0 2 * * * /bin/bash /var/www/manhattan/app/scripts/backup-postgres.sh >> /var/log/manhattan-db-backup.log 2>&1

# 2. Daily CCTV Camera Clip Retention Cleanup at 03:30 AM (Deletes clips 7 days after dispute resolution)
30 3 * * * /bin/bash /var/www/manhattan/app/scripts/cleanup-camera-clips.sh >> /var/log/manhattan-cctv-cleanup.log 2>&1
```

---

## 8. Verifying Your Deployment

1. **Check Database Health:**
   ```bash
   curl -s http://127.0.0.1:3000/api/live/dashboard | jq
   ```
2. **Check Machine Telemetry:**
   ```bash
   curl -s http://127.0.0.1:3000/api/live/machines | jq
   ```
3. **Check Backup Execution:**
   ```bash
   sudo /bin/bash /var/www/manhattan/app/scripts/backup-postgres.sh
   ls -lh /var/backups/postgresql/manhattan/daily/
   ```
4. **Inspect PM2 Logs:**
   ```bash
   pm2 status
   pm2 logs manhattan-admin --lines 50
   ```
