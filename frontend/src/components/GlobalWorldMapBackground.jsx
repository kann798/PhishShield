import React from 'react';
import { REAL_WORLD_MAP_PATH } from './worldMapData';
import ThreatNetworkBackground from './ThreatNetworkBackground';

// Key Global Geographic Hub Nodes on the 1000x500 Equirectangular Coordinate Grid
// Using muted, deep cyber tones with subdued green to keep markers subtle and non-distracting
export const GLOBAL_MAP_HUBS = [
  { id: 'sf', name: 'San Francisco', region: 'North America', x: 160, y: 145, color: '#e11d48', isMalicious: true, pings: 42, pulseOffset: 0.0, labelOffset: 16 },
  { id: 'nyc', name: 'New York', region: 'North America', x: 294, y: 137, color: '#0284c7', isMalicious: false, pings: 88, pulseOffset: 1.1, labelOffset: 16 },
  { id: 'sao', name: 'São Paulo', region: 'South America', x: 370, y: 315, color: '#047857', isMalicious: false, pings: 19, pulseOffset: 2.2, labelOffset: 16 },
  { id: 'lon', name: 'London', region: 'Europe', x: 500, y: 107, color: '#047857', isMalicious: false, pings: 125, pulseOffset: 0.6, labelOffset: -12 },
  { id: 'fra', name: 'Frankfurt', region: 'Europe', x: 524, y: 111, color: '#0284c7', isMalicious: false, pings: 96, pulseOffset: 1.7, labelOffset: 16 },
  { id: 'jnb', name: 'Johannesburg', region: 'Africa', x: 578, y: 323, color: '#d97706', isMalicious: false, pings: 31, pulseOffset: 2.8, labelOffset: 16 },
  { id: 'dxb', name: 'Dubai', region: 'Middle East', x: 654, y: 180, color: '#0284c7', isMalicious: false, pings: 54, pulseOffset: 0.9, labelOffset: 16 },
  { id: 'bom', name: 'Mumbai', region: 'South Asia', x: 702, y: 197, color: '#e11d48', isMalicious: true, pings: 82, pulseOffset: 1.4, labelOffset: 16 },
  { id: 'sin', name: 'Singapore', region: 'Southeast Asia', x: 788, y: 246, color: '#047857', isMalicious: false, pings: 63, pulseOffset: 2.4, labelOffset: 16 },
  { id: 'sha', name: 'Shanghai', region: 'East Asia', x: 837, y: 163, color: '#e11d48', isMalicious: true, pings: 114, pulseOffset: 0.3, labelOffset: 16 },
  { id: 'tok', name: 'Tokyo', region: 'East Asia', x: 888, y: 151, color: '#047857', isMalicious: false, pings: 67, pulseOffset: 1.9, labelOffset: -12 },
  { id: 'syd', name: 'Sydney', region: 'Australia', x: 920, y: 344, color: '#0284c7', isMalicious: false, pings: 24, pulseOffset: 2.6, labelOffset: 16 },
  { id: 'hnl', name: 'Honolulu', region: 'Pacific', x: 75, y: 212, color: '#0284c7', isMalicious: false, pings: 15, pulseOffset: 1.3, labelOffset: 16 },
  { id: 'rey', name: 'Reykjavik', region: 'North Atlantic', x: 455, y: 72, color: '#047857', isMalicious: false, pings: 22, pulseOffset: 2.5, labelOffset: -12 },
  { id: 'bue', name: 'Buenos Aires', region: 'South America', x: 350, y: 365, color: '#0284c7', isMalicious: false, pings: 18, pulseOffset: 0.8, labelOffset: 16 },
  { id: 'nbo', name: 'Nairobi', region: 'East Africa', x: 605, y: 255, color: '#047857', isMalicious: false, pings: 29, pulseOffset: 1.6, labelOffset: 16 },
  { id: 'sel', name: 'Seoul', region: 'East Asia', x: 852, y: 152, color: '#e11d48', isMalicious: true, pings: 76, pulseOffset: 2.1, labelOffset: -12 },
  { id: 'akl', name: 'Auckland', region: 'Oceania', x: 970, y: 375, color: '#047857', isMalicious: false, pings: 14, pulseOffset: 0.4, labelOffset: 16 },
];

/**
 * GlobalWorldMapBackground
 * Renders the animated global world map as the full-screen background of the entire application.
 * Centered vertically in the middle of the viewport and shifted downward comfortably below the header.
 * City/country labels, telemetry rates, and dot markers are set to 10% brightness to remain subtle.
 */
