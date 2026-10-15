// Hero centrepiece: hundreds of gold coins that assemble into the goal you are
// saving for (a home, a graduation cap, a car…). Pick another goal and the
// coins burst apart and rebuild it. Coins scatter around the cursor, a glint
// sweeps across the gold, and you can drag to turn the shape.
//
// Shapes are sampled from the same lucide icons the UI uses, so any goal with
// an icon can become a coin sculpture. Loaded lazily with three.js.
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { MutableRefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { LucideIcon } from 'lucide-react';
import { Hand } from 'lucide-react';
import { GOALS, type GoalId } from '../lib/goals';

const SCALE = 0.25; // lucide's 24-unit box → ~6 world units
const COIN_R = 0.12;
const COIN_H = 0.03;
const GREEN = new THREE.Color('#16A34A');

interface Pointer {
  ndc: THREE.Vector2 | null;
  down: boolean;
  lastX: number;
  drag: number; // y-rotation added by dragging
  dragVel: number;
  px: number;
  py: number;
}

/* ── shape sampling ───────────────────────────────────────────────────── */

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

// Evenly spaced points along every stroke of a lucide icon, two coins wide.
function sampleIcon(icon: LucideIcon, count: number, seed: number) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:24px;height:24px;opacity:0;pointer-events:none';
  host.innerHTML = renderToStaticMarkup(createElement(icon, { size: 24 }));
  document.body.appendChild(host);
  const els = Array.from(host.querySelectorAll<SVGGeometryElement>('path, circle, rect, line, polyline, polygon, ellipse'));
  const lens = els.map((e) => e.getTotalLength());
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  const out = new Float32Array(count * 3);
  const r = rng(seed);
  const pairs = Math.ceil(count / 2);
  for (let i = 0; i < pairs; i++) {
    let d = ((i + 0.5) / pairs) * total;
    let k = 0;
    while (k < els.length - 1 && d > lens[k]) {
      d -= lens[k];
      k++;
    }
    const el = els[k];
    const p = el.getPointAtLength(Math.min(d, lens[k]));
    const q = el.getPointAtLength(Math.min(lens[k], d + 0.2));
    let tx = q.x - p.x;
    let ty = q.y - p.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    for (let s = 0; s < 2; s++) {
      const idx = i * 2 + s;
      if (idx >= count) break;
      const off = (s ? 1 : -1) * 0.3 + (r() - 0.5) * 0.14;
      out[idx * 3] = (p.x - ty * off - 12) * SCALE;
      out[idx * 3 + 1] = -(p.y + tx * off - 12) * SCALE;
      out[idx * 3 + 2] = (s ? 1 : -1) * 0.1 + (r() - 0.5) * 0.12;
    }
  }
  host.remove();
  return out;
}

/* ── textures ─────────────────────────────────────────────────────────── */

