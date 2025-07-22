import { Link } from "react-router-dom";
import UserIcon from "../../../../assets/userIcon.png";

import { MinimapSwitch } from "./switch.jsx";
import { useNotificationsLevel } from "../mainPage.jsx";
import {
  SelectCanvasBG,
  SelectLogLevel,
  SelectNotificationsPosition,
  SelectTheme,
  SelectPastePosition,
} from "./select.jsx";
import React, { useState } from "react";
import {
  IconCloseCross,
  IconTabPalette,
  IconTabPerson,
  IconTabBell,
} from "../../../../assets/ui-icons.jsx";

export default function Settings({
  openSettings,
  showMinimap,
  setShowMinimap,
  currentBG,
  setCurrentBG,
  pastePosition,
  setPastePosition,
  theme,
  setTheme,
  closeSettings,
  toastPosition,
  setToastPosition,
  currentLogLevel,
  setLogLevel,
}) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <div className={`settings-menu ${openSettings ? "showed" : ""}`}>
      <div className="tabs-menu">
        <div className={"upper-div"}>
          <button onClick={closeSettings}>
            <IconCloseCross SVGClassName={"close-setting-cross"} />
          </button>
        </div>

        <button
          className={`settings-tab s-tab0 ${currentTab === 0 ? "active" : ""}`}
          onClick={() => setCurrentTab(0)}
        >
          <IconTabPerson SVGClassName={"settings-tab-icon"} />
          <p>Account</p>
        </button>

        <button
          className={`settings-tab s-tab1 ${currentTab === 1 ? "active" : ""}`}
          onClick={() => setCurrentTab(1)}
        >
          <IconTabBell SVGClassName={"settings-tab-icon"} />
          <p>Notifications</p>
        </button>

        <button
          className={`settings-tab s-tab2 ${currentTab === 2 ? "active" : ""}`}
          onClick={() => setCurrentTab(2)}
        >
          <IconTabPalette SVGClassName={"settings-tab-icon"} />
          <p>Appearance</p>
        </button>
      </div>

      <div className="tab-content">
        <div className={"tab-content-upper"}>
          {currentTab === 0 && "Account"}
          {currentTab === 1 && "Notifications"}
          {currentTab === 2 && "Appearance"}
        </div>
        <TabContent
          currentTab={currentTab}
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
          currentLogLevel={currentLogLevel}
          setLogLevel={setLogLevel}
        />
      </div>
    </div>
  );
}

function TabContent({
  currentTab,
  showMinimap,
  setShowMinimap,
  currentBG,
  setCurrentBG,
  theme,
  setTheme,
  toastPosition,
  setToastPosition,
  pastePosition,
  setPastePosition,
}) {
  const { logLevel, setLogLevel } = useNotificationsLevel();

  if (currentTab === 0) {
    return (
      <Link
        to="/profile"
        className="open-profile-button"
        style={{ textDecoration: "none" }}
      >
        <img className="setting-user-icon" src={UserIcon} alt="User" />
        <span className="setting-user-name">UserName</span>
      </Link>
    );
  }

  if (currentTab === 1) {
    return (
      <div>
        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Notification details level</p>
            <p className="setting-description">
              Allows control over the amount of notifications during simulation.
              The higher the level, the more detailed the toast messages.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <SelectLogLevel
              currentLogLevel={logLevel}
              setCurrentLogLevel={setLogLevel}
            />
          </div>
        </div>

        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Notifications position</p>
            <p className="setting-description">
              Sets the position of notifications to top center or top bottom.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <SelectNotificationsPosition
              toastPosition={toastPosition}
              setToastPosition={setToastPosition}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 2) {
    return (
      <div>
        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Show mini-map</p>
            <p className="setting-description">
              Displays a small overview map of the canvas to help navigate large
              flows. Especially useful when working with complex node graphs.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <MinimapSwitch
              className="minimapSwitch"
              minimapState={showMinimap}
              minimapToggle={setShowMinimap}
            />
          </div>
        </div>

        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Canvas background</p>
            <p className="setting-description">
              Sets the background appearance of the working board.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <SelectCanvasBG
              currentBG={currentBG}
              setCurrentBG={setCurrentBG}
              className="selectBG"
            />
          </div>
        </div>

        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Theme</p>
            <p className="setting-description">
              Changes theme for the entire website.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <SelectTheme
              theme={theme}
              setTheme={setTheme}
              className="selectTheme"
            />
          </div>
        </div>

        <div className="setting-block">
          <div className="setting-text">
            <p className="setting-title">Paste position</p>
            <p className="setting-description">
              Changes position of the paste.
            </p>
          </div>

          <div className={"interactive-wrapper"}>
            <SelectPastePosition
              pastePosition={pastePosition}
              setPastePosition={setPastePosition}
              className="selectPastePosition"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
