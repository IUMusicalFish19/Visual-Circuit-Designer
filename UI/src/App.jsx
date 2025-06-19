import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ContextMenu from './components/codeComponents/ContextMenu.jsx';

import { initialNodes, nodeTypes } from './components/codeComponents/nodes.js';
import { initialEdges } from './components/codeComponents/edges.js';
import {MinimapSwitch} from "./components/codeComponents/switch.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import './CSS/variables.css';
import './CSS/App.css';
import './CSS/settings.css';
import './CSS/toolbar.css';
import './CSS/dnd.css';
import './CSS/backdrop.css';
import './CSS/circuitsMenu.css';
import './CSS/contextMenu.css';
import {SelectCanvasBG, SelectTheme} from "./components/codeComponents/select.jsx";
import Profile from "./pages/profile.jsx";

import './components/codeComponents/switch.jsx';

import {IconSettings, IconMenu, IconArrow, IconStart, IconStop, IconUser, IconLoading} from '../assets/ui-icons.jsx';
import {IconToolbarCursor, IconToolbarEraser, IconToolbarHand, IconToolbarSquareWire, IconToolbarDiagWire, IconToolbarText} from "../assets/toolbar-icons.jsx";
import {IconAND, IconNAND, IconInput, IconNOT, IconXOR, IconOutput, IconNOR, IconOR} from "../assets/circuits-icons.jsx";

const GAP_SIZE = 10;
const MIN_DISTANCE = 10;

