import { calculatePosition } from "../../calculatePosition.js";

jest.mock("../../../constants/nodeSizes", () => ({
  NODE_SIZES: {
    AND: { width: 80, height: 60 },
    OR: { width: 100, height: 70 },
    default: { width: 50, height: 50 },
  },
}));

describe("calculatePosition", () => {
  test("calculates position for AND node", () => {
    const rawPos = { x: 200, y: 150 };
    const result = calculatePosition(rawPos, "AND");
    expect(result).toEqual({ x: 160, y: 120 });
  });

  test("calculates position for OR node", () => {
    const rawPos = { x: 300, y: 250 };
    const result = calculatePosition(rawPos, "OR");
    expect(result).toEqual({ x: 250, y: 215 });
  });

  test("calculates position for unknown node type using default size", () => {
    const rawPos = { x: 100, y: 100 };
    const result = calculatePosition(rawPos, "UNKNOWN");
    expect(result).toEqual({ x: 75, y: 75 });
  });
});
