import AndNode from "../circuits/basicLogicElements/AND.jsx";
import OrNode from "../circuits/basicLogicElements/OR.jsx";
import NotNode from "../circuits/basicLogicElements/NOT.jsx";
import NandNode from "../circuits/basicLogicElements/NAND.jsx";
import NorNode from "../circuits/basicLogicElements/NOR.jsx";
import XorNode from "../circuits/basicLogicElements/XOR.jsx";
import TextNode from "../circuits/advancedElements/TextNode.jsx";
import InputNodeSwitch from "../circuits/IOelemnts/switch.jsx";
import InputNodeButton from "../circuits/IOelemnts/button.jsx";
import OutputNodeLed from "../circuits/IOelemnts/led.jsx";
import CustomBlockNode from "../circuits/customBlockNode.jsx";

export const nodeTypes = {
  andNode: AndNode,
  orNode: OrNode,
  notNode: NotNode,
  nandNode: NandNode,
  norNode: NorNode,
  xorNode: XorNode,
  text: TextNode,
  inputNodeSwitch: InputNodeSwitch,
  inputNodeButton: InputNodeButton,
  outputNodeLed: OutputNodeLed,
  customBlock: CustomBlockNode,
};
