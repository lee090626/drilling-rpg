import React from 'react';

export const ElevatorIcon = ({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3.89543 3 3.89543 3 5 3Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M9 13L12 10L15 13" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M9 17L12 14L15 17" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M7 7H17" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);
