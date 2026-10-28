import React, { useEffect, useState } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  Globe,
  Mail,
  History,
  FileText,
  Cpu,
  GraduationCap,
  Info,
  Compass,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PhishingWorkflowDiagram from './PhishingWorkflowDiagram';

export default function Navbar({
  activePage,
  setActivePage,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenExtension,
}) {
  const [engineStatus, setEngineStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const { theme, toggleTheme } = useTheme();

  // Mobile drawer navigation items in vertical order
  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'url', label: 'URL Analyzer', icon: Globe, badge: 'Live' },
    { id: 'email', label: 'Email Analyzer', icon: Mail, badge: 'NLP' },
    { id: 'history', label: 'Scan History', icon: History, badge: null },
    { id: 'reports', label: 'Reports & Export', icon: FileText, badge: null },
    { id: 'awareness', label: 'Awareness Center', icon: GraduationCap, badge: 'QUIZ' },
    { id: 'help', label: 'Help & Resources', icon: Compass, badge: null },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, badge: null },
    { id: 'contact', label: 'Contact & Feedback', icon: MessageSquare, badge: null },
    { id: 'about', label: 'About & Defense', icon: Info, badge: null },
  ];

  const checkStatus = async () => {
    try {
      await api.getHealth();
      setEngineStatus('online');
    } catch {
      setEngineStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (id) => {
    setActivePage(id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[rgba(7,17,31,0.65)] backdrop-blur-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-colors duration-200 liquid-glass-nav">
      {/* Top Specular Glass Reflection Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sleek Single-Tier Top Header */}
        <div className="flex items-center justify-between py-2.5 gap-3 min-h-[72px]">
          {/* Left: Brand & Mobile Menu Button */}
          <div className="flex-1 flex items-center justify-start gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#10B981]" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-4.5 h-4.5 text-[#10B981]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-radar-glow"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-heading">
                    PHISH<span className="text-[#10B981]">SHIELD</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-700 dark:text-[#10B981] border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                    v1.2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center (TOP): Phishing Workflow Story Animation in Middle */}
          <div className="flex-none hidden min-[860px]:flex items-center justify-center">
            <PhishingWorkflowDiagram className="w-full max-w-xl" />
          </div>

          {/* Right: Status Pills & Theme Controls */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
            {/* Engine Status Pill */}
            <div
              title={`Security Engine Status: ${engineStatus.toUpperCase()}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold bg-white/85 dark:bg-[rgba(8,20,40,0.60)] backdrop-blur-md border-slate-300/80 dark:border-white/10 shadow-sm"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  engineStatus === 'online'
                    ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
                    : engineStatus === 'offline'
                    ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'
                    : 'bg-[#F59E0B] animate-pulse'
                }`}
              ></span>
              <span className="hidden xl:inline text-xs font-mono font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                {engineStatus === 'online' ? 'ENGINE ACTIVE' : engineStatus === 'offline' ? 'OFFLINE' : 'CONNECTING'}
              </span>
            </div>

            {/* ML Engine Status Pill */}
            <div
              title="RandomForest + NLP TF-IDF Dual Classifier Active"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold bg-white/85 dark:bg-[rgba(8,20,40,0.60)] backdrop-blur-md border-slate-300/80 dark:border-white/10 shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981] animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-wide text-emerald-700 dark:text-[#10B981]">ML: ON</span>
            </div>

            {/* Theme Mode Toggle Icon (Hover Tooltip: Dark Glass) */}
            <div className="relative group flex items-center">
              <button
                onClick={toggleTheme}
                aria-label="Dark Glass"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white/85 dark:bg-[rgba(255,255,255,0.07)] backdrop-blur-md border-slate-300/80 dark:border-white/12 text-slate-700 dark:text-slate-200 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white shadow-sm"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </button>
              {/* Tooltip on Hover */}
              <div
                role="tooltip"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-[rgba(8,20,40,0.95)] border border-slate-700/60 dark:border-white/15 text-white text-[11px] font-mono font-medium shadow-[0_8px_20px_rgba(0,0,0,0.4)] whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 backdrop-blur-md"
              >
                Dark Glass
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-[#081428] border-t border-l border-slate-700/60 dark:border-white/15" />
              </div>
            </div>

            {/* PhishShield Extension Preview Modal Trigger Icon (Hover Tooltip: Extension) */}
            <div className="relative group flex items-center">
              <button
                onClick={onOpenExtension}
                aria-label="Extension"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-emerald-500/10 dark:bg-[rgba(16,185,129,0.14)] border-emerald-500/35 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_14px_rgba(16,185,129,0.4)] shadow-sm"
              >
                <Shield className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
              </button>
              {/* Tooltip on Hover */}
              <div
                role="tooltip"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-[rgba(8,20,40,0.95)] border border-slate-700/60 dark:border-white/15 text-white text-[11px] font-mono font-medium shadow-[0_8px_20px_rgba(0,0,0,0.4)] whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 backdrop-blur-md"
              >
                Extension
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-[#081428] border-t border-l border-slate-700/60 dark:border-white/15" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Only visible on narrow mobile screens, vertical layout) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#07111f]/95 backdrop-blur-2xl p-4 space-y-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-800 dark:text-[#10B981]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#10B981]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-[#10B981]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
