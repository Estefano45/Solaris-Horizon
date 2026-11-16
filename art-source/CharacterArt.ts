function p(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function drawMatrix(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  rows: string[],
  palette: Record<string, string>
): void {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = palette[ch];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}

/**
 * Draws the upgraded 16-bit chibi Astronaut frame strictly bounded inside a 32x32 cell
 * (all Y coordinates stay within [oy, oy + 31] so zero pixels bleed across spritesheet rows).
 */
function renderAstronautMatrixFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: SpriteDirection,
  col: number,
  suit: AstronautSuitSpec
): void {
  const isIdle = col < 3;
  const idleIdx = isIdle ? col : 0; // 0, 1, 2
  const walkIdx = isIdle ? 0 : col - 3; // 0, 1, 2, 3

  const breathY = isIdle ? (idleIdx === 2 ? -1 : 0) : walkIdx === 0 || walkIdx === 2 ? -1 : 0;
  const chestWiden = isIdle && idleIdx === 1 ? 1 : 0;
  const blink = isIdle && idleIdx === 2;

  const legSwing = !isIdle ? (walkIdx === 0 ? -1 : walkIdx === 2 ? 1 : 0) : 0;
  const armSwing = !isIdle ? (walkIdx === 0 ? 1 : walkIdx === 2 ? -1 : 0) : 0;

  // Soft ground shadow (subtly reacts to breathing/walk)
  p(ctx, ox + (blink ? 10 : 9), oy + 28, blink ? 12 : 14, 3, 'rgba(4, 7, 20, 0.55)');

  // Backpack when facing down or side
  if (dir === 'left') {
    p(ctx, ox + 19, oy + 14 + breathY, 6, 10, '#0f172a');
    p(ctx, ox + 20, oy + 15 + breathY, 4, 8, suit.pack);
    p(ctx, ox + 21, oy + 16 + breathY, 2, 2, suit.visorGlow);
    p(ctx, ox + 21, oy + 20 + breathY, 2, 1, suit.trim);
  } else if (dir === 'right') {
    p(ctx, ox + 7, oy + 14 + breathY, 6, 10, '#0f172a');
    p(ctx, ox + 8, oy + 15 + breathY, 4, 8, suit.pack);
    p(ctx, ox + 9, oy + 16 + breathY, 2, 2, suit.visorGlow);
    p(ctx, ox + 9, oy + 20 + breathY, 2, 1, suit.trim);
  } else if (dir === 'down') {
    p(ctx, ox + 8, oy + 14 + breathY, 16, 9, suit.pack);
  }

  // Alternating Legs & Boots
  if (dir === 'down' || dir === 'up') {
    const lLift = legSwing < 0 ? -2 : legSwing > 0 ? 1 : 0;
    const rLift = legSwing > 0 ? -2 : legSwing < 0 ? 1 : 0;
    // Left leg/boot
    p(ctx, ox + 10, oy + 22 + lLift, 5, 6, '#0f172a');
    p(ctx, ox + 11, oy + 22 + lLift, 3, 4, suit.suitMain);
    p(ctx, ox + 11, oy + 24 + lLift, 3, 1, suit.trim);
    p(ctx, ox + 11, oy + 26 + lLift, 3, 1, suit.pack);
    // Right leg/boot
    p(ctx, ox + 17, oy + 22 + rLift, 5, 6, '#0f172a');
    p(ctx, ox + 18, oy + 22 + rLift, 3, 4, suit.suitMain);
    p(ctx, ox + 18, oy + 24 + rLift, 3, 1, suit.trim);
    p(ctx, ox + 18, oy + 26 + rLift, 3, 1, suit.pack);
  } else {
    const stepFrontX = dir === 'right' ? 15 : 11;
    const stepBackX = dir === 'right' ? 12 : 16;
    const frontShift = legSwing * 2;
    const backShift = -legSwing * 2;
    p(ctx, ox + stepBackX + backShift, oy + 22, 5, 6, '#0f172a');
    p(ctx, ox + stepBackX + 1 + backShift, oy + 22, 3, 4, suit.suitShade);
    p(ctx, ox + stepBackX + 1 + backShift, oy + 25, 3, 2, '#475569');

    p(ctx, ox + stepFrontX + frontShift, oy + 22, 5, 6, '#0f172a');
    p(ctx, ox + stepFrontX + 1 + frontShift, oy + 22, 3, 4, suit.suitMain);
    p(ctx, ox + stepFrontX + 1 + frontShift, oy + 24, 3, 1, suit.trim);
    p(ctx, ox + stepFrontX + 1 + frontShift, oy + 26, 3, 1, suit.pack);
  }

  // Torso (expands subtly during idle breath frame 1)
  p(ctx, ox + 9 - chestWiden, oy + 14 + breathY, 14 + chestWiden * 2, 9, '#0f172a');
  p(ctx, ox + 10 - chestWiden, oy + 14 + breathY, 12 + chestWiden * 2, 8, suit.suitShade);
  p(ctx, ox + 11, oy + 15 + breathY, 10, 6, suit.suitMain);
  // Suit chest telemetry + belt trim
  p(ctx, ox + 10, oy + 20 + breathY, 12, 2, suit.trim);
  if (dir === 'down') {
    p(ctx, ox + 13, oy + 16 + breathY, 6, 3, '#0284c7');
    p(ctx, ox + 14, oy + 17 + breathY, 4, 1, isIdle && idleIdx === 1 ? '#bae6fd' : suit.visorGlow);
  }

  // Alternating Swinging Arms
  if (dir === 'down' || dir === 'up') {
    const lArmY = oy + 15 + breathY + (armSwing > 0 ? -1 : armSwing < 0 ? 2 : 0);
    const rArmY = oy + 15 + breathY + (armSwing < 0 ? -1 : armSwing > 0 ? 2 : 0);
    p(ctx, ox + 6 - chestWiden, lArmY, 4, 7, '#0f172a');
    p(ctx, ox + 7 - chestWiden, lArmY + 1, 2, 5, suit.suitMain);
    p(ctx, ox + 7 - chestWiden, lArmY + 2, 2, 1, suit.trim);
    p(ctx, ox + 7 - chestWiden, lArmY + 5, 2, 2, suit.suitShade);

    p(ctx, ox + 22 + chestWiden, rArmY, 4, 7, '#0f172a');
    p(ctx, ox + 23 + chestWiden, rArmY + 1, 2, 5, suit.suitMain);
    p(ctx, ox + 23 + chestWiden, rArmY + 2, 2, 1, suit.trim);
    p(ctx, ox + 23 + chestWiden, rArmY + 5, 2, 2, suit.suitShade);
  } else {
    const sideArmShift = armSwing * 2;
    const armX = (dir === 'right' ? 14 : 13) + sideArmShift;
    p(ctx, ox + armX, oy + 15 + breathY, 5, 7, '#0f172a');
    p(ctx, ox + armX + 1, oy + 16 + breathY, 3, 5, suit.suitMain);
    p(ctx, ox + armX + 1, oy + 17 + breathY, 3, 1, suit.trim);
    p(ctx, ox + armX + 1, oy + 20 + breathY, 3, 2, suit.suitShade);
  }

  // Backpack over back when facing UP
  if (dir === 'up') {
    p(ctx, ox + 9, oy + 13 + breathY, 14, 9, '#0f172a');
    p(ctx, ox + 10, oy + 14 + breathY, 12, 7, suit.pack);
    p(ctx, ox + 11, oy + 15 + breathY, 10, 5, suit.suitShade);
    p(ctx, ox + 14, oy + 17 + breathY, 4, 2, isIdle && idleIdx === 1 ? '#bae6fd' : suit.visorGlow);
  }

  // Oversized Cozy Chibi Helmet (strictly inside oy+2..oy+14; breathY shifts down to oy+1 max)
  const antennaY = Math.max(oy, oy + 1 + breathY);
  p(ctx, ox + 7, oy + 3 + breathY, 18, 12, '#0f172a');
  p(ctx, ox + 8, oy + 4 + breathY, 16, 10, suit.suitShade);
  p(ctx, ox + 9, oy + 4 + breathY, 14, 9, suit.suitMain);
  // Ear-comms pods
  p(ctx, ox + 6, oy + 7 + breathY, 2, 4, suit.trim);
  p(ctx, ox + 24, oy + 7 + breathY, 2, 4, suit.trim);
  // Comms antenna clamped cleanly within >= oy so no cyan pixel ever bleeds into upper cell!
  p(ctx, ox + 22, antennaY, 2, 3, suit.pack);
  p(ctx, ox + 22, antennaY, 2, 1, isIdle && idleIdx === 1 ? '#bae6fd' : suit.visorGlow);

  // Expressive Face / Visor
  if (dir === 'down') {
    p(ctx, ox + 10, oy + 5 + breathY, 12, 7, '#0f172a');
    p(ctx, ox + 11, oy + 6 + breathY, 10, 2, suit.hair);
    p(ctx, ox + 11, oy + 8 + breathY, 10, 4, '#fed7aa');
    if (blink) {
      p(ctx, ox + 12, oy + 10 + breathY, 2, 1, '#0f172a');
      p(ctx, ox + 18, oy + 10 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 12, oy + 9 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 18, oy + 9 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 12, oy + 9 + breathY, 1, 1, '#ffffff');
      p(ctx, ox + 18, oy + 9 + breathY, 1, 1, '#ffffff');
    }
    p(ctx, ox + 11, oy + 11 + breathY, 2, 1, '#fb7185');
    p(ctx, ox + 19, oy + 11 + breathY, 2, 1, '#fb7185');
    p(ctx, ox + 20, oy + 6 + breathY, 2, 3, suit.visorGlow);
  } else if (dir === 'left') {
    p(ctx, ox + 8, oy + 5 + breathY, 9, 7, '#0f172a');
    p(ctx, ox + 9, oy + 6 + breathY, 7, 2, suit.hair);
    p(ctx, ox + 9, oy + 8 + breathY, 7, 4, '#fed7aa');
    if (blink) {
      p(ctx, ox + 10, oy + 10 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 10, oy + 9 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 10, oy + 9 + breathY, 1, 1, '#ffffff');
    }
    p(ctx, ox + 12, oy + 11 + breathY, 2, 1, '#fb7185');
    p(ctx, ox + 9, oy + 6 + breathY, 2, 2, suit.visorGlow);
  } else if (dir === 'right') {
    p(ctx, ox + 15, oy + 5 + breathY, 9, 7, '#0f172a');
    p(ctx, ox + 16, oy + 6 + breathY, 7, 2, suit.hair);
    p(ctx, ox + 16, oy + 8 + breathY, 7, 4, '#fed7aa');
    if (blink) {
      p(ctx, ox + 20, oy + 10 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 20, oy + 9 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 21, oy + 9 + breathY, 1, 1, '#ffffff');
    }
    p(ctx, ox + 18, oy + 11 + breathY, 2, 1, '#fb7185');
    p(ctx, ox + 21, oy + 6 + breathY, 2, 2, suit.visorGlow);
  } else {
    p(ctx, ox + 10, oy + 6 + breathY, 12, 6, suit.suitShade);
    p(ctx, ox + 12, oy + 7 + breathY, 8, 2, suit.trim);
    p(ctx, ox + 14, oy + 10 + breathY, 4, 1, suit.visorGlow);
  }
}

