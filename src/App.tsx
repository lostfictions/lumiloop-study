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
                return (
                  <Note
                    audioContext={audioContext}
                    color="#39f"
                    note="D"
                    horiz="c"
                    vert="m"
                    outerRadius={min * 0.8}
                    innerRadius={min * 0.8 * 0.6}
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
                      note="A"
                      horiz="l"
                      vert="t"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#39f"
                      note="D"
                      horiz="c"
                      vert="m"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#3f9"
                      note="C"
                      horiz="l"
                      vert="b"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#f93"
                      note="E"
                      horiz="r"
                      vert="t"
                      outerRadius={outer}
                      innerRadius={inner}
                    />
                    <Note
                      audioContext={audioContext}
                      color="#93f"
                      note="G"
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
