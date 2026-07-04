const extensionApi = typeof browser !== "undefined" ? browser : chrome;

let isEnabled = false;
let observer = null;
let cleanupScheduled = false;

const SHORTS_SELECTORS = `
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
  ytd-notification-renderer:has([href^="/shorts/"])
`;

/**
 * Hides Shorts entries/cards/shelves using narrow selectors.
 */
function hideShortsElements() {
  document.querySelectorAll(SHORTS_SELECTORS).forEach((element) => {
    element.style.display = "none";
  });

  document
    .querySelectorAll(
      "tp-yt-paper-item.style-scope.ytd-guide-entry-renderer, tp-yt-paper-item.style-scope.ytd-mini-guide-entry-renderer"
    )
    .forEach((item) => {
      const titleNode = item.querySelector("yt-formatted-string.title");
      const label = titleNode?.textContent?.trim();

      if (label === "Shorts") {
        item.style.display = "none";
      }
    });
}

/**
 * Schedules one cleanup pass for a burst of DOM mutations.
 */
function scheduleCleanup() {
  if (!isEnabled || cleanupScheduled) {
    return;
  }

  cleanupScheduled = true;

  requestAnimationFrame(() => {
    cleanupScheduled = false;
    hideShortsElements();
  });
}

/**
 * Starts event-driven DOM observation while blocker is enabled.
 */
function startBlocking() {
  if (observer) {
    return;
  }

  observer = new MutationObserver(() => {
    scheduleCleanup();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  scheduleCleanup();
}

/**
 * Stops active blocking by disconnecting the observer.
 */
function stopBlocking() {
  if (!observer) {
    return;
  }

  observer.disconnect();
  observer = null;
}

/**
 * Applies active state and keeps behavior in sync with popup changes.
 */
function applyEnabledState(nextState) {
  isEnabled = nextState;

  if (isEnabled) {
    startBlocking();
  } else {
    stopBlocking();
  }
}

async function initialize() {
  const stored = await extensionApi.storage.local.get("isActive");
  const initialState = stored.isActive === true;

  applyEnabledState(initialState);

  extensionApi.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.isActive) {
      return;
    }

    applyEnabledState(changes.isActive.newValue === true);
  });

  document.addEventListener("yt-navigate-finish", () => {
    if (isEnabled) {
      scheduleCleanup();
    }
  });
}

initialize();
