var CozyTextures = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var stdin_exports = {};
  __export(stdin_exports, {
    generateAllPixelTextures: () => generateAllPixelTextures,
    registerAstronautAnimations: () => registerAstronautAnimations
  });
  function createCanvas(scene, key, w, h) {
    const tex = scene.textures.createCanvas(key, w, h);
    if (!tex) {
      throw new Error(`Failed to create canvas texture: ${key}`);
    }
    const canvas = tex.getSourceImage();
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return {
      canvas,
      ctx,
      finish: () => tex.refresh()
    };
  }
  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }
  function drawAstronautFrame(ctx, ox, oy, dir, step) {
    const bob = step === 0 ? 0 : -1;
    const legL = step === 1 ? -1 : step === 2 ? 1 : 0;
    const legR = step === 1 ? 1 : step === 2 ? -1 : 0;
    px(ctx, ox + 9, oy + 27, 14, 3, "rgba(4, 6, 16, 0.55)");
    if (dir === "left") {
      px(ctx, ox + 19, oy + 14 + bob, 5, 9, "#475569");
      px(ctx, ox + 20, oy + 15 + bob, 3, 6, "#94a3b8");
      px(ctx, ox + 21, oy + 16 + bob, 2, 2, "#38bdf8");
    } else if (dir === "right") {
      px(ctx, ox + 8, oy + 14 + bob, 5, 9, "#475569");
      px(ctx, ox + 9, oy + 15 + bob, 3, 6, "#94a3b8");
      px(ctx, ox + 9, oy + 16 + bob, 2, 2, "#38bdf8");
    } else if (dir === "down") {
      px(ctx, ox + 9, oy + 14 + bob, 14, 8, "#64748b");
    }
    if (dir === "down" || dir === "up") {
      px(ctx, ox + 10, oy + 22 + legL, 5, 5, "#0f172a");
      px(ctx, ox + 11, oy + 22 + legL, 3, 3, "#cbd5e1");
      px(ctx, ox + 11, oy + 25 + legL, 3, 2, "#475569");
      px(ctx, ox + 17, oy + 22 + legR, 5, 5, "#0f172a");
      px(ctx, ox + 18, oy + 22 + legR, 3, 3, "#cbd5e1");
      px(ctx, ox + 18, oy + 25 + legR, 3, 2, "#475569");
    } else {
      px(ctx, ox + 12 + legL, oy + 22, 4, 5, "#0f172a");
      px(ctx, ox + 13 + legL, oy + 22, 3, 3, "#cbd5e1");
      px(ctx, ox + 16 + legR, oy + 22, 4, 5, "#0f172a");
      px(ctx, ox + 16 + legR, oy + 22, 3, 3, "#94a3b8");
    }
    px(ctx, ox + 9, oy + 14 + bob, 14, 9, "#0f172a");
    px(ctx, ox + 10, oy + 14 + bob, 12, 8, "#e2e8f0");
    px(ctx, ox + 11, oy + 15 + bob, 10, 6, "#f8fafc");
    px(ctx, ox + 10, oy + 19 + bob, 12, 2, "#f59e0b");
    if (dir === "down") {
      px(ctx, ox + 13, oy + 16 + bob, 6, 3, "#64748b");
      px(ctx, ox + 14, oy + 17 + bob, 2, 1, "#38bdf8");
      px(ctx, ox + 17, oy + 17 + bob, 1, 1, "#f59e0b");
    }
    if (dir === "down" || dir === "up") {
      px(ctx, ox + 7, oy + 15 + bob + (step === 1 ? 1 : 0), 3, 6, "#0f172a");
      px(ctx, ox + 8, oy + 15 + bob + (step === 1 ? 1 : 0), 2, 5, "#cbd5e1");
      px(ctx, ox + 22, oy + 15 + bob + (step === 2 ? 1 : 0), 3, 6, "#0f172a");
      px(ctx, ox + 22, oy + 15 + bob + (step === 2 ? 1 : 0), 2, 5, "#cbd5e1");
    } else {
      px(ctx, ox + 13, oy + 15 + bob + (step === 1 ? 1 : 0), 5, 5, "#cbd5e1");
      px(ctx, ox + 14, oy + 19 + bob + (step === 1 ? 1 : 0), 3, 2, "#f59e0b");
    }
    if (dir === "up") {
      px(ctx, ox + 10, oy + 13 + bob, 12, 9, "#334155");
      px(ctx, ox + 11, oy + 14 + bob, 10, 7, "#64748b");
      px(ctx, ox + 13, oy + 16 + bob, 6, 2, "#38bdf8");
    }
    px(ctx, ox + 8, oy + 3 + bob, 16, 12, "#0f172a");
    px(ctx, ox + 9, oy + 4 + bob, 14, 10, "#e2e8f0");
    px(ctx, ox + 10, oy + 4 + bob, 12, 9, "#f8fafc");
    px(ctx, ox + 21, oy + 1 + bob, 2, 3, "#94a3b8");
    px(ctx, ox + 21, oy + 1 + bob, 2, 1, "#38bdf8");
    if (dir === "down") {
      px(ctx, ox + 10, oy + 6 + bob, 12, 6, "#0c4a6e");
      px(ctx, ox + 11, oy + 7 + bob, 10, 4, "#0284c7");
      px(ctx, ox + 12, oy + 7 + bob, 8, 2, "#38bdf8");
      px(ctx, ox + 12, oy + 7 + bob, 3, 1, "#e0f2fe");
    } else if (dir === "left") {
      px(ctx, ox + 9, oy + 6 + bob, 8, 6, "#0c4a6e");
      px(ctx, ox + 9, oy + 7 + bob, 7, 4, "#0284c7");
      px(ctx, ox + 10, oy + 7 + bob, 5, 2, "#38bdf8");
      px(ctx, ox + 10, oy + 7 + bob, 2, 1, "#e0f2fe");
    } else if (dir === "right") {
      px(ctx, ox + 15, oy + 6 + bob, 8, 6, "#0c4a6e");
      px(ctx, ox + 16, oy + 7 + bob, 7, 4, "#0284c7");
      px(ctx, ox + 17, oy + 7 + bob, 5, 2, "#38bdf8");
      px(ctx, ox + 19, oy + 7 + bob, 2, 1, "#e0f2fe");
    } else {
      px(ctx, ox + 11, oy + 6 + bob, 10, 4, "#cbd5e1");
      px(ctx, ox + 14, oy + 7 + bob, 4, 2, "#f59e0b");
    }
  }
  function generateAllPixelTextures(scene) {
    if (scene.textures.exists("floor_deck")) return;
    if (!scene.textures.exists("astronaut")) {
      const tex = scene.textures.createCanvas("astronaut_raw", 192, 128);
      if (tex) {
        const canvas = tex.getSourceImage();
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        const dirs = ["down", "up", "left", "right"];
        dirs.forEach((dir, r) => {
          [0, 0, 0, 0, 1, 2].forEach((step, c) => {
            drawAstronautFrame(ctx, c * 32, r * 32, dir, step);
          });
        });
        tex.refresh();
        scene.textures.addSpriteSheet("astronaut", canvas, {
          frameWidth: 32,
          frameHeight: 32
        });
      }
    }
    const makeFloor = (key, base, panel, accent, stripe) => {
      const { ctx, finish } = createCanvas(scene, key, 32, 32);
      px(ctx, 0, 0, 32, 32, base);
      px(ctx, 1, 1, 30, 30, panel);
      px(ctx, 2, 2, 28, 1, accent);
      px(ctx, 2, 2, 1, 28, accent);
      px(ctx, 3, 3, 2, 2, base);
      px(ctx, 27, 3, 2, 2, base);
      px(ctx, 3, 27, 2, 2, base);
      px(ctx, 27, 27, 2, 2, base);
      if (stripe) {
        px(ctx, 0, 15, 32, 2, stripe);
      }
      finish();
    };
    makeFloor("floor_deck", "#0f152b", "#17203f", "#222f59");
    makeFloor("floor_bedroom", "#22173b", "#2c1f4d", "#3a2b63");
    makeFloor("floor_lab", "#0e1d36", "#14294a", "#1d3b69");
    makeFloor("floor_greenhouse", "#0f252b", "#16353b", "#1e4a4f", "#103133");
    makeFloor("floor_hangar", "#131828", "#1b2236", "#27314d");
    {
      const { ctx, finish } = createCanvas(scene, "floor_caution", 32, 32);
      px(ctx, 0, 0, 32, 32, "#171c2e");
      for (let i = -32; i < 48; i += 8) {
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.moveTo(i, 32);
        ctx.lineTo(i + 4, 32);
        ctx.lineTo(i + 16, 0);
        ctx.lineTo(i + 12, 0);
        ctx.closePath();
        ctx.fill();
      }
      px(ctx, 0, 0, 32, 2, "#0b0f1e");
      px(ctx, 0, 30, 32, 2, "#0b0f1e");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "wall_hull", 32, 32);
      px(ctx, 0, 0, 32, 32, "#090d1c");
      px(ctx, 0, 2, 32, 20, "#28335c");
      px(ctx, 2, 4, 28, 16, "#1f284a");
      px(ctx, 0, 2, 32, 2, "#43538c");
      px(ctx, 0, 22, 32, 10, "#141a33");
      px(ctx, 0, 22, 32, 2, "#38bdf8");
      px(ctx, 15, 4, 2, 16, "#141a33");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "wall_window_earth", 96, 48);
      px(ctx, 0, 0, 96, 48, "#0b1024");
      px(ctx, 2, 2, 92, 42, "#2d3a66");
      px(ctx, 4, 4, 88, 36, "#050814");
      const stars = [
        [10, 9],
        [22, 15],
        [15, 29],
        [35, 8],
        [48, 28],
        [60, 10],
        [75, 14],
        [83, 27],
        [68, 33],
        [30, 34],
        [52, 18],
        [86, 8]
      ];
      stars.forEach(([sx, sy], idx) => {
        px(ctx, sx, sy, idx % 3 === 0 ? 2 : 1, idx % 3 === 0 ? 2 : 1, idx % 2 === 0 ? "#e0f2fe" : "#a5b4fc");
      });
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(34, 22, 11, 0, Math.PI * 2);
      ctx.fill();
      px(ctx, 28, 17, 6, 4, "#22c55e");
      px(ctx, 35, 22, 5, 5, "#16a34a");
      px(ctx, 26, 13, 8, 2, "#e0f2fe");
      px(ctx, 33, 28, 6, 2, "#f8fafc");
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(34, 22, 11.5, -2.5, -0.3);
      ctx.stroke();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(70, 18, 5, 0, Math.PI * 2);
      ctx.fill();
      px(ctx, 68, 16, 2, 2, "#94a3b8");
      px(ctx, 71, 19, 2, 1, "#94a3b8");
      px(ctx, 47, 4, 2, 36, "#2d3a66");
      px(ctx, 2, 40, 92, 5, "#3b4b82");
      px(ctx, 4, 41, 88, 2, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "wall_window_stars", 64, 48);
      px(ctx, 0, 0, 64, 48, "#0b1024");
      px(ctx, 2, 2, 60, 42, "#2d3a66");
      px(ctx, 4, 4, 56, 36, "#050814");
      const stars = [
        [10, 10],
        [20, 22],
        [32, 9],
        [46, 16],
        [52, 28],
        [16, 33],
        [38, 30],
        [28, 18]
      ];
      stars.forEach(([sx, sy], idx) => {
        px(ctx, sx, sy, idx % 2 === 0 ? 2 : 1, idx % 2 === 0 ? 2 : 1, idx % 3 === 0 ? "#fde68a" : "#bae6fd");
      });
      px(ctx, 8, 20, 18, 3, "rgba(139, 92, 246, 0.25)");
      px(ctx, 24, 16, 22, 4, "rgba(56, 189, 248, 0.18)");
      px(ctx, 2, 40, 60, 5, "#3b4b82");
      px(ctx, 4, 41, 56, 2, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "door_airlock", 64, 48);
      px(ctx, 0, 0, 64, 48, "#0b1020");
      px(ctx, 2, 2, 60, 44, "#334155");
      px(ctx, 8, 6, 48, 38, "#1e293b");
      px(ctx, 10, 8, 21, 34, "#475569");
      px(ctx, 33, 8, 21, 34, "#475569");
      px(ctx, 31, 8, 2, 34, "#0f172a");
      px(ctx, 16, 14, 9, 10, "#0c4a6e");
      px(ctx, 18, 16, 5, 6, "#38bdf8");
      px(ctx, 39, 14, 9, 10, "#0c4a6e");
      px(ctx, 41, 16, 5, 6, "#38bdf8");
      px(ctx, 26, 3, 12, 3, "#f59e0b");
      px(ctx, 12, 36, 16, 4, "#f59e0b");
      px(ctx, 36, 36, 16, 4, "#f59e0b");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_bed", 48, 64);
      px(ctx, 4, 4, 40, 56, "#0b1020");
      px(ctx, 6, 6, 36, 52, "#3b4875");
      px(ctx, 8, 8, 32, 48, "#1e2747");
      px(ctx, 11, 11, 26, 11, "#f1f5f9");
      px(ctx, 13, 13, 22, 7, "#e2e8f0");
      px(ctx, 9, 24, 30, 30, "#b45309");
      px(ctx, 10, 25, 28, 27, "#d97706");
      px(ctx, 10, 25, 28, 4, "#f59e0b");
      px(ctx, 11, 34, 26, 2, "#92400e");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_desk", 48, 32);
      px(ctx, 2, 4, 44, 24, "#0b1020");
      px(ctx, 4, 6, 40, 20, "#334155");
      px(ctx, 6, 8, 36, 14, "#475569");
      px(ctx, 8, 10, 8, 8, "#f59e0b");
      px(ctx, 10, 12, 4, 4, "#fef3c7");
      px(ctx, 24, 11, 12, 8, "#0f172a");
      px(ctx, 25, 12, 10, 6, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_command_console", 96, 48);
      px(ctx, 4, 10, 88, 34, "#090d1c");
      px(ctx, 6, 12, 84, 30, "#1e294b");
      px(ctx, 8, 14, 80, 18, "#2d3b69");
      px(ctx, 12, 8, 22, 14, "#0c4a6e");
      px(ctx, 14, 10, 18, 10, "#0284c7");
      px(ctx, 16, 12, 10, 2, "#7dd3fc");
      px(ctx, 16, 16, 14, 2, "#38bdf8");
      px(ctx, 37, 4, 22, 18, "#082f49");
      px(ctx, 39, 6, 18, 14, "#0369a1");
      px(ctx, 44, 9, 8, 8, "#38bdf8");
      px(ctx, 46, 11, 4, 4, "#e0f2fe");
      px(ctx, 62, 8, 22, 14, "#0c4a6e");
      px(ctx, 64, 10, 18, 10, "#0284c7");
      px(ctx, 66, 12, 6, 5, "#f59e0b");
      px(ctx, 74, 14, 6, 2, "#38bdf8");
      px(ctx, 14, 26, 68, 6, "#0f172a");
      px(ctx, 16, 28, 6, 2, "#38bdf8");
      px(ctx, 25, 28, 6, 2, "#f59e0b");
      px(ctx, 34, 28, 12, 2, "#10b981");
      px(ctx, 50, 28, 8, 2, "#38bdf8");
      px(ctx, 62, 28, 16, 2, "#a78bfa");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_lab_bench", 64, 48);
      px(ctx, 2, 10, 60, 34, "#0b1020");
      px(ctx, 4, 12, 56, 30, "#1e293b");
      px(ctx, 6, 14, 52, 18, "#334155");
      px(ctx, 12, 6, 12, 14, "#0f172a");
      px(ctx, 14, 8, 8, 10, "#94a3b8");
      px(ctx, 16, 10, 4, 4, "#38bdf8");
      px(ctx, 32, 10, 4, 10, "#38bdf8");
      px(ctx, 38, 10, 4, 10, "#a78bfa");
      px(ctx, 44, 10, 4, 10, "#10b981");
      px(ctx, 10, 24, 44, 6, "#082f49");
      px(ctx, 12, 26, 18, 2, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_cryo_pod", 32, 48);
      px(ctx, 4, 4, 24, 40, "#0b1020");
      px(ctx, 6, 6, 20, 36, "#334155");
      px(ctx, 9, 10, 14, 22, "#082f49");
      px(ctx, 11, 12, 10, 18, "#0284c7");
      px(ctx, 13, 14, 3, 12, "#7dd3fc");
      px(ctx, 8, 35, 16, 4, "#1e293b");
      px(ctx, 10, 36, 4, 2, "#10b981");
      px(ctx, 18, 36, 4, 2, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_planter", 64, 48);
      px(ctx, 2, 10, 60, 34, "#0b1020");
      px(ctx, 4, 14, 56, 28, "#1e293b");
      px(ctx, 6, 16, 52, 18, "#3f2e26");
      const spots = [10, 20, 30, 40, 50];
      spots.forEach((sx, i) => {
        px(ctx, sx, 13 - i % 2 * 2, 6, 8, "#15803d");
        px(ctx, sx + 1, 11 - i % 2 * 2, 4, 6, "#22c55e");
        px(ctx, sx + 2, 10 - i % 2 * 2, 2, 2, "#86efac");
      });
      px(ctx, 6, 4, 52, 4, "#312e81");
      px(ctx, 8, 5, 48, 2, "#a855f7");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_water_dispenser", 32, 48);
      px(ctx, 4, 4, 24, 40, "#0b1020");
      px(ctx, 6, 6, 20, 36, "#334155");
      px(ctx, 9, 9, 14, 16, "#0369a1");
      px(ctx, 11, 11, 10, 12, "#38bdf8");
      px(ctx, 12, 12, 3, 8, "#bae6fd");
      px(ctx, 11, 28, 10, 8, "#0f172a");
      px(ctx, 14, 30, 4, 4, "#7dd3fc");
      px(ctx, 8, 38, 16, 2, "#10b981");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_plant_pot", 24, 32);
      px(ctx, 6, 18, 12, 10, "#0b1020");
      px(ctx, 7, 19, 10, 8, "#b45309");
      px(ctx, 6, 17, 12, 3, "#d97706");
      px(ctx, 5, 8, 14, 10, "#166534");
      px(ctx, 7, 6, 10, 10, "#22c55e");
      px(ctx, 9, 4, 6, 6, "#4ade80");
      finish();
    }
    if (!scene.textures.exists("prop_rover")) {
      const { ctx, finish } = createCanvas(scene, "prop_rover", 96, 64);
      px(ctx, 10, 52, 76, 8, "rgba(4,6,18,0.55)");
      [14, 42, 70].forEach((wx) => {
        px(ctx, wx, 10, 12, 10, "#0f172a");
        px(ctx, wx + 2, 12, 8, 6, "#475569");
        px(ctx, wx, 44, 12, 10, "#0f172a");
        px(ctx, wx + 2, 46, 8, 6, "#475569");
      });
      px(ctx, 12, 16, 72, 32, "#0f172a");
      px(ctx, 14, 18, 68, 28, "#cbd5e1");
      px(ctx, 16, 20, 64, 24, "#e2e8f0");
      px(ctx, 18, 22, 26, 20, "#1e3a8a");
      px(ctx, 20, 24, 22, 16, "#1d4ed8");
      px(ctx, 20, 31, 22, 2, "#60a5fa");
      px(ctx, 30, 24, 2, 16, "#60a5fa");
      px(ctx, 48, 21, 28, 22, "#94a3b8");
      px(ctx, 58, 23, 14, 18, "#0c4a6e");
      px(ctx, 60, 25, 10, 14, "#38bdf8");
      px(ctx, 80, 22, 3, 5, "#fbbf24");
      px(ctx, 80, 37, 3, 5, "#fbbf24");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_locker", 32, 48);
      px(ctx, 3, 4, 26, 40, "#0b1020");
      px(ctx, 5, 6, 22, 36, "#334155");
      px(ctx, 7, 8, 8, 32, "#475569");
      px(ctx, 17, 8, 8, 32, "#475569");
      px(ctx, 9, 12, 4, 2, "#0f172a");
      px(ctx, 19, 12, 4, 2, "#0f172a");
      px(ctx, 13, 22, 2, 4, "#f59e0b");
      px(ctx, 17, 22, 2, 4, "#f59e0b");
      finish();
    }
    const makeGlow = (key, rgbaInner, rgbaOuter) => {
      const { ctx, finish } = createCanvas(scene, key, 128, 128);
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0, rgbaInner);
      grad.addColorStop(1, rgbaOuter);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      finish();
    };
    makeGlow("glow_amber", "rgba(245, 158, 11, 0.28)", "rgba(245, 158, 11, 0)");
    makeGlow("glow_cyan", "rgba(56, 189, 248, 0.24)", "rgba(56, 189, 248, 0)");
    makeGlow("glow_violet", "rgba(168, 85, 247, 0.22)", "rgba(168, 85, 247, 0)");
    {
      const { ctx, finish } = createCanvas(scene, "lunar_ground", 32, 32);
      px(ctx, 0, 0, 32, 32, "#222842");
      px(ctx, 3, 5, 4, 3, "#2c3454");
      px(ctx, 18, 11, 6, 4, "#1b2036");
      px(ctx, 10, 23, 5, 3, "#2c3454");
      px(ctx, 25, 24, 3, 2, "#171c30");
      px(ctx, 13, 4, 2, 2, "#3a456e");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_crater_floor", 32, 32);
      px(ctx, 0, 0, 32, 32, "#171c31");
      px(ctx, 4, 8, 7, 4, "#1e2540");
      px(ctx, 19, 17, 6, 4, "#121626");
      px(ctx, 9, 25, 4, 2, "#242c4d");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_tracks", 32, 32);
      px(ctx, 6, 0, 4, 32, "rgba(12, 16, 30, 0.45)");
      px(ctx, 22, 0, 4, 32, "rgba(12, 16, 30, 0.45)");
      for (let y = 2; y < 32; y += 6) {
        px(ctx, 6, y, 4, 2, "#2f385c");
        px(ctx, 22, y, 4, 2, "#2f385c");
      }
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_rock_lg", 48, 48);
      px(ctx, 6, 34, 36, 10, "rgba(5, 8, 20, 0.6)");
      px(ctx, 8, 14, 32, 24, "#0f1426");
      px(ctx, 10, 12, 28, 24, "#333d63");
      px(ctx, 12, 12, 20, 10, "#4c598a");
      px(ctx, 14, 14, 12, 4, "#6b7ab5");
      px(ctx, 22, 24, 12, 10, "#232a47");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_rock_sm", 32, 32);
      px(ctx, 4, 22, 24, 6, "rgba(5, 8, 20, 0.5)");
      px(ctx, 6, 10, 20, 16, "#14192e");
      px(ctx, 8, 11, 16, 13, "#39446e");
      px(ctx, 10, 11, 10, 5, "#58679e");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_ice_deposit", 64, 48);
      px(ctx, 6, 20, 52, 22, "rgba(14, 165, 233, 0.2)");
      px(ctx, 10, 24, 44, 14, "#0c4a6e");
      px(ctx, 16, 14, 10, 20, "#0284c7");
      px(ctx, 18, 12, 6, 18, "#38bdf8");
      px(ctx, 20, 14, 2, 10, "#e0f2fe");
      px(ctx, 28, 6, 12, 28, "#0369a1");
      px(ctx, 30, 8, 8, 24, "#38bdf8");
      px(ctx, 32, 10, 3, 14, "#e0f2fe");
      px(ctx, 41, 16, 9, 18, "#0284c7");
      px(ctx, 43, 18, 5, 14, "#7dd3fc");
      px(ctx, 45, 19, 2, 8, "#f0f9ff");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_airlock_ext", 96, 80);
      px(ctx, 6, 10, 84, 62, "#0b1020");
      px(ctx, 8, 12, 80, 58, "#334155");
      px(ctx, 12, 16, 72, 34, "#475569");
      px(ctx, 16, 20, 64, 26, "#1e293b");
      px(ctx, 20, 24, 18, 10, "#0284c7");
      px(ctx, 22, 26, 14, 6, "#7dd3fc");
      px(ctx, 58, 24, 18, 10, "#0284c7");
      px(ctx, 60, 26, 14, 6, "#7dd3fc");
      px(ctx, 34, 42, 28, 28, "#1e293b");
      px(ctx, 36, 44, 11, 24, "#64748b");
      px(ctx, 49, 44, 11, 24, "#64748b");
      px(ctx, 44, 8, 8, 6, "#f59e0b");
      px(ctx, 46, 10, 4, 2, "#fef3c7");
      px(ctx, 32, 70, 32, 8, "#475569");
      px(ctx, 34, 72, 28, 2, "#f59e0b");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "earth_sky", 64, 64);
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(32, 32, 24, 0, Math.PI * 2);
      ctx.fill();
      px(ctx, 20, 20, 14, 9, "#22c55e");
      px(ctx, 36, 30, 12, 12, "#16a34a");
      px(ctx, 16, 14, 18, 3, "#f8fafc");
      px(ctx, 30, 44, 14, 3, "#e0f2fe");
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 32, 25, -2.6, -0.3);
      ctx.stroke();
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prompt_e", 26, 22);
      px(ctx, 0, 0, 26, 22, "#090d1c");
      px(ctx, 2, 2, 22, 18, "#38bdf8");
      px(ctx, 4, 4, 18, 14, "#0f172a");
      px(ctx, 9, 6, 8, 2, "#f8fafc");
      px(ctx, 9, 6, 2, 10, "#f8fafc");
      px(ctx, 9, 10, 6, 2, "#f8fafc");
      px(ctx, 9, 14, 8, 2, "#f8fafc");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "hazard_telegraph_ring", 112, 112);
      const cx = 56;
      const cy = 56;
      const r = 50;
      for (let i = 0; i < 36; i++) {
        if (i % 2 === 1) continue;
        const a = i / 36 * Math.PI * 2;
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        px(ctx, x - 2, y - 2, 4, 4, "#f59e0b");
        px(ctx, x - 1, y - 1, 2, 2, "#fef3c7");
      }
      ctx.fillStyle = "rgba(245, 158, 11, 0.10)";
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.fill();
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "hazard_dust_cloud", 112, 112);
      const cx = 56;
      const cy = 56;
      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 54);
      grad.addColorStop(0, "rgba(217, 119, 6, 0.42)");
      grad.addColorStop(0.55, "rgba(148, 163, 184, 0.34)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 112, 112);
      for (let arm = 0; arm < 3; arm++) {
        const baseAngle = arm / 3 * Math.PI * 2;
        for (let t = 0; t < 24; t++) {
          const radius = 10 + t * 1.75;
          const angle = baseAngle + t * 0.24;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const sz = t % 3 === 0 ? 4 : 3;
          const col = t % 4 === 0 ? "#fbbf24" : t % 2 === 0 ? "#cbd5e1" : "#94a3b8";
          px(ctx, x - sz / 2, y - sz / 2, sz, sz, col);
        }
      }
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "hazard_tremor_cracks", 104, 104);
      const cx = 52;
      const cy = 52;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(239, 68, 68, 0.14)";
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.fill();
      const branches = [0.2, 1.3, 2.5, 3.6, 4.9, 5.7];
      branches.forEach((angle, idx) => {
        let x = cx;
        let y = cy;
        for (let step = 0; step < 9; step++) {
          const jitter = (step % 2 === 0 ? 1 : -1) * 0.28;
          x += Math.cos(angle + jitter) * 4.5;
          y += Math.sin(angle + jitter) * 4.5;
          px(ctx, x - 2, y - 2, 4, 4, "#090d1c");
          px(ctx, x - 1, y - 1, 2, 2, step < 5 ? "#f97316" : "#ef4444");
        }
        if (idx % 2 === 0) {
          px(ctx, cx - 3, cy - 3, 6, 6, "#fbbf24");
        }
      });
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "hazard_particle", 6, 6);
      px(ctx, 1, 1, 4, 4, "#fde68a");
      px(ctx, 2, 2, 2, 2, "#f59e0b");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "npc_bot", 32, 32);
      px(ctx, 9, 26, 14, 3, "rgba(4, 6, 16, 0.5)");
      px(ctx, 15, 2, 2, 4, "#38bdf8");
      px(ctx, 14, 1, 4, 2, "#bae6fd");
      px(ctx, 8, 6, 16, 17, "#0f172a");
      px(ctx, 9, 7, 14, 15, "#1d4ed8");
      px(ctx, 10, 8, 12, 12, "#3b82f6");
      px(ctx, 10, 10, 12, 7, "#090d1c");
      px(ctx, 12, 12, 2, 3, "#38bdf8");
      px(ctx, 18, 12, 2, 3, "#38bdf8");
      px(ctx, 14, 15, 4, 1, "#7dd3fc");
      px(ctx, 11, 23, 10, 3, "#475569");
      px(ctx, 13, 25, 6, 2, "#38bdf8");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "npc_lyra", 32, 32);
      px(ctx, 9, 27, 14, 3, "rgba(4, 6, 16, 0.55)");
      px(ctx, 9, 4, 14, 11, "#0f172a");
      px(ctx, 10, 5, 12, 5, "#7c3aed");
      px(ctx, 10, 9, 12, 6, "#fed7aa");
      px(ctx, 11, 10, 4, 3, "#0284c7");
      px(ctx, 17, 10, 4, 3, "#0284c7");
      px(ctx, 15, 11, 2, 1, "#0f172a");
      px(ctx, 12, 11, 1, 1, "#e0f2fe");
      px(ctx, 18, 11, 1, 1, "#e0f2fe");
      px(ctx, 9, 15, 14, 10, "#0f172a");
      px(ctx, 10, 15, 12, 9, "#f1f5f9");
      px(ctx, 14, 16, 4, 8, "#38bdf8");
      px(ctx, 11, 24, 4, 4, "#334155");
      px(ctx, 17, 24, 4, 4, "#334155");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "npc_kaia", 32, 32);
      px(ctx, 9, 27, 14, 3, "rgba(4, 6, 16, 0.55)");
      px(ctx, 15, 1, 2, 3, "#22c55e");
      px(ctx, 13, 2, 3, 2, "#4ade80");
      px(ctx, 9, 4, 14, 11, "#0f172a");
      px(ctx, 10, 5, 12, 4, "#15803d");
      px(ctx, 10, 9, 12, 6, "#fde68a");
      px(ctx, 12, 11, 2, 2, "#0f172a");
      px(ctx, 18, 11, 2, 2, "#0f172a");
      px(ctx, 9, 15, 14, 10, "#0f172a");
      px(ctx, 10, 15, 12, 9, "#10b981");
      px(ctx, 12, 17, 8, 5, "#4c1d95");
      px(ctx, 11, 24, 4, 4, "#475569");
      px(ctx, 17, 24, 4, 4, "#475569");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "npc_rex", 32, 32);
      px(ctx, 9, 27, 14, 3, "rgba(4, 6, 16, 0.55)");
      px(ctx, 8, 3, 16, 7, "#0f172a");
      px(ctx, 9, 4, 14, 5, "#f59e0b");
      px(ctx, 11, 5, 10, 2, "#fde68a");
      px(ctx, 10, 9, 12, 6, "#fdba74");
      px(ctx, 12, 11, 2, 2, "#0f172a");
      px(ctx, 18, 11, 2, 2, "#0f172a");
      px(ctx, 8, 15, 16, 10, "#0f172a");
      px(ctx, 9, 15, 14, 9, "#334155");
      px(ctx, 11, 16, 10, 6, "#d97706");
      px(ctx, 23, 14, 3, 9, "#94a3b8");
      px(ctx, 22, 13, 5, 3, "#cbd5e1");
      px(ctx, 11, 24, 4, 4, "#1e293b");
      px(ctx, 17, 24, 4, 4, "#1e293b");
      finish();
    }
    if (!scene.textures.exists("rover_driver")) {
      const tex = scene.textures.createCanvas("rover_driver_raw", 96, 192);
      if (tex) {
        const canvas = tex.getSourceImage();
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        const dirs = ["down", "up", "left", "right"];
        dirs.forEach((dir, r) => {
          for (let c = 0; c < 2; c++) {
            const ox = c * 48;
            const oy = r * 48;
            const bounce = c === 1 ? -1 : 0;
            px(ctx, ox + 7, oy + 38, 34, 6, "rgba(4, 6, 18, 0.55)");
            if (dir === "left" || dir === "right") {
              [9, 21, 33].forEach((wx) => {
                px(ctx, ox + wx, oy + 31, 8, 9, "#0f172a");
                px(ctx, ox + wx + 1, oy + 32, 6, 7, "#475569");
                px(ctx, ox + wx + 3, oy + 34 + (c === 1 ? 1 : 0), 2, 2, "#94a3b8");
              });
              px(ctx, ox + 6, oy + 18 + bounce, 36, 15, "#0f172a");
              px(ctx, ox + 8, oy + 19 + bounce, 32, 13, "#e2e8f0");
              px(ctx, ox + 10, oy + 25 + bounce, 28, 3, "#f59e0b");
              const cabX = dir === "right" ? ox + 22 : ox + 10;
              px(ctx, cabX, oy + 10 + bounce, 16, 11, "#0c4a6e");
              px(ctx, cabX + 2, oy + 12 + bounce, 12, 8, "#38bdf8");
              px(ctx, cabX + 5, oy + 13 + bounce, 6, 6, "#f8fafc");
              px(ctx, dir === "right" ? ox + 40 : ox + 6, oy + 21 + bounce, 3, 4, "#fef08a");
            } else {
              px(ctx, ox + 8, oy + 12, 6, 10, "#0f172a");
              px(ctx, ox + 34, oy + 12, 6, 10, "#0f172a");
              px(ctx, ox + 8, oy + 26, 6, 10, "#0f172a");
              px(ctx, ox + 34, oy + 26, 6, 10, "#0f172a");
              px(ctx, ox + 12, oy + 10 + bounce, 24, 30, "#0f172a");
              px(ctx, ox + 13, oy + 11 + bounce, 22, 28, "#e2e8f0");
              px(ctx, ox + 15, oy + 13 + bounce, 18, 12, "#1d4ed8");
              px(ctx, ox + 16, oy + 24 + bounce, 16, 10, "#0c4a6e");
              px(ctx, ox + 18, oy + 25 + bounce, 12, 7, "#38bdf8");
              px(ctx, ox + 21, oy + 25 + bounce, 6, 6, "#f8fafc");
              if (dir === "down") {
                px(ctx, ox + 15, oy + 36 + bounce, 4, 3, "#fef08a");
                px(ctx, ox + 29, oy + 36 + bounce, 4, 3, "#fef08a");
              } else {
                px(ctx, ox + 15, oy + 11 + bounce, 4, 3, "#ef4444");
                px(ctx, ox + 29, oy + 11 + bounce, 4, 3, "#ef4444");
              }
            }
          }
        });
        tex.refresh();
        scene.textures.addSpriteSheet("rover_driver", canvas, {
          frameWidth: 48,
          frameHeight: 48
        });
      }
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_workbench", 48, 36);
      px(ctx, 2, 6, 44, 26, "#0b1020");
      px(ctx, 4, 8, 40, 22, "#334155");
      px(ctx, 6, 10, 36, 12, "#475569");
      px(ctx, 9, 12, 12, 7, "#0284c7");
      px(ctx, 11, 14, 8, 3, "#7dd3fc");
      px(ctx, 25, 13, 12, 3, "#f59e0b");
      px(ctx, 27, 17, 6, 3, "#cbd5e1");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_planter_seedling", 64, 48);
      px(ctx, 2, 10, 60, 34, "#0b1020");
      px(ctx, 4, 14, 56, 28, "#1e293b");
      px(ctx, 6, 16, 52, 18, "#3f2e26");
      [12, 24, 36, 48].forEach((sx) => {
        px(ctx, sx, 16, 3, 4, "#4ade80");
        px(ctx, sx + 2, 15, 2, 2, "#86efac");
      });
      px(ctx, 6, 4, 52, 4, "#312e81");
      px(ctx, 8, 5, 48, 2, "#a855f7");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "prop_planter_ripe", 64, 48);
      px(ctx, 2, 10, 60, 34, "#0b1020");
      px(ctx, 4, 14, 56, 28, "#1e293b");
      px(ctx, 6, 16, 52, 18, "#3f2e26");
      [10, 20, 30, 40, 50].forEach((sx, i) => {
        px(ctx, sx, 11 - i % 2 * 2, 7, 10, "#15803d");
        px(ctx, sx + 1, 9 - i % 2 * 2, 5, 7, "#22c55e");
        px(ctx, sx + 2, 11 - i % 2 * 2, 3, 3, "#fbbf24");
      });
      px(ctx, 6, 4, 52, 4, "#312e81");
      px(ctx, 8, 5, 48, 2, "#c084fc");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_ore_node", 36, 32);
      px(ctx, 4, 22, 28, 7, "rgba(4, 6, 18, 0.55)");
      px(ctx, 6, 10, 24, 16, "#0f1426");
      px(ctx, 8, 11, 20, 13, "#475569");
      px(ctx, 10, 12, 14, 6, "#64748b");
      px(ctx, 11, 14, 4, 4, "#f59e0b");
      px(ctx, 19, 16, 5, 4, "#fbbf24");
      px(ctx, 15, 11, 3, 3, "#fef3c7");
      finish();
    }
    if (!scene.textures.exists("lunar_ice_node")) {
      const { ctx, finish } = createCanvas(scene, "lunar_ice_node", 36, 32);
      px(ctx, 4, 22, 28, 7, "rgba(4, 6, 18, 0.55)");
      px(ctx, 10, 8, 6, 16, "#0284c7");
      px(ctx, 12, 9, 3, 13, "#7dd3fc");
      px(ctx, 18, 6, 7, 18, "#0369a1");
      px(ctx, 20, 8, 4, 14, "#38bdf8");
      px(ctx, 21, 9, 2, 7, "#f0f9ff");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "lunar_beacon", 48, 64);
      px(ctx, 10, 50, 28, 8, "rgba(4, 6, 18, 0.6)");
      px(ctx, 12, 42, 24, 12, "#0f172a");
      px(ctx, 14, 44, 20, 8, "#334155");
      px(ctx, 20, 16, 8, 28, "#1e293b");
      px(ctx, 22, 18, 4, 24, "#94a3b8");
      px(ctx, 12, 10, 24, 8, "#475569");
      px(ctx, 16, 12, 16, 4, "#38bdf8");
      px(ctx, 21, 4, 6, 6, "#38bdf8");
      px(ctx, 22, 5, 4, 4, "#e0f2fe");
      px(ctx, 18, 46, 12, 3, "#f59e0b");
      finish();
    }
    {
      const { ctx, finish } = createCanvas(scene, "night_light_mask", 256, 256);
      const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.55, "rgba(255, 255, 255, 0.85)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      finish();
    }
  }
  function registerAstronautAnimations(scene) {
    if (!scene.anims.exists("astro-walk-down")) {
      const tex = scene.textures.get("astronaut");
      const total = tex ? tex.frameTotal : 13;
      const cols = total > 26 ? 7 : total > 13 ? 6 : 3;
      ["down", "up", "left", "right"].forEach((dir, r) => {
        const rowBase = r * cols;
        if (cols === 7) {
          scene.anims.create({
            key: `astro-idle-${dir}`,
            frames: [
              { key: "astronaut", frame: rowBase + 0 },
              { key: "astronaut", frame: rowBase + 1 },
              { key: "astronaut", frame: rowBase + 2 },
              { key: "astronaut", frame: rowBase + 1 }
            ],
            frameRate: 4.5,
            repeat: -1
          });
          scene.anims.create({
            key: `astro-walk-${dir}`,
            frames: [
              { key: "astronaut", frame: rowBase + 3 },
              { key: "astronaut", frame: rowBase + 4 },
              { key: "astronaut", frame: rowBase + 5 },
              { key: "astronaut", frame: rowBase + 6 }
            ],
            frameRate: 10,
            repeat: -1
          });
        } else if (cols === 6) {
          scene.anims.create({
            key: `astro-idle-${dir}`,
            frames: [
              { key: "astronaut", frame: rowBase + 0 },
              { key: "astronaut", frame: rowBase + 1 },
              { key: "astronaut", frame: rowBase + 2 },
              { key: "astronaut", frame: rowBase + 1 }
            ],
            frameRate: 4,
            repeat: -1
          });
          scene.anims.create({
            key: `astro-walk-${dir}`,
            frames: [
              { key: "astronaut", frame: rowBase + 4 },
              { key: "astronaut", frame: rowBase + 3 },
              { key: "astronaut", frame: rowBase + 5 },
              { key: "astronaut", frame: rowBase + 3 }
            ],
            frameRate: 9,
            repeat: -1
          });
        } else {
          scene.anims.create({
            key: `astro-idle-${dir}`,
            frames: [{ key: "astronaut", frame: rowBase }],
            frameRate: 1
          });
          scene.anims.create({
            key: `astro-walk-${dir}`,
            frames: [
              { key: "astronaut", frame: rowBase + 1 },
              { key: "astronaut", frame: rowBase },
              { key: "astronaut", frame: rowBase + 2 },
              { key: "astronaut", frame: rowBase }
            ],
            frameRate: 9,
            repeat: -1
          });
        }
      });
    }
    const npcIds = ["robot", "alien", "asteroid", "cloud", "rover", "battery", "crystal", "sprout", "drone"];
    npcIds.forEach((id) => {
      const key = `npc_${id}`;
      if (!scene.textures.exists(key) || scene.anims.exists(`npc-idle-${id}`)) return;
      scene.anims.create({
        key: `npc-idle-${id}`,
        frames: [
          { key, frame: 0 },
          { key, frame: 1 },
          { key, frame: 2 },
          { key, frame: 1 }
        ],
        frameRate: 4,
        repeat: -1
      });
      scene.anims.create({
        key: `npc-walk-${id}`,
        frames: [
          { key, frame: 3 },
          { key, frame: 4 },
          { key, frame: 5 },
          { key, frame: 6 }
        ],
        frameRate: 9,
        repeat: -1
      });
    });
    if (!scene.anims.exists("rover-drive-down")) {
      ["down", "up", "left", "right"].forEach((dir, r) => {
        scene.anims.create({
          key: `rover-idle-${dir}`,
          frames: [{ key: "rover_driver", frame: r * 2 }],
          frameRate: 1
        });
        scene.anims.create({
          key: `rover-drive-${dir}`,
          frames: [
            { key: "rover_driver", frame: r * 2 },
            { key: "rover_driver", frame: r * 2 + 1 }
          ],
          frameRate: 8,
          repeat: -1
        });
      });
    }
  }
  return __toCommonJS(stdin_exports);
})();
