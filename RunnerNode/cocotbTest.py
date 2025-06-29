import os
import queue
import threading
import time

import socketio
import cocotb
from cocotb.triggers import Timer
from cocotb.runner import get_runner


@cocotb.test()
async def interactive_test(dut):
    user_sid = os.environ["user_sid"]

    inputs_queue = queue.Queue()
    stop_event = threading.Event()

    sio = socketio.Client()

    @sio.event
    def connect():
        dut._log.info("Socket.IO connected to main server")
        sio.emit("register_simulation", {"user_sid": user_sid})

    @sio.event
    def simulation_inputs(data):
        dut._log.info(f"Received inputs: {data}")
        inputs_queue.put(data)

    @sio.event
    def disconnect():
        dut._log.info("Socket.IO disconnected")
        stop_event.set()

    @sio.event
    def stop_simulation():
        dut._log.info("Stop signal received")
        stop_event.set()

    def socket_thread():
        try:
            sio.connect("http://localhost:80", wait=True)
            sio.wait()
        except Exception as e:
            dut._log.error(f"Socket.IO failed: {e}")
            stop_event.set()

    threading.Thread(target=socket_thread, daemon=True).start()

    await Timer(1, units="us")

    while not stop_event.is_set():
        try:
            data = inputs_queue.get(timeout=0.1)
            for name, value in data.items():
                if hasattr(dut, name):
                    getattr(dut, name).value = value
                else:
                    dut._log.warning(f"Signal {name} not found")

            await Timer(1, units="ns")

            outputs = {
                name: int(getattr(dut, name).value)
                for name in dir(dut)
                if name.startswith("out_")
            }

            dut._log.info(f"OUTPUTS: {outputs}")

            sio.emit("simulation_outputs", {"user_sid": user_sid, "outputs": outputs})

        except queue.Empty:
            await Timer(10, units="us")

    sio.disconnect()


def run_cocotb_test(sim_path, user_sid):
    os.environ["user_sid"] = user_sid
    runner = get_runner("icarus")

    try:
        runner.build(
            verilog_sources=[os.path.join(sim_path, "dut.v")],
            hdl_toplevel="GeneratedCircuit",
            build_dir=os.path.join(sim_path, "build")
        )

        runner.test(
            hdl_toplevel="GeneratedCircuit",
            test_module="cocotbTest",
        )
    except Exception as e:
        handle_simulation_error(user_sid, f"Simulation error: {str(e)}")
    except SystemExit as se:
        if se.code != 0:
            handle_simulation_error(user_sid, f"SystemExit with code {se.code}")
    except BaseException as be:
        handle_simulation_error(user_sid, f"Critical error: {str(be)}")


def handle_simulation_error(user_sid, error_msg):
    try:
        print(f"[ERROR] {error_msg}")
        error_sio = socketio.Client()
        error_sio.connect("http://localhost:80")
        error_sio.emit("internal_simulation_error", {
            "user_sid": user_sid,
            "msg": error_msg
        })
        time.sleep(0.5)
        error_sio.disconnect()
    except Exception as e:
        print(f"[CRITICAL] Failed to emit error: {e}")