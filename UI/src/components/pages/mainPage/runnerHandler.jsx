import { io } from "socket.io-client";
import { updateOutputStates } from "../../codeComponents/outputStateManager.js";
import {
  showToast,
  showToastError,
  logMessage,
  LOG_LEVELS,
} from "../../codeComponents/logger.jsx";

let allInputStates = {};
let sendInputStates = null;

export const handleSimulateClick = ({
  simulateState,
  setSimulateState,
  socketRef,
  nodes,
  edges,
}) => {
  if (simulateState === "awaiting") {
    showToast("Cancelled connecting", "🟡", LOG_LEVELS.DEBUG);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      logMessage("Socket manually disconnected ❌", LOG_LEVELS.DEBUG);
    }

    setSimulateState("idle");
    return;
  }

  if (simulateState === "error") {
    showToast("Ignored error", "⚠️", LOG_LEVELS.DEBUG);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      logMessage("Socket manually disconnected ❌", LOG_LEVELS.DEBUG);
    }

    setSimulateState("idle");
    return;
  }

  if (simulateState === "idle") {
    console.log("[Simulation] 🚀 Starting simulation (awaiting connection)");
    setSimulateState("awaiting");

    const inputNodes = nodes.filter(
      (node) =>
        node.type === "inputNode" ||
        node.type === "inputNodeSwitch" ||
        node.type === "inputNodeButton",
    );

    allInputStates = {};
    inputNodes.forEach((node) => {
      const val = node.data.value;
      allInputStates[node.id] = val === 1 || val === "1" ? 1 : 0;
    });

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io("/", {
        transports: ["websocket"],
        path: "/socket.io",
      });

      sendInputStates = (changedInputs) => {
        if (!socketRef.current) {
          showToast(
            "Cannot send input states, socket not connected",
            "⚠️",
            LOG_LEVELS.DEBUG,
          );
          return;
        }

        showToast("Sending changed input states", "📤", LOG_LEVELS.DEBUG);
        logMessage("📤 Sending changed input states:", LOG_LEVELS.DEBUG);
        logMessage(changedInputs, LOG_LEVELS.DEBUG);

        socketRef.current.emit("set_inputs", { inputs: changedInputs });
      };

      socketRef.current.on("ready", () => {
        showToast("Connected to the runner", "✅", LOG_LEVELS.DEBUG);
        setSimulateState("running");
      });

      socketRef.current.on("simulation_ready", () => {
        console.log("✅ Simulation is running");
        setSimulateState("running");

        const initialStates = {};
        for (const nodeId in allInputStates) {
          initialStates[`in_${nodeId}`] = allInputStates[nodeId];
        }

        if (sendInputStates) {
          sendInputStates(initialStates);
        }
      });

      socketRef.current.on("simulation_outputs", (data) => {
        logMessage("📨 Simulation data received:", LOG_LEVELS.DEBUG);
        logMessage(data, LOG_LEVELS.DEBUG);
        updateOutputStates(data);
      });

      // Handle errors
      socketRef.current.on("error", (data) => {
        showToastError(`Simulation error: ${data.msg}`);

        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setSimulateState("error");
        sendInputStates = null;
      });

      socketRef.current.on("disconnect", () => {
        showToast("Disconnected from Runner", "🔌", LOG_LEVELS.DEBUG);

        if (simulateState !== "running") {
          setSimulateState("idle");
        }
        sendInputStates = null;
      });
    }

    const flowData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    };

    showToast("Sending circuit data", "📋", LOG_LEVELS.DEBUG);
    logMessage("Sending circuit data:", LOG_LEVELS.DEBUG);
    logMessage(flowData, LOG_LEVELS.DEBUG);

    socketRef.current.emit("run_simulation", flowData);
  }

  if (simulateState === "running") {
    showToast("Stopping simulation", "🛑", LOG_LEVELS.IMPORTANT);
    socketRef.current.emit("simulation:stop");
    setSimulateState("idle");
    socketRef.current.disconnect();
    socketRef.current = null;
    sendInputStates = null;
    allInputStates = {};
  }
};

export const updateInputState = (nodeId, value) => {
  if (!sendInputStates) {
    showToast(
      "Cannot update input state: simulation not running",
      "⚠️",
      LOG_LEVELS.DEBUG,
    );
    return;
  }

  allInputStates[nodeId] = value;

  const fullStatesToSend = {};
  for (const [id, val] of Object.entries(allInputStates)) {
    let valToSend;
    if (val) valToSend = 1;
    if (!val) valToSend = 0;
    fullStatesToSend[`in_${id}`] = valToSend;
  }

  sendInputStates(fullStatesToSend);
};
