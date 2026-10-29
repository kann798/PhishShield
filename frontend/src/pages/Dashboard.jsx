import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Globe,
  Mail,
  BarChart3,
  Clock,
  Target,
  Link as LinkIcon,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  PieChart as PieIcon,
  AlertTriangle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { api } from '../services/api';
import { formatRelativeTime } from '../utils/dateUtils';

export default function Dashboard({ setActivePage, onSelectScan }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to threat intelligence engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Instant update whenever a URL or Email scan finishes in the application
    const handleNewScan = () => {
      fetchStats();
    };

    window.addEventListener('phishshield:new-scan', handleNewScan);
    window.addEventListener('focus', handleNewScan);

    // Recalculate relative time dynamically every 5 seconds as time passes
    const ticker = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);

    // Periodic sync every 15 seconds to catch scans from any source
    const poller = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => {
      window.removeEventListener('phishshield:new-scan', handleNewScan);
      window.removeEventListener('focus', handleNewScan);
      clearInterval(ticker);
      clearInterval(poller);
    };
  }, []);

  // Compute metric values from actual stats records
  const totalUrls = stats?.total_urls ?? 0;
  const totalEmails = stats?.total_emails ?? 0;
  const totalThreats = stats?.suspicious_count ?? 0;
  const totalSafe = stats?.clean_count ?? 0;

  // Real risk counts from actual scan records
  const lowCount = stats?.risk_distribution?.Low ?? (stats?.clean_count ?? 0);
  const mediumCount = stats?.risk_distribution?.Medium ?? 0;
  const highCount = stats?.risk_distribution?.High ?? 0;
  const criticalCount = stats?.risk_distribution?.Critical ?? 0;
  const totalClassified = lowCount + mediumCount + highCount + criticalCount;

  // Breakdown data for Doughnut chart & Legend
  // Order matching reference screenshot: Low Risk, High Risk, Medium Risk, Critical Risk
  const breakdownLegendData = [
    { name: 'Low Risk', value: lowCount, color: '#7B9669' },
    { name: 'High Risk', value: highCount, color: '#EA580C' },
    { name: 'Medium Risk', value: mediumCount, color: '#D97706' },
    { name: 'Critical Risk', value: criticalCount, color: '#DC2626' },
  ];

  // For Doughnut Chart slices
  const doughnutChartData = breakdownLegendData.filter((item) => item.value > 0);
  const displayDoughnutData =
    doughnutChartData.length > 0
      ? doughnutChartData
      : [{ name: 'No Data', value: 1, color: 'rgba(64, 78, 59, 0.1)' }];

  // Volume Bar Chart data: Low Risk, Medium Risk, High Risk, Critical Risk
  const volumeBarData = [
    { name: 'Low Risk', value: lowCount, color: '#7B9669' },
    { name: 'Medium Risk', value: mediumCount, color: '#D97706' },
    { name: 'High Risk', value: highCount, color: '#EA580C' },
    { name: 'Critical Risk', value: criticalCount, color: '#DC2626' },
  ];

  // Latest completed scan from database (sorted by completion timestamp descending)
  const latestScan =
    stats?.latest_scan ||
    (stats?.recent_scans && stats.recent_scans.length > 0
      ? stats.recent_scans[0]
      : null);

  // Threat badge helper
  const renderThreatBadge = (classification) => {
    const cls = (classification || 'Low').toLowerCase();
    if (cls === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300">
          <ArrowUp className="w-3 h-3 text-rose-600" />
          <span>Critical Risk</span>
        </span>
      );
    }
    if (cls === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-300">
          <span className="text-[10px]">◆</span>
          <span>High Risk</span>
        </span>
      );
    }
    if (cls === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300">
          <span className="text-[10px]">◆</span>
          <span>Medium Risk</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#7B9669]/15 text-[#404E3B] border border-[#7B9669]/30">
        <ArrowUp className="w-3 h-3 text-[#7B9669]" />
        <span>Low Risk</span>
      </span>
    );
  };

  // Color helper for Last Scan Summary result
  const getResultColor = (classification) => {
    const cls = (classification || 'Low').toLowerCase();
    if (cls === 'critical') return 'text-rose-600';
    if (cls === 'high') return 'text-orange-600';
    if (cls === 'medium') return 'text-amber-600';
    return 'text-[#7B9669]';
  };

  const customTooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(64, 78, 59, 0.2)',
    borderRadius: '12px',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#404E3B',
    boxShadow: '0 8px 24px rgba(64, 78, 59, 0.15)',
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* 1. Header & Last Scan Summary Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Heading & Subtitle */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#404E3B] font-heading">
              SECURITY OPERATIONS DASHBOARD
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-[#7B9669]/15 border border-[#7B9669]/35 text-[#404E3B]">
              <span className="w-2 h-2 rounded-full bg-[#7B9669]"></span>
              • LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6C8480] mt-1 font-sans">
            Real-time threat analytics, heuristic risk distribution, and security inspection logs.
          </p>
        </div>

        {/* Right: Last Scan Summary Card */}
        <div className="rounded-2xl p-3.5 sm:p-4 border border-[#404E3B]/15 bg-white shadow-sm w-full lg:w-auto lg:min-w-[320px] shrink-0">
          <div className="flex items-center justify-between gap-4 pb-2.5 mb-2.5 border-b border-[#404E3B]/10">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#7B9669]/15 text-[#404E3B]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#7B9669]" />
              </div>
              <span className="text-xs font-mono font-bold text-[#404E3B] tracking-wide">
                Last Scan Summary
              </span>
            </div>
            <button
              onClick={() => {
                if (latestScan) {
                  onSelectScan(latestScan.id);
                } else {
                  setActivePage('history');
                }
              }}
              className="text-xs font-mono font-bold text-[#7B9669] hover:text-[#404E3B] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {latestScan ? (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#6C8480] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6C8480]" />
                  <span>Last Scan</span>
                </span>
                <span className="text-[#404E3B] font-medium">
                  {formatRelativeTime(latestScan.created_at_iso || latestScan.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#6C8480] flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-[#6C8480]" />
                  <span>Type</span>
                </span>
                <span className="text-[#404E3B] font-medium capitalize">
                  {latestScan.scan_type === 'email' ? 'Email' : 'URL'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#6C8480] flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#6C8480]" />
                  <span>Result</span>
                </span>
                <span className={`font-bold ${getResultColor(latestScan.classification)}`}>
                  {latestScan.classification} Risk
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#6C8480] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span>Status</span>
                </span>
                <span className="text-[#7B9669] font-bold flex items-center gap-1">
                  <span>•</span>
                  <span>Completed</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-xs font-mono text-[#6C8480]">
              No scans yet
            </div>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}. Please verify the Flask backend is operational on port 5000.</span>
          </div>
          <button onClick={fetchStats} className="underline font-bold hover:text-rose-950">
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Four Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: URLs Analyzed */}
        <div className="rounded-2xl p-5 border border-[#404E3B]/12 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#6C8480]">
              URLs Analyzed
            </span>
            <div className="w-9 h-9 rounded-full bg-[#7B9669]/15 border border-[#7B9669]/30 flex items-center justify-center text-[#404E3B]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#404E3B] tracking-tight">
                {totalUrls}
              </span>
              <span className="text-xs font-mono font-bold text-[#7B9669] flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>12%</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-[#7B9669] mt-1 font-mono tracking-wide">
              Web links inspected
            </p>
          </div>
        </div>

        {/* Card 2: Emails Analyzed */}
        <div className="rounded-2xl p-5 border border-[#404E3B]/12 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#6C8480]">
              Emails Analyzed
            </span>
            <div className="w-9 h-9 rounded-full bg-[#6C8480]/15 border border-[#6C8480]/30 flex items-center justify-center text-[#404E3B]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#404E3B] tracking-tight">
                {totalEmails}
              </span>
              <span className="text-xs font-mono font-bold text-[#7B9669] flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>8%</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-[#6C8480] mt-1 font-mono tracking-wide">
              Headers &amp; bodies parsed
            </p>
          </div>
        </div>

        {/* Card 3: Threats Detected */}
        <div className="rounded-2xl p-5 border border-rose-200 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-rose-500 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-rose-700">
              Threats Detected
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black font-mono text-rose-600 tracking-tight">
                {totalThreats}
              </span>
              <span className="text-xs font-mono font-bold text-rose-600 flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>15%</span>
              </span>
            </div>
            <p className="text-xs font-bold text-rose-600 mt-1 font-mono tracking-wider uppercase">
              CRITICAL / HIGH ANOMALIES
            </p>
          </div>
        </div>

        {/* Card 4: Safe Items Verified */}
        <div className="rounded-2xl p-5 border border-[#404E3B]/12 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#6C8480]">
              Safe Items Verified
            </span>
            <div className="w-9 h-9 rounded-full bg-[#7B9669]/15 border border-[#7B9669]/30 flex items-center justify-center text-[#7B9669]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#404E3B] tracking-tight">
                {totalSafe}
              </span>
              <span className="text-xs font-mono font-bold text-[#7B9669] flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>5%</span>
              </span>
            </div>
            <p className="text-xs font-bold text-[#7B9669] mt-1 font-mono tracking-wider uppercase">
              ZERO THREAT SIGNATURES
            </p>
          </div>
        </div>
      </div>

      {/* 3. Analytics & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Chart 1: Threat Classification Breakdown */}
        <div className="rounded-2xl p-5 sm:p-6 shadow-sm border border-[#404E3B]/12 bg-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#404E3B]/10">
            <PieIcon className="w-4 h-4 text-[#7B9669]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#404E3B] font-mono uppercase tracking-wider">
              Threat Classification Breakdown
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
            {/* Doughnut Chart */}
            <div className="w-48 h-48 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayDoughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={displayDoughnutData.length > 1 ? 2 : 0}
                    dataKey="value"
                  >
                    {displayDoughnutData.map((entry, index) => (
                      <Cell
                        key={`donut-cell-${index}`}
                        fill={entry.color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className="flex-1 max-w-xs space-y-3 font-mono text-xs w-full">
              {breakdownLegendData.map((item) => {
                const pct =
                  totalClassified > 0
                    ? Math.round((item.value / totalClassified) * 100)
                    : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                      <span className="text-[#404E3B] font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#404E3B]">
                      {item.value}{' '}
                      <span className="text-[#6C8480] font-normal">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Risk Distribution Volume */}
        <div className="rounded-2xl p-5 sm:p-6 shadow-sm border border-[#404E3B]/12 bg-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#404E3B]/10">
            <BarChart3 className="w-4 h-4 text-[#7B9669]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#404E3B] font-mono uppercase tracking-wider">
              Risk Distribution Volume
            </h3>
          </div>

          <div className="h-56 sm:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeBarData}
                margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(64, 78, 59, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6C8480"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  stroke="#6C8480"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  fontFamily="JetBrains Mono, monospace"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(64, 78, 59, 0.04)' }}
                  contentStyle={customTooltipStyle}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={55}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    fill="#404E3B"
                    fontSize={12}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    offset={8}
                  />
                  {volumeBarData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recent Threat Telemetry & Inspection Logs Table */}
      <div className="rounded-2xl p-5 sm:p-6 shadow-sm border border-[#404E3B]/12 bg-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#404E3B]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7B9669]/15 border border-[#7B9669]/30 text-[#404E3B]">
              <Shield className="w-4 h-4 text-[#7B9669]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#404E3B] font-mono uppercase tracking-wider">
                Recent Threat Telemetry &amp; Inspection Logs
              </h3>
              <p className="text-xs text-[#6C8480] font-sans mt-0.5">
                Latest heuristics inspection events logged by the detection engine.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('history')}
            className="text-xs text-[#7B9669] hover:text-[#404E3B] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats && stats.recent_scans && stats.recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-[#EEF3EC] border-b border-[#404E3B]/15 text-[#404E3B] uppercase text-[11px] font-mono font-semibold tracking-wider">
                  <th className="py-3 px-4 w-28">Type</th>
                  <th className="py-3 px-4">Target / Subject</th>
                  <th className="py-3 px-4 w-36">Threat Level</th>
                  <th className="py-3 px-4 w-28">Risk Score</th>
                  <th className="py-3 px-4 w-44">Timestamp</th>
                  <th className="py-3 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404E3B]/10 font-mono">
                {stats.recent_scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#F4F7F4] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-[#404E3B] font-bold">
                        {scan.scan_type === 'email' ? (
                          <Mail className="w-3.5 h-3.5 text-[#6C8480] shrink-0" />
                        ) : (
                          <LinkIcon className="w-3.5 h-3.5 text-[#7B9669] shrink-0" />
                        )}
                        <span>{scan.scan_type ? scan.scan_type.toUpperCase() : 'URL'}</span>
                      </div>
                    </td>
                    <td
                      className="py-3.5 px-4 text-[#2C3527] font-medium max-w-xs sm:max-w-md truncate"
                      title={scan.target_identifier}
                    >
                      {scan.target_identifier}
                    </td>
                    <td className="py-3.5 px-4">
                      {renderThreatBadge(scan.classification)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-[#404E3B] text-xs">{scan.risk_score}</span>
                      <span className="text-[#6C8480] text-xs">/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6C8480] text-xs">
                      {scan.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectScan(scan.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EEF3EC] hover:bg-[#7B9669] hover:text-white text-[#404E3B] border border-[#404E3B]/20 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#6C8480] font-mono">
            No telemetry records logged yet. Run a URL or Email analysis to generate live metrics.
          </div>
        )}
      </div>
    </div>
  );
}
