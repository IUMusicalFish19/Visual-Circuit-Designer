import {
  IconStop,
  IconLoading,
  IconStart,
  IconError,
  IconDownloadFile,
  IconOpenFile,
  IconUndo,
  IconRedo,
} from "../../../../assets/ui-icons.jsx";

import {
  IconToolbarBezierWire,
  IconToolbarCursor,
  IconToolbarEraser,
  IconToolbarHand,
  IconToolbarStepWire,
  IconToolbarStraightWire,
  IconToolbarText,
  IconToolbarCustomBlock,
} from "../../../../assets/toolbar-icons.jsx";

export default function Toolbar({
  simulateState,
  activeAction,
  setActiveAction,
  activeWire,
  setActiveWire,
  setPanOnDrag,
  onSimulateClick,
  saveCircuit,
  loadCircuit,
  extractFromFile,
  uploadRef,
  handleUploadClick,
  extractRef,
  handleExtractClick,
  undo,
  redo,
  canUndo,
  canRedo,
}) {
  return (
    <div>
      <div className="toolbar">
        <button
          className={`simulate-button ${simulateState}`}
          onClick={onSimulateClick}
          title={"Simulation"}
        >
          {simulateState === "idle" && (
            <IconStart
              SVGClassName="simulate-button-svg idle"
              draggable="false"
            />
          )}
          {simulateState === "awaiting" && (
            <IconLoading
              SVGClassName="simulate-button-svg awaiting"
              draggable="false"
            />
          )}
          {simulateState === "running" && (
            <IconStop
              SVGClassName="simulate-button-svg running"
              draggable="false"
            />
          )}
          {simulateState === "error" && (
            <IconError
              SVGClassName="simulate-button-svg error"
              draggable="false"
            />
          )}
        </button>

        <div className="toolbar-separator"></div>

        <button
          className={`toolbar-button ${activeAction === "cursor" ? "active" : ""}`}
          onClick={() => {
            setActiveAction("cursor");
            setPanOnDrag(false);
          }}
          disabled={activeAction === "cursor"}
          title={"Cursor (Ctrl+1)"}
        >
          <IconToolbarCursor
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <button
          className={`toolbar-button ${activeAction === "hand" ? "active" : ""}`}
          onClick={() => {
            setActiveAction("hand");
            setPanOnDrag(true);
          }}
          disabled={activeAction === "hand"}
          title={"Hand (Ctrl+2)"}
        >
          <IconToolbarHand
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <button
          className={`toolbar-button ${activeAction === "eraser" ? "active" : ""}`}
          onClick={() => setActiveAction("eraser")}
          disabled={activeAction === "eraser"}
          title={"Eraser (Ctrl+3)"}
        >
          <IconToolbarEraser
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <button
          className={`toolbar-button ${activeAction === "text" ? "active" : ""}`}
          onClick={() => setActiveAction("text")}
          disabled={activeAction === "text"}
          title={"Text (Ctrl+4)"}
        >
          <IconToolbarText
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <div className="toolbar-separator"></div>

        <button
          className={`toolbar-button ${activeWire === "default" ? "active" : ""}`}
          onClick={() => {
            setActiveWire("default");
          }}
          disabled={activeWire === "default"}
          title={"Default (Ctrl+5)"}
        >
          <IconToolbarBezierWire
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <button
          className={`toolbar-button ${activeWire === "step" ? "active" : ""}`}
          onClick={() => {
            setActiveWire("step");
          }}
          disabled={activeWire === "step"}
          title={"Step (Ctrl+6)"}
        >
          <IconToolbarStepWire
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <button
          className={`toolbar-button ${activeWire === "straight" ? "active" : ""}`}
          onClick={() => {
            setActiveWire("straight");
          }}
          disabled={activeWire === "straight"}
          title={"Straight (Ctrl+7)"}
        >
          <IconToolbarStraightWire
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <div className="toolbar-separator"></div>

        <button
          className="toolbar-button"
          onClick={undo}
          disabled={!canUndo}
          title={canUndo ? "Undo (Ctrl+Z)" : "Nothing to undo in this tab"}
        >
          <IconUndo SVGClassName="toolbar-button-icon" draggable="false" />
        </button>

        <button
          className="toolbar-button"
          onClick={redo}
          disabled={!canRedo}
          title={canRedo ? "Redo (Ctrl+Y)" : "Nothing to redo in this tab"}
        >
          <IconRedo SVGClassName="toolbar-button-icon" draggable="false" />
        </button>
      </div>

      <div className="toolbar download">
        <button
          className={`toolbar-button`}
          onClick={saveCircuit}
          title={"Download"}
        >
          <IconDownloadFile
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>

        <div className="toolbar-separator"></div>

        <button
          className={`toolbar-button`}
          onClick={handleUploadClick}
          title={"Upload"}
        >
          <IconOpenFile SVGClassName="toolbar-button-icon" draggable="false" />
        </button>
        <input
          className={`hidden`}
          ref={uploadRef}
          type="file"
          accept=".json"
          onChange={loadCircuit}
          style={{ display: "none" }}
        />

        <div className="toolbar-separator"></div>

        <button
          className={`toolbar-button`}
          onClick={handleExtractClick}
          title={"Create custom block"}
        >
          <IconToolbarCustomBlock
            SVGClassName="toolbar-button-icon"
            draggable="false"
          />
        </button>
        <input
          className={`hidden`}
          ref={extractRef}
          type="file"
          accept=".json"
          onChange={extractFromFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
