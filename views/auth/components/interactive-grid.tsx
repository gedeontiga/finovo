'use client';

import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
  squaresClassName?: string;
}

export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [randomHighlights, setRandomHighlights] = useState<Set<number>>(new Set());

  // Add random highlights for ambient animation
  useEffect(() => {
    const interval = setInterval(() => {
      const totalSquares = horizontal * vertical;
      const newHighlights = new Set<number>();

      // Add 3-5 random highlights
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        newHighlights.add(Math.floor(Math.random() * totalSquares));
      }

      setRandomHighlights(newHighlights);
    }, 2000);

    return () => clearInterval(interval);
  }, [horizontal, vertical]);

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        'absolute inset-0 h-full w-full pointer-events-auto',
        className
      )}
      style={{ pointerEvents: 'auto' }}
      {...props}
    >
      <defs>
        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fe9800" stopOpacity="1" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fe9800" stopOpacity="1" />
        </linearGradient>
      </defs>

      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        const isHighlighted = randomHighlights.has(index);
        const isHovered = hoveredSquare === index;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              'transition-all duration-500 ease-out',
              squaresClassName
            )}
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
            stroke="url(#gridGradient)"
            strokeWidth=".5"
            fill={
              isHovered
                ? 'rgba(254, 152, 0, 0.4)'
                : isHighlighted
                  ? 'rgba(254, 152, 0, 0.15)'
                  : 'transparent'
            }
            opacity={isHovered ? 1 : isHighlighted ? 0.8 : 0.5}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}