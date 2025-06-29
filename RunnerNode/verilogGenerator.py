def generate_verilog_from_json(circuit_json_data: dict) -> str:
    nodes = circuit_json_data["nodes"]
    edges = circuit_json_data["edges"]

    inputs = {}
    outputs = {}
    wires = {}
    gates = {}  # key: node_id, value: dict with type, inputs, outputs

    for node in nodes:
        node_id = node["id"]
        node_type = node["type"]

        if node_type in ["inputNode", "inputNodeSwitch", "inputNodeButton"]:
            inputs[node_id] = {
                "verilog_name": f"in_{node_id.replace('-', '_')}",
                "connected_to": []
            }

        elif node_type in ["outputNode", "outputNodeLed"]:
            outputs[node_id] = {
                "verilog_name": f"out_{node_id.replace('-', '_')}",
                "source": None
            }

        elif node_type in ["andNode", "orNode", "notNode", "xorNode", "nandNode", "norNode"]:
            wire_name = f"wire_{node_id.replace('-', '_')}"
            wires[node_id] = wire_name
            gates[node_id] = {
                "type": node_type.replace("Node", ""),  # and, or, not
                "in1": None,
                "in2": None,
                "out": wire_name
            }

    # 2. edges
    for edge in edges:
        source_id = edge["source"]
        target_id = edge["target"]
        target_handle = edge["targetHandle"]  # input-1, input-2

        if source_id in inputs and target_id in gates:
            input_signal = inputs[source_id]["verilog_name"]
            if target_handle in ["input-1", "input"]:
                gates[target_id]["in1"] = input_signal
            elif target_handle == "input-2":
                gates[target_id]["in2"] = input_signal

        elif source_id in gates and target_id in outputs:
            outputs[target_id]["source"] = gates[source_id]["out"]

        elif source_id in gates and target_id in gates:
            source_signal = gates[source_id]["out"]
            if target_handle in ["input-1", "input"]:
                gates[target_id]["in1"] = source_signal
            elif target_handle == "input-2":
                gates[target_id]["in2"] = source_signal

    # 3. input -> gates
    for input_id, input_info in inputs.items():
        for (gate, handle) in input_info["connected_to"]:
            if handle in ["input-1", "input"]:
                gate["in1"] = input_info["verilog_name"]
            elif handle == "input-2":
                gate["in2"] = input_info["verilog_name"]

    verilog_code = "`timescale 1ns/1ps\n\n"

    verilog_code += "module GeneratedCircuit (\n"

    input_ports = [info["verilog_name"] for info in inputs.values()]
    verilog_code += "    input " + ",\n    input ".join(input_ports) + ",\n"

    output_ports = [info["verilog_name"] for info in outputs.values()]
    verilog_code += "    output " + ",\n    output ".join(output_ports) + "\n"

    verilog_code += ");\n\n"

    # Intermediate wires
    if wires:
        verilog_code += "    // Wires declarations\n"
        for wire_name in wires.values():
            verilog_code += f"    wire {wire_name};\n"
        verilog_code += "\n"

    verilog_code += "    // Logic gates\n"
    for gate_id, gate_info in gates.items():
        gtype = gate_info["type"]
        in1 = gate_info["in1"] or "1'b0"
        out_wire = gate_info["out"]

        if gtype == "not":
            verilog_code += f"    not {out_wire.replace('wire', 'not_gate')} ({out_wire}, {in1});\n"
        else:
            in2 = gate_info["in2"] or "1'b0"
            verilog_code += f"    {gtype} {out_wire.replace('wire', gtype + '_gate')} ({out_wire}, {in1}, {in2});\n"

    verilog_code += "\n    // Output connections\n"
    for output_id, output_info in outputs.items():
        source = output_info["source"] or "1'b0"
        verilog_code += f"    assign {output_info['verilog_name']} = {source};\n"

    verilog_code += "\nendmodule\n"
    return verilog_code


if __name__ == "__main__":
    verilog_code_test = generate_verilog_from_json(open("circuitSample.json").read().__dict__)

    with open("cocotb/dut.v", "w") as f:
        f.write(verilog_code_test)

    print("Verilog code generated and written to top.v")