import React from 'react';

interface IconProps {
  color: string;
}

export const InventoryIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className="w-10 h-10"
      style={{ shapeRendering: 'crispEdges' } as React.CSSProperties}
    >
      {/* 가방/배낭 디자인 */}
      <path d="M6 8h12v12H6V8z" />
      <path d="M9 8V5h6v3M6 11h12M11 14h2v3h-2v-3z" />
      <path d="M4 10h2v8H4v-8zM18 10h2v8h-2v-8z" strokeWidth="1" />
    </svg>
  );
};
