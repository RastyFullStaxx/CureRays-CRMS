'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { resolveUiFontFamily, uiTypography } from '@/lib/ui-typography';

export type NeuronSignalStageId = 'chart-prep' | 'planning' | 'delivery' | 'closeout';
export type NeuronSignalTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type NeuronSignalGroup = 'patient' | 'course' | 'stage' | 'task' | 'document' | 'risk' | 'domain';

export type NeuronSignalNode = {
  id: string;
  label: string;
  group: NeuronSignalGroup;
  value: number;
  stage?: NeuronSignalStageId;
  detail?: string;
  tone?: NeuronSignalTone;
  anchor?: {
    x: number;
    y: number;
  };
};

export type NeuronSignalLink = {
  source: string;
  target: string;
  value: number;
  tone?: NeuronSignalTone;
};

type NeuronSimulationNode = NeuronSignalNode & SimulationNodeDatum & {
  phaseSeed: number;
};

type NeuronSimulationLink = NeuronSignalLink & SimulationLinkDatum<NeuronSimulationNode>;

type RenderNode = {
  id: string;
  node: NeuronSimulationNode;
  radius: number;
  x: number;
  y: number;
};

type HoveredNode = {
  detail?: string;
  group: NeuronSignalGroup;
  id: string;
  label: string;
  tone?: NeuronSignalTone;
  value: number;
  x: number;
  y: number;
};

const stageAnchors: Record<NeuronSignalStageId, { x: number; y: number }> = {
  'chart-prep': { x: 0.36, y: 0.5 },
  planning: { x: 0.48, y: 0.36 },
  delivery: { x: 0.64, y: 0.5 },
  closeout: { x: 0.52, y: 0.66 },
};

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function toneColor(tone: NeuronSignalTone | undefined) {
  if (tone === 'error') return 'var(--color-error)';
  if (tone === 'warning') return 'var(--color-warning)';
  if (tone === 'success') return 'var(--color-success)';
  if (tone === 'info') return 'var(--color-info)';
  if (tone === 'neutral') return 'var(--color-text-muted)';
  if (tone === 'primary') return 'var(--color-primary)';
  return undefined;
}

function signalColor(node: NeuronSignalNode) {
  const tone = toneColor(node.tone);
  if (tone) return tone;
  if (node.group === 'risk' || node.group === 'domain') return 'var(--color-error)';
  if (node.group === 'document') return 'var(--color-info)';
  if (node.group === 'stage') return 'var(--color-primary)';
  if (node.group === 'task') return 'var(--color-accent)';
  if (node.group === 'course') return 'var(--color-success)';
  return 'var(--color-primary)';
}

function colorFromToken(token: string, fallback: string) {
  if (!token.startsWith('var(')) return token;
  return cssVar(token.replace('var(', '').replace(')', ''), fallback);
}

function anchorForNode(node: NeuronSignalNode) {
  if (node.anchor) {
    return node.anchor;
  }

  const stage = node.stage ? stageAnchors[node.stage] : undefined;
  if (!stage) {
    return { x: 0.5, y: 0.5 };
  }

  if (node.group === 'patient') {
    return { x: stage.x - 0.08, y: stage.y + 0.03 };
  }

  if (node.group === 'course') {
    return { x: stage.x + 0.08, y: stage.y + 0.02 };
  }

  if (node.group === 'document') {
    return { x: Math.min(0.72, stage.x + 0.14), y: stage.y + 0.08 };
  }

  if (node.group === 'risk' || node.group === 'task') {
    return { x: Math.min(0.7, stage.x + 0.12), y: Math.max(0.3, stage.y - 0.12) };
  }

  return stage;
}

function resolvedNode(value: string | number | NeuronSimulationNode | undefined) {
  return typeof value === 'object' && value !== null ? value : undefined;
}

function nodeRadius(node: NeuronSignalNode) {
  if (node.group === 'domain') {
    return Math.max(8, Math.min(16, 7 + node.value * 0.22));
  }

  if (node.group === 'stage') {
    return Math.max(8, Math.min(15, 7 + node.value * 0.35));
  }

  if (node.group === 'patient') {
    return Math.max(4.5, Math.min(8.5, 4 + node.value * 0.4));
  }

  if (node.group === 'course') {
    return Math.max(4.5, Math.min(10, 4 + node.value * 0.18));
  }

  return Math.max(5, Math.min(10, 4 + node.value * 0.35));
}

function labelReserve(node: NeuronSignalNode) {
  return node.group === 'stage'
    || node.group === 'task'
    || node.group === 'document'
    || node.group === 'risk'
    || node.group === 'domain'
    || node.group === 'course'
    ? 28
    : 10;
}

function orbitRadius(node: NeuronSignalNode, reduceMotion: boolean) {
  if (reduceMotion) return 0;
  if (node.group === 'stage' || node.group === 'domain') return 7;
  if (node.group === 'patient') return 18;
  if (node.group === 'course') return 15;
  return 11;
}

function orbitSpeed(node: NeuronSignalNode) {
  if (node.group === 'stage' || node.group === 'domain') return 2100;
  if (node.group === 'patient') return 1350;
  return 1650;
}

