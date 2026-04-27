// Content script for SureCookie extension
// This script runs on every webpage and handles cookie acceptance

// Safari compatibility: use browser or chrome API
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

let settingsCache = { enabled: true, autoAcceptCookies: true };
let hasAttempted = false;

// Request current settings from background
function initializeSettings() {
  browserAPI.runtime.sendMessage({ action: 'getSettings' }, (response) => {
    if (response && response.enabled && response.autoAcceptCookies) {
      settingsCache = response;
      acceptAllCookies();
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
  initializeSettings();
}

function acceptAllCookies() {
  if (hasAttempted) return;
  hasAttempted = true;

  // Common cookie consent button selectors - ordered by priority
  const selectors = [
    // High priority - specific cookie frameworks
    '[data-cookiebanner-accept]',
    'button[data-testid="cookie-accept-all"]',
    'button[id*="accept-all"]',
    '.CybotCookiebotDialogBodyButtonAcceptAll', // Cookiebot
    '.cookie-consent__button--accept-all',
    '.cookie-accept-all',
    // Medium priority - common patterns
    'button[class*="accept-all"]',
    'button[class*="acceptAll"]',
    'button[id*="acceptAll"]',
    'button[class*="accept"][class*="all"]',
    'button[aria-label*="accept"][aria-label*="all"]',
    // Generic patterns
    'button[class*="accept"]',
    'button[class*="consent"]',
    'button[id*="accept"]',
    'button[id*="consent"]',
    '[role="button"][class*="accept"]',
    '[role="button"][class*="consent"]',
    '.cookie-accept',
    '.cookie-consent-accept',
    '#acceptCookies',
    '#accept-cookies'
  ];

  // Try to find and click accept button
  let clicked = false;
  
  for (const selector of selectors) {
    try {
      const button = document.querySelector(selector);
      if (button && isVisible(button) && isClickable(button)) {
        simulateClick(button);
        closeCookiePane(button);
        clicked = true;
        browserAPI.runtime.sendMessage({ action: 'acceptCookies' }).catch(() => {});
        console.log('[SureCookie] Accepted cookies with selector:', selector);
        break;
      }
    } catch (e) {
      // Selector might be invalid, continue to next
    }
  }

  // If selector-based approach didn't work, try by button text content
  if (!clicked) {
    const buttons = document.querySelectorAll('button, [role="button"], a[class*="button"]');
    const acceptKeywords = ['accept all', 'accept', 'agree', 'allow', 'consent', 'ok', 'continue'];
    
    for (const button of buttons) {
      const text = button.textContent.toLowerCase().trim();
      if (isVisible(button) && isClickable(button) && acceptKeywords.some(kw => text.includes(kw))) {
        // Avoid "Do not accept" or similar negative buttons
        if (!text.includes('do not') && !text.includes('don\'t') && !text.includes('reject') && !text.includes('decline')) {
          simulateClick(button);
          closeCookiePane(button);
          clicked = true;
          browserAPI.runtime.sendMessage({ action: 'acceptCookies' }).catch(() => {});
          console.log('[SureCookie] Accepted cookies with text:', text);
          break;
        }
      }
    }
  }
}

function isVisible(element) {
  if (!element) return false;
  try {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
  } catch (e) {
    return false;
  }
}

function isClickable(element) {
  try {
    return element.offsetParent !== null || element.style.display !== 'none';
  } catch (e) {
    return true;
  }
}

function simulateClick(element) {
  // Try native click first
  element.click();
  
  // Also trigger events for frameworks that listen to them
  const events = [
    new MouseEvent('mousedown', { bubbles: true }),
    new MouseEvent('mouseup', { bubbles: true }),
    new MouseEvent('click', { bubbles: true }),
    new Event('change', { bubbles: true })
  ];
  
  events.forEach(e => element.dispatchEvent(e));
}

function closeCookiePane(button) {
  // Wait a brief moment for the click to process
  setTimeout(() => {
    // Find the cookie consent container by traversing up the DOM
    let container = button;
    const cookiePaneSelectors = [
      '[class*="cookie"]',
      '[class*="consent"]',
      '[id*="cookie"]',
      '[id*="consent"]',
      '[role="dialog"]',
      '[role="banner"]',
      '[class*="banner"]',
      '[class*="modal"]',
      '[class*="overlay"]'
    ];
    
    // Traverse up to find the main cookie consent container
    for (let i = 0; i < 10 && container.parentElement; i++) {
      container = container.parentElement;
      
      // Check if this container matches cookie consent patterns
      const classList = container.className || '';
      const id = container.id || '';
      const role = container.getAttribute('role') || '';
      
      if (classList.toLowerCase().includes('cookie') ||
          classList.toLowerCase().includes('consent') ||
          classList.toLowerCase().includes('banner') ||
          id.toLowerCase().includes('cookie') ||
          id.toLowerCase().includes('consent') ||
          role === 'dialog' ||
          role === 'banner') {
        // Hide the container
        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.opacity = '0';
        container.setAttribute('aria-hidden', 'true');
        console.log('[SureCookie] Closed cookie consent pane');
        break;
      }
    }
  }, 300);
}

// Listen for storage changes from popup
browserAPI.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.autoAcceptCookies?.newValue === true) {
    hasAttempted = false;
    acceptAllCookies();
  }
});

// Re-attempt on dynamic content
const observer = new MutationObserver(() => {
  if (!hasAttempted && settingsCache.autoAcceptCookies) {
    hasAttempted = false;
    acceptAllCookies();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