// Coin face: near-white with a darker ring and currency mark, so it tints
// gold through the material colour and doubles as a bump map.
function faceTexture(symbol: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(110, 100, 10, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#e4e4e4');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#c9c9c9';
  g.lineWidth = 12;
  g.beginPath();
  g.arc(128, 128, 112, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 3;
  g.beginPath();
  g.arc(128, 128, 94, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#bdbdbd';
  g.font = '700 128px "Plus Jakarta Sans", "Inter Tight", system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(symbol, 128, 136);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Reeded edge.
function edgeTexture() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 2;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 8, 2);
  g.fillStyle = '#bcbcbc';
  g.fillRect(0, 0, 3, 2);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(36, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ── scene ────────────────────────────────────────────────────────────── */

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.03);
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

const DUST_VERT = /* glsl */ `
  attribute float alpha; uniform float dpr; varying float vA;
  void main() {
    vA = alpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 3.0 * dpr * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const DUST_FRAG = /* glsl */ `
  uniform vec3 color; varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(color, smoothstep(0.5, 0.0, d) * vA);
  }`;

function Coins({ goal, count, dark, symbol, pointer }: { goal: GoalId; count: number; dark: boolean; symbol: string; pointer: MutableRefObject<Pointer> }) {
  const { camera, gl } = useThree();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);

  // every goal's target positions, sampled once
  const shapes = useMemo(() => {
    const out = {} as Record<GoalId, Float32Array>;
    GOALS.forEach((g, i) => (out[g.id] = sampleIcon(g.Icon, count, 11 + i * 7)));
    return out;
  }, [count]);

  // per-coin simulation state
  const sim = useMemo(() => {
    const r = rng(5);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // start as a wide swirl around the frame so the first build is a show
      const a = r() * Math.PI * 2;
      const d = 5 + r() * 4;
      pos.set([Math.cos(a) * d, Math.sin(a) * d * 0.7, (r() - 0.5) * 4], i * 3);
      vel.set([-Math.sin(a) * 4, Math.cos(a) * 4, 0], i * 3);
    }
    const order = Array.from({ length: count }, (_, i) => i).sort(() => r() - 0.5);
    return {
      pos,
      vel,
      target: new Float32Array(count * 3),
      delay: Float32Array.from({ length: count }, () => r() * 0.5),
      stiff: Float32Array.from({ length: count }, () => 16 + r() * 16),
      phase: Float32Array.from({ length: count }, () => r() * Math.PI * 2),
      tilt: Float32Array.from({ length: count }, () => (r() - 0.5) * 0.5),
      spin: new Float32Array(count),
      order,
      changedAt: 0,
      clock: 0,
    };
  }, [count]);

  // materials (rebuilt on theme / currency change)
  const textures = useMemo(() => ({ face: faceTexture(symbol), edge: edgeTexture(), shadow: shadowTexture() }), [symbol]);
  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#DDB861', metalness: 1, roughness: 0.32, map: textures.edge, envMapIntensity: dark ? 1.15 : 1.6 });
    const face = new THREE.MeshStandardMaterial({
      color: '#F2D27A',
      metalness: 1,
      roughness: 0.26,
      map: textures.face,
      bumpMap: textures.face,
      bumpScale: 1.4,
      envMapIntensity: dark ? 1.25 : 1.75,
    });
    return [side, face, face];
  }, [textures, dark]);
  const geometry = useMemo(() => new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_H, 28, 1), []);
  const dustMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color('#E2C273') }, dpr: { value: gl.getPixelRatio() } },
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [dark, gl],
  );
  const dustGeo = useMemo(() => {
    const n = 90;
    const r = rng(77);
    const p = new Float32Array(n * 3);
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      p.set([(r() - 0.5) * 9, (r() - 0.5) * 7, (r() - 0.5) * 3 - 1], i * 3);
      a[i] = 0.2 + r() * 0.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(a, 1));
    return g;
  }, []);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures]);
  useEffect(() => () => dustMat.dispose(), [dustMat]);
  useEffect(
    () => () => {
      geometry.dispose();
      dustGeo.dispose();
    },
    [geometry, dustGeo],
  );

  // a few shades of gold so the pile reads as real metal, not a flat fill
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const r = rng(9);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const v = 0.86 + r() * 0.2;
      c.setRGB(v, v * (0.97 + r() * 0.04), v * (0.9 + r() * 0.1));
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);

  // new goal: burst outward, then rebuild
  useEffect(() => {
    const shape = shapes[goal];
    const r = rng(goal.length * 31 + 7);
    for (let i = 0; i < count; i++) {
      const j = sim.order[i];
      sim.target[i * 3] = shape[j * 3];
      sim.target[i * 3 + 1] = shape[j * 3 + 1];
      sim.target[i * 3 + 2] = shape[j * 3 + 2];
      if (sim.clock > 0.5) {
        const x = sim.pos[i * 3];
        const y = sim.pos[i * 3 + 1];
        const d = Math.hypot(x, y) || 1;
        const burst = 2.5 + r() * 3.5;
        const swirl = 2 + r() * 2.5;
        sim.vel[i * 3] += (x / d) * burst - (y / d) * swirl;
        sim.vel[i * 3 + 1] += (y / d) * burst + (x / d) * swirl;
        sim.vel[i * 3 + 2] += (r() - 0.5) * 5;
      }
      sim.delay[i] = r() * 0.55;
    }
    sim.changedAt = sim.clock;
  }, [goal, shapes, sim, count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);
  const localRay = useMemo(() => new THREE.Ray(), []);

  useFrame((state, delta) => {
    const m = mesh.current;
    const gr = group.current;
    if (!m || !gr) return;
    const dt = Math.min(delta, 1 / 30);
    sim.clock += dt;
    const t = state.clock.elapsedTime;
    const p = pointer.current;

    // turn: gentle sway + drag (springs back to facing you)
    if (!p.down) {
      p.drag += p.dragVel;
      p.dragVel *= Math.exp(-4 * dt);
      p.drag *= Math.exp(-0.9 * dt);
    }
    gr.rotation.y = Math.sin(t * 0.35) * 0.22 + p.drag;
    gr.rotation.x += (p.py * 0.18 - gr.rotation.x) * (1 - Math.exp(-3 * dt));
    gr.position.y = Math.sin(t * 0.8) * 0.06;

    // cursor in the shape's own plane
    let mx = 1e9;
    let my = 1e9;
    if (p.ndc) {
      ray.setFromCamera(p.ndc, camera);
      gr.updateMatrixWorld();
      inv.copy(gr.matrixWorld).invert();
      localRay.copy(ray.ray).applyMatrix4(inv);
      if (localRay.intersectPlane(plane, hit)) {
        mx = hit.x;
        my = hit.y;
      }
    }

    const since = sim.clock - sim.changedAt;
    const sweep = -5 + ((t % 5) / 5) * 11; // glint running left → right
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      let x = sim.pos[ix];
      let y = sim.pos[ix + 1];
      let z = sim.pos[ix + 2];
      let vx = sim.vel[ix];
      let vy = sim.vel[ix + 1];
      let vz = sim.vel[ix + 2];
      let ax: number;
      let ay: number;
      let az: number;
      if (since < sim.delay[i]) {
        // free flight with drag while the burst plays out
        ax = -vx * 1.4;
        ay = -vy * 1.4;
        az = -vz * 1.4;
      } else {
        const k = sim.stiff[i];
        const c = 2 * Math.sqrt(k) * 0.5; // under-damped: a little bounce on arrival
        const bob = Math.sin(t * 1.6 + sim.phase[i]) * 0.025;
        ax = k * (sim.target[ix] - x) - c * vx;
        ay = k * (sim.target[ix + 1] + bob - y) - c * vy;
        az = k * (sim.target[ix + 2] - z) - c * vz;
      }
      // scatter around the cursor
      const dx = x - mx;
      const dy = y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.9) {
        const d = Math.sqrt(d2) || 0.001;
        const f = (0.95 - d) * 55;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
        az += f * 0.35;
      }
      vx += ax * dt;
      vy += ay * dt;
      vz += az * dt;
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      sim.pos[ix] = x;
      sim.pos[ix + 1] = y;
      sim.pos[ix + 2] = z;
      sim.vel[ix] = vx;
      sim.vel[ix + 1] = vy;
      sim.vel[ix + 2] = vz;

      // tumble while moving, settle face-on when still
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      let spin = sim.spin[i] + speed * dt * 2.2;
      if (speed < 0.6) spin += (Math.round(spin / Math.PI) * Math.PI - spin) * (1 - Math.exp(-5 * dt));
      sim.spin[i] = spin;

      const glint = Math.exp(-((x - sweep) * (x - sweep)) / 0.6) * 0.9;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.PI / 2 + sim.tilt[i] * 0.4 + spin, Math.sin(t * 1.2 + sim.phase[i]) * 0.32 + glint + sim.tilt[i], 0, 'YXZ');
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    if (dust.current) {
      dust.current.rotation.y = t * 0.03;
      dust.current.position.y = Math.sin(t * 0.3) * 0.15;
    }
  });

  return (
    <>
      <group ref={group}>
        <instancedMesh ref={mesh} args={[geometry, materials, count]} frustumCulled={false} />
      </group>
      <mesh position={[0, -3.35, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 2.6]} />
        <meshBasicMaterial map={textures.shadow} transparent opacity={dark ? 0.5 : 0.22} depthWrite={false} />
      </mesh>
      <points ref={dust} geometry={dustGeo} material={dustMat} />
    </>
  );
}

/* ── component ────────────────────────────────────────────────────────── */

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export default function MoneyShapes3D({
  goal,
  symbol,
  compact,
  onActive,
  tag,
}: {
  goal: GoalId;
  symbol: string;
  compact: boolean;
  onActive?: (active: boolean) => void;
  tag: { amount: string; when: string };
}) {
  const dark = useIsDark();
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ ndc: null, down: false, lastX: 0, drag: 0, dragVel: 0, px: 0, py: 0 });
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = pointer.current;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    p.ndc = (p.ndc || new THREE.Vector2()).set(nx * 2 - 1, -(ny * 2 - 1));
    p.px = nx - 0.5;
    p.py = ny - 0.5;
    if (p.down) {
      const dx = e.clientX - p.lastX;
      p.lastX = e.clientX;
      p.drag += dx * 0.008;
      p.dragVel = dx * 0.004;
    }
  };

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-square w-full max-w-[600px] cursor-grab select-none [touch-action:pan-y] active:cursor-grabbing"
      onPointerMove={move}
      onPointerEnter={() => onActive?.(true)}
      onPointerDown={(e) => {
        pointer.current.down = true;
        pointer.current.lastX = e.clientX;
      }}
      onPointerUp={() => (pointer.current.down = false)}
      onPointerLeave={() => {
        const p = pointer.current;
        p.down = false;
        p.ndc = null;
        p.px = 0;
        p.py = 0;
        onActive?.(false);
      }}
    >
      {/* warm glow so the first paint is never empty */}
      <div aria-hidden="true" className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgba(226,194,115,0.35),rgba(22,163,74,0.12)_55%,transparent_72%)] blur-2xl" />
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        <Canvas
          aria-hidden="true"
          dpr={compact ? [1, 1.5] : [1, 1.75]}
          camera={{ position: [0, 0, 13], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          frameloop={visible ? 'always' : 'never'}
          onCreated={() => setReady(true)}
        >
          <Environment />
          <ambientLight intensity={dark ? 0.25 : 0.5} />
          <hemisphereLight args={['#fffaf0', '#c9a24a', dark ? 0.35 : 0.7]} />
          <directionalLight position={[3, 5, 6]} intensity={dark ? 2.2 : 2.6} color="#fff3d6" />
          <directionalLight position={[-6, -2, 3]} intensity={0.6} color="#ffe2a8" />
          <pointLight position={[0, 1.5, -3.5]} color={GREEN} intensity={dark ? 60 : 35} distance={14} decay={2} />
          <Coins goal={goal} count={compact ? 360 : 620} dark={dark} symbol={symbol} pointer={pointer} />
        </Canvas>
      </div>
      {/* a price tag on the sculpture, after it has built */}
      <div className="pointer-events-none absolute right-[4%] top-[7%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={goal + tag.amount + tag.when}
            initial={{ opacity: 0, y: 10, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2, transition: { delay: 0.9, type: 'spring', stiffness: 260, damping: 18 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className="xp-node rounded-2xl border border-[rgba(205,170,95,0.45)] px-4 py-2.5 text-right"
          >
            <div className="bg-[linear-gradient(135deg,#B8923F,#E2C273_45%,#9A7634)] bg-clip-text text-2xl font-bold tracking-[-0.02em] text-transparent">{tag.amount}</div>
            <div className="text-xs font-semibold text-muted-foreground">{tag.when}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute bottom-[2%] left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur md:inline-flex">
        <Hand className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
        Run your cursor through the coins · drag to turn
      </div>
    </div>
  );
}
