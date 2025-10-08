# Royal Trading Academy Backend Setup

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and other configuration.

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE royal_trading_academy;
```

2. The application will automatically create tables when you start it in development mode (synchronize: true).

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- http://localhost:3000/api/docs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `DATABASE_PORT` | PostgreSQL port | 5432 |
| `DATABASE_USERNAME` | PostgreSQL username | postgres |
| `DATABASE_PASSWORD` | PostgreSQL password | password |
| `DATABASE_NAME` | Database name | royal_trading_academy |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 1d |
| `JWT_REFRESH_SECRET` | JWT refresh secret | (required) |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh expiration | 7d |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | CORS origin | http://localhost:4200 |

## Database Schema

The application includes the following entities:

### Core Entities
- **User**: User accounts with roles (student, instructor, admin)
- **Course**: Trading courses with metadata
- **Lesson**: Individual lessons within courses
- **LessonResource**: Downloadable resources for lessons

### Learning Management
- **Enrollment**: User course enrollments
- **Progress**: User progress tracking per lesson
- **CourseReview**: Course ratings and reviews

### Community Features
- **ForumCategory**: Discussion categories
- **ForumThread**: Discussion threads
- **ForumPost**: Individual forum posts

### Payment System
- **Payment**: Payment transactions and history

## Authentication

The API uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

## Authorization

Role-based access control with three roles:
- **Student**: Can enroll in courses, access content, participate in forums
- **Instructor**: Can create and manage courses, interact with students
- **Admin**: Full system access, user management, platform administration

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting with throttling
- Input validation and sanitization
- CORS protection
- Helmet security headers
- SQL injection prevention

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Notes

- The application uses TypeORM with PostgreSQL
- Swagger documentation is automatically generated
- All entities extend a BaseEntity with common fields (id, createdAt, updatedAt)
- Validation is handled with class-validator decorators
- The application follows NestJS best practices and conventions