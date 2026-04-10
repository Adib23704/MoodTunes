"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { EmotionChartProps } from "@/types";

const CHART_SIZE = 280;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = CHART_SIZE / 2 - 40;
const LABEL_RADIUS = MAX_RADIUS + 24;
const NUM_EMOTIONS = 8;

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export default function EmotionChart({ emotions }: EmotionChartProps) {
  const topEmotions = useMemo(() => emotions.slice(0, NUM_EMOTIONS), [emotions]);

  const angleStep = 360 / NUM_EMOTIONS;

  const points = useMemo(() => {
    return topEmotions.map((emotion, i) => {
      const angle = i * angleStep;
      const radius = Math.max(emotion.score * MAX_RADIUS, 10);
      return polarToCartesian(angle, radius);
    });
  }, [topEmotions, angleStep]);

  const polygonPath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  }, [points]);

  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        className="overflow-visible"
        aria-label="Emotion radar chart"
      >
        {gridRings.map((scale) => (
          <circle
            key={scale}
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS * scale}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {topEmotions.map((_, i) => {
          const angle = i * angleStep;
          const end = polarToCartesian(angle, MAX_RADIUS);
          return (
            <line
              key={`axis-${angle}`}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          );
        })}

        {polygonPath && (
          <motion.path
            d={polygonPath}
            fill="rgba(139, 92, 246, 0.15)"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          />
        )}

        {points.map((point, i) => (
          <motion.circle
            key={topEmotions[i].label}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#8b5cf6"
            stroke="#0a0a1a"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
          />
        ))}

        {topEmotions.map((emotion, i) => {
          const angle = i * angleStep;
          const pos = polarToCartesian(angle, LABEL_RADIUS);
          const pct = Math.round(emotion.score * 100);
          return (
            <text
              key={`label-${emotion.label}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-slate-400"
            >
              {emotion.label}
              <tspan className="fill-slate-500 text-[9px]"> {pct}%</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
