import React, { useRef, useEffect, useState } from "react";
import { IconCloseCross } from "../../../../assets/ui-icons.jsx";
import { initializeTabHistory } from "../../utils/initializeTabHistory.js";
import { calculateContextMenuPosition } from "../../utils/calculateContextMenuPosition.js";

export default function TabsContainer({
  tabs,
  activeTabId,
  onTabsChange,
  onActiveTabIdChange,
  ref,
}) {
  const scrollRef = useRef(null);
  const textareaRefs = useRef({});
  const [contextMenu, setContextMenu] = useState(null);
  const [editingTabId, setEditingTabId] = useState(null);

  // Wheel event for horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const SCROLL_SPEED = 1.5;
        el.scrollLeft += e.deltaY * SCROLL_SPEED;
      } else {
        e.preventDefault();
        const SCROLL_SPEED = 1.5;
        el.scrollLeft += e.deltaX * SCROLL_SPEED;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingTabId && textareaRefs.current[editingTabId]) {
      const textarea = textareaRefs.current[editingTabId];
      textarea.focus();
      textarea.select();
    }
  }, [editingTabId]);

  const addTab = () => {
    const newTab = initializeTabHistory({
      id: Date.now(),
      title: "New Tab",
      nodes: [],
      edges: [],
    });
    onTabsChange([...tabs, newTab]);
    onActiveTabIdChange(newTab.id);
  };

  const removeTab = (id) => {
    const updated = tabs.filter((t) => t.id !== id);
    onTabsChange(updated);
    if (id === activeTabId && updated.length > 0) {
      onActiveTabIdChange(updated[0].id);
    }
  };

  const updateTabTitle = (id, newTitle) => {
    const updated = tabs.map((t) =>
      t.id === id ? { ...t, title: newTitle } : t,
    );
    onTabsChange(updated);
  };

  const handleContextMenu = (e, tabId) => {
    e.preventDefault();
    const menuPosition = calculateContextMenuPosition(
      e,
      ref.current.getBoundingClientRect(),
    );
    setContextMenu({
      tabId: tabId,
      top: menuPosition.top,
      left: menuPosition.left,
      right: menuPosition.right,
      bottom: menuPosition.bottom,
    });
  };

  const handleRename = (tabId) => {
    setEditingTabId(tabId);
    setContextMenu(null);
  };

  const handleCloseTab = (tabId) => {
    removeTab(tabId);
    setContextMenu(null);
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tab = tabs.find((t) => t.id === tabId);
      if (tab && tab.title.trim() === "") {
        updateTabTitle(tabId, "Untitled Tab");
      }
      setEditingTabId(null);
    }
    if (e.key === "Escape") {
      setEditingTabId(null);
    }
  };

  const handleBlur = () => {
    if (editingTabId !== null) {
      const tab = tabs.find((t) => t.id === editingTabId);
      if (tab && tab.title.trim() === "") {
        updateTabTitle(editingTabId, "Untitled Tab");
      }
    }
    setEditingTabId(null);
  };

  return (
    <div className="tabs-scroll-container">
      <div className="main-tabs-wrapper" ref={scrollRef}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? "active" : ""}`}
            onClick={() => onActiveTabIdChange(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
          >
            {editingTabId === tab.id ? (
              <textarea
                ref={(el) => {
                  textareaRefs.current[tab.id] = el;
                  if (el) {
                    el.style.width = "auto";
                    el.style.width = `${el.scrollWidth}px`;
                  }
                }}
                className="name-text-area editing"
                value={tab.title}
                onChange={(e) => {
                  const { value } = e.target;
                  updateTabTitle(tab.id, value);
                  const textarea = textareaRefs.current[tab.id];
                  if (textarea) {
                    textarea.style.width = "auto";
                    textarea.style.width = `${textarea.scrollWidth}px`;
                  }
                }}
                placeholder="Tab name"
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="tab-title">{tab.title}</span>
            )}
            {tabs.length > 1 && (
              <button
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
              >
                <IconCloseCross SVGClassName="close-tab-cross" />
              </button>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={addTab}>
          ＋
        </button>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.top,
            left: contextMenu.left,
            right: contextMenu.right,
            bottom: contextMenu.bottom,
          }}
        >
          <div
            className="context-menu-item"
            onClick={() => handleRename(contextMenu.tabId)}
          >
            Rename
          </div>
          {tabs.length > 1 && (
            <div
              className="context-menu-item"
              onClick={() => handleCloseTab(contextMenu.tabId)}
            >
              Close Tab
            </div>
          )}
        </div>
      )}

      <div
        className={`backdrop ${contextMenu ? "show" : ""}`}
        onClick={() => {
          setContextMenu(null);
        }}
      />
    </div>
  );
}
