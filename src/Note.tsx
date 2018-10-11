import React from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

import { wrapper } from "./Note.css";

const ACCEL = 0.02;
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

function map(
  val: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  //normalize val to 0..1 range
  val = (val - fromMin) / (fromMax - fromMin);
  //then map to other domain
  return val * (toMax - toMin) + toMin;
}

function map01(val: number, fromMin: number, fromMax: number): number {
  //normalize val to 0..1 range
  return (val - fromMin) / (fromMax - fromMin);
}

function clamp(val: number, min: number, max: number): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

// -0.5 => 0
//    0 => 1
//  0.5 => 0
function sinmid(value: number) {
  return (Math.sin((value + 0.25) * (2 * Math.PI)) + 1) / 2;
}

// -1 => 0
//  0 => 1
//  1 => 0
function sindesc(value: number): number {
  return (Math.sin((value + 0.5) * Math.PI) + 1) / 2;
}

// -1 => 1
//  0 => 0
//  1 => 1
function sinasc(value: number): number {
  return (Math.sin((value + 1.5) * Math.PI) + 1) / 2;
}

const intervals = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];

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
  } else if (value < 1) {
    return [0, 0, 1];
  }
  throw new Error("Input value out of range");
}

interface NoteProps {
  audioContext: AudioContext;
  note: string;
  color: string;
  outerRadius: number;
  innerRadius: number;
  vert: "t" | "b" | "m";
  horiz: "l" | "r" | "c";
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

@observer
export default class Note extends React.Component<NoteProps> {
  @observable.ref
  samples: Sample[] | null = null;

  @observable
  loop = true;

  gainNode!: GainNode;
  pannerNode!: StereoPannerNode;

  rafId!: number;

  @observable
  angle = 0;

  @observable
  velocity = 0;

  componentDidMount() {
    this.fetchBuffers();

    const { audioContext } = this.props;

    this.pannerNode = audioContext.createStereoPanner();
    this.pannerNode.pan.value = 0;
    this.pannerNode.connect(audioContext.destination);

    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.pannerNode);

    this.rafId = requestAnimationFrame(this.update);
  }

  @action
  update = () => {
    if (this.pointerIsDown) {
      this.velocity = clamp(this.velocity + ACCEL, 0, MAX_VEL);
    } else {
      this.velocity *= 0.9998;
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

      this.samples![0].gain.gain.value = g0;
      this.samples![1].gain.gain.value = g1;
      this.samples![2].gain.gain.value = g2;
    }

    this.rafId = requestAnimationFrame(this.update);
  };

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
    const { note, audioContext } = this.props;
    this.samples = [
      new Sample(
        audioContext,
        await fetchSample(`Choir/${note}3`, audioContext)
      ),
      new Sample(
        audioContext,
        await fetchSample(`Choir/${note}4`, audioContext)
      ),
      new Sample(
        audioContext,
        await fetchSample(`Choir/${note}5`, audioContext)
      )
    ];

    this.samples.forEach(sample => sample.gain.connect(this.gainNode));
  };

  pointerIsDown = false;

  mouseDown = () => {
    if (!this.pointerIsDown) {
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
            onMouseDown={this.mouseDown}
            onMouseUp={this.mouseUp}
            style={{
              pointerEvents: "auto",
              cursor: "grab",
              borderWidth: 50,
              borderStyle: "solid",
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
      <div
        style={{
          position: "absolute",
          borderWidth: 20,
          borderStyle: "solid",
          borderColor: "#eee",
          borderRadius: 20,
          top: -40,
          [this.props.side]: -20
        }}
      />
    );
  }
}
