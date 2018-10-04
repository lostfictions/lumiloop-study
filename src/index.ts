import "./index.css";

const scale = ["C3", "D3", "E3", "G3", "A4"];

const cello = require.context("../samples/Cello");

const notes: { [note: string]: AudioBuffer } = {};

(async () => {
  const ac = new AudioContext();

  await Promise.all(
    scale.map(async note => {
      const res = await fetch(cello(`./${note}.wav`));
      const buff = await res.arrayBuffer();
      const data = await ac.decodeAudioData(buff);

      notes[note] = data;
    })
  );

  Object.entries(notes).forEach(([note, buff]) => {
    const b = document.createElement("button");
    b.textContent = note;
    document.body.appendChild(b);

    b.onclick = () => {
      const src = ac.createBufferSource();
      src.buffer = buff;
      const gain = ac.createGain();
      gain.gain.value = 0.5;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    };
  });
})();

/*
const canvasEl = document.createElement("canvas");
document.body.appendChild(canvasEl);

const c = canvasEl.getContext("2d")!;

let w: number;
let h: number;
function resize() {
  ({ innerWidth: w, innerHeight: h } = window);
  canvasEl.width = w;
  canvasEl.height = h;
}

resize();
window.onresize = resize;

function draw(t: number) {
  c.fillStyle = "#000";
  c.clearRect(0, 0, w, h);
  c.fillRect(0, 0, w, h);

  c.beginPath();

  const posX = 40 + Math.sin(t / 1000) * 20;
  const posY = 40 + Math.cos(t / 1000) * 20;

  c.fillStyle = "#f00";
  c.ellipse(posX, posY, 20, 20, 0, 0, 2 * Math.PI);
  c.fill();

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
 */
