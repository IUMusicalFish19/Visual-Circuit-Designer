import { handleNameChange } from "../../handleNameChange";

describe("handleNameChange", () => {
  const mockSetNodes = jest.fn();

  const editableNode = { id: "1", name: "Old Name" };

  const initialNodes = [
    { id: "1", name: "Old Name", type: "inputNodeSwitch" },
    { id: "2", name: "Another Node", type: "inputNodeButton" },
  ];

  beforeEach(() => {
    mockSetNodes.mockClear();
  });

  it("updates the name of the editable node", () => {
    const event = { target: { value: "New Name" } };

    handleNameChange(event, editableNode, mockSetNodes);

    expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetNodes.mock.calls[0][0];
    const result = updateFn(initialNodes);

    expect(result).toEqual([
      { id: "1", name: "New Name", type: "inputNodeSwitch" },
      { id: "2", name: "Another Node", type: "inputNodeButton" },
    ]);
  });

  it("does nothing if editableNode is null", () => {
    const event = { target: { value: "Should Not Update" } };

    handleNameChange(event, null, mockSetNodes);

    expect(mockSetNodes).not.toHaveBeenCalled();
  });
});
