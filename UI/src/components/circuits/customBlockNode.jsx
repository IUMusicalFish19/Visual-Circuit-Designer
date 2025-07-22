import React from "react";
import { Handle, Position } from "@xyflow/react";

const CustomBlockNode = ({ data }) => {
  return (
    <div className="custom-block-node">
      <div className="custom-block-header">{data.label}</div>
      <div className="custom-block-body">
        {/* Input Handles */}
        <div className="inputs">
          {data.inputs?.map((input, idx) => (
            <div key={`in-${idx}`} className="input-group">
              <div className="input-label">{input.name}</div>
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${idx}`}
                style={{ top: `${9}px`, left: `${-10}px` }}
              />
            </div>
          ))}
        </div>

        {/* Output Handles */}
        <div className="outputs">
          {data.outputs?.map((output, idx) => (
            <div key={`out-${idx}`} className="output-group">
              <div className="output-label">{output.name}</div>
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${idx}`}
                style={{ top: `${9}px`, right: `${-10}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomBlockNode;
