import "./index.css";

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
