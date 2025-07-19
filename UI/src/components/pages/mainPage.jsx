import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
} from "@xyflow/react";

//Importing components
import CircuitsMenu from "./mainPage/circuitsMenu.jsx";
import Toolbar from "./mainPage/toolbar.jsx";
import Settings from "./mainPage/settings.jsx";

import NodeContextMenu from "../codeComponents/NodeContextMenu.jsx";
import EdgeContextMenu from "../codeComponents/EdgeContextMenu.jsx";
import { nodeTypes } from "../codeComponents/nodes.js";

import { IconMenu, IconSettings } from "../../../assets/ui-icons.jsx";
import { useHotkeys } from "./mainPage/useHotkeys.js";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import {
  handleSimulateClick,
  updateInputState,
} from "./mainPage/runnerHandler.jsx";
import { LOG_LEVELS } from "../codeComponents/logger.jsx";
import { nanoid } from "nanoid";
import { Link } from "react-router-dom";

import { copyElements as copyElementsUtil } from "../utils/copyElements.js";
import { cutElements as cutElementsUtil } from "../utils/cutElements.js";
import { pasteElements as pasteElementsUtil } from "../utils/pasteElements.js";
import { deleteSelectedElements as deleteSelectedUtil } from "../utils/deleteSelectedElements.js";
import { deselectAll as deselectAllUtil } from "../utils/deselectAll.js";
import { getSelectedElements as getSelectedUtil } from "../utils/getSelectedElements.js";
import { isValidConnection as isValidConnectionUtil } from "../utils/isValidConnection.js";
import { selectAll as selectAllUtil } from "../utils/selectAll.js";
import TabsContainer from "./mainPage/tabs.jsx";
import { saveCircuit as saveCircuitUtil } from "../utils/saveCircuit.js";
import { loadCircuit as loadCircuitUtil } from "../utils/loadCircuit.js";
import { spawnCircuit as spawnCircuitUtil } from "../utils/spawnCircuit.js";
import { calculateContextMenuPosition } from "../utils/calculateContextMenuPosition.js";
import { onDrop as onDropUtil } from "../utils/onDrop.js";
import { onNodeDragStop as onNodeDragStopUtil } from "../utils/onNodeDragStop.js";
import { loadLocalStorage } from "../utils/loadLocalStorage.js";
import { initializeTabHistory } from "../utils/initializeTabHistory.js";
import { createHistoryUpdater } from "../utils/createHistoryUpdater.js";
import { undo as undoUtil } from "../utils/undo.js";
import { redo as redoUtil } from "../utils/redo.js";
import { handleTabSwitch as handleTabSwitchUtil } from "../utils/handleTabSwitch.js";

export const SimulateStateContext = createContext({
  simulateState: "idle",
  setSimulateState: () => {},
  updateInputState: () => {},
});

export const NotificationsLevelContext = createContext({
  logLevel: "idle",
  setLogLevel: () => {},
});

export function useSimulateState() {
  const context = useContext(SimulateStateContext);
  if (!context)
    throw new Error(
      "useSimulateState must be used within SimulateStateProvider",
    );
  return context;
}

export function useNotificationsLevel() {
  const context = useContext(NotificationsLevelContext);
  if (!context)
    throw new Error(
      "useNotificationsLevel must be used within NotificationsLevelProvider",
    );
  return context;
}

const GAP_SIZE = 10;
const STORAGE_KEY = "myCircuits";

