<script>
  import { spring } from "svelte/motion";
  import { onMount, onDestroy } from "svelte";
  import { clamp, round, adjust } from "./math.js";

  export let name = "CKAD";
  export let img = "/CKAD.png";
  
  let thisCard;
  let rafId = null;
  let pendingSpringUpdate = null;
  let isMobile = false;
  let tapped = false;
  let gyroActive = false;
  let orientationHandler = null;
  let lastGyroTime = 0;

  let active = false;
  let interacting = false;
  let loading = true;

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);

  const interact = (e) => {
    interacting = true;
    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

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
      }
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
    interacting = false;
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
  };

  const imageLoader = () => {
    loading = false;
  };

  // --- Mobile: tap + gyroscope ---

  function handleTap() {
    if (!isMobile) return;
    tapped = !tapped;
    interacting = tapped;

    if (tapped) {
      startGyro();
      springGlare.set({ x: 50, y: 50, o: 1 });
    } else {
      stopGyro();
      interactEnd();
    }
  }

  function handleOrientation(e) {
    // Throttle for performance
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

    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
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
    const imgElement = thisCard?.querySelector('img');
    if (imgElement?.complete) {
      loading = false;
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
  class="card interactive ckad"
  class:interacting
  class:loading
  data-rarity="ckad"
  style={dynamicStyles}
  bind:this={thisCard}
>
  <div class="card__translater">
    <button
      class="card__rotator"
      on:pointermove={interact}
      on:pointerleave={interactEnd}
      on:click={handleTap}
      aria-label="CKAD Card"
    >
      <div class="card__front">
        <img
          src={img}
          alt={name}
          on:load={imageLoader}
        />
        <div class="card__shine"></div>
        <div class="card__glare"></div>
      </div>
    </button>
  </div>
</div>

<style>
  .ckad {
    width: 200px;
    max-width: 100%;
    margin: 40px auto;
    display: block;
    position: relative;
    z-index: 10;
  }
  .card__rotator {
    aspect-ratio: 1;
    width: 100%;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
  }
  .card__front {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .card__front img {
    filter: drop-shadow(0 0 30px rgba(0, 162, 255, 0.4));
  }
</style>
