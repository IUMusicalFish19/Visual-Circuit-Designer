import { useState, useRef, useEffect } from "react";
import { Position } from "@xyflow/react";
import CustomHandle from "../../codeComponents/CustomHandle.jsx";
import { useSimulateState } from "../../pages/mainPage.jsx";
import { useRotatedNode } from "../../hooks/useRotatedNode.jsx";

function InputNodeButton({ id, data, isConnectable }) {
  const { simulateState, updateInputState } = useSimulateState();
  const [inputState, setInputState] = useState(data.value || false);
  const cooldownRef = useRef(false);
  const delay = 500;
  const rotation = data.rotation || 0;

  const { getHandlePosition, RotatedNodeWrapper, triggerUpdate } =
    useRotatedNode(id, rotation, 60, 80);

  const getHandleStyle = () => {
    switch (rotation) {
      case 90:
        return { top: 32, left: 59 };
      case 180:
        return { top: 38.5, left: 59 };
      case 270:
        return { top: 39.5, left: 59 };
      default:
        return { top: 40, left: 52 };
    }
  };

  // Обновлять локальное состояние при изменении data.value
  useEffect(() => {
    setInputState(data.value || false);
  }, [data.value]);

  // 🧼 Дополнительный триггер для обновления DOM после нажатий
  useEffect(() => {
    if (typeof triggerUpdate === "function") {
      triggerUpdate();
    }
  }, [inputState, rotation]);

  const handleChange = (newValue) => {
    setInputState(newValue);
    if (simulateState === "running" && updateInputState) {
      updateInputState(id, newValue);
    }
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
    <RotatedNodeWrapper className="logic-gate">
      <p className="input-text">Button</p>

      <SvgButton
        pressed={inputState}
        onPressDown={handlePressDown}
        onPressUp={handlePressUp}
        disabled={simulateState === "idle"}
      />

      <CustomHandle
        type="source"
        position={getHandlePosition(Position.Right)}
        id="output-1"
        style={getHandleStyle("output-1")}
        isConnectable={isConnectable}
      />
    </RotatedNodeWrapper>
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
