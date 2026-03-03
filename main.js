const GRID_W = 58;
const GRID_H = 58;
const CELL = 10;

const canvas = document.getElementById("beads-canvas");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const eraserBtn = document.getElementById("eraser-btn");

const palette = [
  { name: "Black", hex: "#1b1b1b" },
  { name: "White", hex: "#f8f6f2" },
  { name: "Gray", hex: "#9fa3a7" },
  { name: "Red", hex: "#e34b4b" },
  { name: "Orange", hex: "#f28c3d" },
  { name: "Yellow", hex: "#f4d34f" },
  { name: "Green", hex: "#4ea86b" },
  { name: "Blue", hex: "#3c6fd6" },
  { name: "Purple", hex: "#8f6ad6" },
  { name: "Pink", hex: "#f08fb6" },
  { name: "Brown", hex: "#8b5e3c" },
  { name: "Cyan", hex: "#52c0c7" },
];

let currentColor = 0;
let isPainting = false;
let mode = "paint";

canvas.width = GRID_W * CELL;
canvas.height = GRID_H * CELL;
canvas.style.width = `${canvas.width}px`;
canvas.style.height = `${canvas.height}px`;

const grid = new Array(GRID_W * GRID_H).fill(-1);

function idx(x, y) {
  return y * GRID_W + x;
}

function inBounds(x, y) {
  return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
}

function renderPalette() {
  paletteEl.innerHTML = "";
  palette.forEach((color, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette__color";
    btn.style.background = color.hex;
    btn.title = color.name;
    btn.setAttribute("aria-label", color.name);
    btn.addEventListener("click", () => {
      currentColor = index;
      mode = "paint";
      eraserBtn.classList.remove("is-active");
      eraserBtn.setAttribute("aria-pressed", "false");
      renderPalette();
    });
    if (index === currentColor) {
      btn.classList.add("is-active");
    }
    paletteEl.appendChild(btn);
  });
}

function draw() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < grid.length; i += 1) {
    const colorIndex = grid[i];
    if (colorIndex === -1) {
      continue;
    }

    const x = i % GRID_W;
    const y = Math.floor(i / GRID_W);
    const cx = x * CELL + CELL / 2;
    const cy = y * CELL + CELL / 2;

    ctx.fillStyle = palette[colorIndex].hex;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= GRID_W; x += 1) {
    const px = x * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= GRID_H; y += 1) {
    const py = y * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }
}

renderPalette();
draw();

function paintAtEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const gridX = Math.floor(mouseX / CELL);
  const gridY = Math.floor(mouseY / CELL);

  if (!inBounds(gridX, gridY)) {
    return;
  }

  grid[idx(gridX, gridY)] = mode === "erase" ? -1 : currentColor;
  draw();
}

canvas.addEventListener("mousedown", (event) => {
  isPainting = true;
  paintAtEvent(event);
});

canvas.addEventListener("mousemove", (event) => {
  if (!isPainting) {
    return;
  }
  paintAtEvent(event);
});

canvas.addEventListener("mouseup", () => {
  isPainting = false;
});

canvas.addEventListener("mouseleave", () => {
  isPainting = false;
});

eraserBtn.addEventListener("click", () => {
  if (mode === "erase") {
    mode = "paint";
    eraserBtn.classList.remove("is-active");
    eraserBtn.setAttribute("aria-pressed", "false");
  } else {
    mode = "erase";
    eraserBtn.classList.add("is-active");
    eraserBtn.setAttribute("aria-pressed", "true");
  }
});
