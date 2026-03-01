const MODES = ["quick", "operator", "architect"];

const state = {
  mode: "quick",
  context: {
    workspaceId: "workspace-finops-001",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    currency: "MUR",
  },
};

const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const activeModeBadge = document.getElementById("active-mode-badge");
const quickPanel = document.getElementById("quick-panel");
const operatorPanel = document.getElementById("operator-panel");
const architectPanel = document.getElementById("architect-panel");
const architectTraceButton = document.getElementById("architect-trace");
const contractNote = document.getElementById("contract-note");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const runValidationButton = document.getElementById("run-validation");
const simulateErrorButton = document.getElementById("simulate-error");
const sharedContextForm = document.getElementById("shared-context-form");

function showError(message) {
  errorMessage.textContent = message;
  errorBanner.classList.remove("is-hidden");
}

function clearError() {
  errorBanner.classList.add("is-hidden");
}

function syncContextFromInputs() {
  const formData = new FormData(sharedContextForm);
  state.context = {
    workspaceId: String(formData.get("workspaceId") || ""),
    startDate: String(formData.get("startDate") || ""),
    endDate: String(formData.get("endDate") || ""),
    currency: String(formData.get("currency") || ""),
  };
}

function validateContext() {
  syncContextFromInputs();
  const { workspaceId, startDate, endDate } = state.context;

  if (!workspaceId || !startDate || !endDate) {
    showError("Missing required context fields. Provide workspace ID, start date, and end date.");
    return false;
  }

  if (startDate > endDate) {
    showError("Date range is invalid. Start date must be before or equal to end date.");
    return false;
  }

  clearError();
  return true;
}

function renderMode() {
  activeModeBadge.textContent = state.mode;

  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.mode);
  });

  quickPanel.classList.toggle("is-hidden", false);
  operatorPanel.classList.toggle("is-hidden", state.mode === "quick");
  architectPanel.classList.toggle("is-hidden", state.mode !== "architect");

  const isArchitect = state.mode === "architect";
  architectTraceButton.disabled = !isArchitect;
  architectPanel.classList.toggle("is-muted", !isArchitect);
  contractNote.textContent = isArchitect
    ? "Architect traceability controls are enabled for this mode."
    : "Architect traceability controls are disabled until architect mode is active.";
}

function setMode(nextMode) {
  if (!MODES.includes(nextMode)) {
    return;
  }

  syncContextFromInputs();
  state.mode = nextMode;
  renderMode();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode || "quick");
  });
});

sharedContextForm.addEventListener("input", () => {
  syncContextFromInputs();
  clearError();
});

runValidationButton.addEventListener("click", () => {
  if (validateContext()) {
    contractNote.textContent =
      "Context validated. Mode switch continuity preserved with current workspace and date scope.";
  }
});

simulateErrorButton.addEventListener("click", () => {
  showError("Degraded-state simulation: ingest diagnostics unavailable. Use operator mode and retry diagnostics.");
});

renderMode();
