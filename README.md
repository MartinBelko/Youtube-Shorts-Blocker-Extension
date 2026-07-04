> [!WARNING]
> **AI-Assisted Personal Project**: I am a sysadmin, not a dedicated developer—so projects like this are built to serve my own specific needs and are happily created and maintained using AI. While I manually review and test all code before using it personally, unhandled bugs or edge cases can occur. Please **use with caution**.

# YouTube Shorts Blocker (Firefox)

A lightweight Firefox extension that hides YouTube Shorts UI elements on YouTube pages.

## Features

- Simple popup toggle to enable/disable blocking
- Disabled by default with matching active/inactive toolbar icons
- Efficient stylesheet-based blocking that reacts to state and route changes
- Works with YouTube SPA navigation updates
- Minimal permissions and local-only preference storage

## Privacy

This extension is privacy-respecting by design:

- No analytics
- No telemetry
- No external network calls
- No remote scripts
- Local page modification only
- Uses only local extension storage for the on/off preference

## How it works

When enabled, the content script injects a CSS stylesheet that hides Shorts-related sections/links/cards and redirects direct `/shorts/...` URLs to the regular watch page.  
When disabled, the injected stylesheet is removed so hidden elements are restored.
