import React from 'react';

interface IconProps {
  color: string;
}

export const StatusIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className="w-10 h-10"
      style={{ shapeRendering: 'crispEdges' } as React.CSSProperties}
    >
      {/* 고딕 기사 방패 (Gothic Knight Shield) */}
      <path d="M4 4h4v2h2v2h4V6h2V4h4v8h-2v2h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2H6v-2H4V4z" />
      {/* 내부 장식/문양 */}
      <path d="M8 8l8 8" strokeWidth="1" opacity="0.6" />
      <path d="M11 10h2v4h-2v-4z" fill={color} stroke="none" />
    </svg>
  );
};
