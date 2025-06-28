import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
  createContext,
} from "react";

import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  SelectionMode,
  useNodesState,
  useEdgesState,
  MiniMap,
  useStoreApi,
  useReactFlow,
} from "@xyflow/react";

import CircuitsMenu from "../components/mainPage/circuitsMenu.jsx";
import Toolbar from "../components/mainPage/toolbar.jsx";
import NodeContextMenu from "../components/codeComponents/NodeContextMenu.jsx";
import EdgeContextMenu from "../components/codeComponents/EdgeContextMenu.jsx";

import { initialNodes, nodeTypes } from "../components/codeComponents/nodes";
import { initialEdges } from "../components/codeComponents/edges";
import { MinimapSwitch } from "../components/mainPage/switch.jsx";
import { SelectCanvasBG, SelectTheme } from "../components/mainPage/select.jsx";

import { initialNodes, nodeTypes } from "../codeComponents/nodes.js";
import { initialEdges } from "../codeComponents/edges.js";
import { MinimapSwitch } from "./mainPage/switch.jsx";
import {
  SelectCanvasBG,
  SelectLogLevel,
  SelectTheme,
} from "./mainPage/select.jsx";

import { IconSettings, IconMenu } from "../../../assets/ui-icons.jsx";
import UserIcon from "../../../assets/userIcon.png";

import { Link } from "react-router-dom";

import { handleSimulateClick } from "./mainPage/runnerHandler.jsx";

import { updateInputState } from "./mainPage/runnerHandler.jsx";
import { Toaster } from "react-hot-toast";
import {
  showToast,
  setCurrentLogLevel,
  getCurrentLogLevel,
} from "../codeComponents/logger.jsx";
import { updateInputState } from "../components/mainPage/runnerHandler.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export const SimulateStateContext = createContext({
  simulateState: "idle",
  setSimulateState: () => {},
  updateInputState: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useSimulateState() {
  const ctx = useContext(SimulateStateContext);
  if (!ctx) {
    throw new Error(
      "useSimulateState must be used within SimulateStateProvider",
    );
  }
  return ctx;
}

const GAP_SIZE = 10;
const MIN_DISTANCE = 1;

