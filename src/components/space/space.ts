/**
 * Space background built with three.js.
 *
 * Three layers, drawn back to front on an opaque canvas that *is* the page
 * background (pure black in dark mode, like the blog's OLED theme):
 *   1. Nebula: a full-screen fbm shader in the brand colours, with a soft
 *      Milky Way band across the sky.
 *   2. Stars: point sprites in 3D, denser along the same band, with colour
 *      temperature, twinkle, mouse parallax and a slow scroll-driven dolly.
 *   3. Shooting stars: a short streak now and then.
 */
import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Mesh,
	NormalBlending,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry,
	Points,
	Scene,
	ShaderMaterial,
	WebGLRenderer,
	WebGLRenderTarget,
} from "three";

export type Theme = "dark" | "light";

export interface Space {
	setTheme(theme: Theme): void;
	/** Show or hide the stars and shooting stars; the nebula always stays. */
	setStars(on: boolean): void;
	/** Twinkling stars (the original look) or steady ones that never seem to blink. */
	setTwinkle(on: boolean): void;
	destroy(): void;
}

// Brand palette shared with blog.crstian.me (oklch 285 purple, cyan, pink).
const BRAND = new Color("#7a5cff");
const BRAND_2 = new Color("#3dd6ff");
const BRAND_3 = new Color("#ff4fa3");

const BG: Record<Theme, Color> = {
	dark: new Color("#000000"),
	light: new Color("#fcfcfe"),
};

const STAR_COUNT = 7000;
const BAND_SHARE = 0.45; // share of the stars that sit on the galactic band

// Galactic band: a tilted plane through the scene, matched in the nebula shader.
const BAND_TILT = -0.42; // radians, screen-space slope of the band

const fullscreenVertex = /* glsl */ `
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = vec4(position.xy, 0.0, 1.0);
	}
`;

const nebulaFragment = /* glsl */ `
	precision highp float;
	varying vec2 vUv;
	uniform float uTime;
	uniform vec2 uResolution;
	uniform vec2 uPointer;
	uniform float uScroll;
	uniform float uLight;
	uniform float uTilt;
	uniform vec3 uBrand;
	uniform vec3 uBrand2;
	uniform vec3 uBrand3;
	uniform vec3 uBg;

	float hash(vec2 p) {
		p = fract(p * vec2(123.34, 456.21));
		p += dot(p, p + 45.32);
		return fract(p.x * p.y);
	}

	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
	}

	float fbm(vec2 p) {
		float v = 0.0;
		float a = 0.5;
		mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
		for (int i = 0; i < 6; i++) {
			v += a * noise(p);
			p = r * p * 2.03 + 11.7;
			a *= 0.5;
		}
		return v;
	}

	void main() {
		float aspect = uResolution.x / uResolution.y;
		vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
		// Parallax: the nebula sits far away, so it moves less than the stars.
		p += uPointer * 0.015;
		p.y += uScroll * 0.08;

		float t = uTime * 0.012;

		// Distance to the galactic band (a tilted line through the screen).
		vec2 dir = normalize(vec2(1.0, uTilt));
		vec2 nrm = vec2(-dir.y, dir.x);
		float d = dot(p - vec2(0.05, 0.08), nrm);

		// Domain-warped gas.
		vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.2));
		float gas = fbm(p * 2.2 + q * 1.4 + vec2(t * 0.6, -t));
		float dust = fbm(p * 5.0 + q * 2.0 - t * 0.4);

		float band = exp(-d * d * 9.0);
		float core = exp(-d * d * 40.0);

		// Brand colours drift along the band: cyan on one side, pink on the other.
		float along = dot(p, dir);
		vec3 tint = mix(uBrand2, uBrand, smoothstep(-0.9, 0.1, along + (q.x - 0.5)));
		tint = mix(tint, uBrand3, smoothstep(0.2, 1.1, along + (q.y - 0.5) * 0.8));

		float glow = band * smoothstep(0.32, 0.95, gas) * 0.75
		           + core * smoothstep(0.45, 0.9, gas) * 0.45;
		// Dark dust lanes cut through the core of the band.
		glow *= 1.0 - core * smoothstep(0.5, 0.75, dust) * 0.75;

		// Faint isolated clouds away from the band, so the sky is never flat.
		float clouds = smoothstep(0.62, 0.95, fbm(p * 1.1 - q + 7.0)) * 0.18;

		vec3 dark = tint * (glow + clouds * 0.6) + uBrand * clouds * 0.25;
		// Faint top glow, the same one the blog header has.
		dark += uBrand * 0.07 * (1.0 - smoothstep(-0.1, 0.75, length(vec2(p.x * 0.6, vUv.y - 1.05))));

		vec3 light = mix(uBg, tint, (glow + clouds) * 0.28);
		light = mix(light, uBrand, 0.05 * (1.0 - smoothstep(-0.1, 0.75, length(vec2(p.x * 0.6, vUv.y - 1.05)))));

		vec3 col = mix(uBg + dark, light, uLight);
		// Subtle vignette in dark mode.
		col *= mix(1.0 - 0.25 * smoothstep(0.4, 1.3, length(p)), 1.0, uLight);
		// Dither to avoid banding on the gradients.
		col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
		gl_FragColor = vec4(col, 1.0);
	}
`;

