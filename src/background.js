const extensionApi = typeof browser !== "undefined" ? browser : chrome;

const ACTIVE_ICON_PATH = "popup/youtube-shorts-blocker-enabled.png";
const INACTIVE_ICON_PATH = "popup/youtube-shorts-blocker-disabled.png";

/**
 * Applies the toolbar icon that matches the current blocker state.
 */
async function syncActionIcon(isActive) {
  await extensionApi.action.setIcon({
    path: isActive ? ACTIVE_ICON_PATH : INACTIVE_ICON_PATH,
  });
}

/**
 * Loads the saved blocker state and ensures disabled is the default.
 */
async function initializeActionState() {
  const stored = await extensionApi.storage.local.get("isActive");

  if (typeof stored.isActive !== "boolean") {
    await extensionApi.storage.local.set({ isActive: false });
    await syncActionIcon(false);
    return;
  }

  await syncActionIcon(stored.isActive);
}

extensionApi.runtime.onInstalled.addListener(() => {
  initializeActionState();
});

extensionApi.runtime.onStartup.addListener(() => {
  initializeActionState();
});

extensionApi.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.isActive) {
    return;
  }

  syncActionIcon(changes.isActive.newValue === true);
});

initializeActionState();
