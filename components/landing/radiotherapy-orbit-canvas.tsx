"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Particle = {
  angle: number;
  lift: number;
  phase: number;
  radius: number;
  speed: number;
};

type Palette = {
  accent: string;
  primary: string;
  textSoft: string;
};

function seededValue(index: number, offset: number) {
  const value = Math.sin(index * 127.1 + offset * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function readPalette() {
  const styles = window.getComputedStyle(document.documentElement);
  const readToken = (token: string) => styles.getPropertyValue(token).trim() || styles.color;

  return {
    accent: readToken("--color-accent"),
    primary: readToken("--color-primary"),
    textSoft: readToken("--color-text-soft")
  } satisfies Palette;
}

function createArcGeometry(radiusX: number, radiusY: number, start: number, length: number) {
  const points: THREE.Vector3[] = [];
  const totalPoints = 128;

  for (let index = 0; index < totalPoints; index += 1) {
    const progress = index / (totalPoints - 1);
    const angle = start + length * progress;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY,
        Math.sin(angle * 2) * 0.08
      )
    );
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

function updateParticlePositions(
  particles: Particle[],
  positions: Float32Array,
  elapsedTime: number
) {
  particles.forEach((particle, index) => {
    const angle = particle.angle + elapsedTime * particle.speed;
    const radius = particle.radius + Math.sin(elapsedTime * 0.34 + particle.phase) * 0.06;
    const stride = index * 3;

    positions[stride] = Math.cos(angle) * radius;
    positions[stride + 1] = Math.sin(angle * 1.14 + particle.phase) * particle.lift;
    positions[stride + 2] = Math.sin(angle) * radius * 0.34 + Math.cos(angle * 0.7) * 0.16;
  });
}

export function RadiotherapyOrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;

    if (!canvas || !wrap) {
      return;
    }

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance"
      });
    } catch {
      wrap.dataset.canvasState = "unavailable";
      return;
    }

    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const fieldGroup = new THREE.Group();
    const palette = readPalette();
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const rotatingObjects: Array<{ object: THREE.Object3D; speed: number }> = [];

    camera.position.set(0.35, 0.14, 7.4);
    scene.add(fieldGroup);

    const primaryLineMaterial = new THREE.LineBasicMaterial({
      color: palette.primary,
      depthWrite: false,
      opacity: 0.3,
      transparent: true
    });
    const accentLineMaterial = new THREE.LineBasicMaterial({
      color: palette.accent,
      depthWrite: false,
      opacity: 0.34,
      transparent: true
    });
    const softLineMaterial = new THREE.LineBasicMaterial({
      color: palette.textSoft,
      depthWrite: false,
      opacity: 0.16,
      transparent: true
    });
    const primaryRingMaterial = new THREE.MeshBasicMaterial({
      color: palette.primary,
      depthWrite: false,
      opacity: 0.16,
      transparent: true
    });
    const accentRingMaterial = new THREE.MeshBasicMaterial({
      color: palette.accent,
      depthWrite: false,
      opacity: 0.13,
      transparent: true
    });
    const targetMaterial = new THREE.MeshBasicMaterial({
      color: palette.primary,
      depthWrite: false,
      opacity: 0.1,
      transparent: true,
      wireframe: true
    });
    const particleMaterial = new THREE.PointsMaterial({
      color: palette.primary,
      depthWrite: false,
      opacity: 0.48,
      size: 0.034,
      transparent: true
    });

    materials.push(
      primaryLineMaterial,
      accentLineMaterial,
      softLineMaterial,
      primaryRingMaterial,
      accentRingMaterial,
      targetMaterial,
      particleMaterial
    );

    const arcConfigs = [
      { length: Math.PI * 1.32, material: primaryLineMaterial, radiusX: 2.44, radiusY: 1.16, rotation: [0.76, 0.22, -0.32], speed: 0.05, start: -0.62 },
      { length: Math.PI * 1.18, material: accentLineMaterial, radiusX: 2.06, radiusY: 0.98, rotation: [-0.55, -0.24, 0.78], speed: -0.065, start: 0.82 },
      { length: Math.PI * 1.46, material: softLineMaterial, radiusX: 2.74, radiusY: 1.28, rotation: [0.18, 0.92, 0.18], speed: 0.036, start: 1.64 },
      { length: Math.PI * 1.12, material: primaryLineMaterial, radiusX: 1.68, radiusY: 0.78, rotation: [-0.86, 0.36, -0.18], speed: -0.04, start: -1.12 }
    ] as const;

    arcConfigs.forEach((config) => {
      const geometry = createArcGeometry(config.radiusX, config.radiusY, config.start, config.length);
      const line = new THREE.Line(geometry, config.material);
      line.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
      fieldGroup.add(line);
      geometries.push(geometry);
      rotatingObjects.push({ object: line, speed: config.speed });
    });

    const ringRadii = [0.58, 1.08, 1.62, 2.12];

    ringRadii.forEach((radius, index) => {
      const geometry = new THREE.TorusGeometry(radius, 0.006, 10, 180);
      const ring = new THREE.Mesh(geometry, index % 2 === 0 ? primaryRingMaterial : accentRingMaterial);
      ring.rotation.set(Math.PI / 2.6 + index * 0.16, index * 0.48, -index * 0.2);
      fieldGroup.add(ring);
      geometries.push(geometry);
      rotatingObjects.push({ object: ring, speed: index % 2 === 0 ? 0.032 : -0.026 });
    });

    const targetGeometry = new THREE.IcosahedronGeometry(0.52, 2);
    const target = new THREE.Mesh(targetGeometry, targetMaterial);
    fieldGroup.add(target);
    geometries.push(targetGeometry);
    rotatingObjects.push({ object: target, speed: 0.018 });

    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => ({
      angle: seededValue(index, 1) * Math.PI * 2,
      lift: 0.62 + seededValue(index, 2) * 0.58,
      phase: seededValue(index, 3) * Math.PI * 2,
      radius: 0.84 + seededValue(index, 4) * 1.9,
      speed: 0.08 + seededValue(index, 5) * 0.1
    }));

    updateParticlePositions(particles, positions, 0);
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleCloud = new THREE.Points(particleGeometry, particleMaterial);
    fieldGroup.add(particleCloud);
    geometries.push(particleGeometry);

    const clock = new THREE.Clock();
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId: number | null = null;

    const renderFrame = () => {
      const elapsedTime = clock.getElapsedTime();

      fieldGroup.rotation.y = Math.sin(elapsedTime * 0.16) * 0.18;
      fieldGroup.rotation.x = Math.cos(elapsedTime * 0.13) * 0.05;
      target.rotation.y = elapsedTime * 0.16;
      target.rotation.x = elapsedTime * 0.1;

      rotatingObjects.forEach((entry) => {
        entry.object.rotation.z += entry.speed * 0.016;
      });

      updateParticlePositions(particles, positions, elapsedTime);
      const positionAttribute = particleGeometry.getAttribute("position");
      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const animate = () => {
      renderFrame();

      if (!reducedMotionQuery.matches) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const width = Math.max(entry.contentRect.width, 1);
      const height = Math.max(entry.contentRect.height, 1);
      const compact = width < 760;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(compact ? 0 : 0.35, compact ? 0.3 : 0.14, compact ? 8.3 : 7.4);
      fieldGroup.scale.setScalar(compact ? 0.72 : 1);
      fieldGroup.position.set(compact ? 0 : 0.44, compact ? -0.48 : 0.02, 0);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderFrame();
    });

    const updateThemeColors = () => {
      const nextPalette = readPalette();
      primaryLineMaterial.color.set(nextPalette.primary);
      accentLineMaterial.color.set(nextPalette.accent);
      softLineMaterial.color.set(nextPalette.textSoft);
      primaryRingMaterial.color.set(nextPalette.primary);
      accentRingMaterial.color.set(nextPalette.accent);
      targetMaterial.color.set(nextPalette.primary);
      particleMaterial.color.set(nextPalette.primary);
      renderFrame();
    };

    const mutationObserver = new MutationObserver(updateThemeColors);
    const handleMotionChange = () => {
      if (reducedMotionQuery.matches && frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
        renderFrame();
        return;
      }

      if (!reducedMotionQuery.matches && frameId === null) {
        clock.start();
        animate();
      }
    };

    resizeObserver.observe(wrap);
    mutationObserver.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
    reducedMotionQuery.addEventListener("change", handleMotionChange);
    animate();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      mutationObserver.disconnect();
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="landing-orbit-canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
