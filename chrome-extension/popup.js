/**
 * DeepSite Watermark Remover - Popup Script
 * 
 * This script handles the popup UI and interactions.
 */

// Function to update the status display
function updateStatus(isActive) {
  const statusElement = document.getElementById('status');
  const statusIconElement = document.getElementById('status-icon');
  const statusTextElement = document.getElementById('status-text');
  
  if (isActive) {
    statusElement.className = 'status active';
    statusIconElement.className = 'status-icon active';
    statusTextElement.textContent = 'Active on this page. Watermark will be removed.';
  } else {
    statusElement.className = 'status inactive';
    statusIconElement.className = 'status-icon inactive';
    statusTextElement.textContent = 'Not active. Navigate to a DeepSite static preview URL.';
  }
}

// When the popup is loaded, check if we're on a DeepSite static page
document.addEventListener('DOMContentLoaded', async () => {
  // Get the current tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // Check if we're on a DeepSite static page
  const isDeepSitePage = currentTab.url && currentTab.url.includes('.static.hf.space');
  
  // Update the status display
  updateStatus(isDeepSitePage);
  
  // If we're on a DeepSite static page, try to remove the watermark again
  if (isDeepSitePage) {
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      files: ['content.js']
    }).catch(err => console.error('Error executing content script:', err));
  }
});
