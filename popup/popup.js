const extensionApi = typeof browser !== "undefined" ? browser : chrome;

const toggleElement = document.getElementById("isActive");
const statusText = document.getElementById("statusText");

/**
 * Updates the text shown in popup to mirror current blocker state.
 */
function updateStatusText(isActive) {
  statusText.textContent = isActive
    ? "Blocking is enabled."
    : "Blocking is disabled.";
}

/**
 * Loads initial toggle state from local extension storage.
 */
async function initializePopup() {
  const stored = await extensionApi.storage.local.get("isActive");
  const isActive = stored.isActive !== false;

  toggleElement.checked = isActive;
  updateStatusText(isActive);
}

/**
 * Persists toggle updates so content scripts react immediately.
 */
toggleElement.addEventListener("change", async () => {
  const isActive = toggleElement.checked;
  await extensionApi.storage.local.set({ isActive });
  updateStatusText(isActive);
});

initializePopup();
