// noinspection DuplicatedCode
import { useState, useRef, useEffect } from "react";
import { useSimulateState } from "../../pages/mainPage.jsx";
import { useSimulateState } from "../../../pages/mainPage.jsx";
import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import { Position } from "@xyflow/react";

function InputNodeButton({ id, isConnectable, data }) {
  const { simulateState, updateInputState } = useSimulateState();
  const [inputState, setInputState] = useState(false);
  const cooldownRef = useRef(false);
  const delay = 500;

  useEffect(() => {
    setInputState(data.value || false);
  }, [data.value]);

  const handleChange = (newValue) => {
    setInputState(newValue);

    if (simulateState === "running" && updateInputState)
      updateInputState(id, newValue);

    data.value = newValue;
  };

  const handlePressDown = (e) => {
    e.stopPropagation();

    if (cooldownRef.current || inputState) return;

    handleChange(true);
  };

  const handlePressUp = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!inputState) return;

    cooldownRef.current = true;
    setTimeout(() => {
      handleChange(false);
      cooldownRef.current = false;
    }, delay);
  };

  return (
    <div className="circuit-button input">
      <p className={"input-text"}>Button</p>

      <SvgButton
        pressed={inputState}
        onPressDown={handlePressDown}
        onPressUp={handlePressUp}
        disabled={simulateState === "idle"}
      />

      <CustomHandle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: 40, left: 52.2, zIndex: "1000000" }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

const SvgButton = ({ pressed, onPressDown, onPressUp, disabled }) => {
  return (
    <div
      className={`svg-button-wrapper ${disabled ? "disabled" : ""} ${pressed ? "pressed" : ""}`}
      onPointerDownCapture={onPressDown}
      onPointerUpCapture={onPressUp}
    >
      <div className={`svg-button-inner ${pressed ? "pressed" : ""}`} />
    </div>
  );
};

export default InputNodeButton;
