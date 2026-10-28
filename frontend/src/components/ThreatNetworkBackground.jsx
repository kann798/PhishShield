import React, { useRef, useEffect } from 'react';

// Key global cybersecurity hubs for contained World Map mode (1000x500 coordinate space)
const WORLD_MAP_HUBS = [
  { id: 'sf', name: 'San Francisco', region: 'North America', x: 160, y: 145, color: '#e11d48', isMalicious: true, pulseOffset: 0.0 },
  { id: 'nyc', name: 'New York', region: 'North America', x: 294, y: 137, color: '#0284c7', isMalicious: false, pulseOffset: 1.1 },
  { id: 'sao', name: 'São Paulo', region: 'South America', x: 370, y: 315, color: '#047857', isMalicious: false, pulseOffset: 2.2 },
  { id: 'lon', name: 'London', region: 'Europe', x: 500, y: 107, color: '#047857', isMalicious: false, pulseOffset: 0.6 },
  { id: 'fra', name: 'Frankfurt', region: 'Europe', x: 524, y: 111, color: '#0284c7', isMalicious: false, pulseOffset: 1.7 },
  { id: 'jnb', name: 'Johannesburg', region: 'Africa', x: 578, y: 323, color: '#d97706', isMalicious: false, pulseOffset: 2.8 },
  { id: 'dxb', name: 'Dubai', region: 'Middle East', x: 654, y: 180, color: '#0284c7', isMalicious: false, pulseOffset: 0.9 },
  { id: 'bom', name: 'Mumbai', region: 'South Asia', x: 702, y: 197, color: '#e11d48', isMalicious: true, pulseOffset: 1.4 },
  { id: 'sin', name: 'Singapore', region: 'Southeast Asia', x: 788, y: 246, color: '#047857', isMalicious: false, pulseOffset: 2.4 },
  { id: 'sha', name: 'Shanghai', region: 'East Asia', x: 837, y: 163, color: '#e11d48', isMalicious: true, pulseOffset: 0.3 },
  { id: 'tok', name: 'Tokyo', region: 'East Asia', x: 888, y: 151, color: '#047857', isMalicious: false, pulseOffset: 1.9 },
  { id: 'syd', name: 'Sydney', region: 'Australia', x: 920, y: 344, color: '#0284c7', isMalicious: false, pulseOffset: 2.6 },
];

