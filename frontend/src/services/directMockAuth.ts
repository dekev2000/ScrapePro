// This file provides direct mock authentication functions
// that can be used without relying on axios interceptors

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

// Direct mock login function
export const mockLogin = async (email: string, password: string) => {
  console.log('Direct mock login with:', email, password);

  // Auto-login with admin user for development
  const adminUser = mockUsers[0];
  console.log('Auto-login with admin user');

  // Create a user object without the password
  const { password: _, ...userWithoutPassword } = adminUser;

  return {
    success: true,
    user: userWithoutPassword,
    token: generateToken(adminUser.id)
  };
};

// Direct mock register function
export const mockRegister = async (name: string, email: string, password: string) => {
  console.log('Direct mock register with:', name, email);

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    throw new Error('User already exists');
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
    success: true,
    user: userWithoutPassword,
    token: generateToken(newUser.id)
  };
};

// Direct mock logout function
export const mockLogout = async () => {
  return {
    success: true,
    message: 'Logged out successfully'
  };
};

// Direct mock get user function
export const mockGetUser = async () => {
  return {
    success: true,
    data: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z'
    }
  };
};

export { mockUsers };
