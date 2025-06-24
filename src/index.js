import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import reportWebVitals from './reportWebVitals';
import process from "process";
import { Buffer } from "buffer";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from './authConfig';
import { MsalProvider } from "@azure/msal-react";

window.process = process;
window.Buffer = window.Buffer || Buffer;
const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
);
