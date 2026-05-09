import React from 'react';

interface CircularProgressProps {
  percentage: number;
  label?: string;
  subLabel?: string;
  isRunning?: boolean;
}

export function CircularProgress({ percentage, label, subLabel, isRunning }: CircularProgressProps) {
  const radius = 112; 
  const stroke = 8;
  const normalizedRadius = 100;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-white/5"
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${isRunning ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'text-purple-500'}`}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-5xl font-mono font-light tracking-tighter text-white">
            {label}
          </span>
        )}
        {subLabel && (
          <span className={`text-[10px] tracking-widest uppercase mt-2 font-bold ${isRunning ? 'text-blue-400' : 'text-gray-400'}`}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
