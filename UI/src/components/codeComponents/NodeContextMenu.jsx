import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export default function NodeContextMenu({
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

  const rotateNode = useCallback(
    (angle) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            const currentRotation = node.data?.rotation || 0;
            const newRotation = (currentRotation + angle + 360) % 360;
            return {
              ...node,
              data: {
                ...node.data,
                rotation: newRotation,
              },
            };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

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
      <div style={{ margin: "0.5em", textAlign: "center" }}>
        <div style={{ fontSize: "0.95rem", margin: "0.7rem 0 0.7rem 0" }}>
          Logic gate type: {name ? name.slice(0, -4) : ""}
        </div>
      </div>
      <button
        style={{ margin: "0.5rem" }}
        className={"context-menu-button"}
        onClick={duplicateNode}
      >
        Duplicate
      </button>
      <div style={{ display: "flex" }}>
        <button
          style={{ width: "24%" }}
          className={"context-menu-button"}
          onClick={() => rotateNode(-90)}
        >
          -90
        </button>
        <button
          style={{ width: "24%" }}
          className={"context-menu-button"}
          onClick={() => rotateNode(90)}
        >
          +90
        </button>
      </div>
      <button
        style={{ margin: "0.5rem" }}
        className={"context-menu-button"}
        onClick={deleteNode}
      >
        Delete
      </button>
    </div>
  );
}