// 20 Strategic Full-Screen Viewport Nodes (Normalized 0.0 - 1.0 Coordinates)
// Distributed comfortably along perimeter and margins so lines sweep gently behind content without cutting across headings
const FULLSCREEN_APP_HUBS = [
  // Top-left perimeter (visible in upper header margins)
  { id: 'app-n1', name: 'C2_BOTNET_SRC', label: '185.220.101.x', tag: 'C2_ORIGIN', normX: 0.05, normY: 0.08, role: 'threat', pulseOffset: 0.0 },
  { id: 'app-n2', name: 'DNS_INTEGRITY_PROBE', label: 'DNS-GW-01', tag: 'GATEWAY', normX: 0.18, normY: 0.06, role: 'gateway', pulseOffset: 1.2 },
  
  // Top-right perimeter (visible in upper right action bar periphery)
  { id: 'app-n3', name: 'PHISH_KIT_DEPLOYER', label: 'DARKNET_IP', tag: 'SPOOF_SRC', normX: 0.84, normY: 0.06, role: 'threat', pulseOffset: 0.5 },
  { id: 'app-n4', name: 'SECURE_MX_FILTER', label: 'MX-AUDIT', tag: 'DEFENSE', normX: 0.94, normY: 0.09, role: 'defense', pulseOffset: 1.8 },
  
  // Mid-upper quadrant (sides)
  { id: 'app-n5', name: 'ZERO_DAY_SANDBOX', label: 'SANDBOX-09', tag: 'SENSOR', normX: 0.03, normY: 0.28, role: 'gateway', pulseOffset: 2.3 },
  { id: 'app-n6', name: 'TOR_EXIT_RELAY', label: 'ANON_TOR', tag: 'ANOMALY', normX: 0.14, normY: 0.38, role: 'warning', pulseOffset: 0.8 },
  { id: 'app-n7', name: 'PHISHSHIELD_CORE', label: 'SHIELD_AI', tag: 'DEFENSE', normX: 0.86, normY: 0.32, role: 'defense', pulseOffset: 1.5 },
  { id: 'app-n8', name: 'SMTP_ANOMALY_VECTOR', label: 'SPOOF_MAIL', tag: 'PAYLOAD', normX: 0.96, normY: 0.38, role: 'threat', pulseOffset: 2.1 },

  // Mid-screen quadrant (outer gutters)
  { id: 'app-n9', name: 'EDGE_NEURAL_DEFENDER', label: 'EDGE-AI-02', tag: 'DEFENSE', normX: 0.05, normY: 0.52, role: 'defense', pulseOffset: 0.3 },
  { id: 'app-n10', name: 'GLOBAL_TELEMETRY_FEED', label: 'SIEM-INGEST', tag: 'GATEWAY', normX: 0.95, normY: 0.54, role: 'gateway', pulseOffset: 1.9 },
  { id: 'app-n11', name: 'BOTNET_SWARM_DRONE', label: 'CMD_BEACON', tag: 'THREAT', normX: 0.12, normY: 0.68, role: 'threat', pulseOffset: 1.1 },
  { id: 'app-n12', name: 'DEEP_PACKET_INSPECTOR', label: 'DPI-ARRAY', tag: 'GATEWAY', normX: 0.28, normY: 0.72, role: 'gateway', pulseOffset: 2.7 },
  { id: 'app-n13', name: 'VICTIM_USER_ENDPOINT', label: 'USER_INBOX', tag: 'TARGET', normX: 0.72, normY: 0.70, role: 'warning', pulseOffset: 0.4 },
  { id: 'app-n14', name: 'RANSOMWARE_EXPLOIT_HUB', label: 'PAYLOAD_DROP', tag: 'THREAT', normX: 0.88, normY: 0.68, role: 'threat', pulseOffset: 1.6 },

  // Bottom quadrant (footer & lower gutters)
  { id: 'app-n15', name: 'ENTERPRISE_GATE_SENTINEL', label: 'GATE-SENTINEL', tag: 'DEFENSE', normX: 0.06, normY: 0.88, role: 'defense', pulseOffset: 2.4 },
  { id: 'app-n16', name: 'CREDENTIAL_STEALER', label: 'EVIL_TWIN_AP', tag: 'THREAT', normX: 0.22, normY: 0.92, role: 'threat', pulseOffset: 0.9 },
  { id: 'app-n17', name: 'ML_PHISH_CLASSIFIER', label: 'NLP-ENGINE', tag: 'DEFENSE', normX: 0.42, normY: 0.94, role: 'defense', pulseOffset: 1.7 },
  { id: 'app-n18', name: 'HONEYPOT_CLUSTER_ALPHA', label: 'HONEY-DECOY', tag: 'SENSOR', normX: 0.60, normY: 0.93, role: 'gateway', pulseOffset: 0.2 },
  { id: 'app-n19', name: 'BEACON_INTERCEPTOR', label: 'FW-BLOCKER', tag: 'DEFENSE', normX: 0.78, normY: 0.91, role: 'defense', pulseOffset: 1.4 },
  { id: 'app-n20', name: 'DYNAMIC_DNS_RESOLVER', label: 'FAST-FLUX', tag: 'SUSPICIOUS', normX: 0.94, normY: 0.89, role: 'warning', pulseOffset: 2.5 },
];

// Cyber Palettes for Dark and Light Modes
const PALETTES = {
  dark: {
    threat: '#e11d48',   // Soft crimson
    defense: '#047857',  // Deep subdued forest emerald (no neon glare)
    gateway: '#0284c7',  // Soft cyber cyan
    warning: '#d97706',  // Soft amber
  },
  light: {
    threat: '#dc2626',   // High-contrast crimson
    defense: '#059669',  // Crisp emerald
    gateway: '#0284c7',  // Technical sky blue
    warning: '#d97706',  // Amber warning
  },
};

const SIMULATED_PAYLOADS = [
  'PAYLOAD.EXE',
  'PHISH.LINK',
  'EXPLOIT.JS',
  'SYN_BEACON',
  'CRED_SNIFF',
  'SPOOF.EML',
  'DNS_TUNNEL',
  'MALWARE.ZIP',
];

/**
 * Calculates a point along a quadratic Bézier curve at parameter t (0 <= t <= 1)
 */
function getQuadraticBezierPoint(p0, cp, p1, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * cp.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * cp.y + t * t * p1.y,
  };
}

/**
 * ThreatNetworkBackground
 * Renders an active, live animated cyber threat network directly in the background.
 * Supports:
 * 1. Full Application Background Mode (isGlobalApp={true}):
 *    Spans full screen, dynamically positions nodes, and animates continuous
 *    threat connections (connecting -> transmitting -> intercepting -> disconnecting).
 * 2. Contained World Map Mode (isGlobalApp={false}):
 *    Scaled to the 1000x500 equirectangular world map grid.
 */
