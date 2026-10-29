import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Database } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardModule } from './features/dashboard/DashboardModule';
import { VisitInputModule } from './features/visits/VisitInputModule';
import { MonitoringModule } from './features/monitoring/MonitoringModule';
import { ReportsModule } from './features/reports/ReportsModule';
import { SettingsModule } from './features/settings/SettingsModule';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { DataStore, DEMO_ACCOUNTS } from './lib/dataStore';
import { UserProfile } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataStore.getCurrentUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setCurrentUser(DataStore.getCurrentUser());
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userRole={currentUser.role}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="flex items-center">
          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 text-slate-600 hover:text-slate-900 bg-white border-b border-r border-slate-200"
            aria-label="Buka Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <Header
              currentTab={currentTab}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          </div>
        </div>

        {/* Dynamic Main View */}
        <main className="flex-1 pb-12">
          {currentTab === 'dashboard' && (
            <DashboardModule
              onNavigateToVisits={() => setCurrentTab('visits')}
              onNavigateToMonitoring={() => setCurrentTab('monitoring')}
            />
          )}

          {currentTab === 'visits' && (
            <VisitInputModule
              onSuccessNavigate={(tab) => setCurrentTab(tab)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringModule onNavigateToVisits={() => setCurrentTab('visits')} />
          )}

          {currentTab === 'reports' && <ReportsModule />}

          {currentTab === 'settings' && (
            <SettingsModule onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Supabase Connection & Credentials Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChanged={() => {
          // Re-trigger store update
          DataStore.init();
        }}
      />
    </div>
  );
}
