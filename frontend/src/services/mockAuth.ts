// This file provides mock authentication for development
import axios from 'axios';

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Demo Account',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
    createdAt: '2023-01-03T00:00:00Z'
  }
];

// Mock token generator
const generateToken = (userId: string) => {
  return `mock-jwt-token-${userId}-${Date.now()}`;
};

// Setup mock authentication
const setupMockAuth = () => {
  // Add a request interceptor to log all requests
  axios.interceptors.request.use(
    config => {
      console.log('Mock Auth Request:', config.method, config.url, config.data);
      return config;
    },
    error => {
      console.error('Mock Auth Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Add a response interceptor for auth endpoints
  axios.interceptors.response.use(
    response => {
      console.log('Mock Auth Response:', response.config.url, response.status);

      // Check if this is an auth endpoint
      const url = response.config.url;
      if (!url || !url.includes('/auth/')) {
        return response;
      }

      // Handle login
      if (url.includes('/auth/login')) {
        console.log('Intercepting login request');

        let requestData = {};
        try {
          if (response.config.data) {
            requestData = JSON.parse(response.config.data);
          }
        } catch (e) {
          console.error('Error parsing request data:', e);
        }

        const { email, password } = requestData;
        console.log('Login attempt with:', email, password);

        // Find user with matching credentials
        const user = mockUsers.find(u =>
          u.email?.toLowerCase() === email?.toLowerCase() && u.password === password
        );

        if (user) {
          console.log('User found, returning success');
          // Create a user object without the password
          const { password, ...userWithoutPassword } = user;

          return {
            ...response,
            data: {
              success: true,
              user: userWithoutPassword,
              token: generateToken(user.id)
            }
          };
        } else {
          console.log('Invalid credentials, returning 401');
          // Return 401 for invalid credentials
          return Promise.reject({
            response: {
              status: 401,
              data: {
                success: false,
                message: 'Invalid credentials'
              }
            }
          });
        }
      }

      // Handle register
      if (url === '/auth/register') {
        const { name, email, password } = response.config.data ? JSON.parse(response.config.data) : {};

        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
          return Promise.reject({
            response: {
              status: 400,
              data: {
                success: false,
                message: 'User already exists'
              }
            }
          });
        }

        // Create new user
        const newUser = {
          id: `${mockUsers.length + 1}`,
          name,
          email,
          password,
          role: 'user',
          createdAt: new Date().toISOString()
        };

        // Add to mock users (in a real app this would persist to a database)
        mockUsers.push(newUser);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;

        return {
          ...response,
          data: {
            success: true,
            user: userWithoutPassword,
            token: generateToken(newUser.id)
          }
        };
      }

      // Handle logout
      if (url === '/auth/logout') {
        return {
          ...response,
          data: {
            success: true,
            message: 'Logged out successfully'
          }
        };
      }

      // Handle get user
      if (url === '/auth/me') {
        // In a real app, we would validate the token and get the user
        // For mock purposes, we'll just return a success response
        return {
          ...response,
          data: {
            success: true,
            data: {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              createdAt: '2023-01-01T00:00:00Z'
            }
          }
        };
      }

      return response;
    },
    error => {
      // If it's a network error and it's an auth endpoint, return mock data
      if (error.message === 'Network Error') {
        const config = error.config;
        const url = config.url;

        if (url === '/auth/login') {
          const { email, password } = config.data ? JSON.parse(config.data) : {};

          // Find user with matching credentials
          const user = mockUsers.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );

          if (user) {
            // Create a user object without the password
            const { password, ...userWithoutPassword } = user;

            return {
              data: {
                success: true,
                user: userWithoutPassword,
                token: generateToken(user.id)
              }
            };
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

export { setupMockAuth, mockUsers };
