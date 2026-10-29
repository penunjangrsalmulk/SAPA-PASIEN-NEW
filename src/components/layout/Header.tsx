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
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DataStore, DEMO_ACCOUNTS } from '../../lib/dataStore';
import { getSupabaseCredentials, getSupabaseClient } from '../../lib/supabase';

interface HeaderProps {
  currentTab: string;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenSupabaseModal }) => {
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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Current Module Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">RSUD Al-Mulk</span>
          <span aria-hidden="true">/</span>
          <span className="capitalize">{currentTab}</span>
        </div>
        <h1 className="text-base font-semibold text-slate-900 truncate">
          {tabTitles[currentTab] || 'SAPA PASIEN'}
        </h1>
      </div>

      {/* Zone 2: Supabase Connection Status & Sync */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
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
            {isLiveConnected ? 'Supabase Online' : 'Database Lokal (Demo)'}
          </span>
          <span className="md:hidden">
            {isLiveConnected ? 'Online' : 'Lokal'}
          </span>
        </button>

        {/* Zone 3: Active User & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                {currentUser.full_name}
              </div>
              <div className="text-[11px] text-slate-500">
                {getRoleLabel(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Ganti Hak Akses Pengguna</p>
                <p className="text-[11px] text-slate-500">
                  Uji antarmuka berdasarkan peran akun rumah sakit
                </p>
              </div>

              <div className="p-1 space-y-1">
                {users.map((account) => {
                  const isActive = account.id === currentUser.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSwitchRole(account)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{account.full_name}</div>
                        <div className="text-[11px] text-slate-500">{getRoleLabel(account.role)}</div>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 rounded-b-xl flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Hak akses disesuaikan dengan aturan RLS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
