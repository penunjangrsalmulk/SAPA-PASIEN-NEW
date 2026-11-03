import React from 'react';
import {
  LayoutDashboard,
  ClipboardPen,
  Activity,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface MobileFloatingNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onOpenWelcomeScreen: () => void;
}

export const MobileFloatingNavBar: React.FC<MobileFloatingNavBarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onOpenWelcomeScreen,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: LayoutDashboard,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'visits',
      label: 'Input',
      icon: ClipboardPen,
      roles: ['administrator', 'supervisor', 'petugas'],
    },
    {
      id: 'monitoring',
      label: 'Monitor',
      icon: Activity,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: BarChart3,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
    {
      id: 'settings',
      label: 'Akun',
      icon: Settings,
      roles: ['administrator', 'supervisor', 'petugas', 'pimpinan'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[430px] pointer-events-auto"
    >
      {/* Outer Floating Pill Container (Matte Charcoal with Organic Pink Accent Contour) */}
      <div className="relative flex items-center justify-between bg-[#141517]/95 backdrop-blur-xl border border-neutral-800/90 rounded-full px-2 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)]">
        
        {/* Subtle Ambient Pink Glow Beneath the Capsule */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-transparent rounded-full blur-md -z-10 opacity-70 pointer-events-none" />

        {/* LEFT: Embossed Circular Brand Button (Model Logo seperti Pinterest di foto referensi) */}
        <div className="flex items-center shrink-0 pr-1">
          <button
            type="button"
            onClick={onOpenWelcomeScreen}
            className="group relative w-11 h-11 rounded-full bg-gradient-to-b from-[#2a2c31] to-[#161719] border border-neutral-700/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all active:scale-95 hover:border-pink-500/60"
            title="Layar Pembuka & Ganti Akun"
          >
            {/* SP Monogram Icon in Pink */}
            <span className="font-black text-sm tracking-tighter text-pink-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover:scale-105 transition-transform">
              SP
            </span>

            {/* Micro Badge Sparkle */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border-2 border-[#141517] flex items-center justify-center">
              <span className="w-1 h-1 bg-white rounded-full" />
            </span>
          </button>

          {/* Organic Curved Neon Contour Divider (Inspirasi Garis Lengkung Pink di Foto) */}
          <svg
            className="w-4 h-11 text-pink-500/80 shrink-0 ml-1 hidden sm:block overflow-visible"
            viewBox="0 0 16 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2 C8 12, 14 18, 14 22 C14 26, 8 32, 2 42"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]"
            />
          </svg>
        </div>

        {/* RIGHT: Navigation Items (Home, Input, Monitor, Laporan, Akun) */}
        <div className="flex-1 flex items-center justify-around gap-1 min-w-0">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`group relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-pink-500 scale-105'
                    : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
                }`}
              >
                {/* Active Soft Halo */}
                {isActive && (
                  <span className="absolute inset-0 bg-pink-500/15 rounded-2xl blur-xs -z-10" />
                )}

                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive
                        ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] stroke-[2.4]'
                        : 'text-neutral-400 group-hover:text-neutral-200 stroke-[1.8]'
                    }`}
                  />

                  {/* Red/Pink Dot for Special Updates or Active indicator on icon */}
                  {item.id === 'monitoring' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[#141517]" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9.5px] tracking-tight mt-0.5 leading-none transition-colors ${
                    isActive
                      ? 'font-bold text-white drop-shadow-xs'
                      : 'font-medium text-neutral-400 group-hover:text-neutral-300'
                  }`}
                >
                  {item.label}
                </span>

                {/* Bottom Active Glow Dot (Model Titik di Bawah Icon Home pada Foto) */}
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_#f43f5e] mt-1 transition-all" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};
