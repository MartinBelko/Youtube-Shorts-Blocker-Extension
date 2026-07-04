const extensionApi = typeof browser !== "undefined" ? browser : chrome;

const STYLE_ID = "yt-shorts-blocker-style";
const SHORTS_CSS = `
  ytd-guide-entry-renderer a[title="Shorts"],
  ytd-mini-guide-entry-renderer a[title="Shorts"],
  ytm-pivot-bar-item-renderer a[href="/shorts"],
  ytm-pivot-bar-item-renderer:has(.pivot-shorts),
  ytd-reel-shelf-renderer,
  ytd-rich-shelf-renderer:has([href*="/shorts/"]),
  ytm-reel-shelf-renderer,
  ytm-rich-section-renderer:has([href^="/shorts/"]),
  grid-shelf-view-model:has([href^="/shorts/"]),
  ytd-rich-grid-group:has([href^="/shorts/"]),
  [href^="/shorts/"],
  ytd-reel-item-renderer,
  ytm-reel-item-renderer,
  ytm-shorts-lockup-view-model,
  ytd-rich-item-renderer:has([href^="/shorts/"]),
  ytd-video-renderer:has([href^="/shorts/"]),
  ytd-grid-video-renderer:has([href^="/shorts/"]),
  ytd-compact-video-renderer:has([href^="/shorts/"]),
  ytm-rich-item-renderer:has([href^="/shorts/"]),
  ytm-video-with-context-renderer:has([href^="/shorts/"]),
  ytm-grid-video-renderer:has([href^="/shorts/"]),
  ytd-notification-renderer:has([href^="/shorts/"]) {
    display: none !important;
  }
`;

/**
 * Injects the Shorts blocking stylesheet when enabled.
 */
function enableBlocking() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = STYLE_ID;
  styleElement.textContent = SHORTS_CSS;

  (document.head || document.documentElement).appendChild(styleElement);
}

/**
 * Removes the injected stylesheet so hidden elements are restored.
 */
function disableBlocking() {
  document.getElementById(STYLE_ID)?.remove();
}

/**
 * Redirects direct Shorts URLs to the regular watch page.
 */
function redirectShortsPage() {
  if (!window.location.pathname.startsWith("/shorts/")) {
    return;
  }

  const videoId = window.location.pathname.split("/")[2];
  if (!videoId) {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = "/watch";
  nextUrl.search = "";
  nextUrl.searchParams.set("v", videoId);

  window.location.replace(nextUrl.toString());
}

/**
 * Applies active state and keeps behavior in sync with popup changes.
 */
function applyEnabledState(nextState) {
  if (nextState) {
    enableBlocking();
    redirectShortsPage();
    return;
  }

  disableBlocking();
}

async function initialize() {
  const stored = await extensionApi.storage.local.get("isActive");
  applyEnabledState(stored.isActive === true);

  extensionApi.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.isActive) {
      return;
    }

    applyEnabledState(changes.isActive.newValue === true);
  });

  document.addEventListener("yt-navigate-finish", async () => {
    const latestState = await extensionApi.storage.local.get("isActive");
    if (latestState.isActive === true) {
      enableBlocking();
      redirectShortsPage();
    }
  });
}

initialize();
