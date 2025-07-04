import { Position } from "@xyflow/react";

// Handle configurations for different gate types
export const GATE_HANDLE_CONFIGS = {
  AND: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "input-2", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],

  NAND: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "input-2", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],

  NOR: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "input-2", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],

  NOT: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],

  OR: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "input-2", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],

  XOR: [
    { id: "input-1", type: "target", position: Position.Left },
    { id: "input-2", type: "target", position: Position.Left },
    { id: "output-1", type: "source", position: Position.Right },
  ],
};

// Style overrides for NOT gate (single input)
export const getNotGateHandleStyle = (handle, rotation) => {
  switch (rotation) {
    case 90:
      return handle === "input-1"
        ? { top: 29, left: -1 }
        : { top: 21.5, left: 79 };
    case 180:
      return handle === "input-1"
        ? { top: 29, left: -8 }
        : { top: 29, left: 79 };
    case 270:
      return handle === "input-1"
        ? { top: 22.5, left: -1 }
        : { top: 29.5, left: 79 };
    default:
      return handle === "input-1"
        ? { top: 30, left: -1 }
        : { top: 30, left: 72 };
  }
};
