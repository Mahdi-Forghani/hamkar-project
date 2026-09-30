import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import faIR from "antd/locale/fa_IR";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import {
  ThemeProvider,
  useTheme,
  getAntTheme,
} from "./theme/ThemeProvider";

import { AuthProvider } from "./context/AuthContext";

function AppTheme() {
  const { mode } = useTheme();

  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={getAntTheme(mode)}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppTheme />
    </ThemeProvider>
  </React.StrictMode>,
);