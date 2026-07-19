'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

/**
 * BubbleLogo — a 3D, cartoon speech-bubble mark for the brand.
 *
 * The silhouette is a rounded speech bubble with a chunky down-left tail. The
 * "立体 / cartoon" treatment comes from layering: a sticker drop shadow behind,
 * a diagonal blue gradient body, a clipped glossy highlight + specular dot on
 * top, and a clipped inner-bottom shadow for volume. Built as pure SVG so it
 * stays crisp at any size and reads well on both light and dark backgrounds.
 */
const BUBBLE_PATH =
  'M15 7 H33 A9 9 0 0 1 42 16 V24 A9 9 0 0 1 33 33 H25 L13 40 L15 33 A9 9 0 0 1 6 24 V16 A9 9 0 0 1 15 7 Z';

export function BubbleLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const grad = `bl-${uid}-grad`;
  const clip = `bl-${uid}-clip`;

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('block', className)}
      role="img"
      aria-label="logo"
    >
      <defs>
        <linearGradient
          id={grad}
          x1="10"
          y1="6"
          x2="36"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#9CC2FF" />
          <stop offset="48%" stopColor="#5686FF" />
          <stop offset="100%" stopColor="#264DD8" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={BUBBLE_PATH} />
        </clipPath>
      </defs>

      {/* sticker drop shadow — the 3D lift */}
      <path
        d={BUBBLE_PATH}
        transform="translate(1.6,2.4)"
        fill="#0F1A3D"
        opacity="0.28"
      />

      {/* body */}
      <path
        d={BUBBLE_PATH}
        fill={`url(#${grad})`}
        stroke="#1B2A6B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* clipped interior — shading + shine */}
      <g clipPath={`url(#${clip})`}>
        {/* inner-bottom shadow for volume */}
        <ellipse cx="24" cy="40" rx="22" ry="9" fill="#1630A8" opacity="0.32" />
        {/* big glossy highlight */}
        <ellipse
          cx="19"
          cy="15"
          rx="13"
          ry="6.2"
          fill="#ffffff"
          opacity="0.55"
          transform="rotate(-22 19 15)"
        />
        {/* specular dot */}
        <circle cx="14.5" cy="12.5" r="1.7" fill="#ffffff" opacity="0.95" />
      </g>
    </svg>
  );
}
