import React from "react";
import { hot } from "react-hot-loader";
import MediaQuery from "react-responsive";

import Note from "./Note";

const App = ({ audioContext }: { audioContext: AudioContext }) => (
  <div>
    <MediaQuery maxWidth={767}>
      {matches => {
        if (matches) {
          return (
            <Note audioContext={audioContext} note="D" horiz="c" vert="m" />
          );
        } else {
          return (
            <>
              <Note audioContext={audioContext} note="D" horiz="c" vert="m" />
              <Note audioContext={audioContext} note="A" horiz="l" vert="t" />
              <Note audioContext={audioContext} note="E" horiz="r" vert="t" />
              <Note audioContext={audioContext} note="C" horiz="l" vert="b" />
              <Note audioContext={audioContext} note="G" horiz="r" vert="b" />
            </>
          );
        }
      }}
    </MediaQuery>
  </div>
);

export default hot(module)(App);
