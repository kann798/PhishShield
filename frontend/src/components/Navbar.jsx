import React, { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
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
  BookOpen,
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
    { id: 'help', label: 'Help & Resources', icon: BookOpen, badge: null },
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
    <header className="sticky top-0 z-40 w-full border-b border-[#404E3B]/15 bg-[#EEF3EC]/90 backdrop-blur-[20px] shadow-[0_2px_12px_rgba(64,78,59,0.06)] transition-colors duration-200">
      {/* Top Specular Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#7B9669]/40 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sleek Single-Tier Top Header */}
        <div className="flex items-center justify-between py-2.5 gap-3 min-h-[72px]">
          {/* Left: Brand & Mobile Menu Button */}
          <div className="flex-1 flex items-center justify-start gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#404E3B] hover:text-[#2C3527] rounded-lg hover:bg-[#BAC8B1]/30 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#7B9669]" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#7B9669]/20 border border-[#7B9669]/40 text-[#404E3B] shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-4.5 h-4.5 text-[#404E3B]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7B9669]"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-[#404E3B] font-heading">
                    PHISH<span className="text-[#7B9669]">SHIELD</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide uppercase bg-[#BAC8B1]/40 text-[#404E3B] border border-[#7B9669]/30">
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

          {/* Right: Status Pills & Controls */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
            {/* Engine Status Pill */}
            <div
              title={`Security Engine Status: ${engineStatus.toUpperCase()}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold bg-white border-[#404E3B]/15 text-[#404E3B] shadow-sm"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  engineStatus === 'online'
                    ? 'bg-[#7B9669]'
                    : engineStatus === 'offline'
                    ? 'bg-[#DC2626]'
                    : 'bg-[#D97706] animate-pulse'
                }`}
              ></span>
              <span className="hidden xl:inline text-xs font-mono font-semibold tracking-wide text-[#404E3B]">
                {engineStatus === 'online' ? 'ENGINE ACTIVE' : engineStatus === 'offline' ? 'OFFLINE' : 'CONNECTING'}
              </span>
            </div>

            {/* ML Engine Status Pill */}
            <div
              title="RandomForest + NLP TF-IDF Dual Classifier Active"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold bg-white border-[#404E3B]/15 text-[#404E3B] shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-[#7B9669]" />
              <span className="text-xs font-mono font-semibold tracking-wide text-[#7B9669]">ML: ON</span>
            </div>

            {/* Live Threat Telemetry Icon - Compact fixed w-8 h-8 button (never expands horizontally or disturbs other header elements) */}
            <div className="relative group flex items-center">
              <div
                role="button"
                tabIndex={0}
                aria-label="Live Threat Telemetry"
                className="relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white dark:bg-[#404E3B] border-[#404E3B]/15 dark:border-[#7B9669]/60 text-[#404E3B] dark:text-white hover:bg-[#BAC8B1]/30 hover:border-[#7B9669]/50 shadow-sm cursor-pointer select-none group-hover:shadow-md"
              >
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7B9669] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A] dark:bg-[#86EFAC]"></span>
                </span>
                <Activity className="w-4 h-4 text-[#7B9669] dark:text-[#86EFAC] group-hover:scale-110 transition-transform" />
              </div>

              {/* Rich Telemetry Popover Card on Hover ONLY (Never on click, zero header shift) */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="w-[310px] p-4 rounded-2xl border border-[#BAC8B1]/25 bg-[#303B2C] text-white shadow-2xl backdrop-blur-2xl text-xs font-mono select-none space-y-3">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#7B9669] text-white shadow-xs">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <span>THREAT TELEMETRY</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-ping"></span>
                        </span>
                        <span className="text-[10px] text-[#BAC8B1] block">Real-time Global Sensor Feed</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#86EFAC] bg-[#7B9669]/30 px-2 py-0.5 rounded border border-[#7B9669]/50">
                      LIVE
                    </span>
                  </div>

                  {/* Quick Summary Pill */}
                  <div className="px-3 py-2 rounded-xl bg-[#283225] border border-[#7B9669]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#86EFAC]"></span>
                      <span className="font-bold text-white tracking-wider">STATUS:</span>
                      <span className="text-rose-300 font-bold">298 ALERTS</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#86EFAC] font-bold">
                      <span>•</span>
                      <span>50ms RTT</span>
                    </div>
                  </div>

                  {/* Payloads Audited */}
                  <div className="p-2.5 rounded-xl bg-[#404E3B] border border-white/10 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#BAC8B1] block">PAYLOADS AUDITED</span>
                      <span className="text-xl font-black text-white">300K</span>
                      <span className="text-[10px] font-bold text-amber-300 ml-1.5">78% Risk</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#86EFAC]">14.5K</span>
                      <span className="text-[9.5px] text-[#BAC8B1] block">+12% vs avg</span>
                    </div>
                  </div>

                  {/* Threats & Latency Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#4A2828] border border-rose-500/40">
                      <span className="text-[10px] uppercase font-bold text-rose-200 block">THREATS DETECTED</span>
                      <span className="text-base font-black text-rose-300">298 ALERTS</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#404E3B] border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-[#BAC8B1] block">LATENCY</span>
                      <span className="text-base font-black text-[#86EFAC]">50ms</span>
                      <span className="text-[9.5px] text-[#BAC8B1] block">12ms P99</span>
                    </div>
                  </div>

                  {/* Telemetry Taxonomy Breakdown */}
                  <div className="p-2.5 rounded-xl bg-[#404E3B] border border-white/10 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#BAC8B1]">Phishing Origin:</span>
                      <span className="text-rose-300 font-bold">176 / hr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#BAC8B1]">Malware Delivery:</span>
                      <span className="text-amber-300 font-bold">41.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#BAC8B1]">Social Eng. Ratio:</span>
                      <span className="text-[#86EFAC] font-bold">33.3%</span>
                    </div>
                  </div>

                  {/* Live Threat Stream Ticker */}
                  <div className="p-2 rounded-xl bg-[#283225] border border-[#7B9669]/40 text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-ping shrink-0"></span>
                      <span className="text-[#BAC8B1]">Intercept:</span>
                      <span className="text-white font-bold truncate">Honeypot [FRA-04]</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#7B9669]/30 text-[#86EFAC] font-bold text-[9px] border border-[#7B9669]/50">
                      ROUTED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Mode Toggle Icon with Tooltip */}
            <div className="relative group flex items-center">
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white border-[#404E3B]/15 text-[#404E3B] hover:bg-[#BAC8B1]/30 hover:border-[#7B9669]/50 shadow-sm cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#404E3B]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#D97706]" />
                )}
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                <div className="px-2.5 py-1 rounded-lg bg-[#303B2C] text-white text-[11px] font-mono font-semibold whitespace-nowrap shadow-lg border border-[#BAC8B1]/30">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
              </div>
            </div>

            {/* PhishShield Extension Trigger Icon with High-Contrast Hover & Icon Name Tooltip */}
            <div className="relative group/ext flex items-center">
              <button
                onClick={onOpenExtension}
                aria-label="Browser Extension"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white border-[#404E3B]/15 text-[#404E3B] hover:bg-[#7B9669] hover:border-[#7B9669] shadow-sm cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#7B9669] group-hover/ext:text-white transition-colors" />
              </button>

              {/* Display icon name on hover */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/ext:opacity-100 group-hover/ext:visible transition-all duration-200 pointer-events-none z-50">
                <div className="px-2.5 py-1 rounded-lg bg-[#303B2C] text-white text-[11px] font-mono font-semibold whitespace-nowrap shadow-lg border border-[#BAC8B1]/30">
                  Browser Extension
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Only visible on narrow mobile screens, vertical layout) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#404E3B]/15 bg-[#EEF3EC] p-4 space-y-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#7B9669] text-white'
                    : 'text-[#404E3B] hover:bg-[#BAC8B1]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7B9669]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-[#BAC8B1]/50 text-[#404E3B]'}`}>
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
