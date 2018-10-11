import React from "react";
import { hot } from "react-hot-loader";
import MediaQuery from "react-responsive";

import WindowSize from "./WindowSize";
import Note from "./Note";

const App = ({ audioContext }: { audioContext: AudioContext }) => (
  <div>
    <MediaQuery maxWidth={767}>
      {matches => {
        if (matches) {
          return (
            <WindowSize>
              {({ width, height }) => {
                const min = Math.min(width, height);

                const outer = min * 0.2;
                const inner = outer * 0.6;

                return (
                  <Note
                    audioContext={audioContext}
                    color="#39f"
                    samples={["D3", "D4", "D5"]}
                    horiz="c"
                    vert="m"
                    outerRadius={outer}
                    innerRadius={inner}
                  />
                );
              }}
            </WindowSize>
          );
        } else {
          return (
            <WindowSize>
              {({ width, height }) => {
                const min = Math.min(width, height);

                const outer = min * 0.2;
                const inner = outer * 0.6;

                return (
                  <>
                    <Note
                      audioContext={audioContext}
                      color="#f39"
                      samples={["A2", "A3", "A4"]}
                      horiz="l"
                      vert="t"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#39f"
                      samples={["D3", "D4", "D5"]}
                      horiz="c"
                      vert="m"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#3f9"
                      samples={["C3", "C4", "C5"]}
                      horiz="l"
                      vert="b"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#f93"
                      samples={["E3", "E4", "E5"]}
                      horiz="r"
                      vert="t"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#93f"
                      samples={["G2", "G3", "G4"]}
                      horiz="r"
                      vert="b"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                  </>
                );
              }}
            </WindowSize>
          );
        }
      }}
    </MediaQuery>
  </div>
);

export default hot(module)(App);