const starVertex = /* glsl */ `
	attribute float aSize;
	attribute float aPhase;
	attribute vec3 aColor;
	uniform float uTime;
	uniform float uPixelRatio;
	uniform float uLight;
	varying vec3 vColor;
	varying float vTwinkle;
	varying float vFade;
	varying float vDim;
	uniform float uTwinkle;

	void main() {
		vec4 mv = modelViewMatrix * vec4(position, 1.0);
		gl_Position = projectionMatrix * mv;
		float depth = -mv.z;
		// uTwinkle 1: the stars twinkle. 0: steady brightness and size.
		float tw = mix(1.0, 0.72 + 0.28 * sin(uTime * (0.6 + aPhase * 1.8) + aPhase * 40.0), uTwinkle);
		vTwinkle = tw;
		vColor = aColor;
		// Fade stars in from far away and out when they get too close.
		vFade = (1.0 - smoothstep(900.0, 1400.0, depth)) * smoothstep(8.0, 60.0, depth);
		float size = aSize * (300.0 / depth) * uPixelRatio * mix(1.0, 0.8, uLight);
		float px = size * (0.85 + 0.15 * tw);
		// Below ~3.5 px a star covers one pixel or the next as it drifts, so it
		// seems to switch on and off. Draw it at the minimum size and dim it by
		// the area it lost: same light, steady on screen.
		// Only for steady stars: with twinkle the original drawing stays as it was.
		float minPx = 3.5 * uPixelRatio;
		vDim = uTwinkle > 0.5 ? 1.0 : min(1.0, (px * px) / (minPx * minPx));
		gl_PointSize = clamp(uTwinkle > 0.5 ? px : max(px, minPx), 1.0, 14.0 * uPixelRatio);
	}
`;

const starFragment = /* glsl */ `
	precision highp float;
	uniform float uLight;
	uniform vec3 uInk;
	varying vec3 vColor;
	varying float vTwinkle;
	varying float vFade;
	varying float vDim;

	void main() {
		vec2 c = gl_PointCoord - 0.5;
		float r = length(c);
		if (r > 0.5) discard;
		// Bright core plus a soft halo and a faint cross (diffraction spikes).
		float core = (1.0 - smoothstep(0.0, 0.5, r));
		core = pow(core, 2.6);
		float halo = exp(-r * r * 30.0) * 0.5;
		float spikes = (exp(-abs(c.x) * 60.0) + exp(-abs(c.y) * 60.0)) * (1.0 - smoothstep(0.0, 0.5, r)) * 0.18;
		// Small stars get a soft gaussian (~0.8 px) instead of the sharp core: a
		// sub-pixel peak lands on one pixel or between two as the star drifts,
		// and its brightness jumps. The gaussian looks the same wherever it lands.
		float soft = exp(-r * r * 9.0) * 1.6;
		float shape = mix(soft, core + halo + spikes, smoothstep(0.35, 1.0, vDim));
		float a = shape * vTwinkle * vFade * vDim;

		vec3 darkCol = vColor * a;
		if (uLight > 0.5) {
			gl_FragColor = vec4(mix(uInk, vColor * 0.55, 0.35), clamp(a * 0.85, 0.0, 1.0));
		} else {
			gl_FragColor = vec4(darkCol, 1.0);
		}
	}
`;

const meteorVertex = /* glsl */ `
	varying vec2 vUv;
	uniform vec2 uStart;
	uniform vec2 uDir;
	uniform float uLength;
	uniform float uWidth;
	uniform float uProgress;
	uniform vec2 uResolution;
	void main() {
		vUv = uv;
		vec2 nrm = vec2(-uDir.y, uDir.x);
		vec2 head = uStart + uDir * uProgress;
		// position.x in [-0.5, 0.5] along the trail, position.y across it.
		vec2 px = head - uDir * (0.5 - position.x) * uLength + nrm * position.y * uWidth;
		vec2 ndc = px / uResolution * 2.0 - 1.0;
		gl_Position = vec4(ndc, 0.0, 1.0);
	}
`;

