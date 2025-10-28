# Royal Trading Academy - Backend API

A comprehensive NestJS backend for the Royal Trading Academy e-learning platform with Supabase PostgreSQL database.

## 🚀 Quick Start

1. **Set up PostgreSQL** - See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
2. **Configure environment** - Copy `.env.example` to `.env`
3. **Install dependencies** - `npm install`
4. **Start the app** - `npm start`

## 📚 Documentation

- **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - Database setup guide
- **[SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md)** - Deployment options
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[AUTHENTICATION_FEATURES.md](./AUTHENTICATION_FEATURES.md)** - Authentication features

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **File Upload**: Multer
- **Payment**: Stripe
- **Email**: Nodemailer

## ✨ Features

- ✅ User authentication (register, login, JWT)
- ✅ Email verification
- ✅ Password reset
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ Course management (CRUD)
- ✅ Lesson management with resources
- ✅ Student enrollments
- ✅ Progress tracking
- ✅ Forum system (categories, threads, posts)
- ✅ Payment processing (Stripe)
- ✅ Promo codes
- ✅ File uploads
- ✅ Audit logging
- ✅ Rate limiting
- ✅ In-memory caching

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+ (local, Docker, or cloud)

## 🏃 Running the Application

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# PostgreSQL Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=royal_trading_academy

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email

### Users
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin)

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create course (Instructor/Admin)
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `POST /courses/:id/reviews` - Add review

### Enrollments
- `POST /enrollments` - Enroll in course
- `GET /enrollments/user/:userId` - Get user enrollments
- `GET /enrollments/course/:courseId` - Get course enrollments

### Forum
- `GET /forum/categories` - Get categories
- `POST /forum/categories` - Create category (Admin)
- `GET /forum/threads` - Get threads
- `POST /forum/threads` - Create thread
- `GET /forum/threads/:id` - Get thread
- `POST /forum/posts` - Create post
- `GET /forum/posts/thread/:id` - Get thread posts

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/promo-codes` - Create promo code (Admin)
- `POST /payments/validate-promo` - Validate promo code

## 🗄️ Database Schema

The application uses TypeORM with automatic schema synchronization in development.

### Main Entities
- **User** - User accounts with roles
- **Course** - Course information
- **Lesson** - Course lessons
- **Enrollment** - Student course enrollments
- **Progress** - Lesson completion tracking
- **ForumCategory** - Forum categories
- **ForumThread** - Forum threads
- **ForumPost** - Forum posts
- **Payment** - Payment records
- **PromoCode** - Promotional codes
- **AuditLog** - System audit logs

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention (TypeORM)
- XSS protection

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment

### Railway (Recommended)
1. Push code to GitHub
2. Connect repository to Railway
3. Add PostgreSQL database
4. Add environment variables
5. Deploy automatically

### Render
1. Connect GitHub repository
2. Add PostgreSQL database
3. Set build command: `npm install && npm run build`
4. Set start command: `node dist/main.js`
5. Add environment variables

### Heroku
```bash
heroku create royal-trading-academy-api
heroku addons:create heroku-postgresql:mini
git push heroku main
```

See [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md) for detailed instructions.

## 📊 Monitoring

- Use pgAdmin or DBeaver for database management
- Check API logs in deployment platform
- Monitor performance with PostgreSQL queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for database setup
- Review [SIMPLE_DEPLOYMENT.md](./SIMPLE_DEPLOYMENT.md) for deployment
- See [SETUP.md](./SETUP.md) for detailed instructions

## 🎯 Roadmap

- [ ] WebSocket support for real-time features
- [ ] Advanced analytics dashboard
- [ ] Video streaming optimization
- [ ] Mobile app API
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch

---

Built with ❤️ using NestJS and PostgreSQL
