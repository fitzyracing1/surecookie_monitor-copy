// Popup UI logic for SureCookie extension

// Safari compatibility: use browser or chrome API
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const defaults = {
  enabled: true,
  autoAcceptCookies: true,
  totalCookiesAccepted: 0,
  apiEndpoint: '',
  apiToken: '',
  lastApiStatus: 'Waiting for request',
  lastApiBody: 'No response yet.',
  lastApiUpdated: ''
};

const qs = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = qs('toggle-enabled');
  const autoToggle = qs('toggle-auto-accept');
  const counter = qs('counter');
  const resetCounter = qs('reset-counter');
  const endpointInput = qs('api-endpoint');
  const tokenInput = qs('api-token');
  const saveApiBtn = qs('save-api-settings');
  const fetchApiBtn = qs('fetch-api');
  const statusEl = qs('api-status');
  const bodyEl = qs('api-body');
  const updatedEl = qs('api-updated');

  browserAPI.storage.sync.get(defaults, (items) => {
    enableToggle.checked = items.enabled !== false;
    autoToggle.checked = items.autoAcceptCookies !== false;
    counter.textContent = items.totalCookiesAccepted || 0;
    endpointInput.value = items.apiEndpoint || '';
    tokenInput.value = items.apiToken || '';
    statusEl.textContent = items.lastApiStatus || defaults.lastApiStatus;
    bodyEl.textContent = items.lastApiBody || defaults.lastApiBody;
    updatedEl.textContent = items.lastApiUpdated || '';
  });

  enableToggle.addEventListener('change', (e) => {
    browserAPI.storage.sync.set({ enabled: e.target.checked });
  });

  autoToggle.addEventListener('change', (e) => {
    browserAPI.storage.sync.set({ autoAcceptCookies: e.target.checked });
  });

  resetCounter.addEventListener('click', () => {
    browserAPI.storage.sync.set({ totalCookiesAccepted: 0 });
    counter.textContent = '0';
  });

  saveApiBtn.addEventListener('click', () => {
    const apiEndpoint = endpointInput.value.trim();
    const apiToken = tokenInput.value.trim();
    browserAPI.storage.sync.set({ apiEndpoint, apiToken }, () => {
      statusEl.textContent = 'Saved settings';
      updatedEl.textContent = '';
    });
  });

  fetchApiBtn.addEventListener('click', async () => {
    const apiEndpoint = endpointInput.value.trim();
    const apiToken = tokenInput.value.trim();

    if (!apiEndpoint) {
      statusEl.textContent = 'Enter an endpoint URL';
      bodyEl.textContent = 'No request sent.';
      updatedEl.textContent = '';
      return;
    }

    statusEl.textContent = 'Requesting...';
    bodyEl.textContent = '';
    updatedEl.textContent = '';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const headers = { Accept: 'application/json' };
      if (apiToken) {
        headers.Authorization = `Bearer ${apiToken}`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeout);

      const statusText = `${response.status} ${response.statusText || ''}`.trim();
      const rawBody = await response.text();
      const parsedBody = safePretty(rawBody);
      const truncatedBody = truncate(parsedBody, 2000);
      const updated = new Date().toLocaleString();

      statusEl.textContent = statusText;
      bodyEl.textContent = truncatedBody;
      updatedEl.textContent = updated;

      browserAPI.storage.sync.set({
        apiEndpoint,
        apiToken,
        lastApiStatus: statusText,
        lastApiBody: truncatedBody,
        lastApiUpdated: updated
      });
    } catch (error) {
      clearTimeout(timeout);
      const message = error?.name === 'AbortError' ? 'Request timed out' : `Error: ${error.message || error}`;
      statusEl.textContent = message;
      bodyEl.textContent = 'No response body.';
      updatedEl.textContent = new Date().toLocaleString();
      browserAPI.storage.sync.set({
        apiEndpoint,
        apiToken,
        lastApiStatus: message,
        lastApiBody: 'No response body.',
        lastApiUpdated: updatedEl.textContent
      });
    }
  });
});

function safePretty(raw) {
  try {
    const json = JSON.parse(raw);
    return JSON.stringify(json, null, 2);
  } catch (_) {
    return raw || 'Empty body';
  }
}

function truncate(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}
