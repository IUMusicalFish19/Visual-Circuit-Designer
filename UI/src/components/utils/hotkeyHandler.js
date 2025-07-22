export function hotkeyHandler(e, context) {
  if (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA" ||
    document.activeElement.isContentEditable
  ) {
    return;
  }

  if (!context) return;

  const {
    openSettings,
    setOpenSettings,
    copyElements,
    cutElements,
    pasteElements,
    selectAll,
    deselectAll,
    saveCircuit,
    handleSimulateClick,
    simulateState,
    setSimulateState,
    socketRef,
    nodes,
    edges,
    handleUploadClick,
    handleExtractClick,
    setActiveAction,
    setPanOnDrag,
    setActiveWire,
    undo,
    redo,
  } = context;

  const isCtrlOrCmd = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();

  // Ctrl/Cmd + Key combinations
  if (isCtrlOrCmd) {
    switch (key) {
      case "c":
      case "с":
        e.preventDefault();
        copyElements?.();
        return;
      case "x":
      case "ч":
        e.preventDefault();
        cutElements?.();
        return;
      case "v":
      case "м":
        e.preventDefault();
        pasteElements?.();
        return;
      case "a":
      case "ф":
        e.preventDefault();
        selectAll?.();
        return;
      case "d":
      case "в":
        e.preventDefault();
        deselectAll?.();
        return;
      case "z":
      case "я":
        if (e.shiftKey) {
          e.preventDefault();
          redo?.();
        } else {
          e.preventDefault();
          undo?.();
        }
        return;
      case "y":
      case "н":
        e.preventDefault();
        redo?.();
        return;
      case "s":
      case "ы":
        e.preventDefault();
        if (e.shiftKey) {
          setOpenSettings?.((prev) => !prev);
        } else {
          saveCircuit?.();
        }
        return;
      case "r":
      case "к":
        if (e.shiftKey) {
          e.preventDefault();
          handleSimulateClick?.({
            simulateState,
            setSimulateState,
            socketRef,
            nodes,
            edges,
          });
        }
        return;
      case "o":
      case "щ":
        e.preventDefault();
        handleUploadClick?.();
        return;
      case "b":
      case "и":
        e.preventDefault();
        handleExtractClick?.();
        return;
    }
  }

  // Single-key hotkeys (not combined with Ctrl/Cmd)
  const hotkeys = {
    1: () => {
      setActiveAction?.("cursor");
      setPanOnDrag?.([2]);
    },
    2: () => {
      setActiveAction?.("hand");
      setPanOnDrag?.(true);
    },
    3: () => setActiveAction?.("eraser"),
    4: () => setActiveAction?.("text"),
    5: () => setActiveWire?.("default"),
    6: () => setActiveWire?.("step"),
    7: () => setActiveWire?.("straight"),
  };

  if (hotkeys[key]) {
    e.preventDefault();
    hotkeys[key]();
    return;
  }

  if (key === "escape" && openSettings) {
    setOpenSettings?.(false);
  }
}
