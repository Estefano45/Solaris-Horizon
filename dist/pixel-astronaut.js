// Adapted from teammate PixelArtGenerator.ts.
function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}
function drawAstronautFrame(ctx, ox, oy, dir, step, color = "#f59e0b") {
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
  px(ctx, ox + 10, oy + 19 + bob, 12, 2, color);
  if (dir === "down") {
    px(ctx, ox + 13, oy + 16 + bob, 6, 3, "#64748b");
    px(ctx, ox + 14, oy + 17 + bob, 2, 1, "#38bdf8");
    px(ctx, ox + 17, oy + 17 + bob, 1, 1, color);
  }
  if (dir === "down" || dir === "up") {
    px(ctx, ox + 7, oy + 15 + bob + (step === 1 ? 1 : 0), 3, 6, "#0f172a");
    px(ctx, ox + 8, oy + 15 + bob + (step === 1 ? 1 : 0), 2, 5, "#cbd5e1");
    px(ctx, ox + 22, oy + 15 + bob + (step === 2 ? 1 : 0), 3, 6, "#0f172a");
    px(ctx, ox + 22, oy + 15 + bob + (step === 2 ? 1 : 0), 2, 5, "#cbd5e1");
  } else {
    px(ctx, ox + 13, oy + 15 + bob + (step === 1 ? 1 : 0), 5, 5, "#cbd5e1");
    px(ctx, ox + 14, oy + 19 + bob + (step === 1 ? 1 : 0), 3, 2, color);
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
    px(ctx, ox + 14, oy + 7 + bob, 4, 2, color);
  }
}
