# PostgreSQL Setup Guide

## Quick Setup Options

Choose the option that works best for you:

### Option 1: Local PostgreSQL (Development)
### Option 2: Docker PostgreSQL (Easy Development)
### Option 3: Cloud PostgreSQL (Production)

---

## Option 1: Local PostgreSQL Installation

### Windows

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer (version 14 or higher)
   - Run the installer

2. **During Installation**
   - Port: `5432` (default)
   - Password: Choose a strong password (remember this!)
   - Locale: Default

3. **Create Database**
   ```cmd
   # Open Command Prompt
   psql -U postgres
   # Enter your password
   
   CREATE DATABASE royal_trading_academy;
   \q
   ```

4. **Update .env**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your-password-here
   DATABASE_NAME=royal_trading_academy
   ```

### macOS

1. **Install with Homebrew**
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Create Database**
   ```bash
   psql postgres
   CREATE DATABASE royal_trading_academy;
   \q
   ```

3. **Update .env**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=
   DATABASE_NAME=royal_trading_academy
   ```

### Linux (Ubuntu/Debian)

1. **Install PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE royal_trading_academy;
   CREATE USER royal_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE royal_trading_academy TO royal_user;
   \q
   ```

3. **Update .env**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=royal_user
   DATABASE_PASSWORD=t7D&BNu5yqLD?rp
   DATABASE_NAME=royal_trading_academy
   ```

---

## Option 2: Docker PostgreSQL (Recommended for Development)

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))

### Setup

1. **Use the existing docker-compose.yml**
   ```bash
   cd royal-trading-academy-backend
   docker-compose up -d
   ```

2. **Verify it's running**
   ```bash
   docker ps
   ```

3. **Your .env is already configured!**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=password
   DATABASE_NAME=royal_trading_academy
   ```

4. **Stop when done**
   ```bash
   docker-compose down
   ```

### Docker Commands

```bash
# Start database
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop database
docker-compose down

# Stop and remove data
docker-compose down -v

# Access PostgreSQL shell
docker exec -it royal-trading-academy-backend-postgres-1 psql -U postgres -d royal_trading_academy
```

---

## Option 3: Cloud PostgreSQL (Production)

### A. Supabase (Free Tier Available)

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create new project

2. **Get Credentials**
   - Dashboard → Settings → Database
   - Copy connection details

3. **Update .env**
   ```env
   DATABASE_HOST=db.xxxxx.supabase.co
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your-supabase-password
   DATABASE_NAME=postgres
   ```

**Cost**: Free (500MB), Pro $25/month (8GB)

### B. Railway (Easy Deployment)

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Add PostgreSQL**
   - New Project → Add PostgreSQL
   - Copy connection details

3. **Update .env**
   ```env
   DATABASE_HOST=containers-us-west-xxx.railway.app
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=generated-password
   DATABASE_NAME=railway
   ```

**Cost**: $5/month credit (enough for small apps)

### C. Heroku Postgres

1. **Create Heroku App**
   ```bash
   heroku create royal-trading-academy
   heroku addons:create heroku-postgresql:mini
   ```

2. **Get Credentials**
   ```bash
   heroku config:get DATABASE_URL
   ```

3. **Parse URL and update .env**
   ```
   postgres://user:password@host:5432/database
   ```

**Cost**: Free (10k rows), Mini $5/month (10M rows)

### D. DigitalOcean Managed Database

1. **Create Database**
   - Go to [digitalocean.com](https://www.digitalocean.com)
   - Create → Databases → PostgreSQL

2. **Get Connection Details**
   - Copy from dashboard

3. **Update .env**
   ```env
   DATABASE_HOST=db-postgresql-xxx.ondigitalocean.com
   DATABASE_PORT=25060
   DATABASE_USERNAME=doadmin
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=defaultdb
   ```

**Cost**: $15/month (1GB RAM, 10GB storage)

### E. AWS RDS

1. **Create RDS Instance**
   - AWS Console → RDS → Create Database
   - Choose PostgreSQL
   - Free tier available

2. **Configure Security Group**
   - Allow inbound on port 5432

3. **Update .env**
   ```env
   DATABASE_HOST=xxx.rds.amazonaws.com
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=royal_trading_academy
   ```

**Cost**: Free tier (12 months), then ~$15/month

---

## Verify Connection

After setting up PostgreSQL, test the connection:

```bash
cd royal-trading-academy-backend
npm install
npm run build
npm start
```

You should see:
```
[Nest] LOG [NestApplication] Nest application successfully started
```

If you see database connection errors, check:
- PostgreSQL is running
- Credentials in `.env` are correct
- Port 5432 is not blocked by firewall
- Database exists

---

## Database Management Tools

### pgAdmin (GUI)
- Download: https://www.pgadmin.org/download/
- Connect using your database credentials
- Visual interface for managing database

### DBeaver (GUI)
- Download: https://dbeaver.io/download/
- Free, cross-platform
- Supports multiple databases

### psql (Command Line)
```bash
# Connect to database
psql -h localhost -U postgres -d royal_trading_academy

