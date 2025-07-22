import React, { useCallback, useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { SelectWireType } from "../pages/mainPage/select.jsx";

export default function EdgeContextMenu({
  id,
  name,
  top,
  left,
  right,
  bottom,
  ...props
}) {
  const { setEdges, getEdges } = useReactFlow();
  const [currentType, setCurrentType] = useState(name);

  // Update type if edge changes externally
  useEffect(() => {
    const edge = getEdges().find((e) => e.id === id);
    if (edge) setCurrentType(edge.type);
  }, [id, getEdges]);

  const changeEdgeType = useCallback(
    (newType) => {
      setCurrentType(newType);
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id ? { ...edge, type: newType } : edge,
        ),
      );
    },
    [id, setEdges],
  );

  const deleteEdge = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [setEdges, id]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <div style={{ margin: "0.5em", textAlign: "center" }}>
        <div style={{ fontSize: "0.95rem", margin: "0.7rem 0 0.7rem 0" }}>
          Wire type:
        </div>
      </div>
      <SelectWireType
        wireType={currentType}
        setWireType={changeEdgeType}
        className="select-wire-type"
      />
      <button
        style={{ margin: "0.5rem" }}
        className={"context-menu-button"}
        onClick={deleteEdge}
      >
        Delete
      </button>
    </div>
  );
}