export default function ThreatNetworkBackground({
  isGlobalApp = false,
  theme = 'dark',
  zIndex = 0,
  className = '',
  hubs = null,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const palette = theme === 'light' ? PALETTES.light : PALETTES.dark;

    // Viewport dimensions in CSS pixels
    let cssWidth = 1000;
    let cssHeight = 500;
    let dpr = 1;

    // Handle High-DPI crisp rendering & dynamic responsiveness
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = rect.width || window.innerWidth || 1000;
      cssHeight = rect.height || window.innerHeight || 500;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Active connection arcs state pool
    const MIN_CONCURRENT_ARCS = isGlobalApp ? 6 : 4;
    const MAX_CONCURRENT_ARCS = isGlobalApp ? 10 : 8;
    const activeArcs = [];
    const burstRings = [];

    // Helper to get active nodes with calculated screen coordinates
    const getNodes = () => {
      if (!isGlobalApp) {
        // Map mode uses provided hubs or WORLD_MAP_HUBS
        const sourceHubs = hubs || WORLD_MAP_HUBS;
        return sourceHubs.map((h) => ({
          ...h,
          color: h.color || (h.isMalicious ? palette.threat : palette.gateway),
        }));
      }

      // Fullscreen mode: map normalized coordinates to current CSS width & height
      return FULLSCREEN_APP_HUBS.map((node) => {
        const color = palette[node.role] || palette.gateway;
        return {
          ...node,
          x: node.normX * cssWidth,
          y: node.normY * cssHeight,
          color,
          isMalicious: node.role === 'threat',
        };
      });
    };

    // Helper to spawn a new threat connection line between two distinct nodes
    const spawnThreatArc = () => {
      const currentNodes = getNodes();
      if (currentNodes.length < 2) return;

      // Select source (prefer threat/gateway) and target
      const fromIdx = Math.floor(Math.random() * currentNodes.length);
      let toIdx = Math.floor(Math.random() * currentNodes.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * currentNodes.length);
      }

      const fromNode = currentNodes[fromIdx];
      const toNode = currentNodes[toIdx];

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.hypot(dx, dy);

      // Ballistic curvature trajectory
      const curveDirection = Math.random() > 0.48 ? -1 : 1;
      const curvature = curveDirection * (dist * 0.22 + 25);
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2 + curvature;

      // Select cyber palette color based on source status
      let arcColor = fromNode.color;
      if (!arcColor) {
        arcColor = fromNode.isMalicious ? palette.threat : palette.gateway;
      }

      // Reduced target alpha by 40-50% for softer, non-intrusive network threads
      const targetAlpha = isGlobalApp
        ? (theme === 'dark' ? 0.05 + Math.random() * 0.03 : 0.03 + Math.random() * 0.02)
        : (theme === 'dark' ? 0.11 + Math.random() * 0.06 : 0.07 + Math.random() * 0.04);

      const payloadText = SIMULATED_PAYLOADS[Math.floor(Math.random() * SIMULATED_PAYLOADS.length)];

      activeArcs.push({
        from: fromNode,
        to: toNode,
        cp: { x: midX, y: midY },
        color: arcColor,
        alpha: 0.01,
        targetAlpha,
        // Connection lifecycle: 'connecting' -> 'active' -> 'disconnecting'
        phase: 'connecting',
        connectProgress: 0, // 0 to 1 during connecting phase
        payloadText,
        dashOffset: Math.random() * 20,
        packet: {
          t: 0,
          speed: 0.005 + Math.random() * 0.006, // Transit duration ~2.5 - 4.5s
          size: isGlobalApp ? 1.5 + Math.random() * 0.5 : 1.6 + Math.random() * 0.6,
        },
      });
    };

    // Pre-populate pool with initial staggered active arcs
    const initialCount = isGlobalApp ? 6 : 5;
    for (let i = 0; i < initialCount; i++) {
      spawnThreatArc();
      if (activeArcs[i]) {
        activeArcs[i].alpha = activeArcs[i].targetAlpha;
        activeArcs[i].phase = 'active';
        activeArcs[i].connectProgress = 1;
        activeArcs[i].packet.t = 0.15 + i * 0.14;
      }
    }

    let lastSpawnTime = 0;

    // 60FPS Continuous Canvas Animation Loop
    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      if (isGlobalApp) {
        // High-DPI scale for full screen
        ctx.scale(dpr, dpr);
      } else {
        // Contained 1000x500 Equirectangular scale for World Map
        const scaleX = canvas.width / 1000;
        const scaleY = canvas.height / 500;
        ctx.scale(scaleX, scaleY);
      }

      const currentNodes = getNodes();

      // 1. Maintain pool of concurrent connecting & disconnecting lines
      if (
        activeArcs.length < MIN_CONCURRENT_ARCS ||
        (activeArcs.length < MAX_CONCURRENT_ARCS && time - lastSpawnTime > (isGlobalApp ? 500 : 700))
      ) {
        spawnThreatArc();
        lastSpawnTime = time;
      }

      // 2. Render Node Radar Ripples & Subdued Hub Cores (without excessive halos)
      currentNodes.forEach((node) => {
        const pulse = (Math.sin(time * 0.0028 + node.pulseOffset) + 1) / 2; // 0 to 1
        const radarRadius1 = (isGlobalApp ? 3.5 : 3.5) + pulse * (isGlobalApp ? 12 : 12);
        const radarAlpha1 = (1 - pulse) * (isGlobalApp ? 0.12 : 0.20);

        const secondaryPulse = (Math.sin(time * 0.0028 + node.pulseOffset + Math.PI / 2) + 1) / 2;
        const radarRadius2 = (isGlobalApp ? 2.8 : 2.8) + secondaryPulse * (isGlobalApp ? 15 : 15);
        const radarAlpha2 = (1 - secondaryPulse) * (isGlobalApp ? 0.07 : 0.12);

        ctx.save();

        // Outer radar pulse ring 1 (faint, subdued echo)
        ctx.beginPath();
        ctx.arc(node.x, node.y, radarRadius1, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 0.40;
        ctx.globalAlpha = isGlobalApp
          ? Math.min(0.018, Math.max(0.003, radarAlpha1 * 0.10))
          : Math.min(0.025, Math.max(0.004, radarAlpha1 * 0.10));
        ctx.stroke();

        // Outer radar pulse ring 2 (very faint echo)
        ctx.beginPath();
        ctx.arc(node.x, node.y, radarRadius2, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 0.30;
        ctx.globalAlpha = isGlobalApp
          ? Math.min(0.012, Math.max(0.002, radarAlpha2 * 0.10))
          : Math.min(0.016, Math.max(0.003, radarAlpha2 * 0.10));
        ctx.stroke();

        // Subdued node core: strictly 10% brightness and no glowing halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, isGlobalApp ? 1.5 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.10;
        ctx.shadowBlur = 0;
        ctx.fill();

        // Technical node tag (Full Screen App Mode) - strictly 10% brightness
        if (isGlobalApp && node.label) {
          ctx.font = '7.5px "JetBrains Mono", monospace';
          ctx.fillStyle = node.color;
          ctx.globalAlpha = 0.10;
          ctx.shadowBlur = 0;
          ctx.textAlign = 'center';
          ctx.fillText(`[${node.label}]`, node.x, node.y + 13);
        }

        ctx.restore();
      });

      // 3. Render Connecting, Active & Disconnecting Threat Arcs
      for (let i = activeArcs.length - 1; i >= 0; i--) {
        const arc = activeArcs[i];

        // Connection Lifecycle State Transitions:
        if (arc.phase === 'connecting') {
          // Establishing connection: line draws across and fades in
          arc.connectProgress = Math.min(1, arc.connectProgress + 0.04);
          arc.alpha += 0.012;
          if (arc.connectProgress >= 1 && arc.alpha >= arc.targetAlpha) {
            arc.alpha = arc.targetAlpha;
            arc.phase = 'active';
            // Connection established ripple at target
            burstRings.push({
              x: arc.to.x,
              y: arc.to.y,
              color: arc.color,
              r: 2,
              maxR: 10,
              alpha: 0.10,
            });
          }
        } else if (arc.phase === 'disconnecting') {
          // Severing connection: line dissolves / fades out cleanly
          arc.alpha -= 0.010;
          arc.dashOffset += 1.0; // digital de-materialization motion
          if (arc.alpha <= 0) {
            activeArcs.splice(i, 1);
            continue;
          }
        }

        // Advance threat packet along ballistic curve during 'active' phase
        if (arc.phase === 'active') {
          arc.packet.t += arc.packet.speed;

          // Packet reaches destination -> trigger impact burst and initiate DISCONNECT
          if (arc.packet.t >= 1) {
            arc.phase = 'disconnecting';
            // Spawn impact radar burst ring at target node (subdued intensity)
            burstRings.push({
              x: arc.to.x,
              y: arc.to.y,
              color: arc.to.color || arc.color,
              r: 2.5,
              maxR: isGlobalApp ? 14 : 14,
              alpha: isGlobalApp ? 0.12 : 0.22,
            });
          }
        }

        // Clamped opacity for maximum text legibility (reduced by ~45-50%)
        const renderAlpha = isGlobalApp
          ? Math.min(0.10, Math.max(0.015, arc.alpha))
          : Math.min(0.22, Math.max(0.025, arc.alpha));

        ctx.save();

        // A. Subtle Dotted Ballistic Arc Trajectory (Thinner, reduced intensity)
        ctx.beginPath();
        ctx.moveTo(arc.from.x, arc.from.y);

        // If still in 'connecting' phase, curve draws partially towards target
        if (arc.phase === 'connecting' && arc.connectProgress < 1) {
          const currentEndpoint = getQuadraticBezierPoint(arc.from, arc.cp, arc.to, arc.connectProgress);
          ctx.quadraticCurveTo(arc.cp.x, arc.cp.y, currentEndpoint.x, currentEndpoint.y);
        } else {
          ctx.quadraticCurveTo(arc.cp.x, arc.cp.y, arc.to.x, arc.to.y);
        }

        ctx.strokeStyle = arc.color;
        ctx.lineWidth = isGlobalApp ? 0.70 : 0.75;
        ctx.setLineDash([3, 6]);
        ctx.lineDashOffset = -arc.dashOffset;
        ctx.globalAlpha = isGlobalApp ? renderAlpha * 0.45 : renderAlpha * 0.55;
        ctx.stroke();

        // B. Ambient Arc Under-Glow Line (Thinner, significantly reduced glow)
        ctx.beginPath();
        ctx.moveTo(arc.from.x, arc.from.y);
        ctx.quadraticCurveTo(arc.cp.x, arc.cp.y, arc.to.x, arc.to.y);
        ctx.setLineDash([]);
        ctx.lineWidth = isGlobalApp ? 0.45 : 0.50;
        ctx.globalAlpha = isGlobalApp ? renderAlpha * 0.10 : renderAlpha * 0.16;
        ctx.stroke();

        // C. Glowing Threat Packet / Projectile Traveling Along Trajectory (Subtle, non-distracting)
        if (arc.phase === 'active' && arc.packet.t >= 0 && arc.packet.t <= 1) {
          const pt = getQuadraticBezierPoint(arc.from, arc.cp, arc.to, arc.packet.t);

          // Subtle tracer head
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, arc.packet.size, 0, Math.PI * 2);
          ctx.fillStyle = arc.color;
          ctx.globalAlpha = isGlobalApp
            ? Math.min(0.24, renderAlpha * 1.0)
            : Math.min(0.36, renderAlpha * 1.2);
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = isGlobalApp ? 2.5 : 3.5;
          ctx.fill();

          // Motion-blur comet tail
          if (arc.packet.t > 0.04) {
            const tailPt = getQuadraticBezierPoint(arc.from, arc.cp, arc.to, arc.packet.t - 0.038);
            ctx.beginPath();
            ctx.moveTo(tailPt.x, tailPt.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.strokeStyle = arc.color;
            ctx.lineWidth = arc.packet.size * 0.5;
            ctx.globalAlpha = isGlobalApp ? renderAlpha * 0.22 : renderAlpha * 0.32;
            ctx.stroke();
          }

          // Small telemetry payload text badge along the trajectory - strictly 10% brightness
          if (arc.payloadText && arc.packet.t > 0.20 && arc.packet.t < 0.80) {
            ctx.font = '7.5px "JetBrains Mono", monospace';
            ctx.fillStyle = arc.color;
            ctx.globalAlpha = 0.10;
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.fillText(arc.payloadText, pt.x, pt.y - 6);
          }
        }

        ctx.restore();
      }

      // 4. Render Target Impact & Neutralization Shockwave Bursts
      for (let j = burstRings.length - 1; j >= 0; j--) {
        const ring = burstRings[j];
        ring.r += isGlobalApp ? 0.35 : 0.42;
        ring.alpha -= 0.014;

        if (ring.alpha <= 0 || ring.r >= ring.maxR) {
          burstRings.splice(j, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = isGlobalApp
          ? Math.min(0.12, Math.max(0.02, ring.alpha))
          : Math.min(0.22, Math.max(0.035, ring.alpha));
        ctx.stroke();

        // Secondary inner defense ripple
        if (ring.r > 6) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 0.55;
          ctx.globalAlpha = Math.min(0.16, Math.max(0.025, ring.alpha * 0.6));
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hubs, isGlobalApp, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${
        isGlobalApp
          ? 'fixed inset-0 w-full h-full overflow-hidden'
          : 'absolute inset-0 w-full h-full'
      } ${className}`}
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}
