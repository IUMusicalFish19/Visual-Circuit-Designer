import React, { useState, useCallback } from "react";
import { IconArrow } from "../../../assets/ui-icons.jsx";
import {
  IconAND,
  IconOR,
  IconNOT,
  IconNAND,
  IconNOR,
  IconXOR,
  IconInput,
  IconOutput,
} from "../../../assets/circuits-icons.jsx";

export default function CircuitsMenu({
  circuitsMenuState,
  onDragStart,
  spawnCircuit,
}) {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = useCallback((index) => {
    setOpenIndexes((prevIndexes) =>
      prevIndexes.includes(index)
        ? prevIndexes.filter((i) => i !== index)
        : [...prevIndexes, index],
    );
  }, []);

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
      gates: [],
    },
    {
      header: "Pins",
      gates: [
        { id: "inputNode", label: "input", icon: IconInput },
        { id: "outputNode", label: "output", icon: IconOutput },
      ],
    },
    {
      header: "Custom Logic Elements",
      gates: [],
    },
  ];

  return (
    <div className={`circuitsMenu ${circuitsMenuState ? "open" : ""}`}>
      <div className="menu-container">
        <div className="menu-header">
          <p className="circuitsMenuTitle">Menu</p>
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
                      className="dndnode"
                      draggable
                      onDragStart={(e) => onDragStart(e, node.id)}
                    >
                      <button onClick={() => spawnCircuit(node.id)}>
                        <node.icon
                          SVGClassName="dndnode-icon"
                          draggable="false"
                        />
                        <div className="circuitsName">{node.label}</div>
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
