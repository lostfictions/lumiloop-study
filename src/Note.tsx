import React from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

import { sinasc, sindesc, map01, map, clamp } from "./helpers";

import { wrapper, note, eye, pupil } from "./Note.css";

const ACCEL = 0.2;
const DECEL = 0.996;
const MAX_VEL = 200;

async function fetchSample(
  noteName: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const { default: filename } = await import(`../samples/${noteName}.wav`);
  const res = await fetch(filename);
  const buff = await res.arrayBuffer();
  return audioContext.decodeAudioData(buff);
}

const intervals = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];

/** Takes a value in the interval [0, 1] */
function getGainSet(value: number): [number, number, number] {
  if (value < intervals[0]) {
    return [sinasc(map01(value, 0, intervals[0])), 0, 0];
  } else if (value < intervals[1]) {
    return [1, 0, 0];
  } else if (value < intervals[2]) {
    return [
      sindesc(map01(value, intervals[1], intervals[2])),
      sinasc(map01(value, intervals[1], intervals[2])),
      0
    ];
  } else if (value < intervals[3]) {
    return [0, 1, 0];
  } else if (value < intervals[4]) {
    return [
      0,
      sindesc(map01(value, intervals[3], intervals[4])),
      sinasc(map01(value, intervals[3], intervals[4]))
    ];
  }
  return [0, 0, 1];
}

interface NoteProps {
  audioContext: AudioContext;
  samples: [string, string, string];
  color: string;
  outerRadius: number;
  innerRadius: number;
  vert: "t" | "b" | "m";
  horiz: "l" | "r" | "c";
}

@observer
export default class Note extends React.Component<NoteProps> {
  samples: Sample[] | null = null;

  gainNode!: GainNode;
  pannerNode!: StereoPannerNode;

  rafId!: number;

  @observable
  angle = 0;

  @observable
  velocity = 0;

  componentDidMount() {
    const { audioContext } = this.props;

    this.pannerNode = audioContext.createStereoPanner();
    this.pannerNode.pan.value = 0;
    this.pannerNode.connect(audioContext.destination);

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.pannerNode);

    this.fetchBuffers();

    this.rafId = requestAnimationFrame(this.update);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);

    if (this.samples) {
      this.samples.forEach(sample => sample.cleanup());
    }
    this.samples = [];

    this.gainNode.disconnect();
    this.gainNode = null as any;
    this.pannerNode.disconnect();
    this.pannerNode = null as any;
  }

  fetchBuffers = async () => {
    const { samples, audioContext } = this.props;

    const audioBuffers = await Promise.all(
      samples.map(s => fetchSample(`Choir/${s}`, audioContext))
    );

    const loadedSamples = audioBuffers.map(ab => new Sample(audioContext, ab));

    if (this.gainNode) {
      loadedSamples.forEach(sample => sample.gain.connect(this.gainNode));
      this.samples = loadedSamples;
    } else {
      console.log("Component unmounted while loading samples. Cancelling...");
      loadedSamples.forEach(sample => sample.cleanup());
    }
  };

  @action
  update = () => {
    if (this.pointerIsDown) {
      this.velocity = clamp(this.velocity + ACCEL, 0, MAX_VEL);
    } else {
      this.velocity *= DECEL;
      if (this.velocity < 0.0000001) {
        this.velocity = 0;
      }
    }

    this.angle += this.velocity;

    this.gainNode.gain.value = map(this.velocity, 0, MAX_VEL, 0, 1);

    if (this.samples) {
      const [g0, g1, g2] = getGainSet(
        map01(clamp(this.velocity, 0, MAX_VEL), 0, MAX_VEL)
      );

      this.samples[0].gain.gain.value = g0;
      this.samples[1].gain.gain.value = g1;
      this.samples[2].gain.gain.value = g2;
    }

    this.rafId = requestAnimationFrame(this.update);
  };

  pointerIsDown = false;

  mouseDown = () => {
    if (!this.pointerIsDown) {
      // this is meaningless and confusing but i guess might make audio continue
      // to work in chrome if they still decide break the web with their
      // nonstandard autoplay garbage
      this.props.audioContext.resume();
      this.pointerIsDown = true;
    }
  };

  mouseUp = () => {
    this.pointerIsDown = false;
  };

  render() {
    const { innerRadius, outerRadius, color, vert, horiz } = this.props;

    const justifyContent =
      vert === "t" ? "flex-start" : vert === "m" ? "center" : "flex-end";

    const alignItems =
      horiz === "l" ? "flex-start" : horiz === "c" ? "center" : "flex-end";

    return (
      <>
        <div className={wrapper} style={{ justifyContent, alignItems }}>
          <div
            className={note}
            onMouseDown={this.mouseDown}
            onMouseUp={this.mouseUp}
            style={{
              borderColor: color,
              borderRadius: outerRadius,
              height: innerRadius,
              width: innerRadius,
              transform: `rotate(${this.angle}deg)`
            }}
          >
            <div style={{ position: "relative" }}>
              <Eye side="left" />
              <Eye side="right" />
            </div>
          </div>
        </div>
      </>
    );
  }
}

class Eye extends React.PureComponent<{ side: "left" | "right" }> {
  render() {
    return (
      <>
        <div
          className={eye}
          style={{
            [this.props.side]: -20
          }}
        />
        <div
          className={pupil}
          style={{
            [this.props.side]: -20
          }}
        />
      </>
    );
  }
}

class Sample {
  source: AudioBufferSourceNode;
  gain: GainNode;
  constructor(ctx: AudioContext, sample: AudioBuffer) {
    this.source = ctx.createBufferSource();
    this.source.buffer = sample;
    this.source.loop = true;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.source.connect(this.gain);
    this.source.start();
  }

  cleanup() {
    this.source.stop();
    this.source.disconnect();
    this.source = null as any;
    this.gain.disconnect();
    this.gain = null as any;
  }
}
