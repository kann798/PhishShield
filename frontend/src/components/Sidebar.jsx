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
    </aside>
  );
}
