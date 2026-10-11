import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

// Vanilla port of the React Bits "Galaxy" background (https://reactbits.dev/backgrounds/galaxy).
// Layered starfield shader with depth parallax, twinkle and pointer repulsion.

const vertexShader = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;


// Spiral galaxies (log-spiral arms + fbm dust, telescope-photo style) and
// satellites drifting across the sky. Drawn on top of the starfield.
const galaxyFragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uLightMode;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// p: screen space relative to galaxy center. size: radius. tilt: in-plane angle.
// incl: vertical squash for inclination. spin: arm rotation.
vec3 spiral(vec2 p, float size, float tilt, float incl, float spin, float arms, vec3 coreCol, vec3 armCol) {
  p = rot(tilt) * p;
  p.y *= incl;
  p /= size;
  float r = length(p);
  if (r > 2.2) return vec3(0.0);

  float a = atan(p.y, p.x);
  float phase = arms * (a - log(r + 0.02) * 1.9) + spin;
  float warp = fbm(p * 3.0 + spin * 0.1) * 2.2;
  float arm = pow(0.5 + 0.5 * cos(phase + warp), 1.8);

  float disk = exp(-r * 2.6);
  float gas = fbm(rot(spin * 0.15) * p * 2.5);
  float dust = smoothstep(0.5, 0.8, fbm(p * 6.0 - spin * 0.2)) * arm * disk;

  float core = exp(-r * 14.0) * 1.6 + exp(-r * 4.5) * 0.35;
  float clusters = pow(noise(rot(spin * 0.15) * p * 60.0), 20.0) * arm * disk * 2.5;

  vec3 col = armCol * arm * disk * (0.45 + gas) * 1.5;
  col += mix(armCol, coreCol, 0.7) * disk * 0.25;
  col += coreCol * core;
  col += vec3(0.75, 0.85, 1.0) * clusters;
  col *= 1.0 - dust * 0.45;
  col += armCol * exp(-r * 1.4) * 0.08;
  return max(col, 0.0) * smoothstep(2.2, 1.2, r);
}

vec3 satellite(vec2 uv, vec2 from, vec2 to, float period, float offset) {
  float k = fract(uTime / period + offset);
  vec2 dir = normalize(to - from);
  vec2 pos = mix(from, to, k);
  float fade = sin(k * 3.14159);

  // short faint trail behind the satellite
  vec2 tail = pos - dir * 0.05;
  vec2 pa = uv - tail;
  vec2 ba = pos - tail;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  float trail = smoothstep(0.0015, 0.0, length(pa - ba * h)) * h * 0.35;

  float d = length(uv - pos);
  float body = smoothstep(0.0035, 0.0, d);
  float blink = step(0.8, fract(uTime * 0.9 + offset * 7.0));
  float halo = exp(-d * 180.0) * blink;

  return (vec3(1.0) * (body + trail) + vec3(1.0, 0.35, 0.35) * halo) * fade;
}

