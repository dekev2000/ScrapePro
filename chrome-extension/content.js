/**
 * DeepSite Watermark Remover
 * 
 * This content script automatically detects and removes the DeepSite watermark
 * from Hugging Face static preview URLs.
 */

// Function to remove the DeepSite watermark
function removeDeepSiteWatermark() {
  // Look for the watermark by its specific style and content
  const watermarks = document.querySelectorAll('p[style*="position: fixed"][style*="bottom: 8px"][style*="z-index: 10"]');
  
  // Also look for any elements containing the DeepSite logo or text
  const possibleWatermarks = document.querySelectorAll('p:has(a[href*="deepsite.hf.space"])');
  
  // Combine the results
  const allWatermarks = [...watermarks, ...possibleWatermarks];
  
  // If we found any watermarks, remove them
  if (allWatermarks.length > 0) {
    console.log(`DeepSite Watermark Remover: Found ${allWatermarks.length} watermark(s)`);
    
    allWatermarks.forEach(watermark => {
      // Check if it's really a DeepSite watermark by looking for specific text or elements
      if (
        watermark.innerHTML.includes('DeepSite') || 
        watermark.innerHTML.includes('enzostvs-deepsite.hf.space')
      ) {
        // Remove the watermark
        watermark.remove();
        console.log('DeepSite Watermark Remover: Watermark removed successfully');
      }
    });
    
    // Send a message to the background script to update the icon
    chrome.runtime.sendMessage({ action: "watermarkRemoved" });
    
    // Show a notification to the user
    showNotification();
  } else {
    console.log('DeepSite Watermark Remover: No watermark found');
  }
}

// Function to show a notification to the user
function showNotification() {
  // Create a notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.transition = 'opacity 0.5s ease-in-out';
  notification.style.opacity = '0';
  notification.textContent = 'DeepSite watermark removed! Ready for screenshot.';
  
  // Add the notification to the page
  document.body.appendChild(notification);
  
  // Fade in the notification
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);
  
  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Alternative approach using MutationObserver to handle dynamically loaded content
function setupMutationObserver() {
  // Create a new observer
  const observer = new MutationObserver((mutations) => {
    // Check if any of the mutations might have added a watermark
    const shouldCheck = mutations.some(mutation => {
      return mutation.addedNodes.length > 0 && 
             Array.from(mutation.addedNodes).some(node => 
               node.nodeType === Node.ELEMENT_NODE && 
               (node.tagName === 'P' || node.innerHTML?.includes('DeepSite'))
             );
    });
    
    // If we think a watermark might have been added, try to remove it
    if (shouldCheck) {
      removeDeepSiteWatermark();
    }
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  return observer;
}

// Run the watermark removal when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Try to remove any watermarks that are already on the page
  removeDeepSiteWatermark();
  
  // Set up an observer to catch any watermarks that might be added later
  const observer = setupMutationObserver();
  
  // Also try again after a short delay, in case the watermark is added after the page loads
  setTimeout(removeDeepSiteWatermark, 1000);
  setTimeout(removeDeepSiteWatermark, 2000);
});

// Run immediately in case the DOM is already loaded
removeDeepSiteWatermark();
