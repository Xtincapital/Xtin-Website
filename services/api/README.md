# Xtin Capital - Backend

## 📋 Overview
This is the backend service for the Xtin Capital platform, built with Node.js and Express.js. The application follows a clean architecture pattern with separate layers for routes, controllers, services, and data access. This documentation is designed to help new developers understand the project structure, setup, and development workflow.

## 🏗️ Project Structure

```
backend/
├── config/                 # Configuration files and constants
│   ├── config.mjs          # Application configuration (environment variables, third-party services)
│   └── constants.mjs       # Application-wide constants (error messages, status codes, etc.)
│
├── controllers/            # Request handlers (business logic)
│   ├── course.controller.mjs  # Course-related request handlers
│   └── user.controller.mjs    # User authentication and profile handlers
│
├── db/                     # Database configuration
│   └── database.mjs        # MongoDB connection setup and configuration
│
├── middlewares/            # Custom Express middleware
│   └── auth.mjs            # Authentication and authorization middleware
│
├── models/                 # Database models (Mongoose schemas)
│   ├── course.model.mjs    # Course data structure
│   ├── user.model.mjs      # User data structure
│   ├── video.model.mjs     # Video content structure
│   └── purchase.model.mjs  # Purchase/transaction records
│
├── repository/             # Data access layer (DAL)
│   ├── course.repository.mjs  # Course data operations
│   └── user.repository.mjs    # User data operations
│
├── routes/                 # API route definitions
│   ├── course.routes.mjs   # Course-related API endpoints
│   └── user.routes.mjs     # User-related API endpoints
│
├── utils/                  # Utility functions and helpers
│   ├── validators.mjs      # Request validation utilities
│   └── helper_functions.mjs # Common helper functions
│
├── validators/             # Request validation schemas
│   └── user.validator.mjs  # User input validation schemas
│
├── .gitignore              # Git ignore file
├── app.mjs                 # Express application setup and middleware configuration
├── index.mjs               # Application entry point (server startup)
├── package.json            # Project dependencies and scripts
└── sample.env              # Environment variables template
```

## 🧩 Key Components

### 🎛️ Controllers
Controllers handle incoming HTTP requests, process input, and return appropriate responses. They should:
- Extract and validate request parameters
- Call the appropriate repository/service methods
- Handle errors and return appropriate HTTP responses
- Not contain business logic (that belongs in services)

### 📦 Models
Mongoose schemas that define the data structure and validation rules for MongoDB collections. Each model:
- Defines the schema structure and types
- Includes validation rules
- Can define instance/static methods
- Handles data transformation

### 🛣️ Routes
Define the API endpoints and map them to controller methods. Routes should:
- Define the HTTP method and path
- Apply any necessary middleware (auth, validation)
- Map to the appropriate controller method
- Document expected request/response formats

### 🔌 Middleware
Custom Express middleware functions that process requests before they reach the route handlers:
- `auth.mjs`: Handles JWT authentication and authorization
- Request validation
- Error handling
- Request logging
- Response formatting

### 🗄️ Repository Pattern
The data access layer that abstracts database operations:
- Provides a clean API for controllers to interact with the database
- Handles all database-specific logic
- Makes it easy to swap out the database implementation if needed
- Implements data caching if necessary

### 🛠️ Utils
Reusable utility functions and helpers:
- `validators.mjs`: Request validation using Zod
- `helper_functions.mjs`: Common utility functions
- Error handling utilities
- Data transformation functions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher) or yarn
- MongoDB (v6.0 or higher) - either local or cloud instance
- Git (for version control)

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Xtin-capital/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp sample.env .env
   ```
   Then edit the `.env` file with your configuration.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The server will start on `http://localhost:3000` by default.

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/xtincapital

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173  # Your frontend URL
```

## 📚 API Documentation

API documentation is available using Swagger/OpenAPI. When running in development mode, visit:
- API Documentation: `http://localhost:3000/api-docs`
- API JSON: `http://localhost:3000/api-docs.json`

## 🛠 Development

### Available Scripts

```bash
# Start development server with hot-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Check for security vulnerabilities
npm audit
```

### Code Style
- Use ES modules (import/export)
- Follow JavaScript Standard Style
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for all functions and classes

### Git Workflow
1. Create a new branch for each feature/bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit with a descriptive message
3. Push your branch and create a pull request

## 🚀 Deployment

### Production Build
```bash
# Install production dependencies
npm ci --production

# Build the application (if needed)
npm run build

# Start the production server
npm start
```

### Docker
A `Dockerfile` is provided for containerized deployment:

```bash
# Build the Docker image
docker build -t xtin-capital-backend .

# Run the container
docker run -p 3000:3000 --env-file .env xtin-capital-backend
```

### Environment Variables in Production
In production, ensure you set the following environment variables:
- `NODE_ENV=production`
- A secure `JWT_SECRET`
- Production `MONGODB_URI`
- Proper CORS origins

## 🔒 Security

- Always use HTTPS in production
- Keep dependencies updated
- Use environment variables for sensitive data
- Implement rate limiting
- Validate and sanitize all user input
- Use Helmet.js for security headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📬 Contact

For any questions or support, please contact the development team at [your-email@example.com](mailto:your-email@example.com)
