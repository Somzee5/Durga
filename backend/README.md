# Durga Backend API

🕉️ Backend API for Durga Women Safety Companion App

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/durga-safety
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

3. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Schema

### User Model

```javascript
{
  name: String (required, 2-50 chars)
  email: String (required, unique, valid email)
  age: Number (required, 13-120)
  contactNumber: String (required, unique, 10-digit Indian mobile)
  address: {
    street: String (required, 5-200 chars)
    city: String (required, 2-50 chars)
    state: String (required, 2-50 chars)
    pincode: String (required, 6-digit Indian pincode)
  }
  password: String (required, min 6 chars, hashed)
  emergencyContacts: [{
    name: String
    relationship: String (family|friend|colleague|neighbor|other)
    contactNumber: String (10-digit Indian mobile)
    isPrimary: Boolean
  }]
  preferences: {
    language: String (default: 'en')
    notifications: Boolean (default: true)
    locationSharing: Boolean (default: false)
    emergencyMode: Boolean (default: false)
  }
  safetyStats: {
    totalSessions: Number (default: 0)
    emergencyTriggers: Number (default: 0)
    lastEmergencyDate: Date
  }
  isActive: Boolean (default: true)
  isVerified: Boolean (default: false)
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🔗 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-token` - Verify JWT token
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset

### User Management

- `POST /api/v1/users/register` - Register new user
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/emergency-contacts` - Add emergency contact
- `GET /api/v1/users/emergency-contacts` - Get emergency contacts
- `GET /api/v1/users/location/:city/:state` - Get location-based contacts
- `POST /api/v1/users/safety-stats` - Update safety statistics

### System

- `GET /health` - Health check
- `GET /` - API information

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - Security headers
- **Error Handling** - Secure error responses

## 📱 Frontend Integration

The backend is designed to work seamlessly with the React Native frontend:

1. **User Registration Flow**
   - Frontend collects user data
   - Validates input client-side
   - Sends to `/api/v1/users/register`
   - Receives JWT token
   - Stores token for future requests

2. **Authentication Flow**
   - Login via `/api/v1/auth/login`
   - Token stored in AsyncStorage
   - Automatic token verification
   - Protected routes require valid token

3. **Data Synchronization**
   - User profile updates
   - Emergency contact management
   - Safety statistics tracking
   - Location-based emergency contacts

## 🛠️ Development

### Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── env.example           # Environment template
├── models/
│   └── User.js           # User data model
├── routes/
│   ├── userRoutes.js     # User management routes
│   └── authRoutes.js     # Authentication routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
└── README.md             # This file
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/durga-safety` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### API Response Format

**Success Response:**
```json
{
  "message": "🕉️ Operation successful",
  "data": { ... },
  "code": "SUCCESS_CODE"
}
```

**Error Response:**
```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/durga-safety
   JWT_SECRET=your-production-secret-key
   ```

2. **Security Considerations**
   - Use strong JWT secret
   - Enable MongoDB authentication
   - Configure CORS for production domain
   - Set up SSL/TLS
   - Use environment variables for secrets

3. **Performance Optimization**
   - Enable MongoDB indexes
   - Configure connection pooling
   - Set up monitoring
   - Implement caching if needed

## 📊 Monitoring & Logging

- **Morgan** - HTTP request logging
- **Console Logging** - Error and debug information
- **Health Check** - `/health` endpoint for monitoring
- **Error Tracking** - Comprehensive error handling

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📄 License

This project is designed for public safety and government use. Please ensure compliance with local regulations and privacy laws.

---

🕉️ **Durga's Protection** - Empowering women through technology and divine strength.
