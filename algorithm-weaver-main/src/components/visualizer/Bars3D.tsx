import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import type { SortStep } from "@/lib/sorting";

interface Props {
  step: SortStep;
  maxValue: number;
}

const COLOR_DEFAULT = new THREE.Color("#7cc4ff");
const COLOR_COMPARING = new THREE.Color("#ff5470");
const COLOR_ACTIVE = new THREE.Color("#ffd166");
const COLOR_SORTED = new THREE.Color("#5ed6a8");

function getColor(state: string): THREE.Color {
  switch (state) {
    case "comparing":
      return COLOR_COMPARING;
    case "active":
      return COLOR_ACTIVE;
    case "sorted":
      return COLOR_SORTED;
    default:
      return COLOR_DEFAULT;
  }
}

interface BarProps {
  index: number;
  totalCount: number;
  value: number;
  maxValue: number;
  state: string;
  spacing: number;
}

function Bar({ index, totalCount, value, maxValue, state, spacing }: BarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const targetColor = useMemo(() => getColor(state), [state]);
  const isHighlighted = state === "comparing" || state === "active";
  const targetEmissive = isHighlighted ? 0.8 : state === "sorted" ? 0.4 : 0.05;
  const targetLift = state === "comparing" ? 0.35 : state === "active" ? 0.2 : 0;

  // Geometry size (constant width per bar; height scaled in useFrame)
  const barWidth = Math.max(0.18, Math.min(0.7, 8 / totalCount));
  const x = (index - (totalCount - 1) / 2) * spacing;
  const targetHeight = Math.max(0.12, (value / Math.max(1, maxValue)) * 5);

  useFrame((_, delta) => {
    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;

    const dampLambda = 15;
    m.scale.y = THREE.MathUtils.damp(m.scale.y, targetHeight, dampLambda, delta);
    m.position.y = m.scale.y / 2 + targetLift;

    if (textRef.current) {
      textRef.current.position.y = m.scale.y + targetLift + 0.3;
    }

    const t = 1 - Math.exp(-dampLambda * delta);
    mat.color.lerp(targetColor, t);
    mat.emissive.lerp(targetColor, t);
    mat.emissiveIntensity = THREE.MathUtils.damp(
      mat.emissiveIntensity,
      targetEmissive,
      dampLambda,
      delta
    );
  });

  return (
    <group position={[x, 0, 0]}>
      <RoundedBox
        ref={meshRef as any}
        args={[barWidth, 1, barWidth]}
        radius={Math.min(0.08, barWidth / 3)}
        smoothness={4}
        position={[0, targetHeight / 2 + targetLift, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={matRef}
          color={targetColor}
          emissive={targetColor}
          emissiveIntensity={0.05}
          metalness={0.15}
          roughness={0.15}
          transmission={0.4}
          thickness={1.5}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
      {totalCount <= 80 && (
        <Text
          ref={textRef}
          position={[0, targetHeight + targetLift + 0.3, 0]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {value}
        </Text>
      )}
    </group>
  );
}

function Scene({ step, maxValue }: Props) {
  const { array, indices, sorted, type } = step;
  const sortedSet = useMemo(() => new Set(sorted), [sorted]);
  const activeSet = useMemo(() => new Set(indices), [indices]);
  const total = array.length;
  const spacing = Math.max(0.32, Math.min(0.95, 11 / total));

  const getState = (i: number) => {
    if (sortedSet.has(i)) return "sorted";
    if (activeSet.has(i)) {
      if (type === "swap" || type === "overwrite") return "active";
      return "comparing";
    }
    return "default";
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={42} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.2}
        color="#c9b6ff"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-6, 6, -4]} intensity={0.5} color="#7ad7ff" />
      <pointLight position={[0, 6, 4]} intensity={0.6} color="#a78bfa" />

      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#1a1530"
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.55}
        scale={20}
        blur={2.4}
        far={6}
        color="#000000"
        resolution={256}
      />
      <Environment preset="city" resolution={256} />

      {array.map((value, i) => (
        <Bar
          key={i}
          index={i}
          totalCount={total}
          value={value}
          maxValue={maxValue}
          state={getState(i)}
          spacing={spacing}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.2, 0]}
      />
    </>
  );
}

export default function Bars3D({ step, maxValue }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Scene step={step} maxValue={maxValue} />
      </Suspense>
    </Canvas>
  );
}