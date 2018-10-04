import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";

import { container } from "./Note.css";

interface NoteProps {
  audioContext: AudioContext;
  note: string;
}

@observer
export default class Note extends React.Component<NoteProps> {
  @observable
  buffer: AudioBuffer | null = null;

  @observable
  loop = true;

  @observable
  gain = 0.5;

  @observable.shallow
  sources = [] as AudioBufferSourceNode[];

  gainNode!: GainNode;

  componentDidMount() {
    this.fetchBuffer();

    const { audioContext } = this.props;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = this.gain;
    this.gainNode.connect(audioContext.destination);
  }

  componentWillUnmount() {
    this.sources.forEach(src => {
      src.stop();
      src.disconnect();
    });
    this.gainNode.disconnect();
  }

  fetchBuffer = async () => {
    const { note, audioContext } = this.props;
    const { default: filename } = await import(`../samples/Cello/${note}.wav`);
    const res = await fetch(filename);
    const buff = await res.arrayBuffer();
    this.buffer = await audioContext.decodeAudioData(buff);
  };

  playNote = () => {
    const source = this.props.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.loop = this.loop;
    source.onended = () => {
      source.disconnect();
      this.sources.splice(this.sources.indexOf(source), 1);
    };
    this.sources.push(source);
    source.connect(this.gainNode);
    source.start();
  };

  stopAll = () => {
    this.sources.forEach(src => {
      src.stop();
      src.disconnect();
    });
    this.sources = [];
  };

  toggleLoop = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.loop = ev.target.checked;
    this.sources.forEach(src => {
      src.loop = this.loop;
    });
  };

  setGain = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.gain = parseFloat(ev.target.value);
    this.gainNode.gain.value = this.gain;
  };

  render() {
    const { note } = this.props;
    return (
      <div className={container}>
        <div>{note}</div>
        {this.buffer ? (
          <>
            <button onClick={this.playNote}>▶️️</button>
            <button onClick={this.stopAll}>⏹️</button>
          </>
        ) : (
          <button disabled>Loading....</button>
        )}
        <div>
          <input
            type="checkbox"
            onChange={this.toggleLoop}
            checked={this.loop}
          />
          <span>Loop</span>
        </div>
        <div>
          <input
            type="range"
            onChange={this.setGain}
            onInput={this.setGain}
            value={this.gain}
            min={0}
            max={1}
            step={0.01}
          />
        </div>
        <div>Gain: {this.gain}</div>
        <span>Voices: {this.sources.length}</span>
      </div>
    );
  }
}