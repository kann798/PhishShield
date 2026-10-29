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

            {/* Theme Mode Toggle Icon */}
            <div className="relative group flex items-center">
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white border-[#404E3B]/15 text-[#404E3B] hover:bg-[#BAC8B1]/30 hover:border-[#7B9669]/50 shadow-sm"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#404E3B]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#D97706]" />
                )}
              </button>
            </div>

            {/* PhishShield Extension Preview Modal Trigger Icon */}
            <div className="relative group flex items-center">
              <button
                onClick={onOpenExtension}
                aria-label="Extension"
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 bg-white border-[#404E3B]/15 text-[#404E3B] hover:bg-[#7B9669] hover:text-white shadow-sm"
              >
                <Shield className="w-4 h-4 text-[#7B9669]" />
              </button>
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