function App() {
  // Internal variables
  const [circuitsMenuState, setCircuitsMenuState] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [activeButton, setActiveButton] = useState("cursor")
  const [simulateState, setSimulateState] = useState("idle")


  // Setting variables
  let variant;
  const [currentBG, setCurrentBG] = useState("dots")
  const [showMinimap, setShowMinimap] = useState(true)
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentBG) setCurrentBG(parsed.currentBG);
        if (typeof parsed.showMinimap === 'boolean') setShowMinimap(parsed.showMinimap);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.activeButton) setActiveButton(parsed.activeButton);
        if (typeof parsed.openSettings === 'boolean') setOpenSettings(parsed.openSettings);
        if (typeof parsed.circuitsMenuState === 'boolean') setCircuitsMenuState(parsed.circuitsMenuState);
      } catch (e) {
        console.error("Ошибка при загрузке настроек из localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (openSettings) return;

      // Mac: e.metaKey (Command), Windows: e.ctrlKey (Control)
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === "m") {
        e.preventDefault();
        setCircuitsMenuState(prev => !prev)
      }

      if (isCtrlOrCmd && e.key === "1") {
        e.preventDefault();
        setActiveButton("cursor")
      }

      if (isCtrlOrCmd && e.key === "2") {
        e.preventDefault();
        setActiveButton("hand")
      }

      if (isCtrlOrCmd && e.key === "3") {
        e.preventDefault();
        setActiveButton("sqwire")
      }

      if (isCtrlOrCmd && e.key === "4") {
        e.preventDefault();
        setActiveButton("dwire")
      }

      if (isCtrlOrCmd && e.key === "5") {
        e.preventDefault();
        setActiveButton("eraser")
      }

      if (isCtrlOrCmd && e.key === "6") {
        e.preventDefault();
        setActiveButton("text")
      }

      // if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
      //   e.preventDefault();
      //   console.log("Ctrl + Shift + S pressed");
      //   myFunctionTwo();
      // }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSettings]);


  if (currentBG === "dots") { variant = BackgroundVariant.Dots; }
  else if (currentBG === "cross") { variant = BackgroundVariant.Cross; }
  else { variant = BackgroundVariant.Lines; }

  useEffect(() => {
    // Устанавливаем data-theme на корневой элемент <html>
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  useEffect(() => {
    const settings = {
      currentBG,
      showMinimap,
      theme,
      activeButton,
      openSettings,
      circuitsMenuState,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [currentBG, showMinimap, theme, activeButton, openSettings, circuitsMenuState]);


  /* React Flow */
  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  const store = useStoreApi();
  const {getInternalNode} = useReactFlow();


  const [panOnDrag, setPanOnDrag] = useState([1, 2]);

  const validateConnection = useCallback((connection) => {
    return connection.source !== connection.target;
  });

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        customId: `${type}-${Date.now()}`,
      }
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        name: node.type,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu],
  );


  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const getClosestEdge = useCallback((draggedNode) => {
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
            y: draggedPos.y + srcHandle.y + srcHandle.height / 2
          };

          if (nodeHandles.target) {
            nodeHandles.target.forEach((tgtHandle) => {
              const tgtHandlePos = {
                x: nodePos.x + tgtHandle.x + tgtHandle.width / 2,
                y: nodePos.y + tgtHandle.y + tgtHandle.height / 2
              };

              const dx = srcHandlePos.x - tgtHandlePos.x;
              const dy = srcHandlePos.y - tgtHandlePos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < minDistance) {
                minDistance = distance;
                closestEdge = {
                  id: `temp-${internalNode.id}-${srcHandle.id}-to-${node.id}-${tgtHandle.id}`,
                  source: internalNode.id,
                  sourceHandle: srcHandle.id,
                  target: node.id,
                  targetHandle: tgtHandle.id,
                  className: 'temp'
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
            y: draggedPos.y + tgtHandle.y + tgtHandle.height / 2
          };

          if (nodeHandles.source) {
            nodeHandles.source.forEach((srcHandle) => {
              const srcHandlePos = {
                x: nodePos.x + srcHandle.x + srcHandle.width / 2,
                y: nodePos.y + srcHandle.y + srcHandle.height / 2
              };

              const dx = tgtHandlePos.x - srcHandlePos.x;
              const dy = tgtHandlePos.y - srcHandlePos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < minDistance) {
                minDistance = distance;
                closestEdge = {
                  id: `temp-${node.id}-${srcHandle.id}-to-${internalNode.id}-${tgtHandle.id}`,
                  source: node.id,
                  sourceHandle: srcHandle.id,
                  target: internalNode.id,
                  targetHandle: tgtHandle.id,
                  className: 'temp'
                };
              }
            });
          }
        });
      }
    });

    return closestEdge;
  }, [store, getInternalNode]);

  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');
        if (closeEdge !== null) {
          nextEdges.push(closeEdge);
        }
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges],
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');
        const closeEdge = getClosestEdge(node);

        if (closeEdge) {
          return addEdge({
            source: closeEdge.source,
            sourceHandle: closeEdge.sourceHandle,
            target: closeEdge.target,
            targetHandle: closeEdge.targetHandle
          }, nextEdges);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges],
  );

  const saveCircuit = () => {
    const flowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        // Include any other necessary node properties
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        // Include any other necessary edge properties
      }))
    };

    // Create downloadable JSON file
    const dataStr = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(flowData, null, 2));
    const downloadAnchorNode = document.createElement('a');
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

      // Reset existing flow
      setNodes([]);
      setEdges([]);

      // Add timeout to ensure reset completes
      setTimeout(() => {
        setNodes(circuitData.nodes || []);
        setEdges(circuitData.edges || []);
      }, 100);
    };
  };

  const spawnCircuit = (type) => {
    const position = reactFlowInstance.screenToFlowPosition({
      x: screen.availWidth / 2,
      y: screen.availHeight / 2,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: type,
      position,
      data: {
        customId: `${type}-${Date.now()}`,
      }
    };

    setNodes((nds) => nds.concat(newNode));
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && openSettings) {
        setOpenSettings(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSettings]);

  const [openIndexes, setOpenIndexes] = useState([]);
  const menuItems = [
    {
      header: "Basic Logic Elements",
      gates: [
        { id: 'andNode', label: 'AND', icon: IconAND },
        { id: 'orNode', label: 'OR', icon: IconOR },
        { id: 'notNode', label: 'NOT', icon: IconNOT },
        { id: 'nandNode', label: 'NAND', icon: IconNAND },
        { id: 'norNode', label: 'NOR', icon: IconNOR },
        { id: 'xorNode', label: 'XOR', icon: IconXOR },
      ]
    },
    {
      header: "Advanced Logic Elements",
      gates: []
    },
    {
      header: "Pins",
      gates: [
        { id: 'inputNode', label: 'input', icon: IconInput },
        { id: 'outputNode', label: 'output', icon: IconOutput },
      ]
    },
    {
      header: "Custom Logic Elements",
      gates: []
    }
  ];

  const toggleItem = (index) => {
    setOpenIndexes(prevIndexes =>
      prevIndexes.includes(index)
        ? prevIndexes.filter(i => i !== index)
        : [...prevIndexes, index]
    );
  };

  return (
    <Router>
      <div style={{height: '100%'}}>
        <Routes>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/" element={
            <>
              <ReactFlow
                ref={ref}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                isValidConnection={validateConnection}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                panOnScroll
                selectionOnDrag
                panOnDrag={panOnDrag}
                nodeTypes={nodeTypes}
                selectionMode={SelectionMode.Partial}
                snapToGrid={true}
                snapGrid={[GAP_SIZE, GAP_SIZE]}
                minZoom={0.1}
                maxZoom={10}
              >
                <Background
                  offset={[10.5, 5.5]}
                  bgColor={"var(--canvas-bg-color)"}
                  color="var(--canvas-color)"

                  gap={GAP_SIZE}
                  size={0.8}
                  variant={variant}
                />

                <Controls className={'controls'}/>

                {showMinimap && (
                  <MiniMap
                    className='miniMap'
                    bgColor={'var(--canvas-bg-color)'}
                    maskColor={'var(--minimap-mask-color)'}
                    nodeColor={'var(--minimap-node-color)'}
                    position="top-right"
                    style={{borderRadius: '0.5rem', overflow: 'hidden'}}
                  />)}
                {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
              </ReactFlow>


              <button className="openCircuitsMenuButton" onClick={() => setCircuitsMenuState(!circuitsMenuState)}>
                <IconMenu SVGClassName={"openCircuitsMenuButtonIcon"} draggable="false"/>
              </button>

              <button onClick={() => setOpenSettings(true)} className="openSettingsButton">
                <IconSettings SVGClassName={"openSettingsButtonIcon"} draggable="false"/>
              </button>


              <div className={`backdrop ${openSettings ? 'cover' : ''}`}
                   onClick={() => setOpenSettings(false)}>
              </div>

              <div className={`settingsMenu ${openSettings ? 'showed' : ''}`}>
                <p className={'settingsMenuTitle'}>Settings</p>

                <Link to="/profile" className="openProfileButton" style={{textDecoration: 'none'}}>

                  <IconUser SVGClassName={'settingUserIcon'}/>

                  <span className='settingUserName'>UserName</span>
                </Link>


                <div className="minimapSwitchBlock">
                  <p className={'minimapSwitchLabel'}>Show mini-map</p>
                  <MinimapSwitch
                    className={'minimapSwitch'}
                    minimapState={showMinimap}
                    minimapToggle={setShowMinimap}
                  />
                </div>

                <div className="backgroundVariantBlock">
                  <p className={'selectCanvasBG'}>Canvas background</p>
                  <label htmlFor="selectBackground"></label>
                  <SelectCanvasBG
                    currentBG={currentBG}
                    setCurrentBG={setCurrentBG}
                    className={'selectBG'}
                  />
                </div>

                <div className="backgroundVariantBlock">
                  <p className={'minimapSwitchLabel'}>Theme</p>
                  <label htmlFor="selectTheme"></label>
                  <SelectTheme
                    theme={theme}
                    setTheme={setTheme}
                    className={'selectTheme'}
                  />
                </div>

                <button className={""} onClick={saveCircuit}>Save Circuit</button>
                <input
                  type="file"
                  accept=".json"
                  onChange={loadCircuit}
                  style={{marginTop: '10px'}}
                />
              </div>

              <div className={`circuitsMenu ${circuitsMenuState ? 'open' : ''}`}>

                <div className="menu-container">
                  <div className="menu-header">
                    <p className={"circuitsMenuTitle"}>
                      Menu
                    </p>
                    <div className="divider"></div>
                  </div>

                  <ol className="menu-items">
                    {menuItems.map((item, index) => (
                      <li
                        key={index}
                        className={`menu-item ${openIndexes.includes(index) ? 'active' : ''}`}
                      >
                        <div className="header" onClick={() => toggleItem(index)}>
                          {item.header}
                          <IconArrow SVGClassName={'arrow'} draggable="false"/>
                        </div>

                          <div className={`gates-grid-wrapper ${openIndexes.includes(index) ? 'open' : ''}`}>
                            <div className="gates-grid">
                              {item.gates.map((node) => (
                                <div
                                  key={node.id}
                                  className="dndnode"
                                  draggable
                                  onDragStart={(e) => onDragStart(e, node.id)}
                                >
                                  <button onClick={() => spawnCircuit(node.id)}>
                                    <node.icon SVGClassName="dndnode-icon" draggable="false"/>
                                    <div className={"circuitsName"}>{node.label}</div>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

        <div className={"toolbar"}>

          <button
            className={`simulate-button ${simulateState ? "stop" : "start"}`}
            onClick={() => console.log(simulateState)}
          >
            {simulateState==="idle" && (<IconLoading SVGClassName={`simulate-button-svg idle`} draggable="false"/>)}
            {simulateState==="awaiting" && (<IconLoading SVGClassName={`simulate-button-svg awaiting`} draggable="false"/>)}
            {simulateState==="running" && (<IconStop SVGClassName={`simulate-button-svg running`} draggable="false"/>)}
          </button>

          <div className={'toolbar-separator'}></div>

          <button
            className={`toolbarButton ${activeButton === "cursor" ? 'active' : ''}`}
              onClick={() => {
                setActiveButton("cursor")
                setPanOnDrag([1, 2])
              }
            }
          >
            <IconToolbarCursor SVGClassName={`toolbarButtonIcon`} draggable="false"/>
          </button>

          <button
            className={`toolbarButton ${activeButton === "hand" ? 'active' : ''}`}
              onClick={() => {
                setActiveButton("hand")
                setPanOnDrag(true)
              }
            }
          >
            <IconToolbarHand SVGClassName={`toolbarButtonIcon`} draggable="false"/>
          </button>

                <button
                  className={`toolbarButton ${activeButton === "sqwire" ? 'active' : ''}`}
                  onClick={() => setActiveButton("sqwire")}
                >
                  <IconToolbarSquareWire SVGClassName={`toolbarButtonIcon`} draggable="false"/>
                </button>

                <button
                  className={`toolbarButton ${activeButton === "dwire" ? 'active' : ''}`}
                  onClick={() => setActiveButton("dwire")}
                >
                  <IconToolbarDiagWire SVGClassName={`toolbarButtonIcon`} draggable="false"/>
                </button>

                <button
                  className={`toolbarButton ${activeButton === "eraser" ? 'active' : ''}`}
                  onClick={() => setActiveButton("eraser")}
                >
                  <IconToolbarEraser SVGClassName={`toolbarButtonIcon`} draggable="false"/>
                </button>

                <button
                  className={`toolbarButton ${activeButton === "text" ? 'active' : ''}`}
                  onClick={() => setActiveButton("text")}
                >
                  <IconToolbarText SVGClassName={`toolbarButtonIcon`} draggable="false"/>
                </button>
              </div>
            </>
          }/>
        </Routes>
      </div>
    </Router>
  );
}
export default App
