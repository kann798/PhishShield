import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Mail,
  History,
  FileText,
  GraduationCap,
  Info,
  Compass,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, mobileMenuOpen, setMobileMenuOpen }) {
  // Main Navigation Headers arranged in Vertical Order
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'url', label: 'URL Analyzer', icon: Globe, badge: 'Live' },
    { id: 'email', label: 'Email Analyzer', icon: Mail, badge: 'NLP' },
    { id: 'history', label: 'Scan History', icon: History, badge: null },
    { id: 'reports', label: 'Reports & Export', icon: FileText, badge: null },
  ];

  // Secondary Resources & Support Items arranged in Vertical Order matching reference image
  const resourceItems = [
    {
      id: 'awareness',
      label: 'Awareness Center',
      icon: GraduationCap,
      badge: 'QUIZ',
    },
    {
      id: 'help',
      label: 'Help & Resources',
      icon: Compass,
      badge: null,
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'contact',
      label: 'Contact & Feedback',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'about',
      label: 'About & Defense',
      icon: Info,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <aside className="hidden md:flex flex-col justify-between w-[272px] shrink-0 border-r border-[#303B2C]/40 bg-[#404E3B] p-4 min-h-[calc(100vh-4rem)] shadow-sidebar select-none relative overflow-y-auto no-scrollbar text-[#E6E6E6]">
      <div className="space-y-6">
        {/* Sidebar Brand Header */}
        <div className="px-2 pt-1 pb-3 border-b border-[#BAC8B1]/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7B9669] flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white font-heading">
              PHISH<span className="text-[#BAC8B1]">SHIELD</span>
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#BAC8B1]/80">
              Threat Intelligence
            </p>
          </div>
        </div>

        {/* SECTION 1: Main Navigation Headers (Vertical Order) */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between border-b border-[#BAC8B1]/15 pb-2 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#BAC8B1] font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]"></span>
              <span>Navigation</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border relative ${
                    isActive
                      ? 'bg-[#7B9669] border-[#7B9669] text-white shadow-sm font-bold'
                      : 'border-transparent text-[#E6E6E6]/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-[#BAC8B1] group-hover:text-white'
                      }`}
                    />
                    <span className="font-sans tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#404E3B] text-white border border-white/20'
                          : 'bg-black/25 text-[#BAC8B1] border border-white/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Resources & Knowledge (Vertical Order) */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between border-b border-[#BAC8B1]/15 pb-2 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#BAC8B1] font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]"></span>
              <span>Resources &amp; Support</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {resourceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border relative ${
                    isActive
                      ? 'bg-[#7B9669] border-[#7B9669] text-white shadow-sm font-bold'
                      : 'border-transparent text-[#E6E6E6]/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-[#BAC8B1] group-hover:text-white'
                      }`}
                    />
                    <span className="font-sans tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#404E3B] text-white border border-white/20'
                          : 'bg-black/25 text-[#BAC8B1] border border-white/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Zero-SSRF Sandbox Status Card */}
      <div className="pt-4 mt-6 border-t border-[#BAC8B1]/15 shrink-0">
        <div className="rounded-xl border border-[#BAC8B1]/25 bg-[#303B2C] p-3.5 space-y-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#7B9669]/25 border border-[#7B9669]/40 text-[#BAC8B1]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BAC8B1]" />
              </div>
              <span className="text-xs font-bold text-white font-sans tracking-tight">
                Zero-SSRF Sandbox
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#7B9669]/30 text-white border border-[#7B9669]/50">
              ISOLATED
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-[#E6E6E6]/80 font-sans">
            Strict offline memory execution with zero outbound redirects.
          </p>

          <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-[#BAC8B1] border-t border-white/10">
            <span className="uppercase tracking-wider">RUNTIME</span>
            <span className="text-white font-bold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7B9669]" />
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
