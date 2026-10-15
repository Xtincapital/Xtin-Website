// The hero's 3D centrepiece: a glass "Xtin core" floating over a holographic
// platform, with the eight products as real 3D tiles on two tilted orbits and
// light streaming from each product into the core. Drag to spin, hover to
// focus, click to open.
//
// Loaded lazily (three.js only ships with this page). The product names are a
// DOM layer of real links positioned every frame from the 3D scene, so they
// stay crisp, keyboard-focusable and readable by screen readers.
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSE_COUNT, PRODUCTS, type ProductId } from '../lib/catalog';

const GREEN = new THREE.Color('#16A34A');
const GOLD = '#CDAA5F';

const ORBITS = [
  { radius: 1.8, tilt: new THREE.Euler(0.84, 0, 0.12), speed: 0.17, items: ['learn', 'tools', 'newsletter', 'gini'] as ProductId[] },
  { radius: 2.85, tilt: new THREE.Euler(0.94, 0, -0.14), speed: -0.115, items: ['fundakamental', 'backtest', 'algos', 'journal'] as ProductId[] },
];
const SATS = ORBITS.flatMap((o, oi) =>
  o.items.map((id, k) => ({ id, orbit: oi, phase: (k / o.items.length) * Math.PI * 2 + (oi ? Math.PI / 4 : 0) })),
);
const PER_SAT = 5; // light particles flowing from each product into the core
const CORE_R = 1.18;
const CAM_Y = 1.7;
const CAM_Z = 12.6;

interface Controls {
  px: number;
  py: number;
  spin: number;
  vel: number;
  down: boolean;
  lastX: number;
  moved: number;
  hovered: ProductId | null;
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

// A lucide icon drawn onto a canvas texture for the front of a tile.
function iconTexture(id: ProductId, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const svg = renderToStaticMarkup(createElement(PRODUCTS[id].Icon, { size: 256, color, strokeWidth: 1.7 }));
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 256, 256);
    ctx.drawImage(img, 20, 20, 216, 216);
    tex.needsUpdate = true;
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return tex;
}

const easeOutBack = (x: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* ── shaders ──────────────────────────────────────────────────────────── */

const RIM_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const RIM_FRAG = /* glsl */ `
  uniform vec3 color; uniform float power; uniform float intensity;
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(vN, vV)), power);
    gl_FragColor = vec4(color, clamp(f * intensity, 0.0, 1.0));
  }`;

const DOT_VERT = /* glsl */ `
  attribute float alpha; uniform float size; uniform float dpr; varying float vA;
  void main() {
    vA = alpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * dpr * (10.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const DOT_FRAG = /* glsl */ `
  uniform vec3 color; varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(color, a * a * vA);
  }`;

// The "platform": a fading grid with a ripple running outward.
const FLOOR_VERT = /* glsl */ `
  varying vec2 vP;
  void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FLOOR_FRAG = /* glsl */ `
  uniform vec3 color; uniform float opacity; uniform float time;
  varying vec2 vP;
  void main() {
    float r = length(vP) / 4.6;
    vec2 q = vP * 1.6;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);
    float rings = 1.0 - min(abs(fract(r * 5.0) - 0.5) / fwidth(r * 5.0), 1.0);
    float wave = smoothstep(0.035, 0.0, abs(r - fract(time * 0.22))) * (1.0 - r);
    float glow = smoothstep(0.5, 0.0, r) * 0.22;
    float fade = smoothstep(1.0, 0.15, r);
    float a = (grid * 0.5 + rings * 0.14 * smoothstep(0.18, 0.4, r) + wave * 1.2) * fade + glow;
    gl_FragColor = vec4(color, a * opacity);
  }`;

