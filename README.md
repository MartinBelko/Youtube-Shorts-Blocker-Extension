> [!WARNING]
> **AI-Assisted Personal Project**: I am a sysadmin, not a dedicated developer—so projects like this are built to serve my own specific needs and are happily created and maintained using AI. While I manually review and test all code before using it personally, unhandled bugs or edge cases can occur. Please **use with caution**.

# YouTube Shorts Blocker (Firefox)

A lightweight Firefox extension that hides YouTube Shorts UI elements on YouTube pages.

## Features

- Simple popup toggle to enable/disable blocking
- Disabled by default with matching active/inactive toolbar icons
- Efficient, event-driven blocking with `MutationObserver`
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

The content script watches for DOM updates and YouTube route changes, then removes Shorts-related sections/links/cards when enabled.  
When disabled, the observer is disconnected so active blocking behavior stops cleanly.
