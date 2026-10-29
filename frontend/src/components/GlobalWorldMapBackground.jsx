import React from 'react';
import { REAL_WORLD_MAP_PATH } from './worldMapData';
import ThreatNetworkBackground from './ThreatNetworkBackground';

// Key Global Geographic Hub Nodes on the 1000x500 Equirectangular Coordinate Grid
// Using nature palette with subdued sage/forest/slate green and threat red
export const GLOBAL_MAP_HUBS = [
  { id: 'sf', name: 'San Francisco', region: 'North America', x: 160, y: 145, color: '#DC2626', isMalicious: true, pings: 42, pulseOffset: 0.0, labelOffset: 16 },
  { id: 'nyc', name: 'New York', region: 'North America', x: 294, y: 137, color: '#6C8480', isMalicious: false, pings: 88, pulseOffset: 1.1, labelOffset: 16 },
  { id: 'sao', name: 'São Paulo', region: 'South America', x: 370, y: 315, color: '#7B9669', isMalicious: false, pings: 19, pulseOffset: 2.2, labelOffset: 16 },
  { id: 'lon', name: 'London', region: 'Europe', x: 500, y: 107, color: '#7B9669', isMalicious: false, pings: 125, pulseOffset: 0.6, labelOffset: -12 },
  { id: 'fra', name: 'Frankfurt', region: 'Europe', x: 524, y: 111, color: '#6C8480', isMalicious: false, pings: 96, pulseOffset: 1.7, labelOffset: 16 },
  { id: 'jnb', name: 'Johannesburg', region: 'Africa', x: 578, y: 323, color: '#D97706', isMalicious: false, pings: 31, pulseOffset: 2.8, labelOffset: 16 },
  { id: 'dxb', name: 'Dubai', region: 'Middle East', x: 654, y: 180, color: '#6C8480', isMalicious: false, pings: 54, pulseOffset: 0.9, labelOffset: 16 },
  { id: 'bom', name: 'Mumbai', region: 'South Asia', x: 702, y: 197, color: '#DC2626', isMalicious: true, pings: 82, pulseOffset: 1.4, labelOffset: 16 },
  { id: 'sin', name: 'Singapore', region: 'Southeast Asia', x: 788, y: 246, color: '#7B9669', isMalicious: false, pings: 63, pulseOffset: 2.4, labelOffset: 16 },
  { id: 'sha', name: 'Shanghai', region: 'East Asia', x: 837, y: 163, color: '#DC2626', isMalicious: true, pings: 114, pulseOffset: 0.3, labelOffset: 16 },
  { id: 'tok', name: 'Tokyo', region: 'East Asia', x: 888, y: 151, color: '#7B9669', isMalicious: false, pings: 67, pulseOffset: 1.9, labelOffset: -12 },
  { id: 'syd', name: 'Sydney', region: 'Australia', x: 920, y: 344, color: '#6C8480', isMalicious: false, pings: 24, pulseOffset: 2.6, labelOffset: 16 },
  { id: 'hnl', name: 'Honolulu', region: 'Pacific', x: 75, y: 212, color: '#6C8480', isMalicious: false, pings: 15, pulseOffset: 1.3, labelOffset: 16 },
  { id: 'rey', name: 'Reykjavik', region: 'North Atlantic', x: 455, y: 72, color: '#7B9669', isMalicious: false, pings: 22, pulseOffset: 2.5, labelOffset: -12 },
  { id: 'bue', name: 'Buenos Aires', region: 'South America', x: 350, y: 365, color: '#6C8480', isMalicious: false, pings: 18, pulseOffset: 0.8, labelOffset: 16 },
  { id: 'nbo', name: 'Nairobi', region: 'East Africa', x: 605, y: 255, color: '#7B9669', isMalicious: false, pings: 29, pulseOffset: 1.6, labelOffset: 16 },
  { id: 'sel', name: 'Seoul', region: 'East Asia', x: 852, y: 152, color: '#DC2626', isMalicious: true, pings: 76, pulseOffset: 2.1, labelOffset: -12 },
  { id: 'akl', name: 'Auckland', region: 'Oceania', x: 970, y: 375, color: '#7B9669', isMalicious: false, pings: 14, pulseOffset: 0.4, labelOffset: 16 },
];

