// Simple API test
document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const logElement = document.getElementById('log');
  const testBtn = document.getElementById('testBtn');
  const ipForm = document.getElementById('ipForm');
  const ipInput = document.getElementById('ipInput');
  
  function log(message) {
    const time = new Date().toLocaleTimeString();
    logElement.innerHTML += `<div>[${time}] ${message}</div>`;
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  function setStatus(message, isSuccess = false) {
    statusElement.textContent = message;
    statusElement.className = isSuccess ? 'success' : 'error';
  }

  async function testAPI(baseUrl = 'http://localhost:3000') {
    setStatus('Testing connection...');
    log(`Testing connection to ${baseUrl}/api/auth/register`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        })
      });
      
      const data = await response.json();
      log(`Response status: ${response.status}`);
      log(`Response data: ${JSON.stringify(data, null, 2)}`);
      
      if (response.ok) {
        setStatus(`Success! Server responded with status ${response.status}`, true);
        return true;
      } else {
        setStatus(`Server error: ${response.status} ${data.error || ''}`);
        return false;
      }
      
    } catch (error) {
      log(`Error: ${error.message}`);
      setStatus(`Connection failed: ${error.message}`);
      return false;
    }
  }
  
  testBtn.addEventListener('click', () => {
    testAPI();
  });
  
  ipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const customIP = ipInput.value.trim();
    if (customIP) {
      testAPI(customIP);
    }
  });
  
  // Initial test
  testAPI();
}); 