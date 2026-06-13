"use client";

import { useSyncExternalStore } from "react";
import { RadiotherapyOrbitCanvas } from "@/components/landing/radiotherapy-orbit-canvas";

function subscribe() {
  return () => undefined;
}

export function RadiotherapyOrbitCanvasMount() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className="landing-orbit-canvas landing-orbit-canvas-fallback"
        aria-hidden="true"
      />
    );
  }

  return <RadiotherapyOrbitCanvas />;
}
