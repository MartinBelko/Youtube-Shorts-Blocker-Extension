const extensionApi = typeof browser !== "undefined" ? browser : chrome;

const toggleElement = document.getElementById("isActive");
const statusText = document.getElementById("statusText");
const stateIcon = document.getElementById("stateIcon");

const ACTIVE_ICON_PATH = "youtube-shorts-blocker-enabled.png";
const INACTIVE_ICON_PATH = "youtube-shorts-blocker-disabled.png";

/**
 * Updates the popup copy and icon to mirror current blocker state.
 */
function updatePopupState(isActive) {
  statusText.textContent = isActive ? "Shorts blocking is on." : "Shorts blocking is off.";
  stateIcon.src = isActive ? ACTIVE_ICON_PATH : INACTIVE_ICON_PATH;
}

/**
 * Loads initial toggle state from local extension storage.
 */
async function initializePopup() {
  const stored = await extensionApi.storage.local.get("isActive");
  const isActive = stored.isActive === true;

  toggleElement.checked = isActive;
  updatePopupState(isActive);
}

/**
 * Persists toggle updates so content scripts react immediately.
 */
toggleElement.addEventListener("change", async () => {
  const isActive = toggleElement.checked;
  await extensionApi.storage.local.set({ isActive });
  updatePopupState(isActive);
});

initializePopup();
