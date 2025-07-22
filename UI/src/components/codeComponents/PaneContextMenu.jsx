import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export default function PaneContextMenu({
  copyElements,
  pasteElements,
  cutElements,
  selectedElements,
  clipboard,
  onClose,
  top,
  left,
  right,
  bottom,
  onCreateCustom,
  ...props
}) {
  const { setNodes, setEdges } = useReactFlow();

  const deleteSelectedElements = useCallback(() => {
    const selectedNodeIds = new Set(selectedElements.nodes.map((n) => n.id));
    const selectedEdgeIds = new Set(selectedElements.edges.map((e) => e.id));

    setNodes((nodes) => nodes.filter((node) => !selectedNodeIds.has(node.id)));
    setEdges((edges) =>
      edges.filter(
        (edge) =>
          !selectedEdgeIds.has(edge.id) &&
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target),
      ),
    );
  }, [selectedElements, setNodes, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      onClick={onClose}
      {...props}
    >
      <button
        className="context-menu-button"
        onClick={copyElements}
        disabled={!selectedElements?.nodes?.length}
      >
        Copy
      </button>
      <button
        className="context-menu-button"
        onClick={pasteElements}
        disabled={!clipboard?.nodes?.length}
      >
        Paste here
      </button>
      <button
        className="context-menu-button"
        onClick={cutElements}
        disabled={!selectedElements?.nodes?.length}
      >
        Cut
      </button>
      <button className="context-menu-button" onClick={deleteSelectedElements}>
        Delete
      </button>

      {/* New custom circuit button */}
      <button
        className="context-menu-button"
        onClick={() => {
          onCreateCustom();
          onClose();
        }}
      >
        Create custom node
      </button>
    </div>
  );
}
