import toast from "react-hot-toast";
import { IconCloseCross } from "../../../assets/ui-icons.jsx";

export const LOG_LEVELS = {
  ERROR: 0,
  IMPORTANT: 1,
  DEBUG: 2,
};

// Уровень логирования по умолчанию
let currentLogLevel = LOG_LEVELS.ERROR;

export const logMessage = (msg, level = LOG_LEVELS.IMPORTANT) => {
  if (level <= currentLogLevel) {
    const levelLabel = Object.keys(LOG_LEVELS).find(
      (k) => LOG_LEVELS[k] === level,
    );
    console.log(`[${levelLabel}]:`, msg);
  }
};

export const showToast = (msg, icon = "ℹ️", level = LOG_LEVELS.IMPORTANT) => {
  if (level <= currentLogLevel) {
    toast(
      (t) => (
        <div className={"toast-notification"}>
          <div style={{ flex: 1, wordBreak: "break-word" }}>{msg}</div>
          <button onClick={() => toast.dismiss(t.id)} className={"close-cross"}>
            <IconCloseCross SVGClassName={"close-cross-icon"} />
          </button>
        </div>
      ),
      { duration: "500", icon: icon },
    );
  }
};

export const showToastError = (msg) => {
  toast.error(
    (t) => (
      <div className={"toast-notification"}>
        <div style={{ flex: 1, wordBreak: "break-word" }}>{msg}</div>
        <button className={"close-cross"} onClick={() => toast.dismiss(t.id)}>
          <IconCloseCross SVGClassName={"close-cross-icon-toast"} />
        </button>
      </div>
    ),
    { duration: "500" },
  );
};
