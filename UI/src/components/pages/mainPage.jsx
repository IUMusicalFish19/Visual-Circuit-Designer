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
import PaneContextMenu from "../codeComponents/PaneContextMenu.jsx";
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
import { getEditableNode } from "../utils/getEditableNode.js";
import { handleNameChange } from "../utils/handleNameChange.js";
import CreateCustomBlockModal from "./mainPage/createCustomBlockModal.jsx";
import { CustomBlocksProvider } from "./mainPage/customCircuit.jsx";
import FlowWithCustomNodes from "./mainPage/FlowWithCustomNodes.jsx";

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
  const [pastePosition, setPastePosition] = useState("cursor");

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
  const [panOnDrag, setPanOnDrag] = useState(false);

  const socketRef = useRef(null);

  const ignoreChangesRef = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [nodesCustom, setNodesCustom] = useNodesState([]);
  const [edgesCustom, setEdgesCustom] = useEdgesState([]);

  const uploadRef = useRef(null);
  const extractRef = useRef(null);

  const handleUploadClick = () => {
    uploadRef.current?.click();
  };

  const handleExtractClick = () => {
    extractRef.current?.click();
  };

  const extractFromFile = useCallback(
    (event) => {
      loadCircuitUtil(event, setNodesCustom, setEdgesCustom);
      setModalOpen(true);
    },
    [setNodesCustom, setEdgesCustom],
  );

  const handleCreateCustomBlock = (customBlock) => {
    // Handle custom block creation
    console.log("Created custom block:", customBlock);
  };

  const editableNode = useMemo(
    () => getEditableNode(nodes, edges),
    [nodes, edges],
  );

  const onNameChange = (e) => handleNameChange(e, editableNode, setNodes);

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

  const onCreateCustom = useCallback(() => {
    const selectedElements = getSelectedElements();
    setNodesCustom(selectedElements.nodes);
    setEdgesCustom(selectedElements.edges);
    setModalOpen(true);
  }, [getSelectedElements, setNodesCustom, setEdgesCustom]);

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
      pastePosition,
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
      setPastePosition,
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
      pastePosition,
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
    pastePosition,
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

  const closeMenu = () => setMenu(null);

  const onNodeContextMenu = useCallback((event) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    const menuPosition = calculateContextMenuPosition(event, pane);
    setMenu({
      type: "pane",
      top: menuPosition.top,
      left: menuPosition.left,
      right: menuPosition.right,
      bottom: menuPosition.bottom,
    });
  }, []);

  const onEdgeContextMenu = useCallback((event) => {
    event.preventDefault();
    const pane = ref.current.getBoundingClientRect();
    const menuPosition = calculateContextMenuPosition(event, pane);
    setMenu({
      type: "pane",
      top: menuPosition.top,
      left: menuPosition.left,
      right: menuPosition.right,
      bottom: menuPosition.bottom,
    });
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    const paneRect = ref.current.getBoundingClientRect();
    const menuPosition = calculateContextMenuPosition(event, paneRect);
    setMenu({
      type: "pane",
      top: menuPosition.top,
      left: menuPosition.left,
      right: menuPosition.right,
      bottom: menuPosition.bottom,
    });
  }, []);

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
      handleUploadClick,
      handleExtractClick,
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
      handleUploadClick,
      handleExtractClick,
      undo,
      redo,
    ],
  );

  return (
    <CustomBlocksProvider>
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
              ref={ref}
            />
          </div>

          <>
            <FlowWithCustomNodes
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
              onPaneContextMenu={onPaneContextMenu}
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
            </FlowWithCustomNodes>

            {editableNode && (
              <div className="name-editor">
                <div className="label-container">
                  <label>Export Name (Optional)</label>
                  <div className="tooltip-container">
                    <div className="tooltip-icon">?</div>
                    <div className="tooltip-text">
                      When creating custom circuit, each IO with an export name
                      will become one of the new circuit's outputs.
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    value={editableNode.name || ""}
                    onChange={onNameChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        deselectAll();
                        setTimeout(recordHistory, 0);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="close-button"
                    onClick={(e) => {
                      e.preventDefault();
                      deselectAll();
                      setTimeout(recordHistory, 0);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {menu && menu.type === "node" && <NodeContextMenu {...menu} />}

            {menu && menu.type === "edge" && <EdgeContextMenu {...menu} />}

            {menu && menu.type === "pane" && (
              <PaneContextMenu
                {...menu}
                selectedElements={getSelectedElements()}
                copyElements={copyElements}
                pasteElements={pasteElements}
                cutElements={cutElements}
                onClose={closeMenu}
                clipboard={clipboard}
                onCreateCustom={onCreateCustom}
              />
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
              className="open-circuits-menu-button"
              onClick={() => setCircuitsMenuState(!circuitsMenuState)}
              title={"Circuits menu"}
            >
              <IconMenu
                SVGClassName="open-circuits-menu-button-icon"
                draggable="false"
              />
            </button>

            <button
              className="open-settings-button"
              onClick={() => setOpenSettings(true)}
              title={"Settings"}
            >
              <IconSettings
                SVGClassName="open-settings-button-icon"
                draggable="false"
              />
            </button>

            <Link
              to="/login"
              className="login-button"
              style={{ textDecoration: "none" }}
            >
              <span className="login-button-text">Log in</span>
            </Link>

            <div
              className={`backdrop ${openSettings ? "cover" : ""}`}
              onClick={() => {
                setOpenSettings(false);
              }}
            />

            <div
              className={`backdrop ${menu ? "show" : ""}`}
              onClick={() => closeMenu()}
            />

            <div
              className={`backdrop ${editableNode ? "show" : ""}`}
              onClick={() => {
                deselectAll();
                setTimeout(recordHistory, 0);
              }}
            />

            <CreateCustomBlockModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              nodes={nodesCustom}
              edges={edgesCustom}
              onCreateCustomBlock={handleCreateCustomBlock}
            />

            <Settings
              openSettings={openSettings}
              showMinimap={showMinimap}
              setShowMinimap={setShowMinimap}
              currentBG={currentBG}
              setCurrentBG={setCurrentBG}
              pastePosition={pastePosition}
              setPastePosition={setPastePosition}
              theme={theme}
              setTheme={setTheme}
              toastPosition={toastPosition}
              setToastPosition={setToastPosition}
              currentLogLevel={logLevel}
              setLogLevel={setLogLevel}
              closeSettings={() => {
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
              extractFromFile={extractFromFile}
              uploadRef={uploadRef}
              handleUploadClick={handleUploadClick}
              extractRef={extractRef}
              handleExtractClick={handleExtractClick}
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
    </CustomBlocksProvider>
  );
}
