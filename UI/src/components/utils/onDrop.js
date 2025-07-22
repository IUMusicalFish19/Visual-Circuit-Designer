import { calculatePosition } from "./calculatePosition.js";
import { generateId } from "./generateId.js";
import { findCustomBlockById } from "./customBlockUtils.js"; // Add import

export function onDrop(event, reactFlowInstance, setNodes) {
  event.preventDefault();
  const type = event.dataTransfer.getData("application/reactflow");
  if (!type || !reactFlowInstance) return;

  const rawPos = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  const position = calculatePosition(rawPos, type);

  let newNode;

  // Handle custom blocks
  if (type.startsWith("custom-")) {
    const blockId = type.replace("custom-", "");
    const block = findCustomBlockById(blockId);

    if (block) {
      newNode = {
        id: generateId(),
        type: "customBlock", // Use this special type
        position,
        selected: true,
        data: {
          blockId: block.id, // Store block ID for lookup
          label: block.name, // Display name
          inputs: block.inputs,
          outputs: block.outputs,
        },
      };
    } else {
      console.error(`Custom block not found: ${blockId}`);
      return;
    }
  } else {
    // Standard node
    newNode = {
      id: generateId(),
      type,
      position,
      selected: true,
      data: { customId: generateId() },
    };
  }

  setNodes((nds) => nds.concat(newNode));
}