const meteorFragment = /* glsl */ `
	precision highp float;
	varying vec2 vUv;
	uniform float uAlpha;
	uniform float uLight;
	uniform vec3 uColor;
	uniform vec3 uInk;
	void main() {
		float along = pow(vUv.x, 3.0);
		float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
		float a = along * pow(across, 2.0) * uAlpha;
		if (uLight > 0.5) {
			gl_FragColor = vec4(uInk, a * 0.6);
		} else {
			vec3 col = mix(uColor, vec3(1.0), along);
			gl_FragColor = vec4(col * a, 1.0);
		}
	}
`;

function starColor(rng: number, onBand: boolean): Color {
	// Mostly white-blue stars, some warm ones, and a few in the brand colours.
	if (rng < 0.55) return new Color().setHSL(0.6, 0.35, 0.86);
	if (rng < 0.78) return new Color("#ffffff");
	if (rng < 0.88) return new Color().setHSL(0.09, 0.7, 0.8);
	if (rng < 0.94) return BRAND.clone().lerp(new Color("#ffffff"), onBand ? 0.35 : 0.5);
	if (rng < 0.97) return BRAND_2.clone().lerp(new Color("#ffffff"), 0.4);
	return BRAND_3.clone().lerp(new Color("#ffffff"), 0.45);
}

