<script>
  import { spring } from "svelte/motion";
  import { onMount, onDestroy } from "svelte";
  import { clamp, round, adjust } from "../ckad-card/math.js";

  let thisCard;
  let asciiCanvas;
  let rafId = null;
  let pendingSpringUpdate = null;

  export let images = [];
  export let selectedItem = null;
  export let precomputedAscii = null;

  let interacting = false;
  let isHovering = false;
  let asciiReady = false;
  let isMobile = false;
  let tapped = false;
  let gyroActive = false;
  let orientationHandler = null;

  // If no selectedItem is provided (e.g. from other pages), use fallback if needed
  // or use the server-selected item passed as prop
  const item =
    selectedItem ||
    (images.length > 0
      ? images[Math.floor(Math.random() * images.length)]
      : "/assets/profiles/japancara.jpg");

  const isMasked = typeof item === "object" && item.fg;
  const imgSrc = isMasked ? item.bg : item;
  const fgSrc = isMasked ? item.fg : null;

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);

  // Dense → sparse for dark → light
  const CHARS = "@%#*+=-:,. ";

  function renderPrecomputedAscii() {
    if (!precomputedAscii || !asciiCanvas) return;

    const {
      asciiData,
      canvasSize,
      fontSize,
      charWidth,
      charHeight,
      rows,
      cols,
    } = precomputedAscii;

    asciiCanvas.width = canvasSize;
    asciiCanvas.height = canvasSize;
    const ctx = asciiCanvas.getContext("2d");

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = "top";

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = asciiData[y][x];
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.char, x * charWidth, y * charHeight);
      }
    }

    asciiReady = true;
  }

  function generateAscii() {
    const bgImg = new Image();
    let fgImg = null;

    const applyAscii = (imgToSample) => {
      const canvasSize = 640;
      const fontSize = 20;
      const charWidth = fontSize * 0.8;
      const charHeight = fontSize;
      const cols = Math.floor(canvasSize / charWidth);
      const rows = Math.floor(canvasSize / charHeight);

      // Center-crop image to square, sample at grid resolution
      const size = Math.min(imgToSample.width, imgToSample.height);
      const sx = (imgToSample.width - size) / 2;
      const sy = (imgToSample.height - size) / 2;

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      const sampleCtx = sampleCanvas.getContext("2d");

      // If masked, we need to composite bg and fg on a temp canvas first
      if (isMasked) {
        const compositeCanvas = document.createElement("canvas");
        compositeCanvas.width = imgToSample.width;
        compositeCanvas.height = imgToSample.height;
        const compCtx = compositeCanvas.getContext("2d");

        // Draw layers
        compCtx.drawImage(bgImg, 0, 0);
        if (fgImg && fgImg.complete) {
          compCtx.drawImage(fgImg, 0, 0);
        }

        sampleCtx.drawImage(
          compositeCanvas,
          sx,
          sy,
          size,
          size,
          0,
          0,
          cols,
          rows,
        );
      } else {
        sampleCtx.drawImage(imgToSample, sx, sy, size, size, 0, 0, cols, rows);
      }

      const imageData = sampleCtx.getImageData(0, 0, cols, rows);

      // Render ASCII onto visible canvas
      asciiCanvas.width = canvasSize;
      asciiCanvas.height = canvasSize;
      const ctx = asciiCanvas.getContext("2d");
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textBaseline = "top";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const lum = 0.21 * r + 0.72 * g + 0.07 * b;
          const charIndex = Math.floor((lum / 255) * (CHARS.length - 1));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillText(CHARS[charIndex], x * charWidth, y * charHeight);
        }
      }

      asciiReady = true;
    };

    if (isMasked) {
      fgImg = new Image();
      let loadedCount = 0;
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) applyAscii(bgImg);
      };

      bgImg.onload = checkAllLoaded;
      fgImg.onload = checkAllLoaded;

      bgImg.src = imgSrc;
      fgImg.src = fgSrc;
    } else {
      bgImg.onload = () => applyAscii(bgImg);
      bgImg.src = imgSrc;
    }
  }

  // --- Desktop: pointer-based interaction ---

  const interact = (e) => {
    if (isMobile) return;
    interacting = true;
    isHovering = true;

    const rect = thisCard.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    pendingSpringUpdate = {
      background: {
        x: adjust(percent.x, 0, 100, 37, 63),
        y: adjust(percent.y, 0, 100, 33, 67),
      },
      rotate: {
        x: round(-(center.x / 3.5)),
        y: round(center.y / 3.5),
      },
      glare: {
        x: round(percent.x),
        y: round(percent.y),
        o: 1,
      },
    };

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (pendingSpringUpdate) {
          springBackground.set(pendingSpringUpdate.background);
          springRotate.set(pendingSpringUpdate.rotate);
          springGlare.set(pendingSpringUpdate.glare);
          pendingSpringUpdate = null;
        }
        rafId = null;
      });
    }
  };

  const interactEnd = () => {
    if (isMobile) return;
    interacting = false;
    isHovering = false;
    resetSprings();
  };

  function resetSprings() {
    const snapStiff = 0.01;
    const snapDamp = 0.06;
    springRotate.stiffness = snapStiff;
    springRotate.damping = snapDamp;
    springRotate.set({ x: 0, y: 0 });
    springGlare.stiffness = snapStiff;
    springGlare.damping = snapDamp;
    springGlare.set({ x: 50, y: 50, o: 0 });
    springBackground.stiffness = snapStiff;
    springBackground.damping = snapDamp;
    springBackground.set({ x: 50, y: 50 });
  }

  // --- Mobile: tap + gyroscope ---

  let lastGyroTime = 0;

  function handleTap() {
    if (!isMobile) return;
    tapped = !tapped;
    isHovering = tapped;

    if (tapped) {
      startGyro();
      springGlare.set({ x: 50, y: 50, o: 1 });
    } else {
      stopGyro();
      resetSprings();
    }
  }

  function handleOrientation(e) {
    // Throttle to ~20fps for performance
    const now = performance.now();
    if (now - lastGyroTime < 50) return;
    lastGyroTime = now;

    const beta = clamp(e.beta || 0, -30, 30);
    const gamma = clamp(e.gamma || 0, -30, 30);

    const percentX = clamp(round((gamma + 30) * (100 / 60)));
    const percentY = clamp(round((beta + 30) * (100 / 60)));

    springRotate.stiffness = 0.04;
    springRotate.damping = 0.3;
    springBackground.set({
      x: adjust(percentX, 0, 100, 37, 63),
      y: adjust(percentY, 0, 100, 33, 67),
    });
    springRotate.set({
      x: round(-(gamma / 4)),
      y: round(beta / 4),
    });
    springGlare.set({
      x: percentX,
      y: percentY,
      o: 1,
    });
  }

  async function startGyro() {
    if (gyroActive) return;

    // iOS 13+ requires permission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== "granted") return;
      } catch {
        return;
      }
    }

    orientationHandler = handleOrientation;
    window.addEventListener("deviceorientation", orientationHandler);
    gyroActive = true;
  }

  function stopGyro() {
    if (orientationHandler) {
      window.removeEventListener("deviceorientation", orientationHandler);
      gyroActive = false;
    }
  }

  onMount(() => {
    isMobile = window.matchMedia("(hover: none)").matches;
    if (precomputedAscii) {
      renderPrecomputedAscii();
    } else {
      generateAscii();
    }
  });

  onDestroy(() => {
    if (orientationHandler) {
      window.removeEventListener("deviceorientation", orientationHandler);
    }
  });

  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --pointer-from-center: ${clamp(Math.sqrt(($springGlare.y - 50) * ($springGlare.y - 50) + ($springGlare.x - 50) * ($springGlare.x - 50)) / 50, 0, 1)};
    --pointer-from-top: ${$springGlare.y / 100};
    --pointer-from-left: ${$springGlare.x / 100};
    --card-opacity: ${$springGlare.o};
    --rotate-x: ${$springRotate.x}deg;
    --rotate-y: ${$springRotate.y}deg;
    --background-x: ${$springBackground.x}%;
    --background-y: ${$springBackground.y}%;
    --card-scale: 1;
    --card-aspect: 1;
    --translate-x: 0px;
    --translate-y: 0px;
  `;
</script>

<div
  class="card interactive profile"
  class:interacting
  class:hovering={isHovering}
  data-rarity="profile"
  style={dynamicStyles}
  bind:this={thisCard}
>
  <div class="card__translater">
    <div
      class="card__rotator"
      on:pointermove={interact}
      on:pointerleave={interactEnd}
      on:click={handleTap}
      role="img"
      aria-label="Cristian Gutierrez profile picture"
    >
      <div class="card__front">
        <canvas
          class="ascii-overlay"
          class:ready={asciiReady}
          bind:this={asciiCanvas}
        ></canvas>
        {#if isMasked}
          <img class="bg-layer" src={imgSrc} alt="Background" />
          <div class="card__shine"></div>
          <div class="card__glare"></div>
          <img class="fg-layer" src={fgSrc} alt="Cristian Gutierrez" />
        {:else}
          <img src={imgSrc} alt="Cristian Gutierrez" />
        {/if}
      </div>
    </div>
  </div>
</div>
