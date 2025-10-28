# Getting Started with Royal Trading Academy Backend

## Overview

This is a NestJS backend API for the Royal Trading Academy e-learning platform with PostgreSQL database.

## Quick Setup (3 Steps)

### Step 1: Set Up PostgreSQL

Choose ONE option:

**Option A: Docker (Easiest)**
```bash
docker-compose up -d
```

**Option B: Local Installation**
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
- Mac: `brew install postgresql@14`
- Linux: `sudo apt install postgresql`

**Option C: Cloud (Production)**
- Railway, Heroku, DigitalOcean, AWS RDS, etc.

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed instructions.

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your favorite editor
```

Update these values:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=royal_trading_academy
```

### Step 3: Run the Application

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

You should see:
```
[Nest] LOG [NestApplication] Nest application successfully started
```

Visit: http://localhost:3000

## What's Included

### Features
- ✅ User authentication (JWT)
- ✅ Role-based access control
- ✅ Course management
- ✅ Student enrollments
- ✅ Progress tracking
- ✅ Forum system
- ✅ Payment processing (Stripe)
- ✅ File uploads
- ✅ Email notifications

### Tech Stack
- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Auth**: JWT + Passport
- **Validation**: class-validator
- **Payments**: Stripe

## Project Structure

```
royal-trading-academy-backend/
├── src/
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── courses/        # Course management
│   ├── lessons/        # Lesson management
│   ├── enrollments/    # Student enrollments
│   ├── progress/       # Progress tracking
│   ├── forum/          # Forum system
│   ├── payments/       # Payment processing
│   ├── common/         # Shared utilities
│   └── config/         # Configuration files
├── uploads/            # File uploads directory
├── .env                # Environment variables
└── package.json        # Dependencies
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (Instructor/Admin)
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Enrollments
- `POST /enrollments` - Enroll in course
- `GET /enrollments/user/:userId` - Get user enrollments

### Forum
- `GET /forum/categories` - List categories
- `GET /forum/threads` - List threads
- `POST /forum/threads` - Create thread
- `POST /forum/posts` - Create post

See full API documentation in [README.md](./README.md)

## Development

### Run in Development Mode
```bash
npm run start:dev
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
npm start
```

## Database Management

### View Database
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **Command line**: `psql -U postgres -d royal_trading_academy`

### Backup Database
```bash
pg_dump -U postgres royal_trading_academy > backup.sql
```

### Restore Database
```bash
psql -U postgres royal_trading_academy < backup.sql
```

## Deployment

### Railway (Recommended)
1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL database
4. Deploy

### Render
1. Connect GitHub repo
2. Add PostgreSQL database
3. Deploy

### Heroku
```bash
heroku create royal-trading-academy
heroku addons:create heroku-postgresql:mini
git push heroku main
```

See [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md) for details.

## Troubleshooting

### Can't connect to database
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check port 5432 is not blocked

### Port 3000 already in use
```bash
# Change port in .env
PORT=3001
```

### Database tables not created
- Check `synchronize: true` in `app.module.ts`
- Verify database exists
- Check TypeORM logs

## Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=royal_trading_academy

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

## Documentation

- **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Database setup (all options)
- **[SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md)** - Deployment guide
- **[README.md](./README.md)** - Full documentation
- **[AUTHENTICATION_FEATURES.md](./AUTHENTICATION_FEATURES.md)** - Auth features

## Support

### Common Issues
1. **Database connection failed** → Check PostgreSQL is running
2. **Port already in use** → Change PORT in .env
3. **Module not found** → Run `npm install`
4. **Build failed** → Delete `node_modules` and reinstall

### Get Help
- Check documentation files
- Review error logs
- Verify environment variables
- Test database connection

## Next Steps

1. ✅ Set up PostgreSQL
2. ✅ Configure `.env`
3. ✅ Run `npm start`
4. ✅ Test API endpoints
5. ✅ Deploy to production

Happy coding! 🚀
