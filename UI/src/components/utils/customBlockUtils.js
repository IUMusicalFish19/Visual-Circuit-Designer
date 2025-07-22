/*TODO: Add tests*/
import { generateId } from "./generateId.js";

export const createCustomBlock = (nodes, edges, blockName) => {
  if (!Array.isArray(nodes)) throw new Error("Invalid nodes: must be an array");
  if (!Array.isArray(edges)) throw new Error("Invalid edges: must be an array");

  const inputs = nodes.filter(
    (node) =>
      node.type === "inputNodeSwitch" || node.type === "inputNodeButton",
  );

  const outputs = nodes.filter((node) => node.type === "outputNodeLed");

  if (inputs.length === 0 || outputs.length === 0) {
    throw new Error(
      "Custom block must have at least one input and one output pin",
    );
  }

  inputs.forEach((node) => {
    if (!node.name) {
      throw new Error(
        `Input \"${node.type.replace("inputNode", "")}\" must have a name`,
      );
    }
  });

  outputs.forEach((node) => {
    if (!node.name) {
      throw new Error(
        `Output \"${node.type.replace("outputNode", "")}\" must have a name`,
      );
    }
  });

  return {
    id: generateId(),
    name: blockName,
    inputs,
    outputs,
    originalSchema: { nodes, edges },
    defaultPosition: { x: 0, y: 0 },
  };
};

/**
 * Сохраняет кастомный блок в localStorage
 */
export const saveCustomBlock = (customBlock) => {
  try {
    const savedBlocks = JSON.parse(
      localStorage.getItem("customBlocks") || "[]",
    );
    localStorage.setItem(
      "customBlocks",
      JSON.stringify([...savedBlocks, customBlock]),
    );
  } catch (error) {
    console.error("Failed to save custom block:", error);
  }
};

/**
 * Загружает все кастомные блоки из localStorage
 */
export const loadCustomBlocks = () => {
  try {
    return JSON.parse(localStorage.getItem("customBlocks") || "[]");
  } catch (error) {
    console.error("Failed to load custom blocks:", error);
    return [];
  }
};

/**
 * Удаляет кастомный блок по ID
 */
export const deleteCustomBlock = (blockId) => {
  try {
    const savedBlocks = JSON.parse(
      localStorage.getItem("customBlocks") || "[]",
    );
    const updatedBlocks = savedBlocks.filter((block) => block.id !== blockId);
    localStorage.setItem("customBlocks", JSON.stringify(updatedBlocks));
    return true;
  } catch (error) {
    console.error("Failed to delete custom block:", error);
    return false;
  }
};

/**
 * Находит кастомный блок по ID
 */
export const findCustomBlockById = (blockId) => {
  try {
    const savedBlocks = JSON.parse(
      localStorage.getItem("customBlocks") || "[]",
    );
    return savedBlocks.find((block) => block.id === blockId);
  } catch (error) {
    console.error("Failed to find custom block:", error);
    return null;
  }
};
