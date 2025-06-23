import { Position } from "@xyflow/react";

import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import { IconInput } from "../../../../assets/circuits-icons.jsx";
import { useSimulateState } from "../../../pages/mainPage.jsx";

import { useEffect, useState } from "react";

function InputNode({ isConnectable, data }) {
  const { simulateState } = useSimulateState();
  const [inputState, setInputState] = useState(false);

  useEffect(() => {
    setInputState(data.simState);
  }, [data.simState]);

  return (
    <div className="circuit-button input">
      <div className="input-icon-wrapper">
        <IconInput SVGClassName="circuit-button-icon" />
      </div>

      {simulateState !== "idle" && (
        <div className="switch-wrapper">
          <SvgSwitch
            checked={inputState}
            onChange={setInputState}
            className="circuit-switch-input"
          />
        </div>
      )}

      {/* Handles */}
      <CustomHandle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: 25, left: 92 }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

// Вместо @radix-ui/react-switch
const SvgSwitch = ({ checked, onChange, SWclassName }) => {
  return (
    <svg
      className={SWclassName}
      width="42"
      height="25"
      viewBox="0 0 42 25"
      style={{ overflow: "visible" }}
    >
      <rect
        x="0"
        y="0"
        width="42"
        height="25"
        rx="12.5"
        fill={checked ? "var(--select-color)" : "var(--switch-bg-color)"}
        onClick={() => onChange(!checked)}
        style={{ cursor: "pointer", transition: "fill 0.1s ease" }}
      />

      <circle
        cx="12.5"
        cy="12.5"
        r="10.5"
        fill="white"
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        style={{
          cursor: "pointer",
          transition: "transform 0.1s ease",
          transform: checked ? `translateX(17px)` : "translateX(0px)",
        }}
      />
    </svg>
  );
};

export default InputNode;
