export function loadLocalStorage({
  setCurrentBG,
  setShowMinimap,
  setTheme,
  setActiveAction,
  setActiveWire,
  setOpenSettings,
  setCircuitsMenuState,
  setLogLevel,
  setToastPosition,
  setPastePosition,
}) {
  const saved = localStorage.getItem("userSettings");
  if (!saved) return;

  let parsed;
  try {
    parsed = JSON.parse(saved);
  } catch {
    return;
  }

  if (parsed.currentBG) setCurrentBG(parsed.currentBG);
  if (typeof parsed.showMinimap === "boolean")
    setShowMinimap(parsed.showMinimap);
  if (parsed.theme) setTheme(parsed.theme);
  if (parsed.activeAction) setActiveAction(parsed.activeAction);
  if (parsed.activeWire) setActiveWire(parsed.activeWire);
  if (typeof parsed.openSettings === "boolean")
    setOpenSettings(parsed.openSettings);
  if (typeof parsed.circuitsMenuState === "boolean")
    setCircuitsMenuState(parsed.circuitsMenuState);
  if (parsed.logLevel) setLogLevel(parsed.logLevel);
  if (parsed.toastPosition) setToastPosition(parsed.toastPosition);
  if (parsed.pastePosition) setPastePosition(parsed.pastePosition);
}
