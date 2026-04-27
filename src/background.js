// Background service worker for SureCookie extension

// Safari compatibility: use browser or chrome API
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Default settings
const defaultSettings = {
  enabled: true,
  autoAcceptCookies: true,
  totalCookiesAccepted: 0
};

// Initialize settings on install
browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.storage.sync.get(defaultSettings, (items) => {
    browserAPI.storage.sync.set(items);
  });
});

// Handle messages from content script and popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    browserAPI.storage.sync.get(defaultSettings, (items) => {
      sendResponse(items);
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'acceptCookies') {
    // Increment counter when cookies are accepted
    browserAPI.storage.sync.get(['totalCookiesAccepted'], (items) => {
      const newTotal = (items.totalCookiesAccepted || 0) + 1;
      browserAPI.storage.sync.set({ totalCookiesAccepted: newTotal });
    });
  }
  
  return true;
});
