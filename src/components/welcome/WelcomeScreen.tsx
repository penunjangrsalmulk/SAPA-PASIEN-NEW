import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  ChevronRight,
  Shield,
  User,
  Users,
  Building2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  X,
  RotateCcw,
  Clock,
  MapPin,
  Check,
  LogIn,
  Wifi,
  WifiOff,
  Camera,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DataStore } from '../../lib/dataStore';
import {
  WelcomeMediaConfig,
  MediaStorage,
  DEFAULT_MEDIA_CONFIG,
  PRESET_MEDIA,
  hospitalInpatientCareImg,
} from '../../lib/mediaStorage';
import { isSupabaseConfigured } from '../../lib/supabase';

interface WelcomeScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenSupabaseModal: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginSuccess,
  onOpenSupabaseModal,
}) => {
  // Accounts
  const [users, setUsers] = useState<UserProfile[]>(DataStore.getUsers());
  const [selectedUser, setSelectedUser] = useState<UserProfile>(DataStore.getCurrentUser());

  // Media Config
  const [mediaConfig, setMediaConfig] = useState<WelcomeMediaConfig>(DEFAULT_MEDIA_CONFIG);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(isSupabaseConfigured());
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Direct File Input Ref
  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load Media Config & Subscribe to Users
  useEffect(() => {
    MediaStorage.loadActiveMedia().then((config) => {
      setMediaConfig(config);
      setIsMuted(config.isMuted);
    });

    const unsub = DataStore.subscribe(() => {
      setUsers(DataStore.getUsers());
      setIsCloudConnected(isSupabaseConfigured());
      MediaStorage.loadActiveMedia().then((config) => {
        setMediaConfig((prev) => {
          if (prev.url !== config.url || prev.updatedAt !== config.updatedAt) {
            return config;
          }
          return prev;
        });
      });
    });

    return () => unsub();
  }, []);

  // Live Clock Interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`WIB ${hours}:${minutes}:${seconds}`);

      const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setCurrentDate(dateStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Video Autoplay & Mute
  useEffect(() => {
    if (mediaConfig.type === 'video' && videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [mediaConfig, isMuted, isPlaying]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const handleEnterApp = () => {
    DataStore.setCurrentUser(selectedUser);
    onLoginSuccess(selectedUser);
  };

  // Direct Upload handler from the Welcome Screen button
  const handleDirectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setUploadFeedback('Format tidak didukung. Harap pilih video (MP4, WebM) atau foto (JPG, PNG, WebP).');
      setTimeout(() => setUploadFeedback(null), 4000);
      return;
    }

    try {
      setUploadFeedback('Memproses dan menerapkan media...');
      const saved = await MediaStorage.saveUploadedMedia(
        file,
        isVideo ? 'video' : 'image',
        {
          title: mediaConfig.title,
          subtitle: mediaConfig.subtitle,
          credit: mediaConfig.credit,
          overlayDarkness: mediaConfig.overlayDarkness,
        }
      );
      setMediaConfig(saved);
      setIsPlaying(true);
      setUploadFeedback(
        isVideo ? 'Video berhasil diunggah dan langsung aktif!' : 'Foto berhasil diunggah dan langsung aktif!'
      );
      setTimeout(() => setUploadFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setUploadFeedback('Gagal mengunggah berkas.');
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'Administrator';
      case 'supervisor':
        return 'Supervisor Ruangan';
      case 'petugas':
        return 'Petugas Sapa Pasien';
      case 'pimpinan':
        return 'Pimpinan / Direksi';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50/70 text-slate-800 flex flex-col font-sans select-none overflow-x-hidden relative">
      
      {/* Soft Ambient Pink Glow Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR (Clean Pink & White Navigation) */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-white/80 backdrop-blur-md shadow-xs">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm shadow-pink-500/20">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900">SAPA PASIEN</span>
              <span className="text-[10px] text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded font-mono font-bold border border-pink-200">
                RSUD AL-MULK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Sistem Advokasi Pelayanan & Asuhan Pasien Rawat Inap
            </p>
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Supabase Status */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isCloudConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title="Pengaturan Database Supabase"
          >
            {isCloudConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Supabase Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Mode Lokal</span>
              </>
            )}
          </button>

          {/* Quick Direct Upload Button */}
          <button
            onClick={() => directFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 transition-colors shadow-xs"
            title="Klik untuk memilih foto atau video dari perangkat Anda"
          >
            <Camera className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden sm:inline">Unggah Foto/Video</span>
          </button>

          {/* Modal Customizer Trigger */}
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-pink-50/50 border border-slate-200 text-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Kustomisasi</span>
          </button>


          {/* Hidden File Input for Instant Upload */}
          <input
            ref={directFileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleDirectFileChange}
          />
        </div>
      </header>

      {/* FEEDBACK TOAST */}
      {uploadFeedback && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs shadow-xl flex items-center gap-2 border border-pink-500/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* MAIN VIEWPORT: SPLIT HERO SECTION (Pink & White Palette) */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 max-w-[1600px] w-full mx-auto min-h-0">
        
        {/* LEFT COLUMN: BRANDING & ACCOUNT SELECTION */}
        <section className="lg:w-[420px] xl:w-[460px] flex flex-col justify-between shrink-0 bg-white border border-pink-100 rounded-3xl p-6 shadow-xl shadow-pink-500/5">
          <div className="space-y-5">
            {/* Monogram Header */}
            <div className="flex items-center gap-3.5 border-b border-pink-100 pb-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-md shadow-pink-500/20 shrink-0">
                SP
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Pilih Akun Petugas
                </h1>
                <p className="text-xs text-slate-500 truncate">
                  Tentukan akun sebelum mendokumentasikan asuhan pasien
                </p>
              </div>
            </div>

            {/* Accounts List (Direct & Clean) */}
            <div className="space-y-2 max-h-[380px] xl:max-h-[460px] overflow-y-auto pr-1">
              {users.map((user) => {
                  const isSelected = selectedUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`group cursor-pointer flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-pink-50/80 border-pink-300 shadow-sm'
                          : 'bg-white hover:bg-pink-50/30 border-slate-100 hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-700'
                          }`}
                        >
                          {user.full_name.charAt(0)}
                        </div>

                        {/* Name & Department */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isSelected ? 'text-pink-900' : 'text-slate-800'
                              }`}
                            >
                              {user.full_name}
                            </span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                            <span className="text-pink-600 font-medium">
                              {getRoleLabel(user.role)}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span>{user.department || 'RSUD Al-Mulk'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Select Indicator */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 group-hover:border-pink-300 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Bottom Action: Big Enter Button (Pink Gradient) */}
          <div className="pt-4 border-t border-pink-100 mt-4 space-y-2.5">
            <button
              onClick={handleEnterApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all active:scale-[0.98]"
            >
              <span>Masuk Sebagai {selectedUser.full_name.split(',')[0]}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Peran: <strong className="text-slate-700">{getRoleLabel(selectedUser.role)}</strong></span>
              <span className="text-pink-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-pink-600" />
                <span>Siap Bertugas</span>
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: SHOWCASE MEDIA FRAME (Clean, Uncluttered, Photo / Video Display) */}
        <section className="flex-1 relative rounded-3xl overflow-hidden border border-pink-200 bg-slate-900 shadow-xl shadow-pink-500/5 flex flex-col justify-end min-h-[480px] lg:min-h-0">
          
          {/* MEDIA BACKGROUND (Video or Photo with Guaranteed Rendering) */}
          <div className="absolute inset-0 z-0">
            {mediaConfig.type === 'video' ? (
              <video
                key={mediaConfig.url}
                ref={videoRef}
                src={mediaConfig.url}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                key={mediaConfig.url}
                src={mediaConfig.url}
                alt={mediaConfig.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn('Fallback to bundled hospital image');
                  (e.currentTarget as HTMLImageElement).src = hospitalInpatientCareImg;
                }}
              />
            )}

            {/* Dynamic Darkness Overlay */}
            <div
              className="absolute inset-0 bg-black transition-opacity duration-300"
              style={{ opacity: mediaConfig.overlayDarkness / 100 }}
            />

            {/* Subtle Vignette for Typography Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
          </div>

          {/* VIDEO CONTROLS (Only visible for videos, zero overlay for photos) */}
          {mediaConfig.type === 'video' && (
            <div className="relative z-10 p-5 flex items-center justify-end gap-2 pointer-events-auto">
              <button
                onClick={togglePlayPause}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-transform active:scale-95 shadow-md"
                title={isPlaying ? 'Jeda Video' : 'Putar Video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-transform active:scale-95 shadow-md"
                title={isMuted ? 'Buka Suara' : 'Bisukan Suara'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* LOWER CENTER: CLEAN EDITORIAL HERO TYPOGRAPHY */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-2.5">
            {/* Bold Display Typography */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md leading-none">
              {mediaConfig.title}
            </h2>

            {/* Subtitle slogan */}
            <p className="text-sm sm:text-base font-semibold text-pink-100 tracking-wide drop-shadow-md max-w-2xl">
              {mediaConfig.subtitle && !mediaConfig.subtitle.includes('KASIH SAYANG')
                ? mediaConfig.subtitle
                : '“MELAYANI DENGAN SEPENUH HATI”'}
            </p>

            {/* Clean Credit Line */}
            <div className="pt-1 text-xs text-white/80 font-medium">
              <span className="text-pink-300 font-bold tracking-wide">{mediaConfig.credit}</span>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM FOOTER BAR (Clean Pink & White Bar) */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between px-6 py-3 border-t border-pink-100 bg-white/85 text-[11px] text-slate-500 font-mono">
        {/* Left: Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-pink-600" />
          <span className="text-slate-700 font-medium">RSUD Al-Mulk Kota Sukabumi, Jawa Barat</span>
        </div>

        {/* Center: System Status */}
        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span>Sistem Advokasi & Asuhan Pasien Rawat Inap 24 Jam</span>
        </div>

        {/* Right: Live Ticking Clock */}
        <div className="flex items-center gap-2 text-slate-800 font-bold tracking-wider">
          <Clock className="w-3.5 h-3.5 text-pink-600" />
          <span>{currentTime || 'WIB 00:00:00'}</span>
          <span className="hidden sm:inline text-slate-500 font-normal">({currentDate})</span>
        </div>
      </footer>

      {/* MODAL: KUSTOMISASI FOTO / VIDEO & TEKS BANNER */}
      {isMediaModalOpen && (
        <MediaCustomizerModal
          currentConfig={mediaConfig}
          onClose={() => setIsMediaModalOpen(false)}
          onApply={async (newConfig) => {
            setMediaConfig(newConfig);
            setIsMediaModalOpen(false);
          }}
        />
      )}


    </div>
  );
};

/**
 * Sub-Component: Modal Kustomisasi Foto / Video Banner
 */
interface MediaCustomizerModalProps {
  currentConfig: WelcomeMediaConfig;
  onClose: () => void;
  onApply: (newConfig: WelcomeMediaConfig) => Promise<void>;
}

const MediaCustomizerModal: React.FC<MediaCustomizerModalProps> = ({
  currentConfig,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [previewConfig, setPreviewConfig] = useState<WelcomeMediaConfig>({ ...currentConfig });
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState(currentConfig.isBlob ? '' : currentConfig.url);
  const [urlType, setUrlType] = useState<'video' | 'image'>(currentConfig.type);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        setErrorMsg('Format berkas tidak didukung. Harap pilih video (MP4, WebM) atau foto (JPG, PNG, WebP).');
        setIsProcessing(false);
        return;
      }

      const saved = await MediaStorage.saveUploadedMedia(
        file,
        isVideo ? 'video' : 'image',
        {
          title: previewConfig.title,
          subtitle: previewConfig.subtitle,
          credit: previewConfig.credit,
          overlayDarkness: previewConfig.overlayDarkness,
        }
      );

      setPreviewConfig(saved);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memproses berkas media.');
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Harap masukkan URL yang valid.');
      return;
    }

    const updated: WelcomeMediaConfig = {
      ...previewConfig,
      id: `url-${Date.now()}`,
      type: urlType,
      url: urlInput.trim(),
      isBlob: false,
      updatedAt: new Date().toISOString(),
    };

    MediaStorage.savePresetMedia(updated);
    setPreviewConfig(updated);
  };

  const handleSelectPreset = (preset: typeof PRESET_MEDIA[0]) => {
    const updated: WelcomeMediaConfig = {
      ...previewConfig,
      ...preset,
      updatedAt: new Date().toISOString(),
    };
    MediaStorage.savePresetMedia(updated);
    setPreviewConfig(updated);
  };

  const handleResetDefault = async () => {
    const def = await MediaStorage.resetToDefault();
    setPreviewConfig(def);
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    MediaStorage.savePresetMedia(previewConfig);
    await onApply(previewConfig);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-pink-100 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-pink-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kelola Foto / Video Banner</h3>
              <p className="text-xs text-slate-500">
                Pilih foto atau video latar belakang untuk menyambut petugas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Berkas Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilihan Preset</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-pink-600 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tautan Web URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: UPLOAD LOCAL FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-pink-300 hover:border-pink-500 hover:bg-pink-50/50 rounded-2xl p-8 text-center space-y-3 transition-colors bg-pink-50/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Klik di sini untuk memilih Foto atau Video
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung Video MP4 / WebM atau Foto JPG / PNG / WebP
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* TAB 2: PRESET GALLERY */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_MEDIA.map((preset) => {
                  const isSelected = previewConfig.url === preset.url;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                        isSelected
                          ? 'bg-pink-50 border-pink-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-xs">{preset.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-100 font-mono text-pink-800 font-bold">
                          {preset.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EXTERNAL URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={urlType === 'image'}
                    onChange={() => setUrlType('image')}
                    className="accent-pink-600"
                  />
                  <span>Foto / Gambar (JPG / PNG / WebP)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={urlType === 'video'}
                    onChange={() => setUrlType('video')}
                    className="accent-pink-600"
                  />
                  <span>Video (MP4 / WebM Direct URL)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/hospital-photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* EDITABLE OVERLAY TEXT & DARKNESS */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600" />
              <span>Teks Judul & Tingkat Kegelapan Banner</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={previewConfig.title}
                  onChange={(e) =>
                    setPreviewConfig((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Slogan / Subjudul
                </label>
                <input
                  type="text"
                  value={previewConfig.subtitle}
                  onChange={(e) =>
                    setPreviewConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Keterangan Rumah Sakit
                </label>
                <input
                  type="text"
                  value={previewConfig.credit}
                  onChange={(e) =>
                    setPreviewConfig((prev) => ({ ...prev, credit: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                <span>Kegelapan Lapisan Kontras:</span>
                <span className="font-mono text-pink-700 font-bold">
                  {previewConfig.overlayDarkness}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={previewConfig.overlayDarkness}
                onChange={(e) =>
                  setPreviewConfig((prev) => ({
                    ...prev,
                    overlayDarkness: Number(e.target.value),
                  }))
                }
                className="w-full accent-pink-600"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
