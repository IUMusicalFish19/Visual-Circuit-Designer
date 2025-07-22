import React, { useMemo } from "react";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import CustomBlockNode from "../../circuits/customBlockNode.jsx";
import { useCustomBlocks } from "./customCircuit.jsx";

const FlowWithCustomNodes = (props) => {
  const { customBlocks } = useCustomBlocks();

  const allNodeTypes = useMemo(() => {
    const customNodeTypes = {};

    customBlocks.forEach((block) => {
      customNodeTypes[`custom-${block.id}`] = CustomBlockNode;
    });

    return {
      ...props.nodeTypes,
      ...customNodeTypes,
    };
  }, [customBlocks, props.nodeTypes]);

  return <ReactFlow {...props} nodeTypes={allNodeTypes} />;
};

export default FlowWithCustomNodes;