/**
 * Renders 7-frame (32x32) NPC & specimen sheets: cols 0..2 = idle, cols 3..6 = animated walk/hop
 */
function renderNpcMatrixFrame(
  ctx: CanvasRenderingContext2D,
  id: CustomSpriteId,
  ox: number,
  oy: number,
  col: number,
  robotSkin: RobotSkinSpec
): void {
  const isIdle = col < 3;
  const breathY = isIdle ? (col === 2 ? -1 : 0) : col === 3 || col === 5 ? -1 : 0;
  const blink = isIdle && col === 2;
  const gleam = isIdle && col === 1;
  const swing = !isIdle ? (col === 3 ? -1 : col === 5 ? 1 : 0) : 0;

  // Ground shadow
  p(ctx, ox + 9, oy + 27, 14, 3, 'rgba(4, 7, 20, 0.5)');

  if (id === 'robot') {
    // LUNA-7 Helper Bot (supports live skin palettes)
    p(ctx, ox + 10, oy + 2 + breathY, 2, 4, '#64748b');
    p(ctx, ox + 20, oy + 2 + breathY, 2, 4, '#64748b');
    p(ctx, ox + 10, oy + 1 + breathY, 2, 2, gleam ? '#ffffff' : robotSkin.antenna);
    p(ctx, ox + 20, oy + 1 + breathY, 2, 2, gleam ? '#ffffff' : robotSkin.eye);

    // Feet
    p(ctx, ox + 10, oy + 23 + (swing < 0 ? -2 : 0), 5, 5, '#0f172a');
    p(ctx, ox + 11, oy + 24 + (swing < 0 ? -2 : 0), 3, 3, robotSkin.shellDark);
    p(ctx, ox + 17, oy + 23 + (swing > 0 ? -2 : 0), 5, 5, '#0f172a');
    p(ctx, ox + 18, oy + 24 + (swing > 0 ? -2 : 0), 3, 3, robotSkin.shellDark);

    // Swinging arms
    p(ctx, ox + 6, oy + 16 + breathY + swing * 2, 3, 5, '#0f172a');
    p(ctx, ox + 7, oy + 17 + breathY + swing * 2, 2, 3, robotSkin.shellLight);
    p(ctx, ox + 23, oy + 16 + breathY - swing * 2, 3, 5, '#0f172a');
    p(ctx, ox + 23, oy + 17 + breathY - swing * 2, 2, 3, robotSkin.shellLight);

    // Body + CRT Head
    p(ctx, ox + 10, oy + 15 + breathY, 12, 9, '#0f172a');
    p(ctx, ox + 11, oy + 16 + breathY, 10, 7, robotSkin.shellDark);
    p(ctx, ox + 14, oy + 17 + breathY, 4, 4, gleam ? '#ffffff' : robotSkin.chestGlow);

    p(ctx, ox + 8, oy + 5 + breathY, 16, 11, '#0f172a');
    p(ctx, ox + 9, oy + 6 + breathY, 14, 9, robotSkin.shellLight);
    p(ctx, ox + 10, oy + 7 + breathY, 12, 7, '#0f172a');
    if (blink) {
      p(ctx, ox + 12, oy + 10 + breathY, 2, 1, robotSkin.eye);
      p(ctx, ox + 18, oy + 10 + breathY, 2, 1, robotSkin.eye);
    } else {
      p(ctx, ox + 12, oy + 9 + breathY, 2, 3, robotSkin.eye);
      p(ctx, ox + 18, oy + 9 + breathY, 2, 3, robotSkin.eye);
    }
    p(ctx, ox + 15, oy + 12 + breathY, 2, 1, robotSkin.eye);
    return;
  }

  if (id === 'alien') {
    p(ctx, ox + 11, oy + 2 + breathY, 2, 4, '#22c55e');
    p(ctx, ox + 19, oy + 2 + breathY, 2, 4, '#22c55e');
    p(ctx, ox + 10, oy + 1 + breathY, 3, 2, gleam ? '#dcfce7' : '#86efac');
    p(ctx, ox + 19, oy + 1 + breathY, 3, 2, gleam ? '#dcfce7' : '#86efac');

    p(ctx, ox + 11, oy + 22 + (swing < 0 ? -2 : 0), 4, 6, '#0f172a');
    p(ctx, ox + 12, oy + 22 + (swing < 0 ? -2 : 0), 3, 5, '#4ade80');
    p(ctx, ox + 17, oy + 22 + (swing > 0 ? -2 : 0), 4, 6, '#0f172a');
    p(ctx, ox + 17, oy + 22 + (swing > 0 ? -2 : 0), 3, 5, '#4ade80');

    p(ctx, ox + 8, oy + 15 + breathY, 3, 6, '#7c3aed');
    p(ctx, ox + 7, oy + 16 + breathY + swing * 2, 3, 5, '#0f172a');
    p(ctx, ox + 8, oy + 17 + breathY + swing * 2, 2, 3, '#4ade80');
    p(ctx, ox + 22, oy + 16 + breathY - swing * 2, 3, 5, '#0f172a');
    p(ctx, ox + 22, oy + 17 + breathY - swing * 2, 2, 3, '#4ade80');

    p(ctx, ox + 10, oy + 15 + breathY, 12, 8, '#0f172a');
    p(ctx, ox + 11, oy + 15 + breathY, 10, 7, '#4ade80');
    p(ctx, ox + 13, oy + 17 + breathY, 6, 3, '#86efac');

    p(ctx, ox + 8, oy + 5 + breathY, 16, 11, '#0f172a');
    p(ctx, ox + 9, oy + 6 + breathY, 14, 9, '#22c55e');
    p(ctx, ox + 10, oy + 7 + breathY, 12, 7, '#4ade80');
    if (blink) {
      p(ctx, ox + 11, oy + 10 + breathY, 3, 1, '#0f172a');
      p(ctx, ox + 18, oy + 10 + breathY, 3, 1, '#0f172a');
    } else {
      p(ctx, ox + 11, oy + 9 + breathY, 3, 3, '#0f172a');
      p(ctx, ox + 18, oy + 9 + breathY, 3, 3, '#0f172a');
      p(ctx, ox + 12, oy + 9 + breathY, 1, 1, '#ffffff');
      p(ctx, ox + 19, oy + 9 + breathY, 1, 1, '#ffffff');
    }
    p(ctx, ox + 15, oy + 12 + breathY, 2, 1, '#0f172a');
    return;
  }

  if (id === 'battery') {
    p(ctx, ox + 14, oy + 3 + breathY, 4, 2, '#cbd5e1');
    p(ctx, ox + 11, oy + 23 + (swing < 0 ? -2 : 0), 4, 5, '#0f172a');
    p(ctx, ox + 12, oy + 24 + (swing < 0 ? -2 : 0), 3, 3, '#f8fafc');
    p(ctx, ox + 17, oy + 23 + (swing > 0 ? -2 : 0), 4, 5, '#0f172a');
    p(ctx, ox + 17, oy + 24 + (swing > 0 ? -2 : 0), 3, 3, '#f8fafc');

    p(ctx, ox + 3, oy + 13 + breathY + swing * 2, 6, 7, '#0f172a');
    p(ctx, ox + 4, oy + 14 + breathY + swing * 2, 4, 5, '#2563eb');
    p(ctx, ox + 5, oy + 15 + breathY + swing * 2, 2, 3, '#60a5fa');

    p(ctx, ox + 23, oy + 13 + breathY - swing * 2, 6, 7, '#0f172a');
    p(ctx, ox + 24, oy + 14 + breathY - swing * 2, 4, 5, '#2563eb');
    p(ctx, ox + 25, oy + 15 + breathY - swing * 2, 2, 3, '#60a5fa');

    p(ctx, ox + 9, oy + 5 + breathY, 14, 19, '#0f172a');
    p(ctx, ox + 10, oy + 6 + breathY, 12, 3, '#fbbf24');
    p(ctx, ox + 10, oy + 9 + breathY, 12, 14, '#334155');
    p(ctx, ox + 11, oy + 10 + breathY, 10, 6, '#0284c7');
    p(ctx, ox + 12, oy + 11 + breathY, 8, 4, '#38bdf8');
    if (blink) {
      p(ctx, ox + 13, oy + 13 + breathY, 2, 1, '#0f172a');
      p(ctx, ox + 17, oy + 13 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 13, oy + 12 + breathY, 1, 2, '#0f172a');
      p(ctx, ox + 18, oy + 12 + breathY, 1, 2, '#0f172a');
    }
    p(ctx, ox + 16, oy + 17 + breathY, 2, 2, '#fde047');
    p(ctx, ox + 14, oy + 19 + breathY, 3, 2, '#facc15');
    return;
  }

  if (id === 'drone') {
    const rotorW = col % 2 === 0 ? 18 : 10;
    p(ctx, ox + 16 - rotorW / 2, oy + 4 + breathY, rotorW, 2, '#e2e8f0');
    p(ctx, ox + 15, oy + 6 + breathY, 2, 3, '#fbbf24');
    const jetH = col % 2 === 0 ? 4 : 2;
    p(ctx, ox + 13, oy + 23 + breathY, 6, jetH, '#38bdf8');
    p(ctx, ox + 14, oy + 24 + breathY, 4, 2, '#bae6fd');

    p(ctx, ox + 7, oy + 8 + breathY, 18, 15, '#0f172a');
    p(ctx, ox + 8, oy + 9 + breathY, 16, 13, '#f8fafc');
    p(ctx, ox + 6, oy + 13 + breathY, 2, 5, '#fbbf24');
    p(ctx, ox + 24, oy + 13 + breathY, 2, 5, '#fbbf24');
    p(ctx, ox + 10, oy + 11 + breathY, 12, 7, '#0f172a');
    if (blink) {
      p(ctx, ox + 12, oy + 14 + breathY, 2, 1, '#38bdf8');
      p(ctx, ox + 18, oy + 14 + breathY, 2, 1, '#38bdf8');
    } else {
      p(ctx, ox + 12, oy + 13 + breathY, 2, 2, '#38bdf8');
      p(ctx, ox + 18, oy + 13 + breathY, 2, 2, '#38bdf8');
      p(ctx, ox + 15, oy + 15 + breathY, 2, 1, '#7dd3fc');
    }
    p(ctx, ox + 14, oy + 19 + breathY, 4, 3, '#facc15');
    return;
  }

  if (id === 'sprout') {
    p(ctx, ox + 7, oy + 17, 18, 9, '#0f172a');
    p(ctx, ox + 8, oy + 18, 16, 7, '#92400e');
    p(ctx, ox + 10, oy + 19, 12, 5, '#b45309');
    const leafTilt = swing;
    p(ctx, ox + 15, oy + 9 + breathY, 2, 9, '#16a34a');
    p(ctx, ox + 7, oy + 6 + breathY + leafTilt, 8, 5, '#22c55e');
    p(ctx, ox + 8, oy + 7 + breathY + leafTilt, 6, 3, '#86efac');
    p(ctx, ox + 17, oy + 6 + breathY - leafTilt, 8, 5, '#22c55e');
    p(ctx, ox + 18, oy + 7 + breathY - leafTilt, 6, 3, '#86efac');
    p(ctx, ox + 13, oy + 11 + breathY, 1, 2, '#0f172a');
    p(ctx, ox + 18, oy + 11 + breathY, 1, 2, '#0f172a');
    return;
  }

  if (id === 'cloud') {
    p(ctx, ox + 7 + swing, oy + 9 + breathY, 18, 13, '#0f172a');
    p(ctx, ox + 10 + swing, oy + 6 + breathY, 12, 14, '#38bdf8');
    p(ctx, ox + 8 + swing, oy + 10 + breathY, 16, 10, '#7dd3fc');
    p(ctx, ox + 10 + swing, oy + 10 + breathY, 12, 8, '#bae6fd');
    if (blink) {
      p(ctx, ox + 12 + swing, oy + 14 + breathY, 2, 1, '#0f172a');
      p(ctx, ox + 18 + swing, oy + 14 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 12 + swing, oy + 13 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 18 + swing, oy + 13 + breathY, 2, 2, '#0f172a');
    }
    p(ctx, ox + 14 + swing, oy + 17 + breathY, 4, 1, '#0284c7');
    return;
  }

  if (id === 'crystal') {
    // Pure faceless 16-bit Lunar Ice Crystal specimen (inanimate collectible/mineral)
    drawMatrix(
      ctx,
      ox + 4,
      oy + 3 + breathY,
      [
        '...........OO...........',
        '..........OCCO..........',
        '.........OCLLCO.........',
        '........OCLWWLCO........',
        '.......OCLLWWLLCO.......',
        '......OCLLLCCLLLCO......',
        '......OCLLCCCCLLCO......',
        '.....OCLLCLLLLCCLCO.....',
        '....OOCLLCCLLCCLLCOO....',
        '...OCCCLCOOCCOOCLCCCO...',
        '..OCLLCCOOCCCCOOCCLLCO..',
        '..OCLCCCOCCCCCCOOCCLCO..',
        '.OCLCCCOCCCCCCCCOOCLLCO.',
        '.OCLLCCOOCCCCCCOOCCLLCO.',
        '.OCCLLCCCCCCCCCCCCLLCCO.',
        '..OOCCLLLLLLLLLLLLCCOO..',
        '....OOCCCCCCCCCCCCOO....',
        '......OOOOOOOOOOOO......',
      ],
      {
        O: '#0f172a',
        C: gleam ? '#7dd3fc' : '#0284c7',
        L: '#38bdf8',
        W: '#e0f2fe',
      }
    );
    // Crisp specular crystal sparkles (no face/eyes)
    p(ctx, ox + 11, oy + 10 + breathY, 2, 3, '#e0f2fe');
    p(ctx, ox + 17, oy + 14 + breathY, 2, 2, gleam ? '#ffffff' : '#bae6fd');
    return;
  }

  if (id === 'asteroid') {
    p(ctx, ox + 6, oy + 7 + breathY, 20, 17, '#0f172a');
    p(ctx, ox + 7, oy + 8 + breathY, 18, 15, '#78716c');
    p(ctx, ox + 9, oy + 9 + breathY, 14, 11, '#a8a29e');
    p(ctx, ox + 9, oy + 10 + breathY, 4, 3, '#57534e');
    p(ctx, ox + 18, oy + 18 + breathY, 4, 3, '#57534e');
    if (blink) {
      p(ctx, ox + 12, oy + 15 + breathY, 2, 1, '#0f172a');
      p(ctx, ox + 18, oy + 15 + breathY, 2, 1, '#0f172a');
    } else {
      p(ctx, ox + 12, oy + 14 + breathY, 2, 2, '#0f172a');
      p(ctx, ox + 18, oy + 14 + breathY, 2, 2, '#0f172a');
    }
    p(ctx, ox + 14, oy + 18 + breathY, 4, 1, '#0f172a');
    return;
  }

  // Rover mini icon/companion
  p(ctx, ox + 5, oy + 20, 6, 6, '#0f172a');
  p(ctx, ox + 13, oy + 20, 6, 6, '#0f172a');
  p(ctx, ox + 21, oy + 20, 6, 6, '#0f172a');
  p(ctx, ox + 7, oy + 21, 3, 4, '#64748b');
  p(ctx, ox + 15, oy + 21, 3, 4, '#64748b');
  p(ctx, ox + 23, oy + 21, 3, 4, '#64748b');
  p(ctx, ox + 5, oy + 12 + breathY, 22, 10, '#0f172a');
  p(ctx, ox + 6, oy + 13 + breathY, 20, 8, '#f8fafc');
  p(ctx, ox + 7, oy + 18 + breathY, 18, 2, '#f59e0b');
  p(ctx, ox + 17, oy + 7 + breathY, 9, 8, '#0f172a');
  p(ctx, ox + 18, oy + 8 + breathY, 7, 6, '#38bdf8');
  p(ctx, ox + 20, oy + 10 + breathY, 1, 2, '#0f172a');
  p(ctx, ox + 23, oy + 10 + breathY, 1, 2, '#0f172a');
}


export {renderAstronautMatrixFrame,renderNpcMatrixFrame};
