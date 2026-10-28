import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScanDetailModal from './components/ScanDetailModal';
import ExtensionPreviewModal from './components/ExtensionPreviewModal';
import SecurityDisclaimerModal from './components/SecurityDisclaimerModal';
import GlobalWorldMapBackground from './components/GlobalWorldMapBackground';
import FixedThreatTelemetryPanel from './components/FixedThreatTelemetryPanel';
import Dashboard from './pages/Dashboard';
import UrlAnalyzer from './pages/UrlAnalyzer';
import EmailAnalyzer from './pages/EmailAnalyzer';
import ScanHistory from './pages/ScanHistory';
import AwarenessCenter from './pages/AwarenessCenter';
import Reports from './pages/Reports';
import About from './pages/About';
import HelpResources from './pages/HelpResources';
import FAQ from './pages/FAQ';
import ContactFeedback from './pages/ContactFeedback';
import { api } from './services/api';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedScanDetail, setSelectedScanDetail] = useState(null);
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [telemetryCollapsed, setTelemetryCollapsed] = useState(true);
  const [securityModal, setSecurityModal] = useState({ open: false, section: 'disclaimer' });
  const [contactSubject, setContactSubject] = useState('');

  const handleOpenScanDetail = async (scanId) => {
    try {
      const res = await api.getScan(scanId);
      if (res.success) {
        setSelectedScanDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load scan details:', err);
    }
  };

  const handleDeleteScan = async (scanId) => {
    try {
      await api.deleteScan(scanId);
      setSelectedScanDetail(null);
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} onSelectScan={handleOpenScanDetail} />;
      case 'url':
        return <UrlAnalyzer onSelectScan={handleOpenScanDetail} />;
      case 'email':
        return <EmailAnalyzer onSelectScan={handleOpenScanDetail} />;
      case 'history':
        return <ScanHistory onSelectScan={handleOpenScanDetail} />;
      case 'awareness':
        return <AwarenessCenter />;
      case 'reports':
        return <Reports />;
      case 'help':
        return <HelpResources setActivePage={setActivePage} />;
      case 'faq':
        return <FAQ setActivePage={setActivePage} />;
      case 'contact':
        return <ContactFeedback initialSubject={contactSubject} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard setActivePage={setActivePage} onSelectScan={handleOpenScanDetail} />;
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden ${
        theme === 'dark'
          ? 'bg-[#040b18] text-[rgba(255,255,255,0.92)]'
          : 'bg-[#edf2f9] text-[#111827]'
      }`}
    >
      {/* Animated Global World Map Full-Screen Background (Corner-to-Corner behind whole app) */}
      <GlobalWorldMapBackground theme={theme} />

      {/* Top Threat Defense Navbar (Translucent Glass above the World Map) */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenExtension={() => setExtensionModalOpen(true)}
      />

      {/* Main Layout: Left-Side Panel + Fluid Content Area */}
      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)] relative z-10">
        {/* Left-Side Panel: Navigation, Awareness & Support (Translucent Glass above the World Map) */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0 transition-all duration-300 relative z-10 flex flex-col ${
            telemetryCollapsed ? '' : 'xl:pr-[330px]'
          }`}
        >
          <div className="w-full max-w-[1920px] mx-auto flex-1 flex flex-col justify-between">
            <div className="flex-1">
              {renderPage()}
            </div>

            {/* Professional Website Footer */}
            <Footer
              setActivePage={setActivePage}
              onOpenSecurity={(section) => setSecurityModal({ open: true, section })}
              onSelectContactSubject={(subj) => setContactSubject(subj)}
            />
          </div>
        </main>
      </div>

      {/* Fixed Threat Telemetry Panel on the Right Side (Anchored while dashboard scrolls) */}
      <FixedThreatTelemetryPanel
        collapsed={telemetryCollapsed}
        onToggleCollapse={() => setTelemetryCollapsed(!telemetryCollapsed)}
      />

      {/* Global Scan Inspection Modal */}
      {selectedScanDetail && (
        <ScanDetailModal
          scan={selectedScanDetail}
          onClose={() => setSelectedScanDetail(null)}
          onDelete={handleDeleteScan}
        />
      )}

      {/* PhishShield Extension Interactive Preview Modal (Root Level) */}
      <ExtensionPreviewModal
        isOpen={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
      />

      {/* Security Disclaimer, Privacy & Responsible Use Modal */}
      <SecurityDisclaimerModal
        isOpen={securityModal.open}
        activeSection={securityModal.section}
        onClose={() => setSecurityModal({ open: false, section: 'disclaimer' })}
      />
    </div>
  );
}
