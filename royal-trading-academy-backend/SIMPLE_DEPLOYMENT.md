# Simple Deployment Guide (No Docker/Redis)

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Development**
   ```bash
   npm run start:dev
   ```

## Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

1. **Server Setup**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd royal-trading-academy-backend
   
   # Install dependencies
   npm ci --production
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start dist/main.js --name "royal-trading-academy"
   pm2 startup
   pm2 save
   ```

3. **Nginx Setup** (Optional - for reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Cloud Platforms

#### Heroku
1. Create `Procfile`:
   ```
   web: node dist/main.js
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Railway/Render
- Connect your GitHub repository
- Set build command: `npm run build`
- Set start command: `node dist/main.js`

## Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_NAME=royal_trading_academy.db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Performance Optimizations (Without Redis)

1. **In-Memory Caching** - Already implemented with SimpleCacheService
2. **Database Indexing** - SQLite automatically creates indexes
3. **Gzip Compression** - Enable in production
4. **Static File Serving** - Use CDN or nginx for static assets

## Monitoring

1. **PM2 Monitoring**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Health Check Endpoint**
   - GET `/health` - Returns application status

## Backup Strategy

1. **Database Backup**
   ```bash
   # Copy SQLite database file
   cp royal_trading_academy.db backup_$(date +%Y%m%d).db
   ```

2. **Automated Backups**
   ```bash
   # Add to crontab
   0 2 * * * cp /path/to/royal_trading_academy.db /backups/backup_$(date +\%Y\%m\%d).db
   ```

## Scaling Considerations

- **Horizontal Scaling**: Use load balancer with multiple instances
- **Database**: Migrate to PostgreSQL when needed
- **Caching**: Add Redis when you have high traffic
- **File Storage**: Use cloud storage (AWS S3, Cloudinary) for uploads