TOPLEVEL_LANG = verilog
VERILOG_SOURCES = $(shell pwd)/user_circuit.v
TOPLEVEL = user_circuit
MODULE = test

include $(shell cocotb-config --makefiles)/Makefile.sim