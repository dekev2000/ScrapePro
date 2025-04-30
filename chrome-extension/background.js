/**
 * DeepSite Watermark Remover - Background Script
 * 
 * This script runs in the background and listens for tab updates to detect
 * when a DeepSite static page is loaded.
 */

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab has completed loading and the URL is a DeepSite static page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('.static.hf.space')) {
    console.log('DeepSite Watermark Remover: Detected DeepSite static page', tab.url);
    
    // Execute the content script to remove the watermark
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => console.error('Error executing content script:', err));
  }
});

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DeepSite Watermark Remover installed');
});
