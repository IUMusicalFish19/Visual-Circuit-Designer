import multiprocessing
import os
import uuid
from verilogGenerator import generate_verilog_from_json
from fastapi import FastAPI
import socketio
from cocotbTest import run_cocotb_test


sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=[
    "http://visual-circuit-designer.ru",
    "https://visual-circuit-designer.ru",
    "http://185.221.215.173",
    "https://185.221.215.173",
    "http://localhost:5173"])   # dev origin
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

user_simulations = {}

@sio.on("connect")
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit("ready", room=sid)


@sio.on("disconnect")
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    if sid in user_simulations:
        sim_sid = user_simulations.pop(sid)
        await sio.emit('stop_simulation', room=sim_sid)

    for user_id, sim_id in list(user_simulations.items()):
        if sim_id == sid:
            user_simulations.pop(user_id)


@sio.on("run_simulation")
async def run_simulation(sid, circuit_data):
    if sid in user_simulations:
        await sio.emit("error", {"msg": "Simulation already running"}, room=sid)
        return

    sim_id = str(uuid.uuid4())
    sim_path = os.path.join("simulations", sim_id)
    os.makedirs(sim_path, exist_ok=True)

    user_simulations[sid] = sim_id

    verilog_code = generate_verilog_from_json(circuit_data)

    verilog_path = os.path.join(sim_path, "dut.v")
    with open(verilog_path, "w") as f:
        f.write(verilog_code)

    p = multiprocessing.Process(
        target=run_cocotb_test,
        args=(sim_path, sid)
    )
    p.start()
    await sio.emit("status", {"msg": "Simulation started"}, room=sid)


@sio.on("set_inputs")
async def set_inputs(sid, data):
    if sid not in user_simulations:
        await sio.emit("error", {"msg": "No active simulation"}, room=sid)
        return

    sim_sid = user_simulations[sid]
    print(data["inputs"])
    await sio.emit('simulation_inputs', data['inputs'], room=sim_sid)


@sio.on("stop_simulation")
async def stop_simulation(sid):
    if sid in user_simulations:
        sim_sid = user_simulations.pop(sid)
        await sio.emit('stop_simulation', room=sim_sid)


@sio.on('simulation_outputs')
async def simulation_outputs(sid, data):
    user_sid = data['user_sid']
    await sio.emit('simulation_outputs', data['outputs'], room=user_sid)
