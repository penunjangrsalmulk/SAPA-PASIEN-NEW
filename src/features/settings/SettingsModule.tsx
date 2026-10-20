import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  Shield,
  Layers,
  Clock,
  Database,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Tag,
  Check,
  Download,
  UploadCloud,
  FileJson,
  Globe,
  HelpCircle,
  Send,
} from 'lucide-react';
import {
  Ward,
  UserProfile,
  AuditLog,
  UserRole,
  HospitalProfile,
  SlaSetting,
  IssueCategorySetting,
  IssuePriority,
} from '../../types';
import { DataStore } from '../../lib/dataStore';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
} from '../../lib/supabase';

interface SettingsModuleProps {
  onOpenSupabaseModal: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onOpenSupabaseModal }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState<
    'profile' | 'users' | 'wards' | 'categories' | 'database' | 'audit'
  >('profile');

  // State entities from DataStore
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(
    DataStore.getHospitalProfile()
  );
  const [users, setUsers] = useState<UserProfile[]>(DataStore.getUsers());
  const [wards, setWards] = useState<Ward[]>(DataStore.getWards());
  const [slaSettings, setSlaSettings] = useState<SlaSetting[]>(DataStore.getSlaSettings());
  const [issueCategories, setIssueCategories] = useState<IssueCategorySetting[]>(
    DataStore.getIssueCategories()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DataStore.getAuditLogs());

  // Global notification toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ----------------------------------------------------
  // 1. STATE & HANDLERS: EDIT PROFIL & FOTO
  // ----------------------------------------------------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<HospitalProfile>(hospitalProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditProfile = () => {
    setProfileForm({ ...hospitalProfile });
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setProfileForm({ ...hospitalProfile });
    setIsEditingProfile(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Nama rumah sakit wajib diisi.', 'error');
      return;
    }
    DataStore.updateHospitalProfile(profileForm);
    setIsEditingProfile(false);
    showToast('Profil dan foto RSUD Al-Mulk berhasil diperbarui.');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih berkas gambar (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfileForm((prev) => ({ ...prev, logo_url: result }));
      showToast('Foto berhasil dimuat. Klik "Simpan Perubahan" untuk menerapkan.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaultLogo = () => {
    setProfileForm((prev) => ({
      ...prev,
      logo_url: '/src/assets/images/rsud_almulk_logo_1792331924541.jpg',
    }));
    showToast('Foto dikembalikan ke logo default RSUD Al-Mulk.');
  };

  // Edit current logged-in user profile
  const [isEditingMyAccount, setIsEditingMyAccount] = useState(false);
  const [myAccountForm, setMyAccountForm] = useState({
    full_name: currentUser.full_name,
    phone: currentUser.phone || '',
    department: currentUser.department || '',
  });

  const handleSaveMyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAccountForm.full_name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    DataStore.updateUser(currentUser.id, myAccountForm);
    setIsEditingMyAccount(false);
    showToast('Profil akun Anda berhasil diperbarui.');
  };

  // ----------------------------------------------------
  // 2. STATE & HANDLERS: EDIT PENGGUNA
  // ----------------------------------------------------
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    phone: '',
    role: 'petugas' as UserRole,
    is_active: true,
  });
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const handleOpenUserModal = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        full_name: user.full_name,
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        full_name: '',
        email: '',
        department: 'Tim Sapa Pasien Rawat Inap',
        phone: '',
        role: 'petugas',
        is_active: true,
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.full_name.trim()) {
      showToast('Nama petugas wajib diisi.', 'error');
      return;
    }
    if (!userFormData.email.trim()) {
      showToast('Email petugas wajib diisi.', 'error');
      return;
    }

    if (editingUser) {
      DataStore.updateUser(editingUser.id, userFormData);
      showToast(`Data pengguna "${userFormData.full_name}" berhasil diperbarui.`);
    } else {
      DataStore.createUser(userFormData);
      showToast(`Pengguna baru "${userFormData.full_name}" berhasil ditambahkan.`);
    }
    setIsUserModalOpen(false);
  };

  const handleToggleUserStatus = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showToast('Anda tidak dapat menonaktifkan akun yang sedang login.', 'error');
      return;
    }
    const newStatus = !user.is_active;
    DataStore.updateUser(user.id, { is_active: newStatus });
    showToast(
      `Status akun "${user.full_name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`
    );
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      showToast('Tidak dapat menghapus akun yang sedang aktif digunakan.', 'error');
      setUserToDelete(null);
      return;
    }
    DataStore.deleteUser(userToDelete.id);
    showToast(`Pengguna "${userToDelete.full_name}" berhasil dihapus.`);
    setUserToDelete(null);
  };

  // ----------------------------------------------------
  // 3. STATE & HANDLERS: EDIT MASTER RUANGAN
  // ----------------------------------------------------
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [wardFormData, setWardFormData] = useState({
    name: '',
    code: '',
    floor: 1,
    capacity: 17,
    is_active: true,
  });
  const [wardToDelete, setWardToDelete] = useState<Ward | null>(null);

  const handleOpenWardModal = (ward?: Ward) => {
    if (ward) {
      setEditingWard(ward);
      setWardFormData({
        name: ward.name,
        code: ward.code,
        floor: ward.floor,
        capacity: ward.capacity,
        is_active: ward.is_active,
      });
    } else {
      setEditingWard(null);
      setWardFormData({
        name: '',
        code: '',
        floor: 1,
        capacity: 17,
        is_active: true,
      });
    }
    setIsWardModalOpen(true);
  };

  const handleSaveWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardFormData.name.trim()) {
      showToast('Nama ruangan rawat inap wajib diisi.', 'error');
      return;
    }
    if (!wardFormData.code.trim()) {
      showToast('Kode ruangan wajib diisi (misal: FATIMAH, USMAN).', 'error');
      return;
    }

    if (editingWard) {
      DataStore.updateWard(editingWard.id, {
        ...wardFormData,
        code: wardFormData.code.toUpperCase().trim(),
      });
      showToast(`Ruangan "${wardFormData.name}" berhasil diperbarui.`);
    } else {
      DataStore.createWard({
        ...wardFormData,
        code: wardFormData.code.toUpperCase().trim(),
      });
      showToast(`Ruangan baru "${wardFormData.name}" berhasil ditambahkan.`);
    }
    setIsWardModalOpen(false);
  };

  const handleToggleWardStatus = (ward: Ward) => {
    const newStatus = !ward.is_active;
    DataStore.updateWard(ward.id, { is_active: newStatus });
    showToast(
      `Status ruangan "${ward.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`
    );
  };

  const handleConfirmDeleteWard = () => {
    if (!wardToDelete) return;
    DataStore.deleteWard(wardToDelete.id);
    showToast(`Ruangan "${wardToDelete.name}" berhasil dihapus dari master data.`);
    setWardToDelete(null);
  };

  // ----------------------------------------------------
  // 4. STATE & HANDLERS: EDIT KATEGORI & SLA
  // ----------------------------------------------------
  const [editingSla, setEditingSla] = useState<SlaSetting | null>(null);
  const [slaFormData, setSlaFormData] = useState({
    max_hours: 1,
    label: '',
    description: '',
  });

  const handleOpenSlaModal = (sla: SlaSetting) => {
    setEditingSla(sla);
    setSlaFormData({
      max_hours: sla.max_hours,
      label: sla.label,
      description: sla.description,
    });
  };

  const handleSaveSla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSla) return;
    if (slaFormData.max_hours <= 0) {
      showToast('Target waktu respons harus lebih dari 0 jam.', 'error');
      return;
    }
    DataStore.updateSlaSetting(editingSla.priority, slaFormData);
    showToast(`Standar SLA untuk "${editingSla.label}" berhasil diperbarui.`);
    setEditingSla(null);
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IssueCategorySetting | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    key: '',
    name: '',
    description: '',
    default_unit: '',
    is_active: true,
  });
  const [categoryToDelete, setCategoryToDelete] = useState<IssueCategorySetting | null>(null);

  const handleOpenCategoryModal = (cat?: IssueCategorySetting) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        key: cat.key,
        name: cat.name,
        description: cat.description,
        default_unit: cat.default_unit || '',
        is_active: cat.is_active,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        key: '',
        name: '',
        description: '',
        default_unit: 'Instalasi Terkait RSUD Al-Mulk',
        is_active: true,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Nama kategori masalah wajib diisi.', 'error');
      return;
    }
    const cleanKey =
      categoryFormData.key.trim().toLowerCase().replace(/\s+/g, '_') ||
      categoryFormData.name.trim().toLowerCase().replace(/\s+/g, '_');

    if (editingCategory) {
      DataStore.updateIssueCategory(editingCategory.id, {
        ...categoryFormData,
        key: cleanKey,
      });
      showToast(`Kategori masalah "${categoryFormData.name}" berhasil diperbarui.`);
    } else {
      DataStore.createIssueCategory({
        ...categoryFormData,
        key: cleanKey,
      });
      showToast(`Kategori baru "${categoryFormData.name}" berhasil ditambahkan.`);
    }
    setIsCategoryModalOpen(false);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    DataStore.deleteIssueCategory(categoryToDelete.id);
    showToast(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
    setCategoryToDelete(null);
  };

  // ----------------------------------------------------
  // SUPABASE TAB & DB TOOLS
  // ----------------------------------------------------
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedMigration, setCopiedMigration] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    try {
      const dataStr = DataStore.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sapa_pasien_data_rsudalmulk_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('File cadangan data lengkap (JSON) berhasil diunduh.');
    } catch {
      showToast('Gagal mengekspor data.', 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = DataStore.importAllData(content);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopySourceCodeDefaults = () => {
    const snippet = `// Master Data Default untuk src/lib/dataStore.ts
export const INITIAL_HOSPITAL_PROFILE: HospitalProfile = ${JSON.stringify(hospitalProfile, null, 2)};

export const INITIAL_WARDS: Ward[] = ${JSON.stringify(wards, null, 2)};

export const DEMO_ACCOUNTS: UserProfile[] = ${JSON.stringify(users, null, 2)};
`;
    navigator.clipboard.writeText(snippet);
    setCopiedCodeSnippet(true);
    showToast('Kode konfigurasi master data berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedCodeSnippet(false), 3000);
  };

  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(res);
    setIsTesting(false);

    if (res.success || supabaseUrl.trim()) {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      resetSupabaseClient();
    }
  };

  const copyMigrationSql = () => {
    const sql = `-- Migration SQL: SAPA PASIEN RSUD Al-Mulk
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'supervisor', 'petugas', 'pimpinan')),
  department TEXT DEFAULT 'RSUD Al-Mulk',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 17,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.wards (name, code, floor, capacity) VALUES
  ('Ruang Fatimah', 'FATIMAH', 1, 17),
  ('Ruang Aisyah', 'AISYAH', 1, 17),
  ('Ruang Usman', 'USMAN', 2, 17),
  ('Ruang Khadijah', 'KHADIJAH', 2, 17),
  ('IGD', 'IGD', 1, 17),
  ('Rawat Jalan', 'RAWAT_JALAN', 1, 17),
  ('ICU', 'ICU', 1, 17)
ON CONFLICT (code) DO NOTHING;
`;
    navigator.clipboard.writeText(sql);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 3000);
  };

  // Sync state on DataStore change
  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setCurrentUser(DataStore.getCurrentUser());
      setHospitalProfile(DataStore.getHospitalProfile());
      setUsers(DataStore.getUsers());
      setWards(DataStore.getWards());
      setSlaSettings(DataStore.getSlaSettings());
      setIssueCategories(DataStore.getIssueCategories());
      setAuditLogs(DataStore.getAuditLogs());
    });
    return () => unsub();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profil & Foto RS', icon: Building2 },
    { id: 'users', label: 'Pengguna & Otoritas', icon: Users, badge: users.length },
    { id: 'wards', label: 'Master Ruangan', icon: Layers, badge: wards.length },
    { id: 'categories', label: 'Kategori & SLA', icon: Clock },
    { id: 'database', label: 'Sinkronisasi Cloud & Vercel', icon: Globe },
    { id: 'audit', label: 'Jejak Audit', icon: History, badge: auditLogs.length },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium animate-in fade-in slide-in-from-top duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengaturan & Master Data Sistem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola profil rumah sakit, foto/logo, pengguna akun, master ruangan rawat inap, dan
            standar SLA respon keluhan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Login: {currentUser.full_name} ({currentUser.role})</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: PROFIL RSUD AL-MULK & FOTO */}
      {/* ==================================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Main Hospital Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={
                      isEditingProfile
                        ? profileForm.logo_url
                        : hospitalProfile.logo_url ||
                          '/src/assets/images/rsud_almulk_logo_1792331924541.jpg'
                    }
                    alt={hospitalProfile.name}
                    className="w-20 h-20 object-contain rounded-2xl border border-slate-200 bg-white p-1 shadow-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/src/assets/images/rsud_almulk_logo_1792331924541.jpg';
                    }}
                  />
                  {isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-900/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium"
                      title="Klik untuk unggah foto baru"
                    >
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span>Ganti Foto</span>
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {hospitalProfile.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hospitalProfile.classification}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                      {hospitalProfile.operational_status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {!isEditingProfile ? (
                  <button
                    onClick={handleStartEditProfile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profil & Foto</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Form View / Display View */}
            {!isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nama Rumah Sakit</span>
                  </div>
                  <div className="text-slate-900 font-semibold text-sm pt-0.5">
                    {hospitalProfile.name}
                  </div>
                </div>

                <div className="space-y-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Klasifikasi Fasilitas Kesehatan</span>
                  </div>
                  <div className="text-slate-900 font-semibold text-sm pt-0.5">
                    {hospitalProfile.classification}
                  </div>
                </div>

                <div className="space-y-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Alamat Lengkap</span>
                  </div>
                  <div className="text-slate-800 leading-relaxed pt-0.5">
                    {hospitalProfile.address}
                  </div>
                </div>

                <div className="space-y-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kontak & Call Center 24 Jam</span>
                  </div>
                  <div className="text-slate-800 leading-relaxed pt-0.5">
                    {hospitalProfile.phone}
                  </div>
                  {hospitalProfile.email && (
                    <div className="text-slate-500 text-[11px] pt-1 flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{hospitalProfile.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="text-blue-900 font-bold flex items-center gap-1.5">
                    <span>Visi & Falsafah Pelayanan SAPA PASIEN</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1 italic">
                    "{hospitalProfile.vision}"
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                {/* Photo Management Controls */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Foto Profil / Logo Rumah Sakit
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Format didukung: PNG, JPG, WebP. Maksimal 3MB.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Gambar Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultLogo}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium"
                      title="Kembalikan ke logo default RSUD Al-Mulk"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Default</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Rumah Sakit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Klasifikasi Fasilitas Kesehatan
                    </label>
                    <input
                      type="text"
                      value={profileForm.classification}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, classification: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kontak & Call Center 24 Jam
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Resmi Rumah Sakit
                    </label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Status Operasional
                    </label>
                    <input
                      type="text"
                      value={profileForm.operational_status}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, operational_status: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      URL Foto / Logo Kustom (Opsi Teks)
                    </label>
                    <input
                      type="text"
                      value={profileForm.logo_url}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, logo_url: e.target.value }))
                      }
                      placeholder="/src/assets/... atau https://..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Lengkap Instansi
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Visi Pelayanan SAPA PASIEN
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.vision}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, vision: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancelEditProfile}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sub Card: Profil Akun Petugas yang Login */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Profil Akun Pengguna Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Informasi identitas petugas yang tercatat pada formulir kunjungan sapa pasien
                </p>
              </div>
              {!isEditingMyAccount && (
                <button
                  onClick={() => {
                    setMyAccountForm({
                      full_name: currentUser.full_name,
                      phone: currentUser.phone || '',
                      department: currentUser.department || '',
                    });
                    setIsEditingMyAccount(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Akun Saya</span>
                </button>
              )}
            </div>

            {!isEditingMyAccount ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Nama Petugas:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {currentUser.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Akun:</span>
                  <span className="font-mono text-slate-700">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Peran / Hak Akses:</span>
                  <span className="font-semibold text-blue-700 uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Unit Kerja:</span>
                  <span className="text-slate-800">{currentUser.department || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">No. Telepon / WA:</span>
                  <span className="text-slate-800">{currentUser.phone || '-'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveMyAccount} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap & Gelar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={myAccountForm.full_name}
                      onChange={(e) =>
                        setMyAccountForm((f) => ({ ...f, full_name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Unit Kerja / Departemen
                    </label>
                    <input
                      type="text"
                      value={myAccountForm.department}
                      onChange={(e) =>
                        setMyAccountForm((f) => ({ ...f, department: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Telepon / WA
                    </label>
                    <input
                      type="text"
                      value={myAccountForm.phone}
                      onChange={(e) =>
                        setMyAccountForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingMyAccount(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: PENGGUNA & HAK AKSES (EDIT PENGGUNA) */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Manajemen Pengguna & Otoritas Sistem
              </h3>
              <p className="text-xs text-slate-500">
                Kelola petugas sapa pasien, supervisor, pimpinan rumah sakit, dan hak akses
              </p>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3">Nama Petugas</th>
                  <th className="py-3 px-3">Email Pengguna</th>
                  <th className="py-3 px-3">Unit / Jabatan</th>
                  <th className="py-3 px-3">Peran Akses (Role)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((acc) => {
                  const isCurrent = acc.id === currentUser.id;
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {acc.full_name.charAt(0)}
                          </div>
                          <div>
                            <div>{acc.full_name}</div>
                            {isCurrent && (
                              <span className="text-[10px] text-blue-600 font-medium">
                                (Akun Aktif Anda)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{acc.email}</td>
                      <td className="py-3 px-3 text-slate-600">{acc.department || '-'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[11px] uppercase ${
                            acc.role === 'administrator'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : acc.role === 'supervisor'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : acc.role === 'petugas'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(acc)}
                          disabled={isCurrent}
                          title={
                            isCurrent
                              ? 'Tidak bisa mengubah status akun sendiri'
                              : 'Klik untuk ubah status aktif/nonaktif'
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            acc.is_active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          } ${isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                        >
                          {acc.is_active ? (
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <UserX className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{acc.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => handleOpenUserModal(acc)}
                          title="Edit Data Pengguna"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(acc)}
                          disabled={isCurrent}
                          title={
                            isCurrent
                              ? 'Tidak dapat menghapus akun sendiri'
                              : 'Hapus Akun Pengguna'
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MASTER RUANGAN RAWAT INAP (EDIT RUANGAN) */}
      {/* ==================================================================== */}
      {activeTab === 'wards' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Ruangan Rawat Inap RSUD Al-Mulk
              </h3>
              <p className="text-xs text-slate-500">
                Daftar bangsal rawat inap untuk pemilihan kamar 1–17 dan monitoring kunjungan
              </p>
            </div>
            <button
              onClick={() => handleOpenWardModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ruangan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {wards.map((w) => (
              <div
                key={w.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  w.is_active
                    ? 'bg-slate-50/80 border-slate-200 hover:border-blue-200 hover:bg-white hover:shadow-xs'
                    : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {w.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleWardStatus(w)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        w.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {w.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-1">{w.name}</h4>
                  <div className="text-slate-500 text-[11px] mt-1 space-y-0.5">
                    <div>Lantai Gedung: <span className="font-semibold text-slate-700">{w.floor}</span></div>
                    <div>
                      Kapasitas Kamar/Bed: <span className="font-mono font-bold text-blue-700">{w.capacity}</span> Kamar
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200/60">
                  <button
                    onClick={() => handleOpenWardModal(w)}
                    className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Ruangan</span>
                  </button>
                  <button
                    onClick={() => setWardToDelete(w)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Ruangan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: KATEGORI & SLA (EDIT SLA & MASTER KATEGORI) */}
      {/* ==================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Sub-section 1: Standar Waktu Respons (SLA) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                1. Standar Waktu Respons (Service Level Agreement / SLA)
              </h3>
              <p className="text-xs text-slate-500">
                Batas waktu target penyelesaian keluhan berdasarkan tingkat prioritas RSUD Al-Mulk
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {slaSettings.map((sla) => {
                const isKritis = sla.priority === 'kritis';
                const isTinggi = sla.priority === 'tinggi';
                const isSedang = sla.priority === 'sedang';

                return (
                  <div
                    key={sla.priority}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isKritis
                        ? 'bg-red-50/70 border-red-200'
                        : isTinggi
                        ? 'bg-amber-50/70 border-amber-200'
                        : isSedang
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`font-bold text-sm ${
                            isKritis
                              ? 'text-red-900'
                              : isTinggi
                              ? 'text-amber-900'
                              : isSedang
                              ? 'text-blue-900'
                              : 'text-slate-900'
                          }`}
                        >
                          {sla.label}
                        </span>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white border border-slate-200">
                          &lt; {sla.max_hours} Jam
                        </span>
                      </div>

                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {sla.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-3 mt-3 border-t border-slate-200/50">
                      <button
                        onClick={() => handleOpenSlaModal(sla)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit SLA</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-section 2: Master Kategori Masalah Pelayanan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Master Kategori Masalah & Unit Penanggung Jawab
                </h3>
                <p className="text-xs text-slate-500">
                  Pengelompokan keluhan saat kunjungan sapa pasien dan eskalasi ke instalasi terkait
                </p>
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {issueCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">{cat.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {cat.key}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-2 text-[11px] text-blue-700 font-medium">
                      Unit: {cat.default_unit || 'Umum'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2.5 mt-2.5 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="flex items-center gap-1 px-2 py-0.5 text-slate-600 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* TAB 5: SINKRONISASI CLOUD & VERCEL */}
      {/* ==================================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Penjelasan Transparan: Mengapa Data Tidak Langsung Muncul di Vercel */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2.5">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Mengapa perubahan edit di Google AI Studio tidak langsung muncul di Vercel?
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Aplikasi web ini menggunakan penyimpanan lokal peramban (<strong>localStorage</strong>) untuk kecepatan dan privasi data. Karena domain preview AI Studio (<code className="bg-amber-100 px-1 rounded text-amber-900 font-mono text-[11px]">*.run.app</code>) dan domain Vercel (<code className="bg-amber-100 px-1 rounded text-amber-900 font-mono text-[11px]">*.vercel.app</code>) adalah <strong>domain yang berbeda</strong>, peramban (browser) memisahkan penyimpanan datanya secara ketat demi keamanan (aturan <em>Same-Origin Policy</em>).
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Pilih salah satu dari <strong>3 solusi mudah</strong> di bawah ini untuk menyinkronkan data Anda ke Vercel:
                </p>
              </div>
            </div>
          </div>

          {/* OPSI 1: EKSPOR & IMPOR FILE JSON (INSTAN & TANPA SETUP) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded uppercase">
                    Solusi 1 (Paling Cepat)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ekspor & Impor Cadangan Data (JSON)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh seluruh konfigurasi hasil editan dari AI Studio ini, lalu cukup unggah di Vercel dalam 1 klik
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Unduh Cadangan dari AI Studio */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Langkah 1: Unduh Cadangan dari AI Studio</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                    Menyimpan seluruh profil RS, foto/logo, pengguna akun, master 7 ruangan, standar waktu SLA, dan riwayat kunjungan ke dalam 1 file JSON siap pakai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan Data (.json)</span>
                </button>
              </div>

              {/* Unggah / Pulihkan di Vercel */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    <span>Langkah 2: Pulihkan di Aplikasi Vercel Anda</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                    Buka situs Vercel Anda, masuk ke tab ini, lalu pilih file JSON yang telah diunduh. Seluruh profil, foto, pengguna, dan ruangan seketika terisi otomatis!
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={jsonImportRef}
                    onChange={handleImportJson}
                    accept=".json,application/json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Pilih & Impor File JSON ke Sini</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OPSI 2: CLOUD SUPABASE DATABASE (SINKRONISASI REALTIME OTOMATIS) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded uppercase">
                    Solusi 2 (Otomatis & Realtime)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hubungkan Cloud Database Supabase PostgreSQL
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dengan menghubungkan Supabase, data di AI Studio dan Vercel otomatis tersinkron ke cloud yang sama
                </p>
              </div>
              <button
                onClick={onOpenSupabaseModal}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs rounded-lg transition-colors self-start sm:self-auto"
              >
                Buka Modal Wizard Supabase
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">
                Cara Menghubungkan ke Vercel:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Buka dashboard proyek Anda di <strong>Vercel.com</strong> &gt; Pilih proyek &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                <li>Tambahkan variabel: <code className="font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">VITE_SUPABASE_URL</code> dan <code className="font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>Lakukan <strong>Redeploy</strong> di Vercel. Keduanya akan otomatis membaca dan menyimpan ke cloud PostgreSQL yang sama.</li>
              </ol>
            </div>

            <form onSubmit={handleTestSupabase} className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzproject.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.success ? 'Berhasil' : 'Perhatian'}</p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  <span>{isTesting ? 'Menguji...' : 'Uji & Simpan Koneksi'}</span>
                </button>

                <button
                  type="button"
                  onClick={copyMigrationSql}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMigration ? 'Tersalin!' : 'Salin SQL Migrasi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* OPSI 3: SALIN MASTER DATA DEFAULT KE KODE REPOSITORY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                    Solusi 3 (Permanen di Kode Sumber)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tanamkan Master Data ke Kode Sumber GitHub
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin konfigurasi aktif saat ini untuk dijadikan data bawaan awal permanen di file <code className="font-mono text-slate-700">src/lib/dataStore.ts</code>
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Jika Anda ingin hasil editan Anda langsung tampil sebagai default bagi setiap pengunjung baru di Vercel tanpa perlu impor file JSON maupun database Supabase, Anda dapat menyalin data aktif saat ini ke clipboard dan menyimpannya ke kode sumber repositori:
            </p>

            <button
              type="button"
              onClick={handleCopySourceCodeDefaults}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCodeSnippet ? 'Tersalin ke Clipboard!' : 'Salin Data Aktif ke Format Kode TypeScript'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: AUDIT TRAIL */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Jejak Audit Sistem (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500">
                Merekam setiap aktivitas penting, perubahan status, edit profil, master ruangan, dan login pengguna
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {auditLogs.length} Aktivitas Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Waktu Kejadian</th>
                  <th className="py-2.5 px-3">Pengguna (Actor)</th>
                  <th className="py-2.5 px-3">Aksi (Action)</th>
                  <th className="py-2.5 px-3">Tabel Sasaran</th>
                  <th className="py-2.5 px-3">Rincian Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actor_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-blue-700 font-semibold">{log.action}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.table_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <pre className="font-mono text-[11px] truncate max-w-xs">
                        {JSON.stringify(log.metadata || {})}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT / TAMBAH PENGGUNA */}
      {/* ==================================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Petugas & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ns. Siti Nurhaliza, S.Kep"
                  value={userFormData.full_name}
                  onChange={(e) =>
                    setUserFormData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Akun Rumah Sakit <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@rsudalmulk.id"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit Kerja / Jabatan
                  </label>
                  <input
                    type="text"
                    placeholder="Tim Sapa Pasien / Humas"
                    value={userFormData.department}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={userFormData.phone}
                    onChange={(e) =>
                      setUserFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Akses (Role Kewenangan) <span className="text-red-500">*</span>
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) =>
                    setUserFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="petugas">Petugas (Input kunjungan & update tindak lanjut)</option>
                  <option value="supervisor">Supervisor (Supervisi & verifikasi tuntas masalah)</option>
                  <option value="administrator">Administrator (Akses penuh sistem, RLS, audit trail)</option>
                  <option value="pimpinan">Pimpinan / Direksi (Monitoring agregat eksekutif)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="user_is_active"
                  checked={userFormData.is_active}
                  onChange={(e) =>
                    setUserFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="user_is_active" className="text-slate-700 font-medium select-none">
                  Akun pengguna aktif dan diizinkan login
                </label>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT / TAMBAH MASTER RUANGAN */}
      {/* ==================================================================== */}
      {isWardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingWard ? 'Edit Ruangan Rawat Inap' : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setIsWardModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWard} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Ruangan Rawat Inap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang Fatimah, Ruang Aisyah"
                  value={wardFormData.name}
                  onChange={(e) =>
                    setWardFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Ruangan (Singkatan Unik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="FATIMAH / IGD / ICU"
                  value={wardFormData.code}
                  onChange={(e) =>
                    setWardFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lantai Gedung
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={wardFormData.floor}
                    onChange={(e) =>
                      setWardFormData((prev) => ({
                        ...prev,
                        floor: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Kamar / Bed (1–50)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={wardFormData.capacity}
                    onChange={(e) =>
                      setWardFormData((prev) => ({
                        ...prev,
                        capacity: parseInt(e.target.value) || 17,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ward_is_active"
                  checked={wardFormData.is_active}
                  onChange={(e) =>
                    setWardFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ward_is_active" className="text-slate-700 font-medium select-none">
                  Ruangan aktif untuk pencatatan kunjungan sapa pasien
                </label>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsWardModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingWard ? 'Simpan Perubahan' : 'Tambahkan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT SLA */}
      {/* ==================================================================== */}
      {editingSla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Standar SLA: {editingSla.label}
              </h3>
              <button
                onClick={() => setEditingSla(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSla} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Waktu Penyelesaian (Batas Jam Maksimal) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    required
                    value={slaFormData.max_hours}
                    onChange={(e) =>
                      setSlaFormData((prev) => ({
                        ...prev,
                        max_hours: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono pr-12"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-medium">Jam</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Label Tampilan Prioritas
                </label>
                <input
                  type="text"
                  required
                  value={slaFormData.label}
                  onChange={(e) =>
                    setSlaFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi & Kriteria Kasus Masalah
                </label>
                <textarea
                  rows={4}
                  required
                  value={slaFormData.description}
                  onChange={(e) =>
                    setSlaFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingSla(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Standar SLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT / TAMBAH KATEGORI MASALAH */}
      {/* ==================================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCategory ? 'Edit Kategori Masalah' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kategori Masalah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fasilitas & AC, Makanan & Gizi"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode / Key Sistem
                </label>
                <input
                  type="text"
                  placeholder="fasilitas / gizi / medis"
                  value={categoryFormData.key}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, key: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono lowercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit Penanggung Jawab Default
                </label>
                <input
                  type="text"
                  placeholder="Contoh: IPSRS, Komite Mutu, Bagian Gizi"
                  value={categoryFormData.default_unit}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, default_unit: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Ruang Lingkup Keluhan
                </label>
                <textarea
                  rows={3}
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingCategory ? 'Simpan Kategori' : 'Tambahkan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONFIRMATION MODAL: HAPUS PENGGUNA */}
      {/* ==================================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-sm">Hapus Pengguna?</h4>
              <p className="text-slate-600 text-center leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>{userToDelete.full_name}</strong>? Tindakan ini akan dicatat ke dalam audit trail.
              </p>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONFIRMATION MODAL: HAPUS RUANGAN */}
      {/* ==================================================================== */}
      {wardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-sm">Hapus Master Ruangan?</h4>
              <p className="text-slate-600 text-center leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{wardToDelete.name}</strong> ({wardToDelete.code}) dari master data ruangan rawat inap?
              </p>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setWardToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWard}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONFIRMATION MODAL: HAPUS KATEGORI */}
      {/* ==================================================================== */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-3 text-xs">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-sm">Hapus Kategori Masalah?</h4>
              <p className="text-slate-600 text-center leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete.name}</strong>?
              </p>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
