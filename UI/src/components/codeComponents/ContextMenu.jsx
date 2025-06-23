import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export default function ContextMenu({
  id,
  name,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    const position = {
      x: node.position.x + 25,
      y: node.position.y + 25,
    };

    addNodes({
      ...node,
      selected: false,
      dragging: false,
      id: `${node.id}-copy-${Date.now()}`,
      position,
    });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <p style={{ margin: "0.5em", textAlign: "center" }}>
        <p style={{ fontSize: "0.95rem", margin: "0.7rem 0 0.7rem 0" }}>
          Node: {name ? name.slice(0, -4) : ""}
        </p>
      </p>
      <button
        style={{ margin: "0.5rem" }}
        className={"contextMenuButton"}
        onClick={duplicateNode}
      >
        Duplicate
      </button>
      <button
        style={{ margin: "0.5rem" }}
        className={"contextMenuButton"}
        onClick={deleteNode}
      >
        Delete
      </button>
    </div>
  );
}
