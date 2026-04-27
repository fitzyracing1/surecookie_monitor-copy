# SureCookie - Browser Extension (Chrome)

A lightweight Chrome extension that automatically accepts all cookies unless disabled.

## Features

- **Auto-Accept Cookies**: Automatically detects and clicks cookie acceptance buttons
- **Smart Detection**: Recognizes common cookie consent frameworks (Cookiebot, OneTrust, etc.)
- **Easy Toggle**: Simple on/off switch in the extension popup
- **Privacy-Focused**: Works entirely locally, no data collection or server communication
- **Lightweight**: Minimal performance impact, optimized for Chrome
- **Dynamic Detection**: Re-scans for new consent dialogs added dynamically to the page

## Project Structure

```
surecookie/
├── manifest.json          # Extension configuration
├── src/
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script for webpage injection
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styling
│   └── popup.js           # Popup functionality
├── assets/                # Icon assets (placeholder)
├── package.json           # Project metadata
└── README.md              # This file
```

## Installation

### Chrome/Brave/Edge

1. Open `chrome://extensions/` (or `brave://extensions/` for Brave)
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Navigate to the `surecookie` folder
5. The extension will appear in your extensions list

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `surecookie` folder
4. The extension will appear in your extensions list

## Usage

1. Click the SureCookie icon in your browser toolbar
2. Toggle "Auto-Accept Cookies" to enable/disable
3. The extension will automatically click cookie acceptance buttons on websites

## Configuration

The extension stores settings in Chrome's sync storage:
- `enabled`: Master enable/disable switch
- `autoAcceptCookies`: Cookie auto-acceptance toggle

## How It Works

1. **Background Script**: Manages settings and initialization
2. **Content Script**: Injects into every webpage and finds cookie consent buttons
3. **Common Selectors**: Targets common cookie button classes and IDs
4. **Text Fallback**: Falls back to finding buttons by text content (Accept, Allow, Agree, etc.)
5. **Popup UI**: Simple interface to toggle the extension on/off

## Limitations

- May not work on all websites with custom cookie implementations
- Requires the page to fully load before attempting to accept cookies
- Some dynamically-loaded consent dialogs may not be caught

## Future Improvements

- [ ] Add icon assets
- [ ] Support for more cookie consent frameworks
- [ ] Whitelist/blacklist specific websites
- [ ] Cookie management dashboard
- [ ] Statistics on blocked cookies
- [ ] Multi-language support

## License

MIT

## Development

To develop this extension:

1. Modify files in the `src/` directory
2. Reload the extension in `chrome://extensions/` (use the refresh icon)
3. Test on websites with cookie consent banners
