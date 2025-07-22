import { useEffect, useState } from "react";
import { Position, useUpdateNodeInternals } from "@xyflow/react";
import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import { useSimulateState } from "../../pages/mainPage.jsx";

function InputNodeSwitch({ id, data, isConnectable }) {
  const { simulateState, updateInputState } = useSimulateState();
  const [inputState, setInputState] = useState(false);
  const rotation = data.rotation || 0;
  const updateNodeInternals = useUpdateNodeInternals();

  const getHandlePosition = (basePosition) => {
    const positions = [
      Position.Top,
      Position.Right,
      Position.Bottom,
      Position.Left,
    ];
    const currentIndex = positions.indexOf(basePosition);
    const newIndex = (currentIndex + Math.floor(rotation / 90)) % 4;
    return positions[newIndex];
  };

  const getHandleStyle = () => {
    switch (rotation) {
      case 90:
        return { top: 72.5, left: 28 };
      case 180:
        return { top: 40, left: -1 };
      case 270:
        return { top: 0, left: 28 };
      default:
        return { top: 40, left: 52 };
    }
  };

  useEffect(() => {
    updateNodeInternals(id);
  }, [rotation, id, updateNodeInternals]);

  useEffect(() => {
    setInputState(data.value || false);
  }, [data.value]);

  const handleChange = (newValue) => {
    setInputState(newValue);

    // Отправляем изменение на сервер
    if (simulateState === "running" && updateInputState) {
      updateInputState(id, newValue);
    }

    // Обновляем данные узла (опционально)
    data.value = newValue;
  };

  return (
    <div className="logic-gate" style={{ width: "60px", height: "80px" }}>
      <p className={"input-text"}>Switch</p>

      <div
        className={`switch-wrapper ${simulateState === "idle" ? "deactivated" : ""}`}
      >
        <SvgSwitch
          checked={inputState}
          onChange={handleChange}
          SWGclassName="circuit-switch-input"
        />
      </div>

      {/* Handles */}
      <CustomHandle
        type="source"
        position={getHandlePosition(Position.Right)}
        id="output-1"
        style={getHandleStyle()}
        isConnectable={isConnectable}
      />
    </div>
  );
}

// Вместо @radix-ui/react-switch
const SvgSwitch = ({ checked, onChange, SWGclassName }) => {
  return (
    <svg
      className={SWGclassName}
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
        fill={checked ? "var(--led-active-color)" : "var(--switch-bg-color)"}
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

export default InputNodeSwitch;
