import AndNode from "../circuits/basicLogicElements/AND.jsx";
import OrNode from "../circuits/basicLogicElements/OR.jsx";
import NotNode from "../circuits/basicLogicElements/NOT.jsx";
import NandNode from "../circuits/basicLogicElements/NAND.jsx";
import NorNode from "../circuits/basicLogicElements/NOR.jsx";
import XorNode from "../circuits/basicLogicElements/XOR.jsx";
import InputNode from "../circuits/IOelemnts/input.jsx";
import OutputNode from "../circuits/IOelemnts/output.jsx";
import SwitchNode from "../circuits/IOelemnts/switch.jsx";

export const nodeTypes = {
  andNode: AndNode,
  orNode: OrNode,
  notNode: NotNode,
  nandNode: NandNode,
  norNode: NorNode,
  xorNode: XorNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  switchNode: SwitchNode,
};

export const initialNodes = [];
