import { Position } from "@xyflow/react";

import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import {
  IconSwitchOn,
  IconSwitchOff,
} from "../../../../assets/circuits-icons.jsx";
import { useState } from "react";

function AndNode({ isConnectable }) {
  const [switchState, setSwitchState] = useState(false);

  function handleSwitchClick() {
    setSwitchState(!switchState);
    console.log("click");
  }

  return (
    <div className="circuit-button">
      <button className={"switchNodeButton"} onClick={handleSwitchClick}>
        {switchState && (
          <IconSwitchOn
            SVGClassName={"circuit-button-icon"}
            className={"circuit-button-icon"}
          />
        )}
        {!switchState && (
          <IconSwitchOff
            SVGClassName={"circuit-button-icon"}
            className={"circuit-button-icon"}
          />
        )}
      </button>

      {/* Handles */}
      <CustomHandle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: 34, left: 72 }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default AndNode;
