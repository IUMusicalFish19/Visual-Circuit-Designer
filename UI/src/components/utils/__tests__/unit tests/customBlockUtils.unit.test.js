import {
  createCustomBlock,
  saveCustomBlock,
  loadCustomBlocks,
  deleteCustomBlock,
  findCustomBlockById,
} from "../../customBlockUtils.js";
import { generateId } from "../../generateId.js";

// Mock generateId to return a predictable ID
jest.mock("../../generateId.js", () => ({
  generateId: jest.fn(() => "mocked-id"),
}));

describe("createCustomBlock", () => {
  const validInputNode = { type: "inputNodeSwitch", name: "input1" };
  const validOutputNode = { type: "outputNodeLed", name: "output1" };
  const edges = [];

  it("throws if nodes is not an array", () => {
    expect(() => createCustomBlock(null, edges, "block")).toThrow(
      "Invalid nodes: must be an array",
    );
  });

  it("throws if edges is not an array", () => {
    expect(() => createCustomBlock([validInputNode], null, "block")).toThrow(
      "Invalid edges: must be an array",
    );
  });

  it("throws if no inputs or outputs", () => {
    expect(() => createCustomBlock([], [], "block")).toThrow(
      "Custom block must have at least one input and one output pin",
    );
  });

  it("throws if input node missing name", () => {
    const badInput = { type: "inputNodeButton" };
    const nodes = [badInput, validOutputNode];
    expect(() => createCustomBlock(nodes, edges, "block")).toThrow(
      'Input "Button" must have a name',
    );
  });

  it("throws if output node missing name", () => {
    const badOutput = { type: "outputNodeLed" };
    const nodes = [validInputNode, badOutput];
    expect(() => createCustomBlock(nodes, edges, "block")).toThrow(
      'Output "Led" must have a name',
    );
  });

  it("creates block with correct structure", () => {
    const block = createCustomBlock(
      [validInputNode, validOutputNode],
      edges,
      "MyBlock",
    );
    expect(block).toEqual({
      id: "mocked-id",
      name: "MyBlock",
      inputs: [validInputNode],
      outputs: [validOutputNode],
      originalSchema: { nodes: [validInputNode, validOutputNode], edges },
      defaultPosition: { x: 0, y: 0 },
    });
    expect(generateId).toHaveBeenCalled();
  });
});

describe("Custom block storage functions", () => {
  const sampleBlock = { id: "id1", name: "Block1" };

  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveCustomBlock", () => {
    it("saves a block to localStorage", () => {
      saveCustomBlock(sampleBlock);
      const stored = JSON.parse(localStorage.getItem("customBlocks"));
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(sampleBlock);
    });

    it("appends to existing blocks", () => {
      localStorage.setItem(
        "customBlocks",
        JSON.stringify([{ id: "existing" }]),
      );
      saveCustomBlock(sampleBlock);
      const stored = JSON.parse(localStorage.getItem("customBlocks"));
      expect(stored).toHaveLength(2);
      expect(stored).toEqual([{ id: "existing" }, sampleBlock]);
    });
  });

  describe("loadCustomBlocks", () => {
    it("returns empty array if none saved", () => {
      expect(loadCustomBlocks()).toEqual([]);
    });

    it("loads saved blocks", () => {
      const blocks = [sampleBlock];
      localStorage.setItem("customBlocks", JSON.stringify(blocks));
      expect(loadCustomBlocks()).toEqual(blocks);
    });

    it("returns empty on parse error", () => {
      localStorage.setItem("customBlocks", "invalid json");
      const originalError = console.error;
      const originalParse = JSON.parse;
      console.error = jest.fn();
      JSON.parse = () => {
        throw new Error("fail");
      };

      expect(loadCustomBlocks()).toEqual([]);

      console.error = originalError;
      JSON.parse = originalParse;
    });
  });

  describe("deleteCustomBlock", () => {
    beforeEach(() => {
      const blocks = [{ id: "a" }, { id: "b" }];
      localStorage.setItem("customBlocks", JSON.stringify(blocks));
    });

    it("deletes existing block and returns true", () => {
      const result = deleteCustomBlock("a");
      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem("customBlocks"));
      expect(stored).toEqual([{ id: "b" }]);
    });

    it("returns true even if id not found", () => {
      const result = deleteCustomBlock("x");
      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem("customBlocks"));
      expect(stored).toEqual([{ id: "a" }, { id: "b" }]);
    });

    it("returns false on error", () => {
      // Temporarily override JSON.parse to throw
      const originalParse = JSON.parse;
      const originalError = console.error;
      console.error = jest.fn();
      JSON.parse = () => {
        throw new Error("fail");
      };

      const result = deleteCustomBlock("a");
      expect(result).toBe(false);

      // Restore originals
      JSON.parse = originalParse;
      console.error = originalError;
    });
  });

  describe("findCustomBlockById", () => {
    beforeEach(() => {
      const blocks = [{ id: "x" }, { id: "y" }];
      localStorage.setItem("customBlocks", JSON.stringify(blocks));
    });

    it("finds and returns block by id", () => {
      expect(findCustomBlockById("y")).toEqual({ id: "y" });
    });

    it("returns undefined if not found", () => {
      expect(findCustomBlockById("z")).toBeUndefined();
    });

    it("returns null on error", () => {
      // Temporarily override JSON.parse to throw
      const originalParse = JSON.parse;
      const originalError = console.error;
      console.error = jest.fn();
      JSON.parse = () => {
        throw new Error("fail");
      };

      expect(findCustomBlockById("x")).toBeNull();

      // Restore originals
      JSON.parse = originalParse;
      console.error = originalError;
    });
  });
});