/* ── scene ────────────────────────────────────────────────────────────── */

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Scene({
  dark,
  ctl,
  labels,
  onHover,
  onOpen,
}: {
  dark: boolean;
  ctl: MutableRefObject<Controls>;
  labels: MutableRefObject<Partial<Record<ProductId, HTMLElement | null>>>;
  onHover: (id: ProductId | null) => void;
  onOpen: (id: ProductId) => void;
}) {
  const { camera, size, gl } = useThree();
  const sats = useRef<(THREE.Group | null)[]>([]);
  const core = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Points>(null);
  const clock = useRef({ orbit: 0, timeScale: 1, scales: SATS.map(() => 1) });

  // geometry + materials (rebuilt only when the theme flips)
  const tileGeo = useMemo(() => new RoundedBoxGeometry(0.9, 0.9, 0.28, 4, 0.19), []);
  const iconGeo = useMemo(() => new THREE.PlaneGeometry(0.56, 0.56), []);
  const icons = useMemo(() => {
    const out = {} as Record<ProductId, { green: THREE.Texture; white: THREE.Texture }>;
    SATS.forEach((s) => (out[s.id] = { green: iconTexture(s.id, '#16A34A'), white: iconTexture(s.id, '#FFFFFF') }));
    return out;
  }, []);
  const base = useMemo(() => new THREE.Color(dark ? '#26272b' : '#ffffff'), [dark]);
  const tileMats = useMemo(
    () =>
      SATS.map(
        () =>
          new THREE.MeshPhysicalMaterial({
            color: base.clone(),
            roughness: dark ? 0.32 : 0.22,
            metalness: 0.05,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
            envMapIntensity: dark ? 0.7 : 1.1,
          }),
      ),
    [base, dark],
  );
  const iconMats = useMemo(() => SATS.map((s) => new THREE.MeshBasicMaterial({ map: icons[s.id].green, transparent: true, alphaTest: 0.04, toneMapped: false })), [icons]);

  const rimMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { color: { value: GREEN }, power: { value: 2.4 }, intensity: { value: dark ? 1.6 : 1.1 } },
        vertexShader: RIM_VERT,
        fragmentShader: RIM_FRAG,
        transparent: true,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [dark],
  );
  const floorMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { color: { value: GREEN }, opacity: { value: dark ? 0.55 : 0.42 }, time: { value: 0 } },
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [dark],
  );
  const dotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { color: { value: GREEN }, size: { value: 9 }, dpr: { value: gl.getPixelRatio() } },
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [dark, gl],
  );
  const dustMat = useMemo(() => {
    const m = dotMat.clone();
    m.uniforms.size.value = 3.2;
    return m;
  }, [dotMat]);

  // flowing particles
  const flow = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SATS.length * PER_SAT * 3), 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(SATS.length * PER_SAT), 1));
    return g;
  }, []);
  // ambient stardust in a shell around the scene
  const dustGeo = useMemo(() => {
    const n = 320;
    const pos = new Float32Array(n * 3);
    const alpha = new Float32Array(n);
    let s = 42;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < n; i++) {
      const r = 3.6 + rnd() * 2.6;
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th)], i * 3);
      alpha[i] = 0.15 + rnd() * 0.55;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
    return g;
  }, []);

  useEffect(
    () => () => {
      tileGeo.dispose();
      iconGeo.dispose();
      flow.dispose();
      dustGeo.dispose();
      Object.values(icons).forEach((t) => {
        t.green.dispose();
        t.white.dispose();
      });
    },
    [tileGeo, iconGeo, flow, dustGeo, icons],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lab = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const view = useMemo(() => new THREE.Vector3(), []);
  const coreScreen = useMemo(() => new THREE.Vector3(), []);

  // Theme switches rebuild these; free the old ones.
  useEffect(() => () => tileMats.forEach((m) => m.dispose()), [tileMats]);
  useEffect(() => () => iconMats.forEach((m) => m.dispose()), [iconMats]);
  useEffect(() => () => [rimMat, floorMat, dotMat, dustMat].forEach((m) => m.dispose()), [rimMat, floorMat, dotMat, dustMat]);
  const satPos = useMemo(() => SATS.map(() => new THREE.Vector3()), []);

  useFrame((state, delta) => {
    const c = ctl.current;
    const k = clock.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const intro = easeOutBack(Math.min(1, t / 1.8));
    // frame-rate independent easing: the same feel at 30 Hz and 120 Hz
    const ease = (rate: number) => 1 - Math.exp(-rate * dt);

    // slow right down while a product is hovered so it is easy to click
    k.timeScale += ((c.hovered ? 0.06 : 1) - k.timeScale) * ease(5);
    k.orbit += dt * k.timeScale;
    if (!c.down) c.vel *= Math.exp(-3.6 * dt);
    c.spin += c.vel;

    // camera drifts toward the pointer
    camera.position.x += (c.px * 1.2 - camera.position.x) * ease(2.6);
    camera.position.y += (CAM_Y - c.py * 0.9 - camera.position.y) * ease(2.6);
    camera.lookAt(0, -0.2, 0);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);

    // core
    if (core.current) {
      core.current.position.y = Math.sin(t * 0.8) * 0.08;
      core.current.scale.setScalar(0.6 + 0.4 * intro);
    }
    if (inner.current) {
      inner.current.rotation.y += dt * 0.5;
      inner.current.rotation.x += dt * 0.22;
      const m = inner.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity += ((c.hovered ? 1.5 : 0.55 + Math.sin(t * 2) * 0.12) - m.emissiveIntensity) * ease(6);
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.18;
      shell.current.rotation.z += dt * 0.07;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.35;
    if (ringB.current) ringB.current.rotation.z -= dt * 0.22;
    if (dust.current) dust.current.rotation.y += dt * 0.025;
    floorMat.uniforms.time.value = t;

    // satellites + their labels
    const camDist = camera.position.length();
    const halfH = Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * camDist;
    const coreRpx = (CORE_R / halfH) * (size.height / 2);
    coreScreen.set(0, core.current?.position.y || 0, 0).project(camera);
    const cx = (coreScreen.x * 0.5 + 0.5) * size.width;
    const cy = (-coreScreen.y * 0.5 + 0.5) * size.height;
    SATS.forEach((s, i) => {
      const g = sats.current[i];
      if (!g) return;
      const o = ORBITS[s.orbit];
      const a = s.phase + k.orbit * o.speed + c.spin * Math.sign(o.speed);
      const r = o.radius * (0.25 + 0.75 * intro);
      tmp.set(Math.cos(a) * r, Math.sin(a) * r, 0).applyEuler(o.tilt);
      g.position.copy(tmp);
      satPos[i].copy(tmp);

      // face the camera, with a gentle wobble so the tile edges catch the light
      g.quaternion.copy(camera.quaternion);
      g.rotateY(Math.sin(t * 0.7 + i) * 0.38);
      g.rotateX(Math.cos(t * 0.55 + i * 1.3) * 0.2);

      const hov = c.hovered === s.id;
      k.scales[i] += ((hov ? 1.28 : 1) - k.scales[i]) * ease(9);
      g.scale.setScalar(k.scales[i] * Math.min(1, 0.2 + intro));
      tileMats[i].color.lerp(hov ? GREEN : base, ease(10));
      iconMats[i].map = hov ? icons[s.id].white : icons[s.id].green;

      // DOM label just under the tile
      const el = labels.current[s.id];
      if (el) {
        lab.copy(tmp).addScaledVector(up, -0.68 * k.scales[i]);
        view.copy(tmp).applyMatrix4(camera.matrixWorldInverse);
        const dist = -view.z;
        const depth = THREE.MathUtils.clamp((camDist + 3.2 - dist) / 6.4, 0, 1); // 1 = nearest
        lab.project(camera);
        const x = (lab.x * 0.5 + 0.5) * size.width;
        const y = (-lab.y * 0.5 + 0.5) * size.height;
        const behindCore = dist > camDist && Math.hypot(x - cx, y - cy) < coreRpx * 1.1;
        // Names only on the front half; back tiles keep just their icon
        // until hovered or focused, so labels never pile up.
        const op = hov ? 1 : behindCore ? 0 : THREE.MathUtils.clamp((depth - 0.42) / 0.22, 0, 1);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateX(-50%) scale(${(0.86 + 0.18 * depth).toFixed(3)})`;
        el.style.opacity = (op * Math.min(1, t / 1.2)).toFixed(3);
        el.style.zIndex = String(hov ? 200 : Math.round(depth * 100));
        el.style.pointerEvents = op < 0.25 ? 'none' : 'auto';
      }
    });

    // light flowing inward along each spoke
    const pos = flow.getAttribute('position') as THREE.BufferAttribute;
    const alpha = flow.getAttribute('alpha') as THREE.BufferAttribute;
    SATS.forEach((s, i) => {
      const hov = c.hovered === s.id;
      for (let j = 0; j < PER_SAT; j++) {
        const f = (t * (hov ? 0.7 : 0.32) + j / PER_SAT + i * 0.137) % 1;
        const e = f * f;
        const idx = i * PER_SAT + j;
        pos.setXYZ(idx, satPos[i].x * (1 - e), satPos[i].y * (1 - e) + (core.current?.position.y || 0) * e, satPos[i].z * (1 - e));
        alpha.setX(idx, Math.sin(f * Math.PI) * (hov ? 1 : c.hovered ? 0.25 : 0.75) * intro);
      }
    });
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  });

  return (
    <>
      <Environment />
      <ambientLight intensity={dark ? 0.35 : 0.7} />
      <directionalLight position={[4, 6, 5]} intensity={dark ? 1.2 : 1.6} />
      <directionalLight position={[-5, -2, -4]} intensity={0.4} color="#bbf7d0" />

      {/* the platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.35, 0]} material={floorMat} renderOrder={-1}>
        <planeGeometry args={[9.2, 9.2]} />
      </mesh>

      {/* orbit paths */}
      {ORBITS.map((o) => (
        <mesh key={o.radius} rotation={o.tilt}>
          <torusGeometry args={[o.radius, 0.0085, 8, 240]} />
          <meshBasicMaterial color={GREEN} transparent opacity={dark ? 0.45 : 0.35} toneMapped={false} />
        </mesh>
      ))}

      {/* the core */}
      <group ref={core}>
        <pointLight color={GREEN} intensity={dark ? 9 : 5} distance={7} decay={2} />
        <mesh ref={inner}>
          <icosahedronGeometry args={[0.56, 0]} />
          <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.6} roughness={0.3} metalness={0.25} flatShading />
        </mesh>
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.9, 1]} />
          <meshBasicMaterial color={GREEN} wireframe transparent opacity={dark ? 0.45 : 0.32} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[CORE_R, 64, 64]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={dark ? 0.1 : 0.16} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={dark ? 1.6 : 2.2} depthWrite={false} />
        </mesh>
        <mesh scale={1.02} material={rimMat}>
          <sphereGeometry args={[CORE_R, 48, 48]} />
        </mesh>
        <group rotation={[1.15, 0.35, 0]}>
          <mesh ref={ringA}>
            <torusGeometry args={[1.5, 0.034, 20, 180]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} envMapIntensity={1.4} />
          </mesh>
        </group>
        <group rotation={[0.35, -0.9, 0.4]}>
          <mesh ref={ringB}>
            <torusGeometry args={[1.72, 0.012, 12, 200]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} envMapIntensity={1.2} />
          </mesh>
        </group>
      </group>

      {/* product tiles */}
      {SATS.map((s, i) => (
        <group
          key={s.id}
          ref={(g) => (sats.current[i] = g)}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(s.id);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            if (ctl.current.moved < 6) onOpen(s.id);
          }}
        >
          <mesh geometry={tileGeo} material={tileMats[i]} />
          <mesh geometry={iconGeo} material={iconMats[i]} position={[0, 0, 0.145]} />
        </group>
      ))}

      <points geometry={flow} material={dotMat} />
      <points ref={dust} geometry={dustGeo} material={dustMat} />
    </>
  );
}

/* ── component ────────────────────────────────────────────────────────── */

export default function EcosystemCore3D() {
  const navigate = useNavigate();
  const dark = useIsDark();
  const wrap = useRef<HTMLDivElement>(null);
  const labels = useRef<Partial<Record<ProductId, HTMLElement | null>>>({});
  const ctl = useRef<Controls>({ px: 0, py: 0, spin: 0, vel: 0, down: false, lastX: 0, moved: 0, hovered: null });
  const [hovered, setHovered] = useState<ProductId | null>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  const hover = (id: ProductId | null) => {
    ctl.current.hovered = id;
    setHovered(id);
    if (wrap.current) wrap.current.style.cursor = id ? 'pointer' : ctl.current.down ? 'grabbing' : 'grab';
  };

  // Stop rendering while scrolled out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const c = ctl.current;
    c.px = (e.clientX - r.left) / r.width - 0.5;
    c.py = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty('--px', c.px.toFixed(3));
    e.currentTarget.style.setProperty('--py', c.py.toFixed(3));
    if (c.down) {
      const dx = e.clientX - c.lastX;
      c.lastX = e.clientX;
      c.moved += Math.abs(dx);
      c.vel = dx * 0.0045;
    }
  };

  const active = hovered ? PRODUCTS[hovered] : null;

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-square w-full max-w-[600px] cursor-grab select-none [touch-action:pan-y]"
      onPointerMove={onPointerMove}
      onPointerDown={(e) => {
        ctl.current.down = true;
        ctl.current.lastX = e.clientX;
        ctl.current.moved = 0;
        if (!ctl.current.hovered && wrap.current) wrap.current.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        ctl.current.down = false;
        if (!ctl.current.hovered && wrap.current) wrap.current.style.cursor = 'grab';
      }}
      onPointerLeave={() => {
        ctl.current.down = false;
        ctl.current.px = 0;
        ctl.current.py = 0;
      }}
    >
      {/* soft glow behind the scene so the first paint is never empty */}
      <div aria-hidden="true" className="absolute inset-[18%] rounded-full bg-[var(--xp-glow-strong)] blur-3xl" />

      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8 }}>
        <Canvas
          aria-hidden="true"
          dpr={[1, 1.75]}
          camera={{ position: [0, CAM_Y, CAM_Z], fov: 33 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          frameloop={visible ? 'always' : 'never'}
          onCreated={() => setReady(true)}
        >
          <Scene dark={dark} ctl={ctl} labels={labels} onHover={hover} onOpen={(id) => navigate(PRODUCTS[id].path)} />
        </Canvas>
      </motion.div>

      {/* product names: real links, moved every frame by the scene */}
      <div className="pointer-events-none absolute inset-0">
        {Object.values(PRODUCTS).map((p) => (
          <Link
            key={p.id}
            ref={(el) => (labels.current[p.id] = el)}
            to={p.path}
            onPointerEnter={() => hover(p.id)}
            onPointerLeave={() => hover(null)}
            onFocus={() => hover(p.id)}
            onBlur={() => hover(null)}
            aria-label={`${p.name}: ${p.tagline}`}
            className={cn(
              'absolute left-0 top-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold opacity-0 shadow-sm outline-none backdrop-blur transition-colors duration-200 will-change-transform',
              'focus-visible:ring-4 focus-visible:ring-brand/30',
              hovered === p.id ? 'border-brand-fill bg-brand-fill text-white' : 'border-border bg-card/85 text-foreground',
            )}
            style={{ transform: 'translate3d(-999px, -999px, 0)' }}
          >
            {p.name}
          </Link>
        ))}
      </div>

      {/* floating facts, nudged by the pointer for depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <FactChip className="-left-2 top-[2%]" depth={18} value="8" label="products" />
        <FactChip className="-right-2 top-[8%]" depth={26} value="20+" label="calculators" />
        <FactChip className="-right-1 bottom-[4%]" depth={14} value={String(COURSE_COUNT)} label="courses" />
      </div>

      {/* what you are pointing at */}
      <div className="pointer-events-none absolute bottom-[3%] left-0" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="xp-node w-[15.5rem] rounded-2xl border border-brand-line p-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-fill text-white">
                  <active.Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-foreground">{active.name}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 text-brand" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{active.tagline}</p>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur"
            >
              <MousePointer2 className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              Drag to spin · click a product to open
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FactChip({ className, depth, value, label }: { className: string; depth: number; value: string; label: string }) {
  return (
    <div
      className={cn('xp-node absolute flex items-baseline gap-1.5 rounded-xl border border-border px-3 py-2 transition-transform duration-500 ease-out', className)}
      style={{ transform: `translate(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth}px))` }}
    >
      <span className="text-lg font-bold tabular-nums text-brand">{value}</span>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
