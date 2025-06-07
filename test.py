import cocotb
from cocotb.triggers import Timer
from itertools import product

@cocotb.test()
async def full_circuit_test(dut):
    inputs = ['A', 'B', 'C']
    outputs = ['OUT1', 'OUT2']

    for combo in product([0, 1], repeat=len(inputs)):
        for name, val in zip(inputs, combo):
            setattr(dut, name, val)

        await Timer(1, units='ns')

        out_vals = [int(getattr(dut, out)) for out in outputs]
        print(f"Inputs: {combo} => Outputs: {out_vals}")