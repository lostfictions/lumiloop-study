import React from "react";
import { render } from "react-dom";

import "./index.css";

import App from "./App";

const ac = new AudioContext();

const root = document.createElement("div");
document.body.appendChild(root);

render(<App audioContext={ac} />, root);
