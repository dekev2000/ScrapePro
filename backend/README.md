# ScrapePro Backend

## Local Development Setup

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB running locally or a MongoDB Atlas account
- npm or yarn package manager

### Environment Setup

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables (or use the existing one):

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/scrapepro
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

### Setting Up Development Users

The application requires users to authenticate. For local development, you can create test users with admin and regular privileges.

Run the following command to create default development users:

```
npm run seed:dev
```

This will create the following users:

- Admin: admin@example.com / password123
- Collaborator: user@example.com / password123
- Test User: test@example.com / password123

If you need to reset the users (remove all existing users and create new ones):

```
npm run seed:dev:clear
```

### Running the Server

Start the development server with:

```
npm run dev
```

The server will run on http://localhost:3000 (or the port specified in your .env file).

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user (admin only)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current logged in user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `GET /api/auth/logout` - Logout

#### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

Additional endpoints are available for businesses, scraping jobs, emails, and analytics.
