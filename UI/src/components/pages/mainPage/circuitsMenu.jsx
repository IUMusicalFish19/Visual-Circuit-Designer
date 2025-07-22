import React, { useState, useCallback } from "react";
import { IconArrow } from "../../../../assets/ui-icons.jsx";
import {
  IconAND,
  IconOR,
  IconNOT,
  IconNAND,
  IconNOR,
  IconXOR,
  IconInput,
  IconOutput,
  IconText,
} from "../../../../assets/circuits-icons.jsx";
import { useCustomBlocks } from "./customCircuit.jsx"; // Путь к вашим утилитам

const CustomBlockIcon = ({ inputs, outputs }) => {
  return (
    <div className="custom-icon">
      <div className="inputs">
        {inputs.map((input, index) => (
          <div key={index} className="input-dot" title={input.name}></div>
        ))}
      </div>
      <div className="custom-block-body"></div>
      <div className="outputs">
        {outputs.map((output, index) => (
          <div key={index} className="output-dot" title={output.name}></div>
        ))}
      </div>
    </div>
  );
};

export default function CircuitsMenu({
  circuitsMenuState,
  onDragStart,
  spawnCircuit,
}) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const { customBlocks, isLoading } = useCustomBlocks();

  const toggleItem = useCallback((index) => {
    setOpenIndexes((prevIndexes) =>
      prevIndexes.includes(index)
        ? prevIndexes.filter((i) => i !== index)
        : [...prevIndexes, index],
    );
  }, []);

  if (isLoading) {
    return (
      <div className={`circuits-menu ${circuitsMenuState ? "open" : ""}`}>
        <div className="menu-container">
          <div className="menu-header">
            <p className="circuits-menu-title">Menu</p>
            <div className="divider"></div>
          </div>
          <p>Loading custom blocks...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      header: "Basic Logic Elements",
      gates: [
        { id: "andNode", label: "AND", icon: IconAND },
        { id: "orNode", label: "OR", icon: IconOR },
        { id: "notNode", label: "NOT", icon: IconNOT },
        { id: "nandNode", label: "NAND", icon: IconNAND },
        { id: "norNode", label: "NOR", icon: IconNOR },
        { id: "xorNode", label: "XOR", icon: IconXOR },
      ],
    },
    {
      header: "Advanced Logic Elements",
      gates: [{ id: "text", label: "Text", icon: IconText }],
    },
    {
      header: "Pins",
      gates: [
        { id: "inputNodeSwitch", label: "Switch", icon: IconInput },
        { id: "inputNodeButton", label: "Button", icon: IconInput },
        { id: "outputNodeLed", label: "LED", icon: IconOutput },
      ],
    },
    {
      header: "Custom Circuits",
      gates: customBlocks.map((block) => ({
        id: `custom-${block.id}`, // Префикс для идентификации кастомных блоков
        label: block.name,
        icon: (props) => (
          <CustomBlockIcon
            inputs={block.inputs}
            outputs={block.outputs}
            {...props}
          />
        ),
        customData: block, // Сохраняем полные данные блока для spawnCircuit
      })),
    },
  ];

  // Обработчик для создания кастомного блока
  const handleSpawnCustomCircuit = useCallback(
    (nodeId) => {
      const blockId = nodeId.replace("custom-", "");
      const block = customBlocks.find((b) => b.id === blockId);

      if (block) {
        spawnCircuit(`custom-${block.id}`);
      }
    },
    [customBlocks, spawnCircuit],
  );

  return (
    <div className={`circuits-menu ${circuitsMenuState ? "open" : ""}`}>
      <div className="menu-container">
        <div className="menu-header">
          <p className="circuits-menu-title">Menu</p>
          <div className="divider"></div>
        </div>

        <ol className="menu-items">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`menu-item ${openIndexes.includes(index) ? "active" : ""}`}
            >
              <div className="header" onClick={() => toggleItem(index)}>
                {item.header}
                <IconArrow SVGClassName="arrow" draggable="false" />
              </div>

              <div
                className={`gates-grid-wrapper ${openIndexes.includes(index) ? "open" : ""}`}
              >
                <div className="gates-grid">
                  {item.gates.map((node) => (
                    <div
                      key={node.id}
                      className="menu-element"
                      draggable
                      onDragStart={(e) => onDragStart(e, node.id)}
                      title={node.label}
                    >
                      <button
                        onClick={() =>
                          node.id.startsWith("custom-")
                            ? handleSpawnCustomCircuit(node.id)
                            : spawnCircuit(node.id)
                        }
                      >
                        <node.icon
                          SVGClassName="dndnode-icon"
                          draggable="false"
                        />
                        <div className="circuits-name">{node.label}</div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
