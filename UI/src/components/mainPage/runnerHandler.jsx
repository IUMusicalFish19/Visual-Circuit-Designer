import { io } from "socket.io-client";

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
    console.log("🟡 User canceled connect waiting");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("❌ Socket manually disconnected during awaiting");
    }

    setSimulateState("idle");
    return;
  }

  if (simulateState === "error") {
    console.log("Ignored error. Back to idle");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("❌ Socket manually disconnected during error");
    }

    setSimulateState("idle");
    return;
  }

  if (simulateState === "idle") {
    console.log("[Simulation] 🚀 Starting simulation (awaiting connection)");
    setSimulateState("awaiting");

    const inputNodes = nodes.filter(node => node.type === 'inputNode');
    allInputStates = {};
    inputNodes.forEach(node => {
      const val = node.data.value;
      allInputStates[node.id] = val === 1 || val === '1' ? 1 : 0;
    });

    // Инициализация сокета
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8000", {
        transports: ["websocket"],
        path: "/socket.io",
      });

      sendInputStates = (changedInputs) => {
        if (!socketRef.current) {
          console.warn("⚠️ Cannot send input states: socket not connected");
          return;
        }
        console.log("📤 Sending changed input states:", changedInputs);
        socketRef.current.emit("set_inputs", { inputs: changedInputs });
      };

      socketRef.current.on("ready", () => {
        console.log("✅ Connected to runner (ready)");
        setSimulateState("running");

        // Отправляем начальные состояния после подключения
        const initialStates = {};
        for (const nodeId in allInputStates) {
          initialStates[`in_${nodeId}`] = allInputStates[nodeId];
        }
      });

      socketRef.current.on("status", (data) => {
        if (data.msg === "Simulation started") {
          console.log("✅ Simulation is ready (status confirmed)");
          setSimulateState("running");

          const initialStates = {};
          for (const nodeId in allInputStates) {
            initialStates[`in_${nodeId}`] = allInputStates[nodeId];
          }

          if (sendInputStates) {
            sendInputStates(initialStates);
          }
        } else {
          console.log("ℹ️ Simulation status:", data);
        }
      });

      socketRef.current.on("simulation_outputs", (data) => {
        console.log("📨 Simulation data received:", data);
      });

      socketRef.current.on("error", (data) => {
        console.error("❌ Simulation error:", data);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setSimulateState("error");
        sendInputStates = null;
      });

      socketRef.current.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        if (simulateState !== "running") {
          setSimulateState("idle");
        }
        sendInputStates = null;
      });
    }

    // Отправляем данные схемы
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

    console.log("[Simulation] 📋 Sending circuit data:", flowData);
    socketRef.current.emit("run_simulation", flowData);
  }

  if (simulateState === "running") {
    console.log("[Simulation] ⛔️ Stopping simulation");
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
    console.warn("⚠️ Cannot update input state: simulation not running");
    return;
  }

  // 1. Обновляем локальное состояние только для измененного узла
  allInputStates[nodeId] = value;

  // 2. Формируем полный набор состояний для отправки
  const fullStatesToSend = {};
  for (const [id, val] of Object.entries(allInputStates)) {
    let valToSend;
    if (val) valToSend= 1;
    if (!val) valToSend = 0;
    fullStatesToSend[`in_${id}`] = valToSend;
  }

  // 3. Отправляем ВСЕ состояния
  sendInputStates(fullStatesToSend);
};