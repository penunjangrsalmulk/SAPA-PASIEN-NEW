import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFloatingNavBar } from './components/layout/MobileFloatingNavBar';
import { DashboardModule } from './features/dashboard/DashboardModule';
import { VisitInputModule } from './features/visits/VisitInputModule';
import { MonitoringModule } from './features/monitoring/MonitoringModule';
import { ReportsModule } from './features/reports/ReportsModule';
import { SettingsModule } from './features/settings/SettingsModule';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { DataStore } from './lib/dataStore';
import { UserProfile } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataStore.getCurrentUser());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Welcome Screen visibility (default true on app load as requested)
  const [isWelcomeScreenVisible, setIsWelcomeScreenVisible] = useState(true);

  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setCurrentUser(DataStore.getCurrentUser());
    });
    return () => unsub();
  }, []);

  // Handle Login from Welcome Screen
  const handleLoginFromWelcome = (user: UserProfile) => {
    setCurrentUser(user);
    setIsWelcomeScreenVisible(false);
  };

  return (
    <>
      {isWelcomeScreenVisible ? (
        <WelcomeScreen
          onLoginSuccess={handleLoginFromWelcome}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      ) : (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
          {/* Desktop Fixed Sidebar (Hidden on mobile) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            userRole={currentUser.role}
            isMobileOpen={false}
            onCloseMobile={() => {}}
            onOpenWelcomeScreen={() => setIsWelcomeScreenVisible(true)}
          />

          {/* Main Content Area */}
          <div className="md:pl-64 flex flex-col min-h-screen">
            {/* Top Header (Clean Full-Width on Mobile & Desktop) */}
            <Header
              currentTab={currentTab}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              onOpenWelcomeScreen={() => setIsWelcomeScreenVisible(true)}
            />

            {/* Dynamic Main View with Extra Bottom Padding for Mobile Floating Navigation */}
            <main className="flex-1 pb-28 md:pb-12">
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

          {/* Floating Pill Bottom Navigation Bar for Mobile (Inspired by the reference image) */}
          <MobileFloatingNavBar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            userRole={currentUser.role}
            onOpenWelcomeScreen={() => setIsWelcomeScreenVisible(true)}
          />
        </div>
      )}

      {/* Supabase Connection & Credentials Modal (Global) */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChanged={() => {
          DataStore.init();
        }}
      />
    </>
  );
}
