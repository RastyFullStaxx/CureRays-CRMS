'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GraphChart, HeatmapChart, SankeyChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts, EChartsCoreOption } from 'echarts/core';

echarts.use([
  GraphChart,
  HeatmapChart,
  SankeyChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

type DashboardEChartProps = {
  option: EChartsCoreOption;
  ariaLabel: string;
  className?: string;
};

export function DashboardEChart({ ariaLabel, className, option }: DashboardEChartProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const chart = echarts.init(host, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    chart.setOption(option, { notMerge: true });

    const observer = new ResizeObserver(() => {
      chart.resize();
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true, lazyUpdate: false });
  }, [option]);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