/**
 * GlobalWorldMapBackground
 * Renders the animated global world map as the full-screen background of the entire application.
 * Centered vertically in the middle of the viewport and shifted downward comfortably below the header.
 * City/country labels, telemetry rates, and dot markers are set to subtle brightness.
 */
export default function GlobalWorldMapBackground({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* 1. Base Atmospheric Background */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isDark ? '#1F271D' : '#F4F7F4',
          backgroundImage: isDark
            ? `radial-gradient(ellipse 90% 70% at 50% 58%, rgba(40, 52, 36, 0.6) 0%, rgba(20, 27, 18, 0.98) 100%)`
            : `radial-gradient(ellipse 90% 70% at 50% 58%, rgba(186, 200, 177, 0.25) 0%, rgba(244, 247, 244, 0.98) 100%)`,
        }}
      />

      {/* Nature Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(123, 150, 105, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(123, 150, 105, 0.08) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(64, 78, 59, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(64, 78, 59, 0.06) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 2. WORLD MAP & NETWORK CONTAINER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-[5] transform translate-y-24 sm:translate-y-28 md:translate-y-[115px] lg:translate-y-[120px] transition-transform duration-300">
        {/* LAYER 1: Vector World Map Continental Silhouettes */}
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full select-none pointer-events-none z-[5] opacity-[0.80]"
        >
          <defs>
            <linearGradient id="fullscreenWorldLandDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A3827" stopOpacity="0.80" />
              <stop offset="50%" stopColor="#354532" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#1E281C" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="fullscreenWorldLandLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#Dce4D8" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#E4ECE1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D5DFD1" stopOpacity="0.70" />
            </linearGradient>
          </defs>

          <g id="bg-real-world-map-layer">
            {/* Subtle Graticule Lines */}
            <g
              stroke={isDark ? 'rgba(123, 150, 105, 0.08)' : 'rgba(108, 132, 128, 0.12)'}
              strokeWidth="0.75"
              fill="none"
            >
              <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="4 8" />
              <line x1="0" y1="250" x2="1000" y2="250" strokeDasharray="4 8" />
              <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="4 8" />
              <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="4 8" />
              <line x1="500" y1="0" x2="500" y2="500" strokeDasharray="4 8" />
              <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="4 8" />
            </g>

            {/* Real World Geographic Continent Outlines & Landmass Fill */}
            <path
              d={REAL_WORLD_MAP_PATH}
              fill={isDark ? 'url(#fullscreenWorldLandDark)' : 'url(#fullscreenWorldLandLight)'}
              stroke={isDark ? '#404E3B' : '#7B9669'}
              strokeWidth="0.75"
              strokeOpacity="0.4"
              strokeLinejoin="round"
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

        {/* LAYER 3: City Hub Reticles */}
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
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="3.2"
                    fill="transparent"
                    stroke={node.color}
                    strokeOpacity="0.25"
                    strokeWidth="0.8"
                  />
                  <circle cx={node.x} cy={node.y} r="1.5" fill={node.color} fillOpacity="0.4" />
                  <text
                    x={node.x}
                    y={node.y + labelOff}
                    textAnchor="middle"
                    fill={isDark ? '#BAC8B1' : '#6C8480'}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    opacity="0.35"
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + pingsOff}
                    textAnchor="middle"
                    fill={isDark ? '#7B9669' : '#6C8480'}
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    opacity="0.25"
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
            ? 'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 68%, rgba(20, 27, 18, 0.75) 100%)'
            : 'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 68%, rgba(244, 247, 244, 0.60) 100%)',
        }}
      />
    </div>
  );
}
