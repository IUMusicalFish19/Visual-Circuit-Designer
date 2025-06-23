import { io } from "socket.io-client";

export const handleSimulateClick = ({
  simulateState,
  setSimulateState,
  socketRef,
  nodes,
  edges,
}) => {
  if (simulateState === "awaiting") {
    console.log("🟡 User canceled connect waiting");

    // Отключаем сокет, если уже есть
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
      console.log("❌ Socket manually disconnected during awaiting");
    }

    setSimulateState("idle");
    return;
  }

  if (simulateState === "idle") {
    setSimulateState("awaiting");

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8000", {
        transports: ["websocket"],
        path: "/socket.io",
      });

      // Когда сервер подтвердит соединение
      socketRef.current.on("ready", () => {
        console.log("✅ Connected to runner (ready)");
        setSimulateState("running");
      });

      socketRef.current.on("simulation_outputs", (data) => {
        console.log("📨 Simulation data received:", data);
      });

      socketRef.current.on("error", (data) => {
        console.error("❌ Simulation error:", data);
        socketRef.current.disconnect();
        socketRef.current = null;
        setSimulateState("error");
      });

      socketRef.current.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        if (simulateState !== "running") {
          setSimulateState("idle");
        }
      });

      // safety check (можно убрать)
      if (!socketRef.current) {
        console.warn("⚠️ Socket still null after init?");
      }
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

    console.log(JSON.stringify(flowData, null, 2));
    socketRef.current.emit("run_simulation", flowData);

    // НЕ переключай simulateState вручную — сервер сам вызовет setSimulateState("running")
  }

  if (simulateState === "running") {
    console.log("⛔️ Остановка симуляции");
    socketRef.current.emit("simulation:stop");
    setSimulateState("idle");
    socketRef.current.disconnect();
    socketRef.current = null;
  }
};
