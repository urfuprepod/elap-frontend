import React from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import App from "./app";

const mockSetup = async () => {
  if (process.env.REACT_APP_MOCK_SERVER === "on") {
    const { worker } = await import("shared/api/mocks/browser");
    worker.start({
      onUnhandledRequest: "bypass",
    });
  }
  return Promise.resolve();
};

mockSetup().then(() => {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

reportWebVitals();