export default function Main() {
  const [circuitsMenuState, setCircuitsMenuState] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [activeAction, setActiveAction] = useState("cursor");
  const [activeWire, setActiveWire] = useState("step");
  const [currentBG, setCurrentBG] = useState("dots");
  const [showMinimap, setShowMinimap] = useState(true);
  const [simulateState, setSimulateState] = useState("idle");
  const [theme, setTheme] = useState("light");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState(null);

  const ref = useRef(null);
  const store = useStoreApi();
  const { getInternalNode } = useReactFlow();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [panOnDrag, setPanOnDrag] = useState([2]);

  const socketRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //Load saved settings from localStorage
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    const savedCircuit = localStorage.getItem("savedCircuit");
    if (savedCircuit) {
      try {
        const circuitData = JSON.parse(savedCircuit);
        setNodes(circuitData.nodes || []);
        setEdges(circuitData.edges || []);
      } catch (e) {
        setNodes(initialNodes);
        setEdges(initialEdges);
      }
    } else {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    const circuitData = JSON.stringify({ nodes, edges });
    localStorage.setItem("savedCircuit", circuitData);
  }, [nodes, edges]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currentBG) setCurrentBG(parsed.currentBG);
      if (typeof parsed.showMinimap === "boolean")
        setShowMinimap(parsed.showMinimap);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.activeAction) setActiveAction(parsed.activeAction);
      if (parsed.activeWire) setActiveWire(parsed.activeWire);
      if (typeof parsed.openSettings === "boolean")
        setOpenSettings(parsed.openSettings);
      if (typeof parsed.circuitsMenuState === "boolean")
        setCircuitsMenuState(parsed.circuitsMenuState);
    }
  }, []);

  //Saves user setting to localStorage
  useEffect(() => {
    const settings = {
      currentBG,
      showMinimap,
      theme,
      activeAction,
      activeWire,
      openSettings,
      circuitsMenuState,
    };
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [
    currentBG,
    showMinimap,
    theme,
    activeAction,
    activeWire,
    openSettings,
    circuitsMenuState,
  ]);

  //Hotkeys handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      //deleting by clicking delete/backspace(delete for windows and macOS, backspace for windows)
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const currentNodes = nodesRef.current;
        const currentEdges = edgesRef.current;
        const selectedNodes = currentNodes.filter((node) => node.selected);
        const selectedEdges = currentEdges.filter((edge) => edge.selected);
        if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
        const nodeIdsToRemove = selectedNodes.map((node) => node.id);
        const newNodes = currentNodes.filter(
          (node) => !nodeIdsToRemove.includes(node.id),
        );
        const newEdges = currentEdges.filter(
          (edge) =>
            !selectedEdges.some((selected) => selected.id === edge.id) &&
            !nodeIdsToRemove.includes(edge.source) &&
            !nodeIdsToRemove.includes(edge.target),
        );
        setNodes(newNodes);
        setEdges(newEdges);
      }
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      //Ctrl + Shift + S - Open/close settings
      if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpenSettings((prev) => !prev);
        return;
      }

      //Ctrl + S - Save circuit.json
      if (isCtrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCircuit();
        return;
      }

      //Ctrl + Shift + R - Start/stop simulation
      if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleSimulateClick({
          simulateState,
          setSimulateState,
          socketRef,
          nodes,
          edges,
        });
        return;
      }

      //Ctrl + Shift + O - Load file
      if (isCtrlOrCmd && e.key.toLowerCase() === "o") {
        e.preventDefault();

        handleOpenClick();

        return;
      }

      //1...6 - Change selected tool
      const hotkeys = {
        1: () => {
          setActiveAction("cursor");
          setPanOnDrag([2]);
        },
        2: () => {
          setActiveAction("hand");
          setPanOnDrag(true);
        },
        3: () => setActiveWire("step"),
        4: () => setActiveWire("straight"),
        5: () => setActiveAction("eraser"),
        6: () => setActiveAction("text"),
      };
      if (hotkeys[e.key]) {
        e.preventDefault();
        hotkeys[e.key]();
      }

      //Escape to close Settings
      if (e.key === "Escape" && openSettings) {
        setOpenSettings(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSettings]);

  //Sets current theme to the whole document (наверное)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Я не знаю, что это
  // const validateConnection = useCallback((connection) => {
  //   return connection.source !== connection.target;
  // }, []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  //Create new node after dragAndDrop
  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: { customId: `${type}_${Date.now()}` },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    setMenu({
      id: node.id,
      name: node.type,
      type: "node",
      top: event.clientY < pane.height - 200 && event.clientY,
      left: event.clientX < pane.width - 200 && event.clientX,
      right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
      bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
    });
  }, []);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    setMenu({
      id: edge.id,
      name: edge.type,
      type: "edge",
      top: event.clientY < pane.height - 200 && event.clientY,
      left: event.clientX < pane.width - 200 && event.clientX,
      right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
      bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
    });
  }, []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  //Allows user to download circuit JSON
  const saveCircuit = () => {
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

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(flowData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "circuit.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const loadCircuit = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (e) => {
      const circuitData = JSON.parse(e.target.result);
      setNodes([]);
      setEdges([]);
      setTimeout(() => {
        setNodes(circuitData.nodes || []);
        setEdges(circuitData.edges || []);
      }, 100);
    };
  };

  const spawnCircuit = (type) => {
    const position = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: {
        customId: `${type}_${Date.now()}`,
        simState: simulateState,
        value: false,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const getClosestEdge = useCallback(
    (draggedNode) => {
      const { nodeLookup } = store.getState();
      const internalNode = getInternalNode(draggedNode.id);
      if (!internalNode) return null;

      const draggedHandles = internalNode.internals.handleBounds;
      if (!draggedHandles) return null;

      const draggedPos = internalNode.internals.positionAbsolute;
      let closestEdge = null;
      let minDistance = MIN_DISTANCE;

      nodeLookup.forEach((node) => {
        if (node.id === draggedNode.id) return;
        const nodeHandles = node.internals.handleBounds;
        if (!nodeHandles) return;
        const nodePos = node.internals.positionAbsolute;

        // Check source->target connections
        if (draggedHandles.source) {
          draggedHandles.source.forEach((srcHandle) => {
            const srcHandlePos = {
              x: draggedPos.x + srcHandle.x + srcHandle.width / 2,
              y: draggedPos.y + srcHandle.y + srcHandle.height / 2,
            };

            if (nodeHandles.target) {
              nodeHandles.target.forEach((tgtHandle) => {
                const tgtHandlePos = {
                  x: nodePos.x + tgtHandle.x + tgtHandle.width / 2,
                  y: nodePos.y + tgtHandle.y + tgtHandle.height / 2,
                };

                const dx = srcHandlePos.x - tgtHandlePos.x;
                const dy = srcHandlePos.y - tgtHandlePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                  minDistance = distance;
                  closestEdge = {
                    id: `temp_${internalNode.id}_${srcHandle.id}_to_${node.id}_${tgtHandle.id}`,
                    source: internalNode.id,
                    sourceHandle: srcHandle.id,
                    target: node.id,
                    targetHandle: tgtHandle.id,
                    className: "temp",
                  };
                }
              });
            }
          });
        }

        // Check target->source connections
        if (draggedHandles.target) {
          draggedHandles.target.forEach((tgtHandle) => {
            const tgtHandlePos = {
              x: draggedPos.x + tgtHandle.x + tgtHandle.width / 2,
              y: draggedPos.y + tgtHandle.y + tgtHandle.height / 2,
            };

            if (nodeHandles.source) {
              nodeHandles.source.forEach((srcHandle) => {
                const srcHandlePos = {
                  x: nodePos.x + srcHandle.x + srcHandle.width / 2,
                  y: nodePos.y + srcHandle.y + srcHandle.height / 2,
                };

                const dx = tgtHandlePos.x - srcHandlePos.x;
                const dy = tgtHandlePos.y - srcHandlePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                  minDistance = distance;
                  closestEdge = {
                    id: `temp_${node.id}_${srcHandle.id}_to_${internalNode.id}_${tgtHandle.id}`,
                    source: node.id,
                    sourceHandle: srcHandle.id,
                    target: internalNode.id,
                    targetHandle: tgtHandle.id,
                    className: "temp",
                  };
                }
              });
            }
          });
        }
      });

      return closestEdge;
    },
    [store, getInternalNode],
  );

  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");
        if (closeEdge !== null) nextEdges.push(closeEdge);
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges],
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");
        const closeEdge = getClosestEdge(node);
        if (closeEdge) {
          return addEdge(
            {
              source: closeEdge.source,
              sourceHandle: closeEdge.sourceHandle,
              target: closeEdge.target,
              targetHandle: closeEdge.targetHandle,
            },
            nextEdges,
          );
        }
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges],
  );

  const variant =
    currentBG === "dots"
      ? BackgroundVariant.Dots
      : currentBG === "cross"
        ? BackgroundVariant.Cross
        : BackgroundVariant.Lines;

  return (
    <SimulateStateContext.Provider
      value={{ simulateState, setSimulateState, updateInputState }}
    >
      <>
        <ReactFlow
          ref={ref}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={{
            type: activeWire,
          }}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          panOnDrag={panOnDrag}
          selectionOnDrag
          panOnScroll
          snapToGrid
          snapGrid={[GAP_SIZE, GAP_SIZE]}
          selectionMode={SelectionMode.Partial}
          minZoom={0.2}
          maxZoom={10}
        >
          <Background
            offset={[10.5, 5]}
            bgColor="var(--main-1)"
            color="var(--main-4)"
            gap={GAP_SIZE}
            size={1.6}
            variant={variant}
          />
          <Controls className="controls" />
          {showMinimap && (
            <MiniMap
              className="miniMap"
              bgColor="var(--main-3)"
              maskColor="var(--mask)"
              nodeColor="var(--mask)"
              position="top-right"
              style={{ borderRadius: "0.5rem" }}
            />
          )}
          {menu && menu.type === "node" && (
            <NodeContextMenu onClick={onPaneClick} {...menu} />
          )}
          {menu && menu.type === "edge" && (
            <EdgeContextMenu onClick={onPaneClick} {...menu} />
          )}
        </ReactFlow>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              backgroundColor: "var(--main-2)",
              color: "var(--main-0)",
              fontSize: "12px",
              borderRadius: "0.5rem",
              padding: "10px 25px 10px 10px",
              border: "0.05rem solid var(--main-5)",
              fontFamily: "Montserrat, serif",
            },
            duration: 5000,
            error: {
              duration: 10000,
            },
          }}
        />

        <button
          className="openCircuitsMenuButton"
          onClick={() => setCircuitsMenuState(!circuitsMenuState)}
        >
          <IconMenu
            SVGClassName="openCircuitsMenuButtonIcon"
            draggable="false"
          />
        </button>

        <button
          className="openSettingsButton"
          onClick={() => setOpenSettings(true)}
        >
          <IconSettings
            SVGClassName="openSettingsButtonIcon"
            draggable="false"
          />
        </button>

        <div
          className={`backdrop ${openSettings ? "cover" : ""}`}
          onClick={() => setOpenSettings(false)}
        />
        <div className={`settingsMenu ${openSettings ? "showed" : ""}`}>
          <p className="settingsMenuTitle">Settings</p>
          <Link
            to="/profile"
            className="openProfileButton"
            style={{ textDecoration: "none" }}
          >
            <img className="settingUserIcon" src={UserIcon} alt="User" />
            <span className="settingUserName">UserName</span>
          </Link>
          <div className="minimapSwitchBlock">
            <p className="minimapSwitchLabel">Show mini-map</p>
            <MinimapSwitch
              className="minimapSwitch"
              minimapState={showMinimap}
              minimapToggle={setShowMinimap}
            />
          </div>

          <div className="selectBlock">
            <p className="selectCanvasBG">Canvas background</p>
            <SelectCanvasBG
              currentBG={currentBG}
              setCurrentBG={setCurrentBG}
              className="selectBG"
            />
          </div>
          <div className="selectBlock">
            <p className="minimapSwitchLabel">Theme</p>
            <SelectTheme
              theme={theme}
              setTheme={setTheme}
              className="selectTheme"
            />
          </div>

          <div className="selectBlock">
            <p className="minimapSwitchLabel">Log verbosity</p>
            <SelectLogLevel
              currentLogLevel={getCurrentLogLevel()}
              setCurrentLogLevel={setCurrentLogLevel}
              className="selectTheme"
            />
          </div>
        </div>

        <CircuitsMenu
          circuitsMenuState={circuitsMenuState}
          onDragStart={onDragStart}
          spawnCircuit={spawnCircuit}
        />

        <Toolbar
          simulateState={simulateState}
          setSimulateState={setSimulateState}
          activeAction={activeAction}
          setActiveAction={setActiveAction}
          activeWire={activeWire}
          setActiveWire={setActiveWire}
          // activeButton={activeButton}
          // setActiveButton={setActiveButton}
          setPanOnDrag={setPanOnDrag}
          setWireType={setWireType}
          saveCircuit={saveCircuit}
          loadCircuit={loadCircuit}
          fileInputRef={fileInputRef}
          handleOpenClick={handleOpenClick}
          onSimulateClick={() =>
            handleSimulateClick({
              simulateState,
              setSimulateState,
              socketRef,
              nodes,
              edges,
            })
          }
        />
      </>
    </SimulateStateContext.Provider>
  );
}
