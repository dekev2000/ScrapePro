// Simple API connection test
import axios from 'axios';

async function testConnection() {
  console.log('Testing API connection...');
  
  try {
    // Test register endpoint
    console.log('Testing /api/auth/register endpoint...');
    const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    });
    
    console.log('Register response:', registerResponse.status, registerResponse.data);
    
    // Test login endpoint
    console.log('Testing /api/auth/login endpoint...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.status, loginResponse.data);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error configuring request:', error.message);
    }
  }
}

testConnection(); 