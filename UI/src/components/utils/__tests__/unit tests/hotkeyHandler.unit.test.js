import { hotkeyHandler } from "../../hotkeyHandler.js";

describe("hotkeyHandler", () => {
  const createContext = () => ({
    openSettings: true,
    setOpenSettings: jest.fn(),
    copyElements: jest.fn(),
    cutElements: jest.fn(),
    pasteElements: jest.fn(),
    selectAll: jest.fn(),
    deselectAll: jest.fn(),
    saveCircuit: jest.fn(),
    handleSimulateClick: jest.fn(),
    simulateState: "idle",
    setSimulateState: jest.fn(),
    socketRef: { current: {} },
    nodes: [],
    edges: [],
    handleUploadClick: jest.fn(),
    handleExtractClick: jest.fn(),
    setActiveAction: jest.fn(),
    setPanOnDrag: jest.fn(),
    setActiveWire: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
  });

  const makeEvent = (key, ctrlKey = true, shiftKey = false) => ({
    key,
    ctrlKey,
    shiftKey,
    metaKey: false,
    preventDefault: jest.fn(),
  });

  it("calls copyElements on Ctrl+C", () => {
    const ctx = createContext();
    const e = makeEvent("c");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.copyElements).toHaveBeenCalled();
  });

  it("calls cutElements on Ctrl+X", () => {
    const ctx = createContext();
    const e = makeEvent("x");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.cutElements).toHaveBeenCalled();
  });

  it("calls pasteElements on Ctrl+V", () => {
    const ctx = createContext();
    const e = makeEvent("v");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.pasteElements).toHaveBeenCalled();
  });

  it("calls selectAll on Ctrl+A", () => {
    const ctx = createContext();
    const e = makeEvent("a");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.selectAll).toHaveBeenCalled();
  });

  it("calls deselectAll on Ctrl+D", () => {
    const ctx = createContext();
    const e = makeEvent("d");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.deselectAll).toHaveBeenCalled();
  });

  it("calls undo on Ctrl+Z", () => {
    const ctx = createContext();
    const e = makeEvent("z");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.undo).toHaveBeenCalled();
  });

  it("calls redo on Ctrl+Y", () => {
    const ctx = createContext();
    const e = makeEvent("y");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.redo).toHaveBeenCalled();
  });

  it("calls redo on Ctrl+Shift+Z", () => {
    const ctx = createContext();
    const e = makeEvent("z", true, true);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.redo).toHaveBeenCalled();
  });

  it("toggles settings on Ctrl+Shift+S", () => {
    const ctx = createContext();
    const e = makeEvent("s", true, true);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setOpenSettings).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls saveCircuit on Ctrl+S", () => {
    const ctx = createContext();
    const e = makeEvent("s");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.saveCircuit).toHaveBeenCalled();
  });

  it("calls handleSimulateClick on Ctrl+Shift+R", () => {
    const ctx = createContext();
    const e = makeEvent("r", true, true);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.handleSimulateClick).toHaveBeenCalledWith({
      simulateState: "idle",
      setSimulateState: ctx.setSimulateState,
      socketRef: ctx.socketRef,
      nodes: [],
      edges: [],
    });
  });

  it("calls handleUploadClick on Ctrl+O", () => {
    const ctx = createContext();
    const e = makeEvent("o");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.handleUploadClick).toHaveBeenCalled();
  });

  it("calls handleExtractClick on Ctrl+B", () => {
    const ctx = createContext();
    const e = makeEvent("b");
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.handleExtractClick).toHaveBeenCalled();
  });

  it('calls setActiveAction and setPanOnDrag on "1"', () => {
    const ctx = createContext();
    const e = makeEvent("1", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveAction).toHaveBeenCalledWith("cursor");
    expect(ctx.setPanOnDrag).toHaveBeenCalledWith([2]);
  });

  it('calls setActiveAction and setPanOnDrag on "2"', () => {
    const ctx = createContext();
    const e = makeEvent("2", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveAction).toHaveBeenCalledWith("hand");
    expect(ctx.setPanOnDrag).toHaveBeenCalledWith(true);
  });

  it('calls setActiveAction on "3"', () => {
    const ctx = createContext();
    const e = makeEvent("3", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveAction).toHaveBeenCalledWith("eraser");
  });

  it('calls setActiveAction on "4"', () => {
    const ctx = createContext();
    const e = makeEvent("4", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveAction).toHaveBeenCalledWith("text");
  });

  it('calls setActiveWire on "5"', () => {
    const ctx = createContext();
    const e = makeEvent("5", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveWire).toHaveBeenCalledWith("default");
  });

  it('calls setActiveWire on "6"', () => {
    const ctx = createContext();
    const e = makeEvent("6", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveWire).toHaveBeenCalledWith("step");
  });

  it('calls setActiveWire on "7"', () => {
    const ctx = createContext();
    const e = makeEvent("7", false);
    hotkeyHandler(e, ctx);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctx.setActiveWire).toHaveBeenCalledWith("straight");
  });

  it("closes settings on Escape if open", () => {
    const ctx = createContext();
    const e = makeEvent("Escape", false);
    hotkeyHandler(e, ctx);
    expect(ctx.setOpenSettings).toHaveBeenCalledWith(false);
  });
});
