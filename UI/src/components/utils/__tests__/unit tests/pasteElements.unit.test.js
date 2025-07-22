import { pasteElements } from "../../pasteElements";
import { calculatePosition } from "../../calculatePosition.js";
import { generateId } from "../../generateId.js";

jest.mock("../../calculatePosition.js");
jest.mock("../../generateId.js");

describe("pasteElements", () => {
  let mockSetNodes;
  let mockSetEdges;
  const mockReactFlowInstance = {
    screenToFlowPosition: jest.fn(() => ({ x: 50, y: 50 })),
  };
  const clipboard = {
    nodes: [
      {
        id: "1",
        type: "foo",
        position: { x: 10, y: 10 },
        data: { customId: "old" },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "1",
        target: "1",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetNodes = jest.fn((fn) => fn([]));
    mockSetEdges = jest.fn((fn) => fn([]));
    calculatePosition.mockReturnValue({ x: 100, y: 100 });
    generateId
      .mockReturnValueOnce("node-1")
      .mockReturnValueOnce("custom-1")
      .mockReturnValueOnce("edge-1");
  });

  it("logs error and returns if reactFlowInstance is null", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    pasteElements({
      clipboard,
      mousePosition: { x: 0, y: 0 },
      reactFlowInstance: null,
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      pastePosition: "cursor",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "React Flow instance not available",
    );
    expect(mockSetNodes).not.toHaveBeenCalled();
    expect(mockSetEdges).not.toHaveBeenCalled();
  });

  it("only clears selection if clipboard is empty", () => {
    pasteElements({
      clipboard: { nodes: [], edges: [] },
      mousePosition: { x: 0, y: 0 },
      reactFlowInstance: mockReactFlowInstance,
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      pastePosition: "cursor",
    });

    // сначала очищаем селекцию узлов и рёбер, второй вызов — нет добавления новых
    expect(mockSetNodes).toHaveBeenCalledTimes(1);
    expect(mockSetEdges).toHaveBeenCalledTimes(1);
  });

  it("pastes elements at cursor position", () => {
    pasteElements({
      clipboard,
      mousePosition: { x: 50, y: 50 },
      reactFlowInstance: mockReactFlowInstance,
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      pastePosition: "cursor",
    });

    expect(mockSetNodes).toHaveBeenCalledTimes(2);
    expect(mockSetEdges).toHaveBeenCalledTimes(2);

    expect(calculatePosition).toHaveBeenCalledWith({ x: 50, y: 50 }, "foo");

    const addNodesFn = mockSetNodes.mock.calls[1][0];
    const resultNodes = addNodesFn([]);
    expect(resultNodes).toEqual([
      {
        id: "node-1",
        type: "foo",
        position: { x: 100, y: 100 },
        selected: true,
        data: { customId: "custom-1" },
      },
    ]);

    const addEdgesFn = mockSetEdges.mock.calls[1][0];
    const resultEdges = addEdgesFn([]);
    expect(resultEdges).toEqual([
      {
        id: "edge-1",
        source: "node-1",
        target: "node-1",
      },
    ]);

    expect(generateId).toHaveBeenCalledTimes(3);
  });

  it("pastes elements at center position when pastePosition !== 'cursor'", () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    Object.defineProperty(window, "innerWidth", {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 600,
      configurable: true,
    });

    pasteElements({
      clipboard,
      mousePosition: { x: 0, y: 0 },
      reactFlowInstance: mockReactFlowInstance,
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      pastePosition: "center",
    });

    expect(mockReactFlowInstance.screenToFlowPosition).toHaveBeenCalledWith({
      x: 800 / 2,
      y: 600 / 2,
    });

    expect(mockSetNodes).toHaveBeenCalledTimes(2);
    expect(mockSetEdges).toHaveBeenCalledTimes(2);

    expect(calculatePosition).toHaveBeenCalledWith({ x: 50, y: 50 }, "foo");

    Object.defineProperty(window, "innerWidth", { value: originalWidth });
    Object.defineProperty(window, "innerHeight", { value: originalHeight });
  });
});
