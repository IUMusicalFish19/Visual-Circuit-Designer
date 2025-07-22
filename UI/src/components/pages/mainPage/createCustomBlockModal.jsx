import React, { useState } from "react";
import { IconCloseCross } from "../../../../assets/ui-icons.jsx";
import { showToastError } from "../../codeComponents/logger.jsx";
import {
  createCustomBlock,
  saveCustomBlock,
} from "../../utils/customBlockUtils";
import { useCustomBlocks } from "./customCircuit.jsx";

export default function CreateCustomBlockModal({
  isOpen,
  onClose,
  nodes,
  edges,
  onCreateCustomBlock,
}) {
  const [blockName, setBlockName] = useState("");
  const [error, setError] = useState("");
  const { addBlock } = useCustomBlocks();

  const handleCreateCustomBlock = () => {
    if (!blockName.trim()) {
      showToastError("Please enter a custom block name.");
      return;
    }
    try {
      const customBlock = createCustomBlock(nodes, edges, blockName.trim());
      saveCustomBlock(customBlock);

      addBlock(customBlock);

      setBlockName("");
      setError("");
      onClose();

      if (onCreateCustomBlock) onCreateCustomBlock(customBlock);
      alert(`Block "${blockName}" created successfully!`);
    } catch (err) {
      console.error("Error creating block:", err);
      setError(`Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="custom-block-modal">
      <div className="modal-content">
        <h3>Create custom block</h3>
        <button className="close-button-custom-circuit" onClick={onClose}>
          <IconCloseCross SVGClassName="close-custom-circuit-cross" />
        </button>

        <div className="creation-options">
          <div className="current-circuit-option">
            <div className="name-input">
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="New custom block name"
                required
              />
              <button
                className="create-button"
                onClick={() => handleCreateCustomBlock()}
              >
                Create
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
