const extensionApi = typeof browser !== "undefined" ? browser : chrome;

let isEnabled = false;
let observer = null;
let cleanupScheduled = false;

/**
 * Adds a CSS fallback that hides Shorts links in left navigation.
 */
function ensureShortsNavHiddenByCss() {
  const styleId = "yt-shorts-nav-hide-style";

  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    ytd-guide-renderer a[href="/shorts"],
    ytd-guide-renderer a[href^="/shorts?"],
    ytd-mini-guide-renderer a[href="/shorts"],
    ytd-mini-guide-renderer a[href^="/shorts?"] {
      display: none !important;
    }
  `;

  document.documentElement.appendChild(style);
}

/**
 * Removes Shorts entries/cards/shelves by finding matching nodes and
 * deleting the closest meaningful container.
 */
function removeShortsElements() {
  // Navigation entries and cards that link to /shorts/
  document.querySelectorAll('a[href^="/shorts"], a[href*="/shorts/"]').forEach((link) => {
    const container = link.closest(
      "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer"
    );

    if (container) {
      container.remove();
    } else {
      link.remove();
    }
  });

  // Specific pass for upper-left guide and mini-guide Shorts buttons.
  document
    .querySelectorAll(
      'ytd-guide-renderer a[href="/shorts"], ytd-guide-renderer a[href^="/shorts?"], ytd-mini-guide-renderer a[href="/shorts"], ytd-mini-guide-renderer a[href^="/shorts?"]'
    )
    .forEach((link) => {
      const navItem = link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer");
      if (navItem) {
        navItem.remove();
      }
    });

  // Shorts shelves/carousels explicitly identified by title.
  document.querySelectorAll("ytd-rich-shelf-renderer").forEach((shelf) => {
    const title =
      shelf.querySelector("#title")?.textContent?.trim() ||
      shelf.querySelector("h2")?.textContent?.trim() ||
      "";

    if (title === "Shorts") {
      shelf.remove();
    }
  });

  // Watch-page Shorts shelf.
  document.querySelectorAll("ytd-reel-shelf-renderer, ytm-shorts-lockup-view-model, ytd-shorts").forEach((node) => {
    node.remove();
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
    removeShortsElements();
  });
}

/**
 * Starts event-driven DOM observation while blocker is enabled.
 */
function startBlocking() {
  if (observer) {
    return;
  }

  ensureShortsNavHiddenByCss();

  observer = new MutationObserver(() => {
    scheduleCleanup();
  });

  observer.observe(document.documentElement, {
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
