import React from 'react';
import Box from '@mui/material/Box';
import { tokens } from '../theme';

/**
 * Animated ECG / heartbeat-style pulse line.
 * The signature visual element tying product name, health, and book cover together.
 */
export default function PulseLine({ width = 200, height = 40, animate = true }) {
  // ECG-style path: flat → small bump → big spike → dip → recovery → flat
  const path = 'M0,20 L30,20 L38,20 L42,14 L48,20 L58,20 L62,20 L68,4 L74,36 L80,12 L86,20 L100,20 L130,20 L138,20 L142,14 L148,20 L158,20 L162,20 L168,4 L174,36 L180,12 L186,20 L200,20';

  return (
    <Box
      component="svg"
      viewBox="0 0 200 40"
      sx={{
        width,
        height,
        overflow: 'visible',
        filter: `drop-shadow(0 0 8px ${tokens.glowViolet})`,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={tokens.violet} stopOpacity="0.4" />
          <stop offset="50%" stopColor={tokens.violetBright} stopOpacity="1" />
          <stop offset="100%" stopColor={tokens.violet} stopOpacity="0.4" />
        </linearGradient>
        {animate && (
          <clipPath id="pulseClip">
            <rect x="-200" y="0" width="200" height="40">
              <animate
                attributeName="x"
                from="-200"
                to="200"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </rect>
          </clipPath>
        )}
      </defs>

      {/* Background trace (dim) */}
      <path
        d={path}
        fill="none"
        stroke={tokens.violet}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* Animated bright trace */}
      <path
        d={path}
        fill="none"
        stroke="url(#pulseGlow)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={animate ? 'url(#pulseClip)' : undefined}
        style={!animate ? { opacity: 0.8 } : undefined}
      />

      {/* Glow dot at the current sweep position */}
      {animate && (
        <circle r="3" fill={tokens.violetBright} opacity="0.9">
          <animateMotion
            path={path}
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </Box>
  );
}
