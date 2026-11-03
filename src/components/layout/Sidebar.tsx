import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardPen,
  Activity,
  BarChart3,
  Settings,
  Building2,
  Sparkles,
} from 'lucide-react';
import { UserRole, HospitalProfile } from '../../types';
import { DataStore } from '../../lib/dataStore';
import { rsudAlMulkLogoImg } from '../../lib/mediaStorage';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenWelcomeScreen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  isMobileOpen,
  onCloseMobile,
  onOpenWelcomeScreen,
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-pink-100 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Pink Touch */}
        <div className="p-5 border-b border-pink-100/80 flex items-center gap-3 bg-pink-50/20">
          <img
            src={hospitalProfile.logo_url || rsudAlMulkLogoImg}
            alt={hospitalProfile.name}
            className="w-10 h-10 object-contain rounded-xl border border-pink-200 bg-white p-0.5 shadow-2xs"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = rsudAlMulkLogoImg;
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm tracking-tight truncate">
              <span>SAPA PASIEN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            </div>
            <p className="text-[11px] text-pink-800 font-medium truncate" title={hospitalProfile.name}>
              {hospitalProfile.name}
            </p>
          </div>
        </div>

        {/* Navigation Links with Pink & White Aesthetics */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-pink-900/60 uppercase">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-pink-50 text-pink-700 font-bold shadow-xs border-r-2 border-pink-500'
                    : 'text-slate-600 hover:text-pink-800 hover:bg-pink-50/40 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-pink-600' : 'text-slate-400 group-hover:text-pink-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 px-1">
            <button
              onClick={() => {
                onOpenWelcomeScreen();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white transition-all shadow-sm shadow-pink-500/25 text-left active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-pink-200 shrink-0" />
              <span className="truncate">Layar Masuk / Ganti Akun</span>
            </button>
          </div>
        </nav>

        {/* Hospital Info Footer with Pink Touch */}
        <div className="p-4 border-t border-pink-100 bg-pink-50/30">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block">Pelayanan Rawat Inap</span>
              Kunjungan Humanis & Terpadu
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="text-pink-700 font-semibold">SAPA v1.0</span>
            <span>Kota Sukabumi</span>
          </div>
        </div>
      </aside>
    </>
  );
};
