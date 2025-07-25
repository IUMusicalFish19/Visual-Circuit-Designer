import React, { useRef, useEffect, useState } from "react";
import { IconCloseCross } from "../../../../assets/ui-icons.jsx";
import { initializeTabHistory } from "../../utils/initializeTabHistory.js";

export default function TabsContainer({
  tabs,
  activeTabId,
  onTabsChange,
  onActiveTabIdChange,
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

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest(".context-menu")) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

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
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId: tabId,
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditingTabId(null);
    }
    if (e.key === "Escape") {
      setEditingTabId(null);
    }
  };

  const handleBlur = () => {
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
            left: contextMenu.x,
            top: contextMenu.y,
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
    </div>
  );
}
