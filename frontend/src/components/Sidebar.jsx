import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Mail,
  History,
  FileText,
  GraduationCap,
  Info,
  BookOpen,
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
      icon: BookOpen,
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
    <aside className="hidden md:flex flex-col w-[272px] shrink-0 border-r border-[#303B2C]/40 bg-[#404E3B] shadow-sidebar select-none relative text-[#E6E6E6]">
      {/* Sticky Inner Container: stays fixed to viewport during scroll while outer aside spans full height down to footer */}
      <div className="sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar p-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* SECTION 1: Main Navigation Headers (Vertical Order) */}
          <div>
            <div className="px-2 py-1 flex items-center justify-between border-b border-[#BAC8B1]/15 pb-2 mb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#BAC8B1] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]"></span>
                <span>Navigation</span>
              </span>
            </div>

            <div className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border relative ${
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
            <div className="px-2 py-1 flex items-center justify-between border-b border-[#BAC8B1]/15 pb-2 mb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#BAC8B1] font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]"></span>
                <span>Resources &amp; Support</span>
              </span>
            </div>

            <div className="space-y-1">
              {resourceItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border relative ${
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

        {/* SECTION 3: Zero-SSRF Sandbox Status Card (Elevated with balanced vertical spacing) */}
        <div className="pt-3 mt-4 border-t border-[#BAC8B1]/20 shrink-0">
          <div className="rounded-xl border border-[#7B9669]/50 bg-[#2D3929] p-3 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[#7B9669] flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-white font-sans tracking-tight">
                  Zero-SSRF Sandbox
                </span>
              </div>
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7B9669] text-white border border-white/20 shadow-xs">
                ISOLATED
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-[#FFFFFF] font-sans font-medium">
              Strict offline memory execution with zero outbound redirects.
            </p>

            <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-white/15">
              <span className="text-[#BAC8B1] font-bold uppercase tracking-wider">RUNTIME</span>
              <span className="text-white font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#86EFAC] shadow-[0_0_6px_#86EFAC]" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
