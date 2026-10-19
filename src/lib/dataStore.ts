import {
  UserProfile,
  Ward,
  Visit,
  Issue,
  FollowUpLog,
  AuditLog,
  IssueStatus,
  UserRole,
} from '../types';
import { getSupabaseClient } from './supabase';

// Initial Wards for RSUD Al-Mulk Kota Sukabumi
export const INITIAL_WARDS: Ward[] = [
  {
    id: 'ward-01',
    name: 'Ruang Fatimah',
    code: 'FATIMAH',
    floor: 1,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-02',
    name: 'Ruang Aisyah',
    code: 'AISYAH',
    floor: 1,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-03',
    name: 'Ruang Usman',
    code: 'USMAN',
    floor: 2,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-04',
    name: 'Ruang Khadijah',
    code: 'KHADIJAH',
    floor: 2,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-05',
    name: 'IGD',
    code: 'IGD',
    floor: 1,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-06',
    name: 'Rawat Jalan',
    code: 'RAWAT_JALAN',
    floor: 1,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ward-07',
    name: 'ICU',
    code: 'ICU',
    floor: 1,
    capacity: 17,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Demo accounts for instant role-based preview and verification
export const DEMO_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@rsudalmulk.id',
    full_name: 'Dr. H. Ahmad Fauzi, Sp.PK',
    role: 'administrator',
    department: 'Manajemen Mutu & SIMRS',
    phone: '0812-3456-7890',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr-super-01',
    email: 'supervisor@rsudalmulk.id',
    full_name: 'Ns. Siti Nurhaliza, S.Kep',
    role: 'supervisor',
    department: 'Supervisi Keperawatan & Pelayanan',
    phone: '0813-9876-5432',
    is_active: true,
    created_at: '2026-01-02T08:00:00Z',
    updated_at: '2026-01-02T08:00:00Z',
  },
  {
    id: 'usr-staff-01',
    email: 'petugas@rsudalmulk.id',
    full_name: 'Budi Santoso, Amd.Kep',
    role: 'petugas',
    department: 'Tim Sapa Pasien Rawat Inap',
    phone: '0815-1122-3344',
    is_active: true,
    created_at: '2026-01-03T08:00:00Z',
    updated_at: '2026-01-03T08:00:00Z',
  },
  {
    id: 'usr-exec-01',
    email: 'direksi@rsudalmulk.id',
    full_name: 'dr. Hj. Endang Sulastri, MARS',
    role: 'pimpinan',
    department: 'Direksi RSUD Al-Mulk Kota Sukabumi',
    phone: '0811-5566-7788',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_VISITS: Visit[] = [
  {
    id: 'vis-101',
    visit_number: 'VIS-202610-0001',
    patient_name: 'Ibu Maryamah',
    ward_id: 'ward-01',
    ward_name: 'Ruang Fatimah',
    room_number: '4',
    visited_at: '2026-10-18T08:30:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Ahmad Ridwan',
    companion_relation: 'Anak Kandung',
    social_observation: 'Dukungan keluarga baik',
    social_notes: 'Didampingi anak secara bergantian, komunikasi keluarga harmonis.',
    psychological_observation: 'Kondisi emosional tampak baik',
    psychological_notes: 'Pasien tenang dan kooperatif dengan perawat.',
    spiritual_observation: 'Kebutuhan spiritual terpenuhi',
    spiritual_notes: 'Sudah disediakan penunjuk arah kiblat dan alat salat.',
    comfort_score: 5,
    cleanliness_score: 5,
    communication_score: 5,
    responsiveness_score: 4,
    overall_satisfaction_score: 5,
    has_issue: false,
    general_notes: 'Pasien sangat berterima kasih atas kunjungan ramah petugas pagi ini.',
    created_at: '2026-10-18T08:45:00Z',
    updated_at: '2026-10-18T08:45:00Z',
  },
  {
    id: 'vis-102',
    visit_number: 'VIS-202610-0002',
    patient_name: 'Bpk. Deden Kurniawan',
    ward_id: 'ward-02',
    ward_name: 'Ruang Aisyah',
    room_number: '2',
    visited_at: '2026-10-18T09:15:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Ibu Nenden',
    companion_relation: 'Istri',
    social_observation: 'Dukungan keluarga baik',
    social_notes: 'Keluarga selalu mendampingi.',
    psychological_observation: 'Pasien atau keluarga menyampaikan ketidaknyamanan',
    psychological_notes: 'Pasien mengeluhkan suhu ruangan agak gerah karena AC kurang dingin.',
    spiritual_observation: 'Kebutuhan spiritual terpenuhi',
    spiritual_notes: 'Tidak ada permintaan khusus.',
    comfort_score: 3,
    cleanliness_score: 4,
    communication_score: 4,
    responsiveness_score: 3,
    overall_satisfaction_score: 3,
    has_issue: true,
    general_notes: 'AC ruangan kamar 2 hembusannya kurang dingin sejak tadi malam.',
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'vis-103',
    visit_number: 'VIS-202610-0003',
    patient_name: 'Ananda Rizky Pratama',
    ward_id: 'ward-04',
    ward_name: 'Ruang Khadijah',
    room_number: '7',
    visited_at: '2026-10-18T10:00:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Ibu Wati',
    companion_relation: 'Ibu',
    social_observation: 'Kendala sosial atau kebutuhan bantuan',
    social_notes: 'Ibu pasien membutuhkan bantuan administrasi aktivasi kepesertaan jaminan daerah.',
    psychological_observation: 'Pasien atau keluarga tampak cemas',
    psychological_notes: 'Keluarga cemas terkait biaya dan prosedur kepesertaan jaminan.',
    spiritual_observation: 'Meminta pendampingan rohani',
    spiritual_notes: 'Ibu meminta doa bersama petugas rohaniwan rumah sakit.',
    comfort_score: 4,
    cleanliness_score: 4,
    communication_score: 4,
    responsiveness_score: 4,
    overall_satisfaction_score: 4,
    has_issue: true,
    general_notes: 'Perlu koordinasi petugas sosial medis/rohaniwan dan instalasi jaminan.',
    created_at: '2026-10-18T10:20:00Z',
    updated_at: '2026-10-18T10:20:00Z',
  },
  {
    id: 'vis-104',
    visit_number: 'VIS-202610-0004',
    patient_name: 'Bpk. Herman Suherman',
    ward_id: 'ward-05',
    ward_name: 'IGD',
    room_number: '5',
    visited_at: '2026-10-17T14:00:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Usep Hendra',
    companion_relation: 'Saudara',
    social_observation: 'Dukungan keluarga baik',
    social_notes: 'Penunggu tertib mendampingi.',
    psychological_observation: 'Kondisi emosional tampak baik',
    psychological_notes: 'Kondisi stabil.',
    spiritual_observation: 'Kebutuhan spiritual terpenuhi',
    spiritual_notes: 'Ibadah mandiri.',
    comfort_score: 4,
    cleanliness_score: 4,
    communication_score: 5,
    responsiveness_score: 5,
    overall_satisfaction_score: 4,
    has_issue: false,
    general_notes: 'Pelayanan perawat IGD dinilai sangat tanggap.',
    created_at: '2026-10-17T14:30:00Z',
    updated_at: '2026-10-17T14:30:00Z',
  },
  {
    id: 'vis-105',
    visit_number: 'VIS-202610-0005',
    patient_name: 'Ny. Siti Aisyah',
    ward_id: 'ward-03',
    ward_name: 'Ruang Usman',
    room_number: '2',
    visited_at: '2026-10-17T11:00:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Bpk. Firman',
    companion_relation: 'Suami',
    social_observation: 'Dukungan keluarga baik',
    social_notes: 'Suami mendampingi penuh.',
    psychological_observation: 'Pasien atau keluarga menyampaikan ketidaknyamanan',
    psychological_notes: 'Air kamar mandi sempat kecil pada jam 06.00 pagi.',
    spiritual_observation: 'Kebutuhan spiritual terpenuhi',
    spiritual_notes: 'Terpenuhi baik.',
    comfort_score: 3,
    cleanliness_score: 4,
    communication_score: 5,
    responsiveness_score: 4,
    overall_satisfaction_score: 4,
    has_issue: true,
    general_notes: 'Keluhan aliran air kamar mandi di Ruang Usman Kamar 2.',
    created_at: '2026-10-17T11:25:00Z',
    updated_at: '2026-10-17T16:00:00Z',
  },
  {
    id: 'vis-106',
    visit_number: 'VIS-202610-0006',
    patient_name: 'Bpk. Sukarna',
    ward_id: 'ward-06',
    ward_name: 'Rawat Jalan',
    room_number: '9',
    visited_at: '2026-10-16T15:30:00Z',
    visitor_id: 'usr-staff-01',
    visitor_name: 'Budi Santoso, Amd.Kep',
    companion_name: 'Cecep',
    companion_relation: 'Keponakan',
    social_observation: 'Dukungan keluarga baik',
    social_notes: 'Keluarga kooperatif.',
    psychological_observation: 'Pasien atau keluarga menyampaikan kekhawatiran',
    psychological_notes: 'Keluarga menanyakan jadwal fisioterapi latihan jalan.',
    spiritual_observation: 'Kebutuhan spiritual terpenuhi',
    spiritual_notes: 'Terpenuhi.',
    comfort_score: 4,
    cleanliness_score: 5,
    communication_score: 4,
    responsiveness_score: 4,
    overall_satisfaction_score: 4,
    has_issue: true,
    general_notes: 'Koordinasi jadwal fisioterapi rehabilitasi medik.',
    created_at: '2026-10-16T16:00:00Z',
    updated_at: '2026-10-17T10:00:00Z',
  },
];

const INITIAL_ISSUES: Issue[] = [
  {
    id: 'iss-201',
    visit_id: 'vis-102',
    category: 'fasilitas',
    description: 'AC Ruang Aisyah Kamar 2 hembusan kurang dingin dan filter berdebu.',
    priority: 'sedang',
    status: 'dalam_proses',
    assigned_unit: 'Instalasi Pemeliharaan Sarana RS (IPSRS)',
    assigned_to: 'Tim Teknisi Pendingin IPSRS',
    initial_action: 'Sudah dilaporkan via tiket internal IPSRS dan teknisi sedang menuju ruangan.',
    due_at: '2026-10-18T16:00:00Z',
    resolved_at: undefined,
    resolution_notes: undefined,
    created_at: '2026-10-18T09:30:00Z',
    updated_at: '2026-10-18T10:15:00Z',
    patient_name: 'Bpk. Deden Kurniawan',
    visit_number: 'VIS-202610-0002',
    ward_name: 'Ruang Aisyah',
    room_number: '2',
    visitor_name: 'Budi Santoso, Amd.Kep',
    follow_up_logs: [
      {
        id: 'log-01',
        issue_id: 'iss-201',
        action_description: 'Masalah dilaporkan dan dibuatkan tiket perbaikan ke IPSRS.',
        status_after_action: 'dalam_proses',
        actor_id: 'usr-staff-01',
        actor_name: 'Budi Santoso, Amd.Kep',
        created_at: '2026-10-18T09:35:00Z',
      },
    ],
  },
  {
    id: 'iss-202',
    visit_id: 'vis-103',
    category: 'dukungan_sosial',
    description: 'Bantuan verifikasi kepesertaan jaminan daerah dan pendampingan rohani pasien anak.',
    priority: 'tinggi',
    status: 'belum_ditindaklanjuti',
    assigned_unit: 'Bagian Humas & Pemasaran / Bina Rohani',
    assigned_to: 'Petugas Bimbingan Rohani & Sosial',
    initial_action: 'Mencatat data keluarga dan menjadwalkan kunjungan rohaniwan pukul 13.00.',
    due_at: '2026-10-18T14:00:00Z',
    created_at: '2026-10-18T10:20:00Z',
    updated_at: '2026-10-18T10:20:00Z',
    patient_name: 'Ananda Rizky Pratama',
    visit_number: 'VIS-202610-0003',
    ward_name: 'Ruang Khadijah',
    room_number: '7',
    visitor_name: 'Budi Santoso, Amd.Kep',
    follow_up_logs: [],
  },
  {
    id: 'iss-203',
    visit_id: 'vis-105',
    category: 'fasilitas',
    description: 'Aliran air kamar mandi kecil pada pagi hari di Ruang Usman Kamar 2.',
    priority: 'sedang',
    status: 'selesai',
    assigned_unit: 'IPSRS',
    assigned_to: 'Bpk. Mulyadi (Plumbing IPSRS)',
    initial_action: 'Pembersihan pipa filter kran dan pengalihan pompa pendorong.',
    due_at: '2026-10-17T17:00:00Z',
    resolved_at: '2026-10-17T15:45:00Z',
    resolution_notes: 'Pompa pendorong booster telah dinyalakan kembali, debit air sudah deras dan normal.',
    verified_by: 'usr-super-01',
    verified_by_name: 'Ns. Siti Nurhaliza, S.Kep',
    verified_at: '2026-10-17T16:00:00Z',
    created_at: '2026-10-17T11:25:00Z',
    updated_at: '2026-10-17T16:00:00Z',
    patient_name: 'Ny. Siti Aisyah',
    visit_number: 'VIS-202610-0005',
    ward_name: 'Ruang Usman',
    room_number: '2',
    visitor_name: 'Budi Santoso, Amd.Kep',
    follow_up_logs: [
      {
        id: 'log-02',
        issue_id: 'iss-203',
        action_description: 'Teknisi membersihkan filter valve kran dan mengaktifkan booster pompa.',
        status_after_action: 'dalam_proses',
        actor_id: 'usr-staff-01',
        actor_name: 'Budi Santoso, Amd.Kep',
        created_at: '2026-10-17T13:30:00Z',
      },
      {
        id: 'log-03',
        issue_id: 'iss-203',
        action_description: 'Konfirmasi kepada pasien bahwa aliran air sudah lancar kembali.',
        status_after_action: 'selesai',
        actor_id: 'usr-super-01',
        actor_name: 'Ns. Siti Nurhaliza, S.Kep',
        created_at: '2026-10-17T15:45:00Z',
      },
    ],
  },
  {
    id: 'iss-204',
    visit_id: 'vis-106',
    category: 'komunikasi',
    description: 'Keluarga membutuhkan kejelasan jadwal latihan fisioterapi pasca-stroke.',
    priority: 'rendah',
    status: 'selesai',
    assigned_unit: 'Instalasi Rehabilitasi Medik',
    assigned_to: 'Fisioterapis Ruangan',
    initial_action: 'Menghubungi fisioterapis penanggung jawab.',
    due_at: '2026-10-17T12:00:00Z',
    resolved_at: '2026-10-17T09:45:00Z',
    resolution_notes: 'Fisioterapis telah datang mengedukasi keluarga dan menjadwalkan latihan rutin setiap pukul 10.00 WIB.',
    verified_by: 'usr-super-01',
    verified_by_name: 'Ns. Siti Nurhaliza, S.Kep',
    verified_at: '2026-10-17T10:00:00Z',
    created_at: '2026-10-16T16:00:00Z',
    updated_at: '2026-10-17T10:00:00Z',
    patient_name: 'Bpk. Sukarna',
    visit_number: 'VIS-202610-0006',
    ward_name: 'Rawat Jalan (Poliklinik)',
    room_number: '9',
    visitor_name: 'Budi Santoso, Amd.Kep',
    follow_up_logs: [],
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    actor_id: 'usr-admin-01',
    actor_name: 'Dr. H. Ahmad Fauzi, Sp.PK',
    action: 'SYSTEM_BOOTSTRAP',
    table_name: 'system',
    record_id: 'RSUD-AL-MULK',
    metadata: { note: 'Inisialisasi sistem SAPA PASIEN RSUD Al-Mulk Kota Sukabumi' },
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'aud-02',
    actor_id: 'usr-staff-01',
    actor_name: 'Budi Santoso, Amd.Kep',
    action: 'CREATE_VISIT',
    table_name: 'visits',
    record_id: 'vis-102',
    metadata: { visit_number: 'VIS-202610-0002', ward: 'Ruang Aisyah' },
    created_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'aud-03',
    actor_id: 'usr-super-01',
    actor_name: 'Ns. Siti Nurhaliza, S.Kep',
    action: 'VERIFY_ISSUE',
    table_name: 'issues',
    record_id: 'iss-203',
    metadata: { issue_category: 'fasilitas', resolution: 'Pompa pendorong diaktifkan' },
    created_at: '2026-10-17T16:00:00Z',
  },
];

// Persistent state management keys
const STORAGE_VISITS = 'sapa_visits_v4';
const STORAGE_ISSUES = 'sapa_issues_v4';
const STORAGE_AUDIT = 'sapa_audit_v4';
const STORAGE_CURRENT_USER = 'sapa_current_user_v1';

export class DataStore {
  private static visits: Visit[] = [];
  private static issues: Issue[] = [];
  private static auditLogs: AuditLog[] = [];
  private static currentUser: UserProfile = DEMO_ACCOUNTS[0]; // Default Admin
  private static listeners: Array<() => void> = [];

  static init() {
    if (typeof window === 'undefined') return;

    // Load or initialize visits
    const storedVisits = localStorage.getItem(STORAGE_VISITS);
    if (storedVisits) {
      try {
        this.visits = JSON.parse(storedVisits);
      } catch {
        this.visits = [...INITIAL_VISITS];
      }
    } else {
      this.visits = [...INITIAL_VISITS];
      this.saveVisits();
    }

    // Load or initialize issues
    const storedIssues = localStorage.getItem(STORAGE_ISSUES);
    if (storedIssues) {
      try {
        this.issues = JSON.parse(storedIssues);
      } catch {
        this.issues = [...INITIAL_ISSUES];
      }
    } else {
      this.issues = [...INITIAL_ISSUES];
      this.saveIssues();
    }

    // Load or initialize audit logs
    const storedAudit = localStorage.getItem(STORAGE_AUDIT);
    if (storedAudit) {
      try {
        this.auditLogs = JSON.parse(storedAudit);
      } catch {
        this.auditLogs = [...INITIAL_AUDIT_LOGS];
      }
    } else {
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.saveAudit();
    }

    // Load active user
    const storedUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch {
        this.currentUser = DEMO_ACCOUNTS[0];
      }
    }
  }

  private static saveVisits() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_VISITS, JSON.stringify(this.visits));
    }
  }

  private static saveIssues() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ISSUES, JSON.stringify(this.issues));
    }
  }

  private static saveAudit() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(this.auditLogs));
    }
  }

  static subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    }
  }

  // Auth User
  static getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  static setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    }
    this.addAuditLog({
      actor_id: user.id,
      actor_name: user.full_name,
      action: 'LOGIN_SWITCH',
      table_name: 'profiles',
      record_id: user.id,
      metadata: { role: user.role, email: user.email },
    });
    this.notify();
  }

  // Wards
  static getWards(): Ward[] {
    return INITIAL_WARDS;
  }

  static getWardById(id: string): Ward | undefined {
    return INITIAL_WARDS.find((w) => w.id === id);
  }

  // Visits
  static getVisits(): Visit[] {
    return [...this.visits].sort(
      (a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
    );
  }

  static getVisitById(id: string): Visit | undefined {
    const visit = this.visits.find((v) => v.id === id);
    if (!visit) return undefined;
    const relatedIssues = this.issues.filter((i) => i.visit_id === id);
    return { ...visit, issues: relatedIssues };
  }

  // Issues
  static getIssues(): Issue[] {
    return [...this.issues].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static getIssueById(id: string): Issue | undefined {
    return this.issues.find((i) => i.id === id);
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.saveAudit();
  }

  // Generate Unique Visit Number
  static generateVisitNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = this.visits.length + 1;
    const seq = String(count).padStart(4, '0');
    return `VIS-${year}${month}-${seq}`;
  }

  // Create Visit with optional Issue
  static async createVisit(
    visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'visit_number'>,
    issueData?: Omit<Issue, 'id' | 'visit_id' | 'created_at' | 'updated_at'>
  ): Promise<Visit> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const visitId = `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const visitNumber = this.generateVisitNumber();
    const ward = this.getWardById(visitData.ward_id);

    const newVisit: Visit = {
      ...visitData,
      id: visitId,
      visit_number: visitNumber,
      ward_name: ward?.name || 'Ruang Perawatan',
      created_at: now,
      updated_at: now,
    };

    let newIssue: Issue | undefined = undefined;

    if (visitData.has_issue && issueData) {
      const issueId = `iss-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      newIssue = {
        ...issueData,
        id: issueId,
        visit_id: visitId,
        created_at: now,
        updated_at: now,
        patient_name: newVisit.patient_name,
        visit_number: newVisit.visit_number,
        ward_name: newVisit.ward_name,
        room_number: newVisit.room_number,
        visitor_name: newVisit.visitor_name,
        follow_up_logs: [
          {
            id: `log-${Date.now()}`,
            issue_id: issueId,
            action_description:
              issueData.initial_action || 'Keluhan dicatat saat kunjungan pasien.',
            status_after_action: issueData.status || 'belum_ditindaklanjuti',
            actor_id: this.currentUser.id,
            actor_name: this.currentUser.full_name,
            created_at: now,
          },
        ],
      };
      this.issues.unshift(newIssue);
      this.saveIssues();
    }

    this.visits.unshift(newVisit);
    this.saveVisits();

    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'CREATE_VISIT',
      table_name: 'visits',
      record_id: visitId,
      metadata: {
        visit_number: visitNumber,
        patient_name: newVisit.patient_name,
        ward: newVisit.ward_name,
        room: newVisit.room_number,
        has_issue: newVisit.has_issue,
      },
    });

    // If Supabase is connected, sync asynchronously
    if (supabase) {
      try {
        await supabase.from('visits').insert([
          {
            visit_number: newVisit.visit_number,
            patient_name: newVisit.patient_name,
            ward_id: newVisit.ward_id,
            room_number: newVisit.room_number,
            visited_at: newVisit.visited_at,
            visitor_id: this.currentUser.id,
            companion_name: newVisit.companion_name,
            companion_relation: newVisit.companion_relation,
            social_observation: newVisit.social_observation,
            social_notes: newVisit.social_notes,
            psychological_observation: newVisit.psychological_observation,
            psychological_notes: newVisit.psychological_notes,
            spiritual_observation: newVisit.spiritual_observation,
            spiritual_notes: newVisit.spiritual_notes,
            comfort_score: newVisit.comfort_score,
            cleanliness_score: newVisit.cleanliness_score,
            communication_score: newVisit.communication_score,
            responsiveness_score: newVisit.responsiveness_score,
            overall_satisfaction_score: newVisit.overall_satisfaction_score,
            has_issue: newVisit.has_issue,
            general_notes: newVisit.general_notes,
          },
        ]);

        if (newIssue) {
          await supabase.from('issues').insert([
            {
              category: newIssue.category,
              description: newIssue.description,
              priority: newIssue.priority,
              status: newIssue.status,
              assigned_unit: newIssue.assigned_unit,
              assigned_to: newIssue.assigned_to,
              initial_action: newIssue.initial_action,
              due_at: newIssue.due_at,
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not sync visit to Supabase table:', err);
      }
    }

    this.notify();
    return newVisit;
  }

  // Update Follow Up on an Issue
  static async addFollowUp(
    issueId: string,
    actionDescription: string,
    newStatus: IssueStatus,
    resolutionNotes?: string
  ): Promise<boolean> {
    const issueIndex = this.issues.findIndex((i) => i.id === issueId);
    if (issueIndex === -1) return false;

    const issue = this.issues[issueIndex];
    const now = new Date().toISOString();

    const log: FollowUpLog = {
      id: `log-${Date.now()}`,
      issue_id: issueId,
      action_description: actionDescription,
      status_after_action: newStatus,
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      created_at: now,
    };

    const currentLogs = issue.follow_up_logs || [];
    const updatedIssue: Issue = {
      ...issue,
      status: newStatus,
      resolution_notes: resolutionNotes || issue.resolution_notes,
      resolved_at: newStatus === 'selesai' ? now : issue.resolved_at,
      updated_at: now,
      follow_up_logs: [log, ...currentLogs],
    };

    this.issues[issueIndex] = updatedIssue;
    this.saveIssues();

    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_FOLLOW_UP',
      table_name: 'issues',
      record_id: issueId,
      metadata: {
        new_status: newStatus,
        action: actionDescription,
        visit_number: issue.visit_number,
      },
    });

    // Supabase sync if active
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('issues')
          .update({
            status: newStatus,
            resolution_notes: updatedIssue.resolution_notes,
            resolved_at: updatedIssue.resolved_at,
            updated_at: now,
          })
          .eq('id', issueId);
      } catch (err) {
        console.warn('Supabase issue update error:', err);
      }
    }

    this.notify();
    return true;
  }

  // Verify Issue Resolution (Supervisor / Admin only)
  static async verifyIssue(issueId: string, verificationNotes: string): Promise<boolean> {
    const issueIndex = this.issues.findIndex((i) => i.id === issueId);
    if (issueIndex === -1) return false;

    const issue = this.issues[issueIndex];
    const now = new Date().toISOString();

    const updatedIssue: Issue = {
      ...issue,
      status: 'selesai',
      verified_by: this.currentUser.id,
      verified_by_name: this.currentUser.full_name,
      verified_at: now,
      resolution_notes: verificationNotes
        ? `${issue.resolution_notes || ''} [Verifikasi: ${verificationNotes}]`
        : issue.resolution_notes,
      updated_at: now,
    };

    this.issues[issueIndex] = updatedIssue;
    this.saveIssues();

    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'VERIFY_ISSUE',
      table_name: 'issues',
      record_id: issueId,
      metadata: {
        verifier: this.currentUser.full_name,
        visit_number: issue.visit_number,
        patient_name: issue.patient_name,
      },
    });

    this.notify();
    return true;
  }

  // Delete Visit (with cascading issues and audit logging)
  static async deleteVisit(visitId: string): Promise<boolean> {
    const visitIndex = this.visits.findIndex((v) => v.id === visitId);
    if (visitIndex === -1) return false;

    const visit = this.visits[visitIndex];
    const supabase = getSupabaseClient();

    // Remove associated issues
    this.issues = this.issues.filter((i) => i.visit_id !== visitId);
    this.saveIssues();

    // Remove visit from repository
    this.visits.splice(visitIndex, 1);
    this.saveVisits();

    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'DELETE_VISIT',
      table_name: 'visits',
      record_id: visitId,
      metadata: {
        visit_number: visit.visit_number,
        patient_name: visit.patient_name,
        ward: visit.ward_name,
        room: visit.room_number,
      },
    });

    if (supabase) {
      try {
        await supabase.from('visits').delete().eq('id', visitId);
      } catch (err) {
        console.warn('Supabase visit delete error:', err);
      }
    }

    this.notify();
    return true;
  }

  // Reset to initial demo data (for testing)
  static resetToDefaults() {
    this.visits = [...INITIAL_VISITS];
    this.issues = [...INITIAL_ISSUES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveVisits();
    this.saveIssues();
    this.saveAudit();
    this.notify();
  }
}

// Auto init in browser
if (typeof window !== 'undefined') {
  DataStore.init();
}
