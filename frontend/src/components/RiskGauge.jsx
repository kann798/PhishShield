import React from 'react';

export default function RiskGauge({ score = 0, classification = 'Low' }) {
  // Normalize score between 0 and 100
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  // Radius and circumference for circular progress
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const getColor = (val) => {
    if (val >= 76) {
      return {
        stroke: '#EF4444',
        text: 'text-[#EF4444]',
        badge: 'bg-rose-500/15 border-rose-500/40 text-[#EF4444]',
        glow: 'rgba(239, 68, 68, 0.45)',
      };
    }
    if (val >= 51) {
      return {
        stroke: '#F97316',
        text: 'text-[#F97316]',
        badge: 'bg-orange-500/15 border-orange-500/40 text-[#F97316]',
        glow: 'rgba(249, 115, 22, 0.45)',
      };
    }
    if (val >= 26) {
      return {
        stroke: '#F59E0B',
        text: 'text-[#F59E0B]',
        badge: 'bg-amber-500/15 border-amber-500/40 text-[#F59E0B]',
        glow: 'rgba(245, 158, 11, 0.45)',
      };
    }
    return {
      stroke: '#10B981',
      text: 'text-[#10B981]',
      badge: 'bg-emerald-500/15 border-emerald-500/40 text-[#10B981]',
      glow: 'rgba(16, 185, 129, 0.45)',
    };
  };

  const style = getColor(clamped);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 filter drop-shadow-sm"
        >
          {/* Background Track */}
          <circle
            className="stroke-slate-200 dark:stroke-white/10 transition-colors duration-200"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Active Meter */}
          <circle
            stroke={style.stroke}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
              filter: `drop-shadow(0 0 10px ${style.glow})`,
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute flex flex-col items-center text-center">
          <span className={`text-4xl font-black tracking-tight font-mono ${style.text}`}>
            {clamped}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            / 100 Score
          </span>
        </div>
      </div>

      {/* Label and Heuristic Notice */}
      <div className="mt-2 text-center">
        <span
          className={`inline-block text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm backdrop-blur-sm ${style.badge}`}
        >
          {classification} Risk
        </span>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] font-sans">
          Calibrated heuristic threat assessment
        </p>
      </div>
    </div>
  );
}
