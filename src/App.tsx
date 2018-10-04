import React from "react";
import { hot } from "react-hot-loader";

import Note from "./Note";

const scale = ["C3", "D3", "E3", "G3", "A4"];

const App = ({ audioContext }: { audioContext: AudioContext }) => (
  <div>
    {scale.map(note => (
      <Note audioContext={audioContext} note={note} key={note} />
    ))}
  </div>
);

export default hot(module)(App);
