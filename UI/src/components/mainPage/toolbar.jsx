import React from "react";
import {
  IconStop,
  IconLoading,
  IconStart,
  IconError,
} from "../../../assets/ui-icons.jsx";

import {
  IconToolbarCursor,
  IconToolbarEraser,
  IconToolbarHand,
  IconToolbarSquareWire,
  IconToolbarDiagWire,
  IconToolbarText,
} from "../../../assets/toolbar-icons.jsx";

export default function Toolbar({
  simulateState,
  activeAction,
  setActiveAction,
  activeWire,
  setActiveWire,
  activeButton,
  setActiveButton,
  setPanOnDrag,
  setWireType,
  onSimulateClick,
}) {
  return (
    <div className="toolbar">
      <button
        className={`simulate-button ${simulateState}`}
        onClick={onSimulateClick}
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
        className={`toolbarButton ${activeAction === "cursor" ? "active" : ""}`}
        onClick={() => {
          setActiveAction("cursor");
          setPanOnDrag([2]);
        }}
      >
        <IconToolbarCursor SVGClassName="toolbarButtonIcon" draggable="false" />
      </button>

      <button
        className={`toolbarButton ${activeAction === "hand" ? "active" : ""}`}
        onClick={() => {
          setActiveAction("hand");
          setPanOnDrag(true);
        }}
      >
        <IconToolbarHand SVGClassName="toolbarButtonIcon" draggable="false" />
      </button>

      <div className="toolbar-separator"></div>

      <button
        className={`toolbarButton ${activeWire === "stepWire" ? "active" : ""}`}
        onClick={() => {
          setActiveWire("stepWire");
          setWireType("step");
        }}
      >
        <IconToolbarSquareWire
          SVGClassName="toolbarButtonIcon"
          draggable="false"
        />
      </button>

      <button
        className={`toolbarButton ${activeWire === "straightWire" ? "active" : ""}`}
        onClick={() => {
          setActiveWire("straightWire");
          setWireType("straight");
        }}
      >
        <IconToolbarDiagWire
          SVGClassName="toolbarButtonIcon"
          draggable="false"
        />
      </button>

      <div className="toolbar-separator"></div>

      <button
        className={`toolbarButton ${activeButton === "eraser" ? "active" : ""}`}
        onClick={() => setActiveButton("eraser")}
      >
        <IconToolbarEraser SVGClassName="toolbarButtonIcon" draggable="false" />
      </button>

      <button
        className={`toolbarButton ${activeButton === "text" ? "active" : ""}`}
        onClick={() => setActiveButton("text")}
      >
        <IconToolbarText SVGClassName="toolbarButtonIcon" draggable="false" />
      </button>
    </div>
  );
}
