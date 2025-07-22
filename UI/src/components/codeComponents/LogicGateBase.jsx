import CustomHandle from "./CustomHandle.jsx";
import { useRotatedNode } from "../hooks/useRotatedNode.jsx";
import React from "react";

function LogicGateBase({
  id,
  data,
  isConnectable,
  IconComponent,
  handleConfigs,
  getHandleStyleOverrides,
}) {
  const rotation = data.rotation || 0;
  const { getHandlePosition, RotatedNodeWrapper } = useRotatedNode(
    id,
    rotation,
    80,
    60,
  );

  const getHandleStyle = (handle) => {
    if (getHandleStyleOverrides) {
      return getHandleStyleOverrides(handle, rotation);
    }

    // Default handle styles for two-input gates
    switch (rotation) {
      case 90:
        return handle === "input-1"
          ? { top: 19, left: -1 }
          : handle === "input-2"
            ? { top: 39, left: -1 }
            : { top: 21.5, left: 79 };
      case 180:
        return handle === "input-1"
          ? { top: 19, left: -8 }
          : handle === "input-2"
            ? { top: 39, left: -8 }
            : { top: 29, left: 79 };
      case 270:
        return handle === "input-1"
          ? { top: 12, left: -1 }
          : handle === "input-2"
            ? { top: 32, left: -1 }
            : { top: 29.5, left: 79 };
      default:
        return handle === "input-1"
          ? { top: 20, left: -1 }
          : handle === "input-2"
            ? { top: 40, left: -1 }
            : { top: 30, left: 72 };
    }
  };

  return (
    <RotatedNodeWrapper className="logic-gate">
      <IconComponent SVGClassName={"logic-gate-icon"} />

      {/* Handles */}
      {handleConfigs.map(({ id: handleId, type, position }) => (
        <CustomHandle
          key={handleId}
          id={handleId}
          type={type}
          position={getHandlePosition(position)}
          isConnectable={isConnectable}
          style={getHandleStyle(handleId)}
          connections={handleId.slice(0, 2) === "in" ? 1 : undefined}
        />
      ))}
    </RotatedNodeWrapper>
  );
}

export default LogicGateBase;
