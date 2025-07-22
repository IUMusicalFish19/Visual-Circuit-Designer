import { getEditableNode } from "../../getEditableNode";

describe("getEditableNode", () => {
  const edge = (id) => ({ id, selected: true });

  const createNode = (type, selected = true) => ({
    id: "1",
    type,
    selected,
  });

  it("returns the node if exactly one valid node is selected and no edge is selected", () => {
    const nodes = [createNode("inputNodeSwitch")];
    const edges = [];
    expect(getEditableNode(nodes, edges)).toEqual(nodes[0]);
  });

  it("returns null if no node is selected", () => {
    const nodes = [{ id: "1", type: "inputNodeSwitch", selected: false }];
    const edges = [];
    expect(getEditableNode(nodes, edges)).toBeNull();
  });

  it("returns null if more than one node is selected", () => {
    const nodes = [
      createNode("inputNodeSwitch"),
      createNode("inputNodeButton"),
    ];
    const edges = [];
    expect(getEditableNode(nodes, edges)).toBeNull();
  });

  it("returns null if a node is selected but edge is also selected", () => {
    const nodes = [createNode("inputNodeSwitch")];
    const edges = [edge("e1")];
    expect(getEditableNode(nodes, edges)).toBeNull();
  });

  it("returns null if selected node has unsupported type", () => {
    const nodes = [createNode("customNodeType")];
    const edges = [];
    expect(getEditableNode(nodes, edges)).toBeNull();
  });
});
