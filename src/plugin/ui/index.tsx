import { createRoot } from "react-dom/client";
import "./index.scss";
import { StrictMode } from "react";
import { App } from "./app";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
