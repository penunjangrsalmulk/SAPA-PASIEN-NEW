import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardPen,
  Activity,
  BarChart3,
  Settings,
  Building2,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { UserRole, HospitalProfile } from '../../types';
import { DataStore } from '../../lib/dataStore';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(
    DataStore.getHospitalProfile()
  );

  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setHospitalProfile(DataStore.getHospitalProfile());
    });
    return () => unsub();
  }, []);
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'visits',
      label: 'Input Kunjungan',
      icon: ClipboardPen,
      roles: ['administrator', 'supervisor', 'petugas'],
    },
    {
      id: 'monitoring',
      label: 'Monitoring Pasien',
      icon: Activity,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'reports',
      label: 'Analisis & Laporan',
      icon: BarChart3,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <img
            src={hospitalProfile.logo_url || "/src/assets/images/rsud_almulk_logo_1792331924541.jpg"}
            alt={hospitalProfile.name}
            className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Graceful SVG fallback
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base tracking-tight truncate">
              <span>SAPA PASIEN</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate" title={hospitalProfile.name}>
              {hospitalProfile.name}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>

          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Hospital Info Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700 block">Pelayanan Rawat Inap</span>
              Kunjungan Humanis & Terpadu
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>SAPA v1.0</span>
            <span>Kota Sukabumi</span>
          </div>
        </div>
      </aside>
    </>
  );
};