# Common commands
\l              # List databases
\dt             # List tables
\d users        # Describe users table
\q              # Quit
```

---

## Database Migrations

The app uses TypeORM with `synchronize: true` in development, which automatically creates/updates tables.

**For production**, disable synchronize and use migrations:

1. **Generate migration**
   ```bash
   npm run typeorm migration:generate -- -n InitialSchema
   ```

2. **Run migrations**
   ```bash
   npm run typeorm migration:run
   ```

3. **Revert migration**
   ```bash
   npm run typeorm migration:revert
   ```

---

## Backup & Restore

### Backup Database

```bash
# Local PostgreSQL
pg_dump -U postgres royal_trading_academy > backup.sql

# Docker
docker exec royal-trading-academy-backend-postgres-1 pg_dump -U postgres royal_trading_academy > backup.sql

# Cloud (with password)
PGPASSWORD=your-password pg_dump -h your-host -U postgres -d database_name > backup.sql
```

### Restore Database

```bash
# Local PostgreSQL
psql -U postgres royal_trading_academy < backup.sql

# Docker
docker exec -i royal-trading-academy-backend-postgres-1 psql -U postgres royal_trading_academy < backup.sql

# Cloud
PGPASSWORD=your-password psql -h your-host -U postgres -d database_name < backup.sql
```

---

## Troubleshooting

### Can't connect to database

1. **Check PostgreSQL is running**
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Docker
   docker ps
   ```

2. **Check credentials**
   - Verify `.env` file
   - Try connecting with psql

3. **Check firewall**
   ```bash
   # Linux
   sudo ufw allow 5432
   
   # Windows
   # Add rule in Windows Firewall
   ```

### Port 5432 already in use

```bash
# Find process using port
# Linux/Mac
sudo lsof -i :5432

# Windows
netstat -ano | findstr :5432

# Kill process or change port in .env
```

### Permission denied

```bash
# Linux - fix PostgreSQL permissions
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'new_password';
```

### Database doesn't exist

```bash
psql -U postgres
CREATE DATABASE royal_trading_academy;
\q
```

---

## Performance Optimization

### Add Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

### Connection Pooling

Already configured in `app.module.ts`:
```typescript
extra: {
  max: 20,  // Maximum connections
  min: 5,   // Minimum connections
  idle: 10000, // Idle timeout
}
```

### Monitor Performance

```sql
-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- View database size
SELECT pg_size_pretty(pg_database_size('royal_trading_academy'));

-- View table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Next Steps

1. ✅ Choose and set up PostgreSQL
2. ✅ Update `.env` with credentials
3. ✅ Run `npm start` to test connection
4. ✅ Database tables will be created automatically
5. ✅ Start developing!

For deployment, see `SIMPLE_DEPLOYMENT.md`
