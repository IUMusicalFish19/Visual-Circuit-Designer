/*TODO: Add tests*/
export const generateCustomBlockId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `custom_${timestamp}_${random}`;
};

export const createCustomBlock = (nodes, edges, blockName) => {
  if (!Array.isArray(nodes)) throw new Error("Invalid nodes: must be an array");
  if (!Array.isArray(edges)) throw new Error("Invalid edges: must be an array");

  const inputNodes = nodes.filter(node =>
    node.type === "inputNodeSwitch" || node.type === "inputNodeButton"
  );

  const outputNodes = nodes.filter(node =>
    node.type === "outputNodeLed"
  );

  if (inputNodes.length === 0 || outputNodes.length === 0) {
    throw new Error("Custom block must have at least one input and one output pin");
  }

  inputNodes.forEach(node => {
    if (!node.name) {
      throw new Error(`Input \"${node.type.replace("inputNode", "")}\" must have a name`);
    }
  });

  outputNodes.forEach(node => {
    if (!node.name) {
      throw new Error(`Output \"${node.type.replace("outputNode", "")}\" must have a name`);
    }
  });

  return {
    id: generateCustomBlockId(),
    name: blockName,
    inputNodes,
    outputNodes,
    originalSchema: { nodes, edges },
  };
};

/**
 * Сохраняет кастомный блок в localStorage
 */
export const saveCustomBlock = (customBlock) => {
  try {
    const savedBlocks = JSON.parse(localStorage.getItem("customBlocks") || "[]");
    localStorage.setItem("customBlocks", JSON.stringify([...savedBlocks, customBlock]));
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
  const blocks = loadCustomBlocks();
  return blocks.find((block) => block.id === blockId);
};
