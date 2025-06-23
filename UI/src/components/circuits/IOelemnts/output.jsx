import { Position } from "@xyflow/react";

import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import { IconOutput } from "../../../../assets/circuits-icons.jsx";

function outputNode({ isConnectable }) {
  return (
    <div className="circuit-button">
      <IconOutput SVGClassName={"circuit-button-icon"} />

      {/* Handles */}
      <CustomHandle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ top: 34, left: -1 }}
        isConnectable={isConnectable}
        maxConnections={1}
      />
    </div>
  );
}

export default outputNode;
