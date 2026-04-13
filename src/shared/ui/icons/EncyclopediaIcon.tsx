import React from 'react';

interface IconProps {
  color: string;
}

export const EncyclopediaIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className="w-10 h-10"
      style={{ shapeRendering: 'crispEdges' } as React.CSSProperties}
    >
      {/* 펼쳐진 책 또는 두꺼운 고서 */}
      <path d="M4 4h16v16H4V4z" />
      <path d="M7 7h10M7 10h10M7 13h6M4 17h16" />
      <path d="M12 4v12" strokeWidth="1" />
      <path d="M16 13h2v2h-2v-2z" fill={color} stroke="none" />
    </svg>
  );
};
