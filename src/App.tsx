import React from "react";
import { hot } from "react-hot-loader";

import Note from "./Note";

const ac = new AudioContext();

const scale = ["C3", "D3", "E3", "G3", "A4"];

const App = () => (
  <div>
    {scale.map(note => (
      <Note audioContext={ac} note={note} key={note} />
    ))}
  </div>
);

export default hot(module)(App);
