const loader = document.querySelector(".loader");
const cursorLight = document.querySelector(".cursor-light");
const canvas = document.getElementById("neural-canvas");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let pointer = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.34 };
let nodes = [];

function splitTitle() {
  const target = document.querySelector("[data-split]");
  if (!target) return;
  const lines = target.querySelectorAll("[data-split-line]");
  let index = 0;
  lines.forEach((line) => {
    const text = line.textContent.trim();
    line.textContent = "";
    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", index);
      span.textContent = char === " " ? "\u00a0" : char;
      line.appendChild(span);
      index += 1;
    });
  });
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(46, Math.max(22, Math.floor(width / 42)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 0.8 + 0.2,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);
  const scroll = window.scrollY * 0.04;
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "rgba(255,255,255,0.98)");
  bg.addColorStop(0.58, "rgba(248,250,253,0.94)");
  bg.addColorStop(1, "rgba(236,241,248,0.9)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  nodes.forEach((node) => {
    const dx = pointer.x - node.x;
    const dy = pointer.y - node.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 150) {
      node.x -= dx * 0.00045;
      node.y -= dy * 0.00045;
    }
    node.x += node.vx * node.z;
    node.y += node.vy * node.z + Math.sin((Date.now() * 0.0005) + node.x) * 0.05;
    if (node.x < -40) node.x = width + 40;
    if (node.x > width + 40) node.x = -40;
    if (node.y < -40) node.y = height + 40;
    if (node.y > height + 40) node.y = -40;
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 105) {
        ctx.strokeStyle = `rgba(20, 60, 115, ${0.045 * (1 - distance / 105)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y + scroll);
        ctx.lineTo(b.x, b.y + scroll);
        ctx.stroke();
      }
    }
  }

  nodes.forEach((node, index) => {
    const orange = index % 11 === 0;
    ctx.fillStyle = orange ? "rgba(255, 101, 51, 0.24)" : "rgba(20, 60, 115, 0.16)";
    ctx.beginPath();
    ctx.arc(node.x, node.y + scroll, orange ? 1.8 : 1.2, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawNetwork);
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function attachTilt() {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${y * -5}deg`);
      card.style.setProperty("--tilt-y", `${x * 7}deg`);
      card.style.setProperty("--lift-y", "-3px");
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--lift-y", "0px");
    });
  });
}

function updateParallax() {
  const center = window.innerHeight * 0.5;
  document.querySelectorAll("[data-scroll-speed]").forEach((element) => {
    const speed = Number(element.dataset.scrollSpeed || 0);
    const rect = element.getBoundingClientRect();
    const elementCenter = rect.top + rect.height * 0.5;
    const offset = (center - elementCenter) * speed;
    const clamped = Math.max(-82, Math.min(82, offset));
    element.style.setProperty("--float-y", `${clamped.toFixed(2)}px`);
  });
  requestAnimationFrame(updateParallax);
}

window.addEventListener("mousemove", (event) => {
  pointer = { x: event.clientX, y: event.clientY };
  if (cursorLight) {
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
  }
});

window.addEventListener("resize", resizeCanvas);

window.addEventListener("load", () => {
  setTimeout(() => loader?.classList.add("is-hidden"), 760);
});

splitTitle();
resizeCanvas();
drawNetwork();
revealOnScroll();
attachTilt();
updateParallax();
