import { createRoot } from "react-dom/client";
import React from "react";
import App from "./components/app.jsx";

const rootNode = document.querySelector("#ReactRoot");
const root = createRoot(rootNode);

root.render(
    <App/>
);