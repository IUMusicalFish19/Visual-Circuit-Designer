import {Handle, Position} from '@xyflow/react';

import CustomHandle from '../../codeComponents/CustomHandle.jsx';
import {IconNAND} from "../../../../assets/circuits-icons.jsx";

function NandNode({ isConnectable }) {
  return (
    <div className='circuit-button'>
      <IconNAND SVGClassName={'circuit-button-icon'}/>

      {/* Handles */}
      <CustomHandle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ top: 24, left: -1 }}
        isConnectable={isConnectable}
        maxConnections={1}
      />
      <CustomHandle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ top: 44, left: -1 }}
        isConnectable={isConnectable}
        maxConnections={1}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: 34, left: 72 }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default NandNode;