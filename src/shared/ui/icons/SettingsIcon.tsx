import React from 'react';

interface IconProps {
  color: string;
}

export const SettingsIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.5" 
      className="w-10 h-10"
      style={{ shapeRendering: 'crispEdges' } as React.CSSProperties}
    >
      {/* 더 정교한 톱니바퀴 디자인 */}
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      <path d="M12 7a5 5 0 100 10 5 5 0 000-10z" strokeWidth="0.5" />
    </svg>
  );
};