function gaussian(): number {
	// Box-Muller
	const u = 1 - Math.random();
	const v = Math.random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildStars(): BufferGeometry {
	const positions = new Float32Array(STAR_COUNT * 3);
	const colors = new Float32Array(STAR_COUNT * 3);
	const sizes = new Float32Array(STAR_COUNT);
	const phases = new Float32Array(STAR_COUNT);

	const cos = Math.cos(BAND_TILT);
	const sin = Math.sin(BAND_TILT);

	for (let i = 0; i < STAR_COUNT; i++) {
		const onBand = i < STAR_COUNT * BAND_SHARE;
		let x: number;
		let y: number;
		const z = -60 - Math.random() * 1300;

		if (onBand) {
			// Spread along the band, gaussian across it; scale with depth so the
			// band keeps the same apparent width at every distance.
			const spread = -z / 300;
			const along = (Math.random() * 2 - 1) * 520 * spread;
			const across = gaussian() * 55 * spread;
			x = along * cos - across * sin;
			y = along * sin + across * cos;
			// Same offset as the nebula band centre.
			x += 0.05 * 300 * spread;
			y -= 0.08 * 300 * spread;
		} else {
			const spread = -z / 300;
			x = (Math.random() * 2 - 1) * 520 * spread;
			y = (Math.random() * 2 - 1) * 320 * spread;
		}

		positions.set([x, y, z], i * 3);
		const c = starColor(Math.random(), onBand);
		colors.set([c.r, c.g, c.b], i * 3);
		// Most stars are tiny; a few are bright.
		const r = Math.random();
		sizes[i] = r < 0.9 ? 0.6 + Math.random() * 1.1 : r < 0.985 ? 1.8 + Math.random() * 1.4 : 3.2 + Math.random() * 1.8;
		phases[i] = Math.random();
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.setAttribute("aColor", new Float32BufferAttribute(colors, 3));
	geometry.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
	geometry.setAttribute("aPhase", new Float32BufferAttribute(phases, 1));
	return geometry;
}

export function createSpace(container: HTMLElement): Space {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

	const renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
	renderer.setPixelRatio(pixelRatio);
	renderer.autoClear = false;
	container.appendChild(renderer.domElement);

	const ink = new Color("#3b2a7a"); // dark purple used for stars in light mode
	let light = 0;
	let showStars = true;

	// --- Nebula (full-screen quad)
	const overlayScene = new Scene();
	const overlayCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const nebulaMaterial = new ShaderMaterial({
		vertexShader: fullscreenVertex,
		fragmentShader: nebulaFragment,
		depthTest: false,
		depthWrite: false,
		uniforms: {
			uTime: { value: 0 },
			uResolution: { value: [1, 1] },
			uPointer: { value: [0, 0] },
			uScroll: { value: 0 },
			uLight: { value: 0 },
			uTilt: { value: Math.tan(BAND_TILT) },
			uBrand: { value: BRAND },
			uBrand2: { value: BRAND_2 },
			uBrand3: { value: BRAND_3 },
			uBg: { value: BG.dark.clone() },
		},
	});
	const nebula = new Mesh(new PlaneGeometry(2, 2), nebulaMaterial);
	overlayScene.add(nebula);

	// The nebula is the expensive part (fbm on every pixel) and it is soft and
	// slow, so it renders at half resolution, every other frame, into a texture
	// that is stretched over the screen. The stars stay at full resolution.
	const NEBULA_SCALE = 0.5;
	const nebulaTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
	const copyScene = new Scene();
	const copyMaterial = new ShaderMaterial({
		vertexShader: fullscreenVertex,
		fragmentShader: /* glsl */ `
			precision highp float;
			varying vec2 vUv;
			uniform sampler2D uMap;
			void main() {
				gl_FragColor = texture2D(uMap, vUv);
			}
		`,
		depthTest: false,
		depthWrite: false,
		uniforms: { uMap: { value: nebulaTarget.texture } },
	});
	const copyQuad = new Mesh(new PlaneGeometry(2, 2), copyMaterial);
	copyScene.add(copyQuad);
	let nebulaFrame = 0;

	// --- Stars
	const scene = new Scene();
	const camera = new PerspectiveCamera(60, 1, 1, 2000);
	const starMaterial = new ShaderMaterial({
		vertexShader: starVertex,
		fragmentShader: starFragment,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uTime: { value: 0 },
			uPixelRatio: { value: pixelRatio },
			uTwinkle: { value: 1 },
			uLight: { value: 0 },
			uInk: { value: ink },
		},
	});
	const stars = new Points(buildStars(), starMaterial);
	scene.add(stars);

	// --- Shooting stars (drawn in screen space on top of everything)
	const meteorScene = new Scene();
	const meteorMaterial = new ShaderMaterial({
		vertexShader: meteorVertex,
		fragmentShader: meteorFragment,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: AdditiveBlending,
		uniforms: {
			uStart: { value: [0, 0] },
			uDir: { value: [1, 0] },
			uLength: { value: 220 },
			uWidth: { value: 2 },
			uProgress: { value: 0 },
			uResolution: { value: [1, 1] },
			uAlpha: { value: 0 },
			uLight: { value: 0 },
			uColor: { value: BRAND_2 },
			uInk: { value: ink },
		},
	});
	const meteor = new Mesh(new PlaneGeometry(1, 1), meteorMaterial);
	meteor.frustumCulled = false;
	meteorScene.add(meteor);

	type Meteor = { start: [number, number]; dir: [number, number]; speed: number; born: number; life: number };
	let current: Meteor | null = null;
	let nextMeteorAt = 3 + Math.random() * 4;

	function spawnMeteor(time: number, w: number, h: number) {
		// From the top area, heading down-left or down-right at a shallow angle.
		const fromLeft = Math.random() < 0.5;
		const angle = 0.35 + Math.random() * 0.35;
		const dir: [number, number] = [(fromLeft ? 1 : -1) * Math.cos(angle), -Math.sin(angle)];
		current = {
			start: [w * (fromLeft ? 0.05 + Math.random() * 0.5 : 0.45 + Math.random() * 0.5), h * (0.65 + Math.random() * 0.3)],
			dir,
			speed: (0.6 + Math.random() * 0.5) * Math.max(w, h),
			born: time,
			life: 0.9 + Math.random() * 0.6,
		};
		meteorMaterial.uniforms.uStart.value = current.start;
		meteorMaterial.uniforms.uDir.value = current.dir;
		meteorMaterial.uniforms.uLength.value = (160 + Math.random() * 160) * pixelRatio;
		meteorMaterial.uniforms.uColor.value = Math.random() < 0.5 ? BRAND_2 : BRAND;
	}

	// --- Input
	const pointer = { x: 0, y: 0 };
	const smooth = { x: 0, y: 0, scroll: 0 };
	function onPointer(e: PointerEvent) {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
	}
	window.addEventListener("pointermove", onPointer, { passive: true });

	function scrollProgress() {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		return max > 0 ? window.scrollY / max : 0;
	}

	// --- Size
	let width = 1;
	let height = 1;
	function resize() {
		width = container.clientWidth || window.innerWidth;
		height = container.clientHeight || window.innerHeight;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		const px = [width * pixelRatio, height * pixelRatio];
		nebulaMaterial.uniforms.uResolution.value = px;
		nebulaTarget.setSize(Math.max(1, Math.round(px[0] * NEBULA_SCALE)), Math.max(1, Math.round(px[1] * NEBULA_SCALE)));
		nebulaFrame = 0;
		meteorMaterial.uniforms.uResolution.value = px;
	}
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(container);
	resize();

	// --- Loop
	let frame = 0;
	let running = false;
	const startTime = performance.now();

	function render(now: number) {
		const time = (now - startTime) / 1000;
		const ease = 0.04;
		smooth.x += (pointer.x - smooth.x) * ease;
		smooth.y += (pointer.y - smooth.y) * ease;
		smooth.scroll += (scrollProgress() - smooth.scroll) * 0.06;

		nebulaMaterial.uniforms.uTime.value = time;
		nebulaMaterial.uniforms.uPointer.value = [smooth.x, -smooth.y];
		nebulaMaterial.uniforms.uScroll.value = smooth.scroll;
		starMaterial.uniforms.uTime.value = time;

		// Camera: a slow drift, mouse parallax and a dolly forward as you scroll.
		camera.position.x = smooth.x * 18 + Math.sin(time * 0.05) * 6;
		camera.position.y = -smooth.y * 12 + smooth.scroll * 30;
		camera.position.z = -smooth.scroll * 160;
		camera.lookAt(camera.position.x * 0.5, camera.position.y * 0.5, camera.position.z - 500);
		stars.rotation.z = time * 0.004;

		// Shooting stars
		if (!reducedMotion) {
			if (!current && time > nextMeteorAt) spawnMeteor(time, width * pixelRatio, height * pixelRatio);
			if (current) {
				const age = (time - current.born) / current.life;
				if (age >= 1) {
					current = null;
					nextMeteorAt = time + 4 + Math.random() * 8;
					meteorMaterial.uniforms.uAlpha.value = 0;
				} else {
					meteorMaterial.uniforms.uProgress.value = age * current.speed * current.life;
					meteorMaterial.uniforms.uAlpha.value = Math.sin(age * Math.PI) * (light ? 0.6 : 1);
					meteorMaterial.uniforms.uWidth.value = 1.6 * pixelRatio;
				}
			}
		}

		if (nebulaFrame++ % 2 === 0) {
			renderer.setRenderTarget(nebulaTarget);
			renderer.clear();
			renderer.render(overlayScene, overlayCamera);
			renderer.setRenderTarget(null);
		}
		renderer.clear();
		renderer.render(copyScene, overlayCamera);
		if (showStars) renderer.render(scene, camera);
		if (showStars && current) renderer.render(meteorScene, overlayCamera);
	}

	function loop(now: number) {
		render(now);
		frame = requestAnimationFrame(loop);
	}

	function start() {
		if (running || reducedMotion) return;
		running = true;
		frame = requestAnimationFrame(loop);
	}

	function stop() {
		running = false;
		cancelAnimationFrame(frame);
	}

	function onVisibility() {
		if (document.hidden) stop();
		else start();
	}
	document.addEventListener("visibilitychange", onVisibility);

	if (reducedMotion) {
		render(performance.now());
		// Re-render a still frame on resize / theme change.
		resizeObserver.disconnect();
		new ResizeObserver(() => {
			resize();
			render(performance.now());
		}).observe(container);
	} else {
		start();
	}

	return {
		setTheme(theme) {
			light = theme === "light" ? 1 : 0;
			nebulaFrame = 0; // repaint the nebula with the new theme on the next frame
			renderer.setClearColor(BG[theme], 1);
			nebulaMaterial.uniforms.uLight.value = light;
			nebulaMaterial.uniforms.uBg.value = BG[theme].clone();
			starMaterial.uniforms.uLight.value = light;
			meteorMaterial.uniforms.uLight.value = light;
			const blending = light ? NormalBlending : AdditiveBlending;
			if (starMaterial.blending !== blending) {
				starMaterial.blending = blending;
				meteorMaterial.blending = blending;
				starMaterial.needsUpdate = true;
				meteorMaterial.needsUpdate = true;
			}
			if (reducedMotion) render(performance.now());
		},
		setTwinkle(on) {
			starMaterial.uniforms.uTwinkle.value = on ? 1 : 0;
			if (reducedMotion) render(performance.now());
		},
		setStars(on) {
			showStars = on;
			if (reducedMotion) render(performance.now());
		},
		destroy() {
			stop();
			resizeObserver.disconnect();
			window.removeEventListener("pointermove", onPointer);
			document.removeEventListener("visibilitychange", onVisibility);
			stars.geometry.dispose();
			starMaterial.dispose();
			nebula.geometry.dispose();
			nebulaTarget.dispose();
			copyQuad.geometry.dispose();
			copyMaterial.dispose();
			nebulaMaterial.dispose();
			meteor.geometry.dispose();
			meteorMaterial.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		},
	};
}
