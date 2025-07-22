export function getEditableNode(nodes, edges) {
  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);

  if (selectedNodes.length === 1 && selectedEdges.length === 0) {
    const node = selectedNodes[0];
    if (
      ["inputNodeSwitch", "inputNodeButton", "outputNodeLed"].includes(
        node.type,
      )
    ) {
      return node;
    }
  }
  return null;
}
