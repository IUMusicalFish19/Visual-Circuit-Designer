import { createRoot } from "react-dom/client";
import "requestidlecallback-polyfill";
import App from "./App";
import { ReactFlowProvider } from "@xyflow/react";

import "./CSS/index.css";

const container = document.querySelector("#app");
const root = createRoot(container);

root.render(
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>,
);
