import { Handle, Position } from '@xyflow/react';
import {IconInput} from "../../../assets/circuits-icons.jsx";

function inputNode({ isConnectable }) {
  return (
    <div className='circuit-button'>
      <IconInput SVGClassName={'circuit-button-icon'}/>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: 34, left: 71 }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default inputNode;