void main() {
  vec2 uv = (vUv * uResolution.xy - 0.5 * uResolution.xy) / uResolution.y;
  vec2 parallax = (uMouse - 0.5) * 0.03;
  float t = uTime;

  vec3 col = vec3(0.0);

  // Main galaxy: upper right, drifts up with scroll
  float fit = clamp(uResolution.z, 0.5, 1.0);
  vec2 c1 = vec2(0.42 * uResolution.z * 0.62, 0.18 + uScroll * 0.12) + parallax * 1.5;
  if (uResolution.z < 1.0) c1 = vec2(0.16, -0.4 + uScroll * 0.12) + parallax;
  col += spiral(uv - c1, 0.4 * fit, 0.45, 2.1, t * 0.035, 2.0, vec3(1.0, 0.86, 0.68), vec3(0.45, 0.4, 1.0));

  // Distant galaxies
  vec2 c2 = vec2(-0.5 * uResolution.z * 0.62, 0.3 + uScroll * 0.06) + parallax * 0.6;
  col += spiral(uv - c2, 0.08, -0.8, 1.4, t * 0.05, 2.0, vec3(1.0, 0.92, 0.8), vec3(1.0, 0.35, 0.65)) * 0.8;
  vec2 c3 = vec2(-0.3 * uResolution.z * 0.62, -0.36 + uScroll * 0.04) + parallax * 0.4;
  col += spiral(uv - c3, 0.05, 1.2, 3.0, t * 0.06, 3.0, vec3(0.9, 0.97, 1.0), vec3(0.25, 0.8, 1.0)) * 0.7;

  // Satellites crossing the sky
  float w = uResolution.z * 0.5;
  col += satellite(uv, vec2(-w - 0.1, 0.42), vec2(w + 0.1, 0.05), 38.0, 0.0);
  col += satellite(uv, vec2(w + 0.1, -0.2), vec2(-w - 0.1, 0.46), 52.0, 0.45);
  col += satellite(uv, vec2(-w * 0.2, -0.6), vec2(w * 0.7, 0.6), 44.0, 0.75);

  float energy = max(max(col.r, col.g), col.b);
  if (uLightMode > 0.5) {
    gl_FragColor = vec4(col * 0.55, clamp(energy * 0.8, 0.0, 0.85));
  } else {
    gl_FragColor = vec4(col, clamp(energy, 0.0, 1.0));
  }
}
`;

export type Galaxy = {
	setTheme: (theme: "dark" | "light") => void;
	dispose: () => void;
};

const OPTIONS = {
	starSpeed: 0.5,
	density: 1.2,
	hueShift: 240,
	speed: 1,
	glowIntensity: 0.25,
	saturation: 0.6,
	repulsionStrength: 2,
	twinkleIntensity: 0.4,
	rotationSpeed: 0.03,
};

export function createGalaxy(container: HTMLElement): Galaxy {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: Math.min(window.devicePixelRatio, 1.5) });
	const gl = renderer.gl;
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0, 0, 0, 0);

	const program = new Program(gl, {
		vertex: vertexShader,
		fragment: fragmentShader,
		uniforms: {
			uTime: { value: 0 },
			uResolution: { value: new Color(1, 1, 1) },
			uFocal: { value: new Float32Array([0.5, 0.5]) },
			uRotation: { value: new Float32Array([1, 0]) },
			uStarSpeed: { value: OPTIONS.starSpeed },
			uDensity: { value: OPTIONS.density },
			uHueShift: { value: OPTIONS.hueShift },
			uSpeed: { value: OPTIONS.speed },
			uMouse: { value: new Float32Array([0.5, 0.5]) },
			uGlowIntensity: { value: OPTIONS.glowIntensity },
			uSaturation: { value: OPTIONS.saturation },
			uMouseRepulsion: { value: true },
			uTwinkleIntensity: { value: OPTIONS.twinkleIntensity },
			uRotationSpeed: { value: OPTIONS.rotationSpeed },
			uRepulsionStrength: { value: OPTIONS.repulsionStrength },
			uMouseActiveFactor: { value: 0 },
			uAutoCenterRepulsion: { value: 0 },
			uTransparent: { value: true },
			uLightMode: { value: 0 },
		},
	});
	const geometry = new Triangle(gl);
	const mesh = new Mesh(gl, { geometry, program });

	const galaxyProgram = new Program(gl, {
		vertex: vertexShader,
		fragment: galaxyFragment,
		transparent: true,
		depthTest: false,
		uniforms: {
			uTime: { value: 0 },
			uResolution: { value: new Color(1, 1, 1) },
			uMouse: program.uniforms.uMouse,
			uScroll: { value: 0 },
			uLightMode: { value: 0 },
		},
	});
	const galaxyMesh = new Mesh(gl, { geometry, program: galaxyProgram });
	function setBlend(theme: "dark" | "light") {
		// Additive glow on dark, regular alpha on light
		if (theme === "dark") galaxyProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
		else galaxyProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}
	setBlend("dark");

	function resize() {
		renderer.setSize(container.offsetWidth, container.offsetHeight);
		program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
		galaxyProgram.uniforms.uResolution.value = program.uniforms.uResolution.value;
	}
	window.addEventListener("resize", resize);
	resize();
	container.appendChild(gl.canvas);

	// The container ignores pointer events so content stays clickable; track on window.
	const target = { x: 0.5, y: 0.5, active: 0 };
	const smooth = { x: 0.5, y: 0.5, active: 0 };
	const onMove = (e: PointerEvent) => {
		target.x = e.clientX / window.innerWidth;
		target.y = 1 - e.clientY / window.innerHeight;
		target.active = 1;
	};
	const onLeave = () => (target.active = 0);
	window.addEventListener("pointermove", onMove, { passive: true });
	document.addEventListener("pointerleave", onLeave);

	let raf = 0;
	function update(t: number) {
		if (!reducedMotion) raf = requestAnimationFrame(update);
		program.uniforms.uTime.value = t * 0.001;
		program.uniforms.uStarSpeed.value = (t * 0.001 * OPTIONS.starSpeed) / 10;

		smooth.x += (target.x - smooth.x) * 0.05;
		smooth.y += (target.y - smooth.y) * 0.05;
		smooth.active += (target.active - smooth.active) * 0.05;
		program.uniforms.uMouse.value[0] = smooth.x;
		program.uniforms.uMouse.value[1] = smooth.y;
		program.uniforms.uMouseActiveFactor.value = smooth.active;

		galaxyProgram.uniforms.uTime.value = t * 0.001;
		galaxyProgram.uniforms.uScroll.value = Math.min(window.scrollY / window.innerHeight, 3);

		renderer.render({ scene: mesh });
		renderer.render({ scene: galaxyMesh, clear: false });
	}
	raf = requestAnimationFrame(update);

	const onVisibility = () => {
		cancelAnimationFrame(raf);
		if (!document.hidden && !reducedMotion) raf = requestAnimationFrame(update);
	};
	document.addEventListener("visibilitychange", onVisibility);

	return {
		setTheme(theme) {
			program.uniforms.uLightMode.value = theme === "light" ? 1 : 0;
			galaxyProgram.uniforms.uLightMode.value = theme === "light" ? 1 : 0;
			setBlend(theme);
			if (reducedMotion) requestAnimationFrame(update);
		},
		dispose() {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerleave", onLeave);
			document.removeEventListener("visibilitychange", onVisibility);
			gl.canvas.remove();
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
	};
}