function forceStrength(node: NeuronSignalNode) {
  if (node.group === 'stage' || node.group === 'domain') return 0.42;
  return 0.18;
}

function chargeStrength(node: NeuronSignalNode) {
  if (node.group === 'stage' || node.group === 'domain') return -92;
  return -36;
}

function shouldShowLabel(node: NeuronSignalNode) {
  return node.group === 'stage'
    || node.group === 'risk'
    || node.group === 'domain';
}

function groupLabel(group: NeuronSignalGroup) {
  if (group === 'domain') return 'Risk domain';
  if (group === 'course') return 'Course signal';
  if (group === 'stage') return 'Carepath stage';
  if (group === 'task') return 'Task signal';
  if (group === 'document') return 'Document signal';
  if (group === 'risk') return 'Risk signal';
  return 'Patient-course signal';
}

export function NeuronSignalField({
  ariaLabel,
  className,
  links,
  nodes,
}: {
  ariaLabel: string;
  className: string;
  links: NeuronSignalLink[];
  nodes: NeuronSignalNode[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverRef = useRef<HoveredNode | null>(null);
  const renderNodesRef = useRef<RenderNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    let animationFrame = 0;
    const initialRect = canvas.getBoundingClientRect();
    width = Math.max(1, initialRect.width || canvas.clientWidth || 560);
    height = Math.max(1, initialRect.height || canvas.clientHeight || 300);
    const simulationNodes: NeuronSimulationNode[] = nodes.map((node, index) => ({
      ...node,
      phaseSeed: index * 1.47,
      x: anchorForNode(node).x * width + Math.cos(index * 1.7) * 24,
      y: anchorForNode(node).y * height + Math.sin(index * 1.7) * 24,
    }));
    const simulationLinks: NeuronSimulationLink[] = links.map((link) => ({ ...link }));
    const centerForce = forceCenter<NeuronSimulationNode>(width / 2, height / 2).strength(0.18);
    const simulation = forceSimulation<NeuronSimulationNode>(simulationNodes)
      .force(
        'link',
        forceLink<NeuronSimulationNode, NeuronSimulationLink>(simulationLinks)
          .id((node) => node.id)
          .distance((link) => 28 + Math.max(1, 9 - link.value) * 5)
          .strength(0.36),
      )
      .force('charge', forceManyBody<NeuronSimulationNode>().strength(chargeStrength))
      .force('collide', forceCollide<NeuronSimulationNode>((node) => nodeRadius(node) + 9).strength(0.72))
      .force('center', centerForce)
      .force('x', forceX<NeuronSimulationNode>((node) => anchorForNode(node).x * width).strength(forceStrength))
      .force('y', forceY<NeuronSimulationNode>((node) => anchorForNode(node).y * height).strength(forceStrength));

    const draw = (time = 0) => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      width = Math.max(1, rect.width || canvas.clientWidth || width);
      height = Math.max(1, rect.height || canvas.clientHeight || height);
      centerForce.x(width / 2).y(height / 2);

      if (canvas.width !== Math.floor(width * scale) || canvas.height !== Math.floor(height * scale)) {
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
      }

      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, width, height);

      const primary = cssVar('--color-primary', 'CanvasText');
      const text = cssVar('--color-text-muted', 'GrayText');
      const card = cssVar('--color-card', 'Canvas');

      context.save();
      const glow = context.createRadialGradient(width * 0.48, height * 0.48, 20, width * 0.48, height * 0.48, Math.max(width, height) * 0.68);
      glow.addColorStop(0, primary);
      glow.addColorStop(1, card);
      context.globalAlpha = 0.08;
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.restore();

      const renderPositions = new Map<string, RenderNode>();

      simulationNodes.forEach((node) => {
        const baseRadius = nodeRadius(node);
        const isHovered = hoverRef.current?.id === node.id;
        const radius = baseRadius * (isHovered ? (reduceMotion ? 1.12 : 1.22) : 1);
        const anchor = anchorForNode(node);
        const anchorX = anchor.x * width;
        const anchorY = anchor.y * height;
        const angle = time / orbitSpeed(node) + node.phaseSeed;
        node.x = Math.min(Math.max(node.x ?? 0, radius + 12), width - radius - 12);
        node.y = Math.min(Math.max(node.y ?? 0, radius + 12), height - radius - labelReserve(node));
        const orbitX = Math.cos(angle) * orbitRadius(node, reduceMotion);
        const orbitY = Math.sin(angle) * orbitRadius(node, reduceMotion);
        const tetherX = ((node.x ?? anchorX) * 0.68) + (anchorX * 0.32);
        const tetherY = ((node.y ?? anchorY) * 0.68) + (anchorY * 0.32);
        renderPositions.set(node.id, {
          id: node.id,
          node,
          radius,
          x: Math.min(Math.max(tetherX + orbitX, radius + 12), width - radius - 12),
          y: Math.min(Math.max(tetherY + orbitY, radius + 12), height - radius - labelReserve(node)),
        });
      });
      renderNodesRef.current = [...renderPositions.values()];

      simulationLinks.forEach((link) => {
        const source = resolvedNode(link.source);
        const target = resolvedNode(link.target);
        const sourcePosition = source ? renderPositions.get(source.id) : undefined;
        const targetPosition = target ? renderPositions.get(target.id) : undefined;
        if (!sourcePosition || !targetPosition) {
          return;
        }

        const isAdjacentToHover = hoverRef.current
          ? sourcePosition.id === hoverRef.current.id || targetPosition.id === hoverRef.current.id
          : false;

        context.beginPath();
        context.moveTo(sourcePosition.x, sourcePosition.y);
        context.lineTo(targetPosition.x, targetPosition.y);
        context.strokeStyle = colorFromToken(toneColor(link.tone) ?? 'var(--color-primary)', primary);
        context.globalAlpha = Math.min(isAdjacentToHover ? 0.62 : 0.38, (isAdjacentToHover ? 0.2 : 0.1) + link.value / 42);
        context.lineWidth = Math.max(1, Math.min(isAdjacentToHover ? 4.5 : 3.5, link.value / 7 + (isAdjacentToHover ? 0.75 : 0)));
        context.stroke();
      });

      context.globalAlpha = 1;
      simulationNodes.forEach((node) => {
        const position = renderPositions.get(node.id) ?? { x: node.x ?? 0, y: node.y ?? 0, radius: nodeRadius(node) };
        const x = position.x;
        const y = position.y;
        const radius = position.radius;
        const color = colorFromToken(signalColor(node), primary);
        const pulse = reduceMotion ? 0 : (Math.sin(time / 620 + node.phaseSeed) + 1) / 2;
        const isHovered = hoverRef.current?.id === node.id;

        context.beginPath();
        context.arc(x, y, radius + (isHovered ? 11 : 6) + pulse * (isHovered ? 7 : 4), 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = isHovered
          ? 0.24 + pulse * 0.12
          : node.group === 'stage' || node.group === 'domain'
            ? 0.16
            : 0.08 + pulse * 0.08;
        context.fill();

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = isHovered ? 1 : node.group === 'stage' || node.group === 'domain' ? 0.96 : 0.82;
        context.fill();

        if (shouldShowLabel(node) || isHovered) {
          context.globalAlpha = isHovered ? 1 : 0.9;
          context.fillStyle = isHovered ? cssVar('--color-text', 'CanvasText') : text;
          context.font = `${uiTypography.weight.semibold} ${uiTypography.size.label}px ${resolveUiFontFamily()}`;
          context.textAlign = 'center';
          context.fillText(node.label, x, y + radius + 14);
        }
      });
    };

    if (reduceMotion) {
      simulation.tick(120);
      draw();
    } else {
      simulation.on('tick', draw);
      simulation.alpha(0.9).restart();
      const animate = (time: number) => {
        draw(time);
        animationFrame = window.requestAnimationFrame(animate);
      };
      animationFrame = window.requestAnimationFrame(animate);
    }

    const handleResize = () => draw();
    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let next: HoveredNode | null = null;

      for (const renderNode of renderNodesRef.current) {
        const distance = Math.hypot(renderNode.x - x, renderNode.y - y);
        if (distance <= renderNode.radius + 9) {
          next = {
            detail: renderNode.node.detail,
            group: renderNode.node.group,
            id: renderNode.node.id,
            label: renderNode.node.label,
            tone: renderNode.node.tone,
            value: renderNode.node.value,
            x: Math.min(Math.max(x + 14, 12), Math.max(12, rect.width - 230)),
            y: Math.min(Math.max(y + 14, 12), Math.max(12, rect.height - 120)),
          };
          break;
        }
      }

      canvas.style.cursor = next ? 'pointer' : 'default';
      if (next?.id !== hoverRef.current?.id || next?.x !== hoverRef.current?.x || next?.y !== hoverRef.current?.y) {
        hoverRef.current = next;
        setHoveredNode(next);
        if (reduceMotion) {
          draw();
        }
      }
    };
    const handlePointerLeave = () => {
      canvas.style.cursor = 'default';
      hoverRef.current = null;
      setHoveredNode(null);
      if (reduceMotion) {
        draw();
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      simulation.stop();
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [links, nodes]);

  const tooltipStyle: CSSProperties | undefined = hoveredNode
    ? {
      left: `${hoveredNode.x}px`,
      top: `${hoveredNode.y}px`,
    }
    : undefined;

  return (
    <>
      <canvas ref={canvasRef} className={className} role="img" aria-label={ariaLabel} />
      <div className="neuron-signal-tooltip" data-visible={hoveredNode ? 'true' : 'false'} data-tone={hoveredNode?.tone ?? 'primary'} style={tooltipStyle}>
        {hoveredNode ? (
          <>
            <span>{groupLabel(hoveredNode.group)}</span>
            <strong>{hoveredNode.label}</strong>
            <p>{hoveredNode.detail ?? `${hoveredNode.value} weighted signal${hoveredNode.value === 1 ? '' : 's'}`}</p>
            <em>{hoveredNode.value} signal weight</em>
          </>
        ) : null}
      </div>
    </>
  );
}
