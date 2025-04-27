/**
 * DeepSite Watermark Remover - Background Script
 * 
 * This background script handles events and manages the extension's state.
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DeepSite Watermark Remover installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "watermarkRemoved") {
    // Update the extension icon to indicate success
    chrome.action.setIcon({
      path: {
        "16": "icons/icon16_success.png",
        "48": "icons/icon48_success.png",
        "128": "icons/icon128_success.png"
      },
      tabId: sender.tab.id
    });
    
    // Update the badge
    chrome.action.setBadgeText({
      text: "✓",
      tabId: sender.tab.id
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: "#4CAF50",
      tabId: sender.tab.id
    });
    
    // Reset after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({
        text: "",
        tabId: sender.tab.id
      });
      
      chrome.action.setIcon({
        path: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        },
        tabId: sender.tab.id
      });
    }, 5000);
  }
});

// Listen for tab updates to check if we're on a DeepSite static page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('.static.hf.space')) {
    // We're on a Hugging Face static page, execute the content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => console.error('Error executing content script:', err));
  }
});
