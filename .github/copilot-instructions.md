# SureCookie Browser Extension - Copilot Instructions

This is a browser extension project that automatically accepts cookies on websites.

## Project Overview

- **Type**: Browser Extension (Chrome/Firefox compatible)
- **Language**: JavaScript
- **Framework**: Chrome Extensions Manifest V3
- **Purpose**: Auto-accept cookies on websites with toggle control

## Key Features

1. Auto-detection and clicking of cookie acceptance buttons
2. Simple popup UI with on/off switches
3. Persistent settings using Chrome sync storage
4. Content script injection on all websites
5. Background service worker for settings management

## Project Structure

- `manifest.json` - Extension configuration
- `src/background.js` - Service worker
- `src/content.js` - Page injection script
- `src/popup.html/css/js` - Extension popup interface
- `assets/` - Icon files (to be added)
- `package.json` - Project metadata

## Development Guidelines

- Keep content.js lightweight for performance
- Test on multiple sites with different cookie implementations
- Ensure selectors are browser-compatible
- Update manifest version when making changes
- Test in Chrome and Firefox for compatibility

## Setup Complete

The project structure is ready for development. To test:

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the project folder
4. Test on websites with cookie consent banners
