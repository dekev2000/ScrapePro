/**
 * DeepSite Watermark Remover - Content Script
 * 
 * This script runs on DeepSite static pages and removes the watermark.
 */

// Function to remove the DeepSite watermark
function removeDeepSiteWatermark() {
  console.log('DeepSite Watermark Remover: Checking for watermarks...');
  
  // Add CSS to hide watermarks
  const style = document.createElement('style');
  style.textContent = `
    /* Hide watermark elements */
    [style*="position: fixed"][style*="bottom: 8px"],
    [style*="position: fixed"][style*="z-index: 10"],
    a[href*="deepsite"],
    a[href*="huggingface"],
    img[src*="logo.svg"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    
    /* Create a blocking overlay at the bottom left corner */
    body::after {
      content: "";
      position: fixed;
      bottom: 0;
      left: 0;
      width: 300px;
      height: 50px;
      background-color: inherit;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
  
  // Execute JavaScript to remove watermarks
  // Target the exact watermark we know exists
  const exactWatermarkSelector = 'p[style*="border-radius: 8px"][style*="text-align: center"][style*="position: fixed"][style*="left: 8px"][style*="bottom: 8px"]';
  const exactWatermark = document.querySelector(exactWatermarkSelector);

  if (exactWatermark) {
    console.log('DeepSite Watermark Remover: Found exact watermark, removing it');
    exactWatermark.remove();
  }
  
  // Remove all elements with specific attributes
  document.querySelectorAll('[style*="position: fixed"][style*="bottom: 8px"]').forEach(el => {
    console.log('DeepSite Watermark Remover: Removing fixed positioned element at bottom');
    el.remove();
  });
  
  // Remove all links to DeepSite
  document.querySelectorAll('a[href*="deepsite"], a[href*="huggingface"], a[href*="remix"]').forEach(el => {
    console.log('DeepSite Watermark Remover: Removing DeepSite link');
    el.remove();
  });
  
  // Remove all DeepSite logo images
  document.querySelectorAll('img[src*="logo.svg"], img[alt*="DeepSite"]').forEach(el => {
    console.log('DeepSite Watermark Remover: Removing DeepSite logo');
    el.remove();
  });
  
  // Create an overlay to cover any remaining watermarks
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.bottom = '0';
  overlay.style.left = '0';
  overlay.style.width = '300px';
  overlay.style.height = '50px';
  overlay.style.backgroundColor = 'white';
  overlay.style.zIndex = '9999';
  document.body.appendChild(overlay);
  
  // Show a notification
  showNotification();
}

// Function to show a notification that the watermark was removed
function showNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
  notification.style.color = 'white';
  notification.style.padding = '12px 16px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  notification.style.zIndex = '10000';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '8px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '14px';
  notification.style.transform = 'translateY(-20px)';
  notification.style.opacity = '0';
  notification.style.transition = 'transform 0.3s, opacity 0.3s';
  
  // Add icon and text
  notification.innerHTML = `
    <div style="font-size: 18px;">✓</div>
    <div>DeepSite watermark removed successfully!</div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(-20px)';
      notification.style.opacity = '0';
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }, 100);
}

// Run the watermark removal when the page loads
removeDeepSiteWatermark();

// Set up a MutationObserver to detect and remove dynamically added watermarks
const observer = new MutationObserver(function(mutations) {
  removeDeepSiteWatermark();
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'removeWatermark') {
    removeDeepSiteWatermark();
    sendResponse({ success: true });
  }
});
