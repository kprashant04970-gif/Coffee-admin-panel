/**
 * Manhattan Coffee Admin Console — PM2 Process Manager Configuration
 * Hostinger VPS Production Deployment
 */

module.exports = {
  apps: [
    {
      name: 'manhattan-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/manhattan/app',
      instances: 'max', // Multi-core cluster mode on VPS
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://manhattan_user:manhattan_secure_pass@localhost:5432/manhattan_coffee',
        JWT_SECRET: 'manhattan_coffee_vps_master_jwt_secret_2026_prod',
        UPLOAD_DIR: '/var/www/manhattan/uploads',
      },
      error_file: '/var/log/pm2/manhattan-error.log',
      out_file: '/var/log/pm2/manhattan-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
