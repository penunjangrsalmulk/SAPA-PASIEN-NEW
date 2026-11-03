import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Database,
  Wifi,
  WifiOff,
  ChevronDown,
  Building2,
  CheckCircle2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DataStore, DEMO_ACCOUNTS } from '../../lib/dataStore';
import { getSupabaseCredentials, getSupabaseClient } from '../../lib/supabase';

interface HeaderProps {
  currentTab: string;
  onOpenSupabaseModal: () => void;
  onOpenWelcomeScreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSupabaseModal,
  onOpenWelcomeScreen,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataStore.getCurrentUser());
  const [users, setUsers] = useState<UserProfile[]>(DataStore.getUsers());
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    const updateConnection = () => {
      const creds = getSupabaseCredentials();
      const client = getSupabaseClient();
      setIsLiveConnected(!!creds.url && !!creds.anonKey && !!client);
    };

    updateConnection();

    const unsub = DataStore.subscribe(() => {
      setCurrentUser(DataStore.getCurrentUser());
      setUsers(DataStore.getUsers());
      updateConnection();
    });

    return () => unsub();
  }, []);

  const handleSwitchRole = (account: UserProfile) => {
    DataStore.setCurrentUser(account);
    setShowRoleDropdown(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'Administrator Sistem';
      case 'supervisor':
        return 'Supervisor Ruangan';
      case 'petugas':
        return 'Petugas Sapa Pasien';
      case 'pimpinan':
        return 'Pimpinan / Direksi RS';
      default:
        return role;
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard Utama & Ringkasan Kinerja',
    visits: 'Input Kunjungan Sapa Pasien',
    monitoring: 'Monitoring Kunjungan & Tindak Lanjut',
    reports: 'Analisis Pelayanan & Laporan Mutu',
    settings: 'Pengaturan & Konfigurasi Sistem',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white/95 backdrop-blur-xs border-b border-pink-100">
      {/* Zone 1: Current Module Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
            RSUD Al-Mulk
          </span>
          <span aria-hidden="true" className="text-pink-300">/</span>
          <span className="capitalize text-slate-600">{currentTab}</span>
        </div>
        <h1 className="text-base font-bold text-slate-900 truncate">
          {tabTitles[currentTab] || 'SAPA PASIEN'}
        </h1>
      </div>

      {/* Zone 2: Supabase Connection Status & Sync */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
            isLiveConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Klik untuk konfigurasi dan status Supabase"
        >
          {isLiveConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            </>
          )}
          <span className="hidden md:inline">
            {isLiveConnected ? 'Supabase Online' : 'Database Lokal'}
          </span>
          <span className="md:hidden">
            {isLiveConnected ? 'Online' : 'Lokal'}
          </span>
        </button>

        {/* Zone 2.5: Welcome Portal / Ganti Akun Button (Pink & White) */}
        <button
          onClick={onOpenWelcomeScreen}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white transition-all shadow-xs shadow-pink-500/25 active:scale-95"
          title="Buka Layar Pembuka & Pilih Akun Petugas"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-200" />
          <span className="hidden sm:inline">Layar Pembuka</span>
        </button>

        {/* Zone 3: Active User & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-left bg-pink-50/40 hover:bg-pink-50/70 border border-pink-100 rounded-xl transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                {currentUser.full_name}
              </div>
              <div className="text-[11px] text-pink-700 font-medium">
                {getRoleLabel(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-pink-100 bg-pink-50/40 rounded-t-2xl">
                <p className="text-xs font-bold text-slate-900">Ganti Hak Akses Pengguna</p>
                <p className="text-[11px] text-slate-500">
                  Uji antarmuka berdasarkan peran akun rumah sakit
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                {users.map((account) => {
                  const isActive = account.id === currentUser.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSwitchRole(account)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-xl transition-colors ${
                        isActive
                          ? 'bg-pink-50 text-pink-900 font-bold'
                          : 'text-slate-700 hover:bg-pink-50/30'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{account.full_name}</div>
                        <div className="text-[11px] text-pink-600">{getRoleLabel(account.role)}</div>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 border-t border-pink-100">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    onOpenWelcomeScreen();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold text-pink-700 hover:bg-pink-50 rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Buka Layar Pembuka (Welcome Screen)</span>
                </button>
              </div>

              <div className="px-4 py-2 border-t border-pink-100 bg-pink-50/30 text-[11px] text-pink-800 rounded-b-2xl flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>Hak akses aktif sesuai regulasi SIMRS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