export default function Main() {
  const [circuitsMenuState, setCircuitsMenuState] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [activeAction, setActiveAction] = useState("cursor");
  const [activeWire, setActiveWire] = useState("default");
  const [currentBG, setCurrentBG] = useState("dots");
  const [showMinimap, setShowMinimap] = useState(true);
  const [simulateState, setSimulateState] = useState("idle");
  const [theme, setTheme] = useState("light");
  const [toastPosition, setToastPosition] = useState("top-center");
  const [logLevel, setLogLevel] = useState(LOG_LEVELS.ERROR);

  // Хуки React Flow
  const [nodes, setNodes, onNodesChangeFromHook] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeFromHook] = useEdgesState([]);

  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Если где-то нужен доступ через рефы — поддерживаем их
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  const [menu, setMenu] = useState(null);

  const ref = useRef(null);
  const store = useStoreApi();
  const { getInternalNode } = useReactFlow();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [panOnDrag, setPanOnDrag] = useState([2]);

  const socketRef = useRef(null);

  const fileInputRef = useRef(null);

  const ignoreChangesRef = useRef(false);

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Create history updater
  const historyUpdater = useMemo(() => createHistoryUpdater(), []);

  // 1) Загрузка списка вкладок и сохранённого activeTabId из localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { tabs: savedTabs, activeTabId: savedActive } =
          JSON.parse(stored);
        if (Array.isArray(savedTabs) && savedActive != null) {
          // Convert saved tabs to history-enabled tabs
          setTabs(savedTabs.map(initializeTabHistory));
          setActiveTabId(savedActive);
          return;
        }
      } catch {}
    }
    // Initial setup for new users
    const initial = [
      initializeTabHistory({
        id: newId(),
        title: "New Tab",
        nodes: [],
        edges: [],
      }),
    ];
    setTabs(initial);
    setActiveTabId(initial[0].id);
  }, []);

  const isInitialMount = useRef(true);

  // Save to localStorage
  useEffect(() => {
    if (activeTabId == null) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const toStore = {
      tabs: tabs.map((tab) => {
        const { nodes, edges } = tab.history[tab.index];
        return { id: tab.id, title: tab.title, nodes, edges };
      }),
      activeTabId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [tabs, activeTabId]);

  // Update history when nodes/edges change
  const recordHistory = useCallback(() => {
    setTabs((tabs) =>
      tabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return historyUpdater.record(tab, nodesRef.current, edgesRef.current);
      }),
    );
  }, [nodesRef, edgesRef, activeTabId, historyUpdater, tabs]);

  // 2) Получение текущей активной вкладки по её id
  const activeTab = tabs.find((t) => t.id === activeTabId) || {
    nodes: [],
    edges: [],
  };

  // 3) Когда меняется активная вкладка — грузим именно последнюю точку истории
  useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;

    const { nodes: histNodes, edges: histEdges } = tab.history[tab.index];
    ignoreChangesRef.current = true;
    setNodes(histNodes);
    setEdges(histEdges);
    ignoreChangesRef.current = false;
  }, [activeTabId, tabs]);

  // 4) Обновляем внешние рефы, если они используются в другой логике вне ReactFlow
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const showWarning = useCallback((message) => {
    toast(message, {
      icon: "⚠️",
      style: {
        backgroundColor: "var(--status-warning-1)",
        color: "var(--status-warning-2)",
      },
    });
  }, []);

  // Undo/Redo functions
  const undo = useCallback(() => {
    undoUtil(tabs, activeTabId, setTabs, setNodes, setEdges, showWarning);
  }, [tabs, activeTabId, setTabs, setNodes, setEdges, showWarning]);

  const redo = useCallback(() => {
    redoUtil(tabs, activeTabId, setTabs, setNodes, setEdges, showWarning);
  }, [tabs, activeTabId, setTabs, setNodes, setEdges, showWarning]);

  const handleTabSwitch = useCallback(
    (newTabId) => {
      handleTabSwitchUtil({
        activeTabId,
        newTabId,
        setTabs,
        setActiveTabId,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      });
    },
    [activeTabId],
  );

  const [clipboard, setClipboard] = useState({ nodes: [], edges: [] });
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const newId = () => nanoid();

  // Update the ref in a window mousemove listener
  useEffect(() => {
    const handleMouseMove = (event) => {
      mousePositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const selectedNodeIds = new Set(
      nodes.filter((node) => node.selected).map((node) => node.id),
    );

    setEdges((edges) =>
      edges.map((edge) => {
        const isBetweenSelected =
          selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target);

        return isBetweenSelected ? { ...edge, selected: true } : edge;
      }),
    );
  }, [nodes]); // Runs when node selection changes

  // Update getSelectedElements
  const getSelectedElements = useCallback(() => {
    return getSelectedUtil(nodes, edges);
  });

  const isValidConnection = useCallback(
    (connection) => isValidConnectionUtil(connection, edgesRef.current),
    [edgesRef],
  );

  const selectAll = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = selectAllUtil(nodes, edges);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const deselectAll = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = deselectAllUtil(nodes, edges);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const deleteSelectedElements = useCallback(() => {
    const selected = getSelectedElements();
    const { newNodes, newEdges } = deleteSelectedUtil(nodes, edges, selected);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(recordHistory, 0);
  }, [nodes, edges, getSelectedElements, recordHistory]);

  const copyElements = useCallback(() => {
    copyElementsUtil({
      getSelectedElements,
      setClipboard,
    });
  }, [nodes, edges, getSelectedElements]);

  const cutElements = useCallback(() => {
    cutElementsUtil({
      getSelectedElements,
      setClipboard,
      deleteSelectedElements,
    });
  }, [getSelectedElements]);

  const pasteElements = useCallback(() => {
    pasteElementsUtil({
      clipboard,
      mousePosition: mousePositionRef.current,
      reactFlowInstance,
      setNodes,
      setEdges,
    });
    setTimeout(recordHistory, 0);
  }, [clipboard, reactFlowInstance, recordHistory]);

  useEffect(() => {
    loadLocalStorage({
      setCurrentBG,
      setShowMinimap,
      setTheme,
      setActiveAction,
      setActiveWire,
      setOpenSettings,
      setCircuitsMenuState,
      setLogLevel,
      setToastPosition,
    });
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
      logLevel,
      toastPosition,
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
    logLevel,
    toastPosition,
  ]);

  //Sets current theme to the whole document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) => {
        const newEdges = addEdge(connection, eds);
        setTimeout(recordHistory, 0);
        return newEdges;
      }),
    [setEdges, recordHistory],
  );

  //Create new node after dragAndDrop
  const onDrop = useCallback(
    (event) => {
      deselectAll();
      onDropUtil(event, reactFlowInstance, setNodes);
      setTimeout(recordHistory, 0);
    },
    [reactFlowInstance, setNodes, deselectAll, recordHistory],
  );

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    setMenu(calculateContextMenuPosition(event, node, pane, "node"));
  }, []);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    setMenu(calculateContextMenuPosition(event, edge, pane, "edge"));
  }, []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  //Allows user to download circuit JSON
  const saveCircuit = () => saveCircuitUtil(nodes, edges);

  const loadCircuit = useCallback(
    (event) => {
      loadCircuitUtil(event, setNodes, setEdges);
    },
    [setNodes, setEdges],
  );

  const spawnCircuit = useCallback(
    (type) => {
      deselectAll();
      spawnCircuitUtil(type, reactFlowInstance, setNodes);
      setTimeout(recordHistory, 0);
    },
    [reactFlowInstance, setNodes, deselectAll, recordHistory],
  );

  const onNodeDragStop = useCallback(
    onNodeDragStopUtil({
      nodes,
      setEdges,
      getInternalNode,
      store,
      addEdge,
      onComplete: () => setTimeout(recordHistory, 0),
    }),
    [nodes, setEdges, getInternalNode, store, recordHistory],
  );

  const variant =
    currentBG === "dots"
      ? BackgroundVariant.Dots
      : currentBG === "cross"
        ? BackgroundVariant.Cross
        : BackgroundVariant.Lines;

  //Hotkeys handler
  useHotkeys(
    {
      saveCircuit,
      nodes,
      edges,
      openSettings,
      setOpenSettings,
      copyElements,
      cutElements,
      pasteElements,
      selectAll,
      deselectAll,
      handleSimulateClick,
      simulateState,
      setSimulateState,
      setActiveAction,
      setPanOnDrag,
      setActiveWire,
      socketRef,
      handleOpenClick,
      undo,
      redo,
    },
    [
      saveCircuit,
      nodes,
      edges,
      openSettings,
      setOpenSettings,
      copyElements,
      cutElements,
      pasteElements,
      selectAll,
      deselectAll,
      handleSimulateClick,
      simulateState,
      setSimulateState,
      setActiveAction,
      setPanOnDrag,
      setActiveWire,
      socketRef,
      handleOpenClick,
      undo,
      redo,
    ],
  );

  return (
    <NotificationsLevelContext.Provider value={{ logLevel, setLogLevel }}>
      <SimulateStateContext.Provider
        value={{ simulateState, setSimulateState, updateInputState }}
      >
        <div className={"main-tabs-wrapper"}>
          <TabsContainer
            tabs={tabs}
            activeTabId={activeTabId}
            onTabsChange={setTabs}
            onActiveTabIdChange={handleTabSwitch}
          />
        </div>

        <>
          <ReactFlow
            style={{ backgroundColor: "var(--main-2)" }}
            ref={ref}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeFromHook}
            onEdgesChange={onEdgesChangeFromHook}
            defaultEdgeOptions={{
              type: activeWire,
            }}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onInit={setReactFlowInstance}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            panOnDrag={panOnDrag}
            selectionOnDrag
            panOnScroll
            snapToGrid
            snapGrid={[GAP_SIZE, GAP_SIZE]}
            selectionMode={SelectionMode.Partial}
            minZoom={0.2}
            maxZoom={10}
            deleteKeyCode={["Delete", "Backspace"]}
            onDelete={deleteSelectedElements}
            // onlyRenderVisibleElements={true}
          >
            <Background
              offset={[10.5, 5]}
              bgColor="var(--main-1)"
              color="var(--main-4)"
              gap={GAP_SIZE}
              size={1.6}
              variant={variant}
              style={{ transition: "var(--ttime)" }}
            />
            <Controls
              className="controls"
              style={{ transition: "var(--ttime)" }}
            />
            {showMinimap && (
              <MiniMap
                className="miniMap"
                bgColor="var(--main-3)"
                maskColor="var(--mask)"
                nodeColor="var(--main-4)"
                position="top-right"
                style={{
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  transition:
                    "background-color var(--ttime),border var(--ttime)",
                }}
              />
            )}
          </ReactFlow>

          {menu && menu.type === "node" && (
            <NodeContextMenu onClick={onPaneClick} {...menu} />
          )}

          {menu && menu.type === "edge" && (
            <EdgeContextMenu onClick={onPaneClick} {...menu} />
          )}

          <Toaster
            position={toastPosition}
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
              duration: 2000,
              error: {
                duration: 10000,
              },
              warning: {
                className: "toast-warning",
                duration: 3000,
                icon: "⚠️",
              },
            }}
          />

          <button
            className="openCircuitsMenuButton"
            onClick={() => setCircuitsMenuState(!circuitsMenuState)}
            title={"Circuits menu"}
          >
            <IconMenu
              SVGClassName="openCircuitsMenuButtonIcon"
              draggable="false"
            />
          </button>

          <button
            className="openSettingsButton"
            onClick={() => setOpenSettings(true)}
            title={"Settings"}
          >
            <IconSettings
              SVGClassName="openSettingsButtonIcon"
              draggable="false"
            />
          </button>

          <Link
            to="/auth"
            className="login-button"
            style={{ textDecoration: "none" }}
          >
            <span className="login-button-text">Log in</span>
          </Link>

          <div
            className={`backdrop ${openSettings ? "cover" : ""}${menu ? "show" : ""}`}
            onClick={() => {
              setMenu(null);
              setOpenSettings(false);
            }}
          />
          <Settings
            openSettings={openSettings}
            showMinimap={showMinimap}
            setShowMinimap={setShowMinimap}
            currentBG={currentBG}
            setCurrentBG={setCurrentBG}
            theme={theme}
            setTheme={setTheme}
            toastPosition={toastPosition}
            setToastPosition={setToastPosition}
            currentLogLevel={logLevel}
            setLogLevel={setLogLevel}
            closeSettings={() => {
              setMenu(null);
              setOpenSettings(false);
            }}
          />

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
            setPanOnDrag={setPanOnDrag}
            saveCircuit={saveCircuit}
            loadCircuit={loadCircuit}
            fileInputRef={fileInputRef}
            handleOpenClick={handleOpenClick}
            setMenu={setMenu}
            onSimulateClick={() =>
              handleSimulateClick({
                simulateState,
                setSimulateState,
                socketRef,
                nodes,
                edges,
              })
            }
            undo={undo}
            redo={redo}
            canUndo={activeTab?.index > 0}
            canRedo={activeTab?.index < (activeTab?.history?.length || 1) - 1}
          />
        </>
      </SimulateStateContext.Provider>
    </NotificationsLevelContext.Provider>
  );
}
