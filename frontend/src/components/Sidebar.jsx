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
    <aside className="hidden md:flex flex-col justify-between w-[272px] shrink-0 border-r border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[rgba(6,16,36,0.72)] backdrop-blur-[24px] p-4 min-h-[calc(100vh-4rem)] shadow-[4px_0_30px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.4)] select-none liquid-glass-sidebar relative overflow-y-auto no-scrollbar">
      {/* Right Specular Edge Line */}
      <div className="absolute top-0 right-0 w-[1px] inset-y-0 bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent pointer-events-none" />

      <div className="space-y-6">
        {/* SECTION 1: Main Navigation Headers (Vertical Order) */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"></span>
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border group backdrop-blur-md relative ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-600/45 text-emerald-950 font-bold dark:bg-[rgba(16,185,129,0.14)] dark:border-emerald-500/45 dark:text-white shadow-[0_2px_12px_rgba(16,185,129,0.18)] dark:shadow-[0_0_16px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 dark:text-[rgba(255,255,255,0.75)] dark:hover:text-white dark:hover:bg-white/5 hover:border-slate-300/80 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-emerald-700 dark:text-[#10B981] filter drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-[#10B981]'
                      }`}
                    />
                    <span className="font-sans tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-emerald-600/15 text-emerald-800 border border-emerald-600/30 dark:bg-emerald-500/20 dark:text-[#10B981] dark:border-emerald-500/40'
                          : 'bg-slate-200/90 text-slate-700 border border-slate-300/80 dark:bg-black/40 dark:text-slate-400 dark:border-white/10'
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
          <div className="px-2 py-1 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border group backdrop-blur-md relative ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-600/45 text-emerald-950 font-bold dark:bg-[rgba(16,185,129,0.14)] dark:border-emerald-500/45 dark:text-white shadow-[0_2px_12px_rgba(16,185,129,0.18)] dark:shadow-[0_0_16px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 dark:text-[rgba(255,255,255,0.75)] dark:hover:text-white dark:hover:bg-white/5 hover:border-slate-300/80 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-emerald-700 dark:text-[#10B981] filter drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-[#10B981]'
                      }`}
                    />
                    <span className="font-sans tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-emerald-600/15 text-emerald-800 border border-emerald-600/30 dark:bg-emerald-500/20 dark:text-[#10B981] dark:border-emerald-500/40'
                          : 'bg-slate-200/90 text-slate-700 border border-slate-300/80 dark:bg-black/40 dark:text-slate-400 dark:border-white/10'
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
      <div className="pt-4 mt-6 border-t border-slate-200/80 dark:border-white/10 shrink-0">
        <div className="liquid-glass-card rounded-xl border border-emerald-500/25 dark:border-emerald-500/30 bg-slate-100/70 dark:bg-[rgba(10,24,52,0.75)] p-3.5 space-y-2 relative overflow-hidden shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          {/* Top Specular Line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                Zero-SSRF Sandbox
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              ISOLATED
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            Strict offline memory execution with zero outbound redirects.
          </p>

          <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/5">
            <span className="uppercase tracking-wider">RUNTIME</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