export default function GlobalWorldMapBackground({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* 1. Base Atmospheric Ocean Background & Cyber Ambient Grid */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isDark ? '#030914' : '#edf2f9',
          backgroundImage: isDark
            ? `radial-gradient(ellipse 90% 70% at 50% 58%, rgba(10, 29, 66, 0.44) 0%, rgba(3, 9, 20, 0.96) 100%)`
            : `radial-gradient(ellipse 90% 70% at 50% 58%, rgba(186, 215, 245, 0.35) 0%, rgba(237, 242, 249, 0.96) 100%)`,
        }}
      />

      {/* Cyber Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(56, 189, 248, 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.10) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(2, 132, 199, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.08) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 2. WORLD MAP & NETWORK CONTAINER - Brought down and centered/fixed in the middle */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-[5] transform translate-y-24 sm:translate-y-28 md:translate-y-[115px] lg:translate-y-[120px] transition-transform duration-300">
        {/* LAYER 1: Vector World Map Continental Silhouettes & Cyber Graticules */}
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full select-none pointer-events-none z-[5] opacity-[0.88]"
        >
          <defs>
            <linearGradient id="fullscreenWorldLandDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#091c3b" stopOpacity="0.80" />
              <stop offset="50%" stopColor="#0c254c" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#06142b" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="fullscreenWorldLandLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c0d6ee" stopOpacity="0.72" />
              <stop offset="50%" stopColor="#cee0f4" stopOpacity="0.68" />
              <stop offset="100%" stopColor="#b7d0ec" stopOpacity="0.78" />
            </linearGradient>
          </defs>

          <g id="bg-real-world-map-layer">
            {/* Subtle Equirectangular Cyber Graticule Lines */}
            <g
              stroke={isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.09)'}
              strokeWidth="0.75"
              fill="none"
            >
              <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="4 8" /> {/* 45° N */}
              <line x1="0" y1="250" x2="1000" y2="250" strokeDasharray="4 8" /> {/* Equator */}
              <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="4 8" /> {/* 45° S */}
              <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="4 8" /> {/* 90° W */}
              <line x1="500" y1="0" x2="500" y2="500" strokeDasharray="4 8" /> {/* Prime Meridian */}
              <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="4 8" /> {/* 90° E */}
            </g>

            {/* Real World Geographic Continent Outlines & Landmass Fill */}
            <path
              d={REAL_WORLD_MAP_PATH}
              fill={isDark ? 'url(#fullscreenWorldLandDark)' : 'url(#fullscreenWorldLandLight)'}
              stroke={isDark ? '#18447d' : '#88b2de'}
              strokeWidth="1.0"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
            />
          </g>
        </svg>

        {/* LAYER 2: Live Animated HTML5 Canvas Threat Network Layer */}
        <ThreatNetworkBackground
          isGlobalApp={false}
          hubs={GLOBAL_MAP_HUBS}
          theme={theme}
          zIndex={10}
          className="absolute inset-0 w-full h-full"
        />

        {/* LAYER 3: City Hub Reticles, Target Rings, and Subtle 10% Brightness Labels */}
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full select-none pointer-events-none z-[15]"
        >
          <g id="bg-city-nodes-layer">
            {GLOBAL_MAP_HUBS.map((node) => {
              const labelOff = node.labelOffset !== undefined ? node.labelOffset : 15;
              const pingsOff = labelOff > 0 ? labelOff + 10 : labelOff - 8;

              return (
                <g key={`bg-map-node-${node.id}`} className="select-none">
                  {/* Outer Target Ring - subdued 10% brightness, muted green & cyber tones */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="3.2"
                    fill="transparent"
                    stroke={node.color}
                    strokeOpacity="0.10"
                    strokeWidth="0.8"
                  />

                  {/* Core Node Dot - subdued 10% brightness */}
                  <circle cx={node.x} cy={node.y} r="1.5" fill={node.color} fillOpacity="0.10" />

                  {/* City/Country Name Label - exactly 10% brightness as requested */}
                  <text
                    x={node.x}
                    y={node.y + labelOff}
                    textAnchor="middle"
                    fill={isDark ? '#64748b' : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    opacity="0.10"
                  >
                    {node.name}
                  </text>

                  {/* Telemetry Message Rate - exactly 10% brightness as requested */}
                  <text
                    x={node.x}
                    y={node.y + pingsOff}
                    textAnchor="middle"
                    fill={isDark ? '#475569' : '#94a3b8'}
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    opacity="0.10"
                  >
                    {node.pings} msg/s
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 5. Subtle Edge Ambient Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[20]"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 68%, rgba(4, 18, 27, 0.75) 100%)'
            : 'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 68%, rgba(220, 230, 242, 0.60) 100%)',
        }}
      />
    </div>
  );
}
