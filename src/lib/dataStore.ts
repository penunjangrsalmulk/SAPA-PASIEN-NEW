import {
  UserProfile,
  Ward,
  Visit,
  Issue,
  FollowUpLog,
  AuditLog,
  IssueStatus,
  UserRole,
  HospitalProfile,
  SlaSetting,
  IssueCategorySetting,
  IssuePriority,
} from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

// Master Ruangan Rawat Inap RSUD Al-Mulk Kota Sukabumi
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

// Akun Pengguna & Hak Akses RSUD Al-Mulk
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

export const INITIAL_HOSPITAL_PROFILE: HospitalProfile = {
  name: 'RSUD Al-Mulk Kota Sukabumi',
  classification: 'Rumah Sakit Umum Daerah Tipe D Pratama / Paripurna',
  address: 'Jl. Pelabuhan II KM. 6, Kel. Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat',
  phone: '(0266) 625-1000 / Layanan SAPA PASIEN ext. 104',
  email: 'rsudalmulk@sukabumikota.go.id',
  operational_status: 'Aktif Penuh (Layanan 24 Jam)',
  vision: 'Mewujudkan pelayanan rawat inap yang menjunjung tinggi empati, komunikasi humanis, pemenuhan kebutuhan spiritual dan sosiologis, serta penyelesaian setiap keluhan pasien secara tuntas demi kepuasan warga Kota Sukabumi.',
  logo_url: '/src/assets/images/rsud_almulk_logo_1792331924541.jpg',
  updated_at: '2026-10-19T00:00:00Z',
};

export const INITIAL_SLA_SETTINGS: SlaSetting[] = [
  {
    priority: 'kritis',
    label: 'Prioritas Kritis',
    max_hours: 1,
    description: 'Meliputi isu keselamatan pasien, insiden kegawatdaruratan, atau ancaman henti napas/jantung. Dilaporkan lisan langsung ke DPJP & Tim Medis.',
    color_badge: 'red',
  },
  {
    priority: 'tinggi',
    label: 'Prioritas Tinggi',
    max_hours: 6,
    description: 'Meliputi kendala pasokan obat darurat, kegagalan listrik/alat bantu nafas di ruangan, atau kecemasan berat keluarga pasien.',
    color_badge: 'amber',
  },
  {
    priority: 'sedang',
    label: 'Prioritas Sedang',
    max_hours: 24,
    description: 'Meliputi fasilitas fisik (AC kurang dingin, kran air macet), kendala administrasi jaminan BPJS, atau kebersihan kamar mandi.',
    color_badge: 'blue',
  },
  {
    priority: 'rendah',
    label: 'Prioritas Rendah',
    max_hours: 48,
    description: 'Permintaan informasi umum, jadwal bimbingan rohani rutin, atau saran perbaikan non-urgent.',
    color_badge: 'slate',
  },
];

export const INITIAL_ISSUE_CATEGORIES: IssueCategorySetting[] = [
  {
    id: 'cat-1',
    key: 'fasilitas',
    name: 'Fasilitas & Sarana Prasarana',
    description: 'Kelayakan tempat tidur, kran air, pencahayaan, AC/kipas, toilet dan bel pemanggil',
    default_unit: 'Instalasi Pemeliharaan Sarana RS (IPSRS)',
    is_active: true,
  },
  {
    id: 'cat-2',
    key: 'kebersihan',
    name: 'Kebersihan & Sanitasi Lingkungan',
    description: 'Kebersihan kamar rawat, sprei, kamar mandi pasien, dan pembuangan sampah medis',
    default_unit: 'Sanitasi & Kesling RS',
    is_active: true,
  },
  {
    id: 'cat-3',
    key: 'pelayanan',
    name: 'Pelayanan Medis & Keperawatan',
    description: 'Ketepatan visitasi dokter, kecepatan respon perawat, dan pemberian obat',
    default_unit: 'Bidang Keperawatan & Pelayanan Medis',
    is_active: true,
  },
  {
    id: 'cat-4',
    key: 'komunikasi',
    name: 'Komunikasi & Edukasi Petugas',
    description: 'Keramahan petugas, kejelasan informasi rencana asuhan, dan penjelasan obat',
    default_unit: 'Humas & PKRS RSUD Al-Mulk',
    is_active: true,
  },
  {
    id: 'cat-5',
    key: 'kenyamanan',
    name: 'Kenyamanan & Ketenangan Ruangan',
    description: 'Kebisingan malam hari, pembatasan pengunjung, suhu ruangan',
    default_unit: 'Kepala Ruangan Rawat Inap & Keamanan',
    is_active: true,
  },
  {
    id: 'cat-6',
    key: 'dukungan_sosial',
    name: 'Dukungan Sosial & Keluarga',
    description: 'Pendampingan pasien tanpa keluarga, kendala pembiayaan/sosial',
    default_unit: 'Pekerja Sosial & Pelayanan Pasien',
    is_active: true,
  },
  {
    id: 'cat-7',
    key: 'dukungan_psikologis',
    name: 'Dukungan Psikologis Pasien',
    description: 'Kecemasan menghadapi tindakan medis, ketakutan pasien/keluarga',
    default_unit: 'Konselor / Psikolog Klinis RS',
    is_active: true,
  },
  {
    id: 'cat-8',
    key: 'dukungan_spiritual',
    name: 'Bimbingan & Fasilitasi Spiritual',
    description: 'Permintaan rohaniwan, bimbingan doa, tayamum & perlengkapan ibadah',
    default_unit: 'Tim Kerohanian & Bintal RSUD Al-Mulk',
    is_active: true,
  },
  {
    id: 'cat-9',
    key: 'lainnya',
    name: 'Lainnya / Masalah Umum',
    description: 'Masalah lain di luar kategori standar di atas',
    default_unit: 'Manajemen Mutu & Pengaduan',
    is_active: true,
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
        action_description: 'Teknisi IPSRS telah memeriksa evaporator dan melakukan pembersihan filter.',
        status_after_action: 'dalam_proses',
        actor_id: 'usr-staff-01',
        actor_name: 'Budi Santoso, Amd.Kep',
        created_at: '2026-10-18T10:15:00Z',
      },
    ],
  },
  {
    id: 'iss-202',
    visit_id: 'vis-103',
    category: 'dukungan_sosial',
    description: 'Pasien membutuhkan bantuan advokasi jaminan kesehatan daerah dan bimbingan rohani.',
    priority: 'tinggi',
    status: 'belum_ditindaklanjuti',
    assigned_unit: 'Tim Pekerja Sosial & Kerohanian',
    assigned_to: 'Petugas Bintal RS',
    initial_action: 'Koordinasi berkas kepesertaan jaminan dan penjadwalan bimbingan doa.',
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
    description: 'Aliran air kamar mandi Ruang Usman Kamar 2 sempat kecil di pagi hari.',
    priority: 'sedang',
    status: 'selesai',
    assigned_unit: 'IPSRS (Sanitasi & Perpipaan)',
    assigned_to: 'Teknisi Pompa',
    initial_action: 'Pembersihan kran dan pengecekan pompa pendorong.',
    due_at: '2026-10-17T17:00:00Z',
    resolved_at: '2026-10-17T15:45:00Z',
    resolution_notes: 'Pompa pendorong telah dinormalkan dan debit air kamar mandi sudah deras kembali.',
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
    ward_name: 'Rawat Jalan',
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

// Persistent state keys
const STORAGE_VISITS = 'sapa_visits_v5';
const STORAGE_ISSUES = 'sapa_issues_v5';
const STORAGE_AUDIT = 'sapa_audit_v5';
const STORAGE_CURRENT_USER = 'sapa_current_user_v5';
const STORAGE_WARDS = 'sapa_wards_v5';
const STORAGE_USERS = 'sapa_users_v5';
const STORAGE_HOSPITAL_PROFILE = 'sapa_hospital_profile_v5';
const STORAGE_SLA_SETTINGS = 'sapa_sla_settings_v5';
const STORAGE_ISSUE_CATEGORIES = 'sapa_issue_categories_v5';

export class DataStore {
  private static visits: Visit[] = [];
  private static issues: Issue[] = [];
  private static auditLogs: AuditLog[] = [];
  private static currentUser: UserProfile = DEMO_ACCOUNTS[0]; // Default Admin
  private static wards: Ward[] = [];
  private static users: UserProfile[] = [];
  private static hospitalProfile: HospitalProfile = INITIAL_HOSPITAL_PROFILE;
  private static slaSettings: SlaSetting[] = [];
  private static issueCategories: IssueCategorySetting[] = [];
  private static listeners: Array<() => void> = [];
  private static isSyncing = false;
  private static realtimeSubscribed = false;

  static init() {
    if (typeof window === 'undefined') return;

    // 1. Load visits
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

    // 2. Load issues
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

    // 3. Load audit logs
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

    // 4. Load active user
    const storedUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch {
        this.currentUser = DEMO_ACCOUNTS[0];
      }
    }

    // 5. Load wards
    const storedWards = localStorage.getItem(STORAGE_WARDS);
    if (storedWards) {
      try {
        this.wards = JSON.parse(storedWards);
      } catch {
        this.wards = [...INITIAL_WARDS];
      }
    } else {
      this.wards = [...INITIAL_WARDS];
      this.saveWards();
    }

    // 6. Load users
    const storedUsers = localStorage.getItem(STORAGE_USERS);
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch {
        this.users = [...DEMO_ACCOUNTS];
      }
    } else {
      this.users = [...DEMO_ACCOUNTS];
      this.saveUsers();
    }

    // 7. Load hospital profile
    const storedProfile = localStorage.getItem(STORAGE_HOSPITAL_PROFILE);
    if (storedProfile) {
      try {
        this.hospitalProfile = JSON.parse(storedProfile);
      } catch {
        this.hospitalProfile = { ...INITIAL_HOSPITAL_PROFILE };
      }
    } else {
      this.hospitalProfile = { ...INITIAL_HOSPITAL_PROFILE };
      this.saveHospitalProfile();
    }

    // 8. Load SLA settings
    const storedSla = localStorage.getItem(STORAGE_SLA_SETTINGS);
    if (storedSla) {
      try {
        this.slaSettings = JSON.parse(storedSla);
      } catch {
        this.slaSettings = [...INITIAL_SLA_SETTINGS];
      }
    } else {
      this.slaSettings = [...INITIAL_SLA_SETTINGS];
      this.saveSlaSettings();
    }

    // 9. Load issue categories
    const storedCategories = localStorage.getItem(STORAGE_ISSUE_CATEGORIES);
    if (storedCategories) {
      try {
        this.issueCategories = JSON.parse(storedCategories);
      } catch {
        this.issueCategories = [...INITIAL_ISSUE_CATEGORIES];
      }
    } else {
      this.issueCategories = [...INITIAL_ISSUE_CATEGORIES];
      this.saveIssueCategories();
    }

    // Attempt cloud sync and setup realtime if connected
    if (isSupabaseConfigured()) {
      this.syncFromSupabase();
      this.setupRealtimeSubscription();
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

  private static saveWards() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_WARDS, JSON.stringify(this.wards));
    }
  }

  private static saveUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(this.users));
    }
  }

  private static saveHospitalProfile() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOSPITAL_PROFILE, JSON.stringify(this.hospitalProfile));
    }
  }

  private static saveSlaSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SLA_SETTINGS, JSON.stringify(this.slaSettings));
    }
  }

  private static saveIssueCategories() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ISSUE_CATEGORIES, JSON.stringify(this.issueCategories));
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

  // --- Hospital Profile ---
  static getHospitalProfile(): HospitalProfile {
    return { ...this.hospitalProfile };
  }

  static async updateHospitalProfile(updates: Partial<HospitalProfile>) {
    this.hospitalProfile = {
      ...this.hospitalProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveHospitalProfile();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_HOSPITAL_PROFILE',
      table_name: 'hospital_profile',
      metadata: { fields: Object.keys(updates), name: this.hospitalProfile.name },
    });

    // Cloud sync to Supabase app_settings
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'hospital_profile',
          value: this.hospitalProfile,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase profile sync error:', err);
      }
    }

    this.notify();
  }

  // --- Auth & Users ---
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

  static getUsers(): UserProfile[] {
    return [...this.users];
  }

  static getUserById(id: string): UserProfile | undefined {
    return this.users.find((u) => u.id === id);
  }

  static async createUser(user: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.saveUsers();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'CREATE_USER',
      table_name: 'profiles',
      record_id: newUser.id,
      metadata: { name: newUser.full_name, role: newUser.role, email: newUser.email },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: newUser.id,
          full_name: newUser.full_name,
          role: newUser.role,
          department: newUser.department,
          phone: newUser.phone,
          email: newUser.email,
          avatar_url: newUser.avatar_url,
          is_active: newUser.is_active,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        });
      } catch (err) {
        console.warn('Supabase user insert error:', err);
      }
    }

    this.notify();
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.currentUser.id === id) {
      this.currentUser = { ...this.users[index] };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(this.currentUser));
      }
    }

    this.saveUsers();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_USER',
      table_name: 'profiles',
      record_id: id,
      metadata: { updates },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase user update error:', err);
      }
    }

    this.notify();
    return true;
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (this.currentUser.id === id) {
      return false;
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;

    this.users = this.users.filter((u) => u.id !== id);
    this.saveUsers();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'DELETE_USER',
      table_name: 'profiles',
      record_id: id,
      metadata: { name: user.full_name, role: user.role },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase user delete error:', err);
      }
    }

    this.notify();
    return true;
  }

  // --- Master Ruangan (Wards) ---
  static getWards(): Ward[] {
    return [...this.wards];
  }

  static getWardById(id: string): Ward | undefined {
    return this.wards.find((w) => w.id === id);
  }

  static async createWard(ward: Omit<Ward, 'id' | 'created_at' | 'updated_at'>): Promise<Ward> {
    const newWard: Ward = {
      ...ward,
      id: `ward-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.wards.push(newWard);
    this.saveWards();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'CREATE_WARD',
      table_name: 'wards',
      record_id: newWard.id,
      metadata: { name: newWard.name, code: newWard.code, capacity: newWard.capacity },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('wards').upsert({
          id: newWard.id,
          name: newWard.name,
          code: newWard.code,
          floor: newWard.floor,
          capacity: newWard.capacity,
          is_active: newWard.is_active,
          created_at: newWard.created_at,
          updated_at: newWard.updated_at,
        });
      } catch (err) {
        console.warn('Supabase ward insert error:', err);
      }
    }

    this.notify();
    return newWard;
  }

  static async updateWard(id: string, updates: Partial<Ward>): Promise<boolean> {
    const index = this.wards.findIndex((w) => w.id === id);
    if (index === -1) return false;

    this.wards[index] = {
      ...this.wards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveWards();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_WARD',
      table_name: 'wards',
      record_id: id,
      metadata: { updates },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('wards')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase ward update error:', err);
      }
    }

    this.notify();
    return true;
  }

  static async deleteWard(id: string): Promise<boolean> {
    const ward = this.wards.find((w) => w.id === id);
    if (!ward) return false;

    this.wards = this.wards.filter((w) => w.id !== id);
    this.saveWards();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'DELETE_WARD',
      table_name: 'wards',
      record_id: id,
      metadata: { name: ward.name, code: ward.code },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('wards').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase ward delete error:', err);
      }
    }

    this.notify();
    return true;
  }

  // --- SLA Settings & Categories ---
  static getSlaSettings(): SlaSetting[] {
    return [...this.slaSettings];
  }

  static async updateSlaSetting(priority: IssuePriority, updates: Partial<SlaSetting>): Promise<boolean> {
    const index = this.slaSettings.findIndex((s) => s.priority === priority);
    if (index === -1) return false;

    this.slaSettings[index] = {
      ...this.slaSettings[index],
      ...updates,
    };
    this.saveSlaSettings();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_SLA',
      table_name: 'sla_settings',
      metadata: { priority, updates },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'sla_settings',
          value: this.slaSettings,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase sla sync error:', err);
      }
    }

    this.notify();
    return true;
  }

  static getIssueCategories(): IssueCategorySetting[] {
    return [...this.issueCategories];
  }

  static async createIssueCategory(category: Omit<IssueCategorySetting, 'id'>): Promise<IssueCategorySetting> {
    const newCat: IssueCategorySetting = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    this.issueCategories.push(newCat);
    this.saveIssueCategories();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'CREATE_ISSUE_CATEGORY',
      table_name: 'issue_categories',
      record_id: newCat.id,
      metadata: { name: newCat.name, key: newCat.key },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'issue_categories',
          value: this.issueCategories,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase categories sync error:', err);
      }
    }

    this.notify();
    return newCat;
  }

  static async updateIssueCategory(id: string, updates: Partial<IssueCategorySetting>): Promise<boolean> {
    const index = this.issueCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    this.issueCategories[index] = {
      ...this.issueCategories[index],
      ...updates,
    };
    this.saveIssueCategories();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'UPDATE_ISSUE_CATEGORY',
      table_name: 'issue_categories',
      record_id: id,
      metadata: { updates },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'issue_categories',
          value: this.issueCategories,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase categories sync error:', err);
      }
    }

    this.notify();
    return true;
  }

  static async deleteIssueCategory(id: string): Promise<boolean> {
    const cat = this.issueCategories.find((c) => c.id === id);
    if (!cat) return false;

    this.issueCategories = this.issueCategories.filter((c) => c.id !== id);
    this.saveIssueCategories();
    this.addAuditLog({
      actor_id: this.currentUser.id,
      actor_name: this.currentUser.full_name,
      action: 'DELETE_ISSUE_CATEGORY',
      table_name: 'issue_categories',
      record_id: id,
      metadata: { name: cat.name },
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('app_settings').upsert({
          key: 'issue_categories',
          value: this.issueCategories,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase categories sync error:', err);
      }
    }

    this.notify();
    return true;
  }

  // --- Visits & Issues ---
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

  static getIssues(): Issue[] {
    return [...this.issues].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static getIssueById(id: string): Issue | undefined {
    return this.issues.find((i) => i.id === id);
  }

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

    const supabase = getSupabaseClient();
    if (supabase) {
      Promise.resolve(
        supabase.from('audit_logs').insert([
          {
            id: newLog.id,
            actor_id: newLog.actor_id,
            actor_name: newLog.actor_name,
            action: newLog.action,
            table_name: newLog.table_name,
            record_id: newLog.record_id || null,
            metadata: newLog.metadata || {},
            created_at: newLog.created_at,
          },
        ])
      ).catch(() => {});
    }
  }

  static generateVisitNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = this.visits.length + 1;
    const seq = String(count).padStart(4, '0');
    return `VIS-${year}${month}-${seq}`;
  }

  static async createVisit(
    visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'visit_number'>,
    issueData?: Omit<Issue, 'id' | 'visit_id' | 'created_at' | 'updated_at'>
  ): Promise<Visit> {
    const now = new Date().toISOString();
    const visitId = `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const visitNumber = this.generateVisitNumber();
    const ward = this.getWardById(visitData.ward_id);

    const newVisit: Visit = {
      ...visitData,
      id: visitId,
      visit_number: visitNumber,
      ward_name: ward?.name || visitData.ward_name || 'Ruang Perawatan',
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
              issueData.initial_action || 'Keluhan dicatat saat kunjungan sapa pasien.',
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

    // Cloud sync to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('visits').insert([
          {
            id: newVisit.id,
            visit_number: newVisit.visit_number,
            patient_name: newVisit.patient_name,
            ward_id: newVisit.ward_id,
            ward_name: newVisit.ward_name,
            room_number: newVisit.room_number,
            visited_at: newVisit.visited_at,
            visitor_id: this.currentUser.id,
            visitor_name: newVisit.visitor_name,
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
            created_at: newVisit.created_at,
            updated_at: newVisit.updated_at,
          },
        ]);

        if (newIssue) {
          await supabase.from('issues').insert([
            {
              id: newIssue.id,
              visit_id: newIssue.visit_id,
              patient_name: newIssue.patient_name,
              visit_number: newIssue.visit_number,
              ward_name: newIssue.ward_name,
              room_number: newIssue.room_number,
              visitor_name: newIssue.visitor_name,
              category: newIssue.category,
              description: newIssue.description,
              priority: newIssue.priority,
              status: newIssue.status,
              assigned_unit: newIssue.assigned_unit,
              assigned_to: newIssue.assigned_to,
              initial_action: newIssue.initial_action,
              due_at: newIssue.due_at,
              follow_up_logs: newIssue.follow_up_logs,
              created_at: newIssue.created_at,
              updated_at: newIssue.updated_at,
            },
          ]);
        }
      } catch (err) {
        console.warn('Supabase visit push error:', err);
      }
    }

    this.notify();
    return newVisit;
  }

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

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('issues')
          .update({
            status: newStatus,
            resolution_notes: updatedIssue.resolution_notes,
            resolved_at: updatedIssue.resolved_at,
            follow_up_logs: updatedIssue.follow_up_logs,
            updated_at: now,
          })
          .eq('id', issueId);
      } catch (err) {
        console.warn('Supabase follow-up sync error:', err);
      }
    }

    this.notify();
    return true;
  }

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

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('issues')
          .update({
            status: 'selesai',
            verified_by: updatedIssue.verified_by,
            verified_by_name: updatedIssue.verified_by_name,
            verified_at: updatedIssue.verified_at,
            resolution_notes: updatedIssue.resolution_notes,
            updated_at: now,
          })
          .eq('id', issueId);
      } catch (err) {
        console.warn('Supabase issue verify error:', err);
      }
    }

    this.notify();
    return true;
  }

  static async deleteVisit(visitId: string): Promise<boolean> {
    const visitIndex = this.visits.findIndex((v) => v.id === visitId);
    if (visitIndex === -1) return false;

    const visit = this.visits[visitIndex];

    this.issues = this.issues.filter((i) => i.visit_id !== visitId);
    this.saveIssues();

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

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('issues').delete().eq('visit_id', visitId);
        await supabase.from('visits').delete().eq('id', visitId);
      } catch (err) {
        console.warn('Supabase visit delete error:', err);
      }
    }

    this.notify();
    return true;
  }

  // --- Realtime Subscriptions & Cloud Sync ---
  private static setupRealtimeSubscription() {
    if (this.realtimeSubscribed || typeof window === 'undefined') return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      this.realtimeSubscribed = true;
      const channel = supabase
        .channel('sapa_live_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            // Background pull on remote change
            console.log('Realtime sync payload received from cloud:', payload.table);
            this.syncFromSupabase(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        this.realtimeSubscribed = false;
      };
    } catch (err) {
      console.warn('Realtime subscription notice:', err);
    }
  }

  // Pull all remote state from Supabase
  static async syncFromSupabase(isBackground = false): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase belum dikonfigurasi.' };
    }

    if (this.isSyncing) {
      return { success: true, message: 'Sinkronisasi sedang berlangsung...' };
    }

    this.isSyncing = true;
    try {
      // 1. Fetch app_settings (Hospital Profile, SLA, Categories)
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('*');

      if (!settingsError && settingsData && settingsData.length > 0) {
        for (const item of settingsData) {
          if (item.key === 'hospital_profile' && item.value) {
            this.hospitalProfile = { ...INITIAL_HOSPITAL_PROFILE, ...item.value };
            this.saveHospitalProfile();
          } else if (item.key === 'sla_settings' && Array.isArray(item.value)) {
            this.slaSettings = item.value;
            this.saveSlaSettings();
          } else if (item.key === 'issue_categories' && Array.isArray(item.value)) {
            this.issueCategories = item.value;
            this.saveIssueCategories();
          }
        }
      }

      // 2. Fetch wards
      const { data: wardsData, error: wardsError } = await supabase
        .from('wards')
        .select('*')
        .order('floor', { ascending: true });

      if (!wardsError && wardsData && wardsData.length > 0) {
        this.wards = wardsData;
        this.saveWards();
      }

      // 3. Fetch profiles (users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (!profilesError && profilesData && profilesData.length > 0) {
        this.users = profilesData;
        this.saveUsers();
        // Update currentUser if in list
        const activeInList = this.users.find((u) => u.id === this.currentUser.id);
        if (activeInList) {
          this.currentUser = activeInList;
        }
      }

      // 4. Fetch visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .order('visited_at', { ascending: false });

      if (!visitsError && visitsData && visitsData.length > 0) {
        this.visits = visitsData;
        this.saveVisits();
      }

      // 5. Fetch issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!issuesError && issuesData && issuesData.length > 0) {
        this.issues = issuesData;
        this.saveIssues();
      }

      // 6. Fetch audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!auditError && auditData && auditData.length > 0) {
        this.auditLogs = auditData;
        this.saveAudit();
      }

      // If remote database is completely empty (fresh project), auto-seed from local data!
      const isRemoteEmpty =
        (!wardsData || wardsData.length === 0) &&
        (!profilesData || profilesData.length === 0) &&
        (!settingsData || settingsData.length === 0);

      if (isRemoteEmpty && !isBackground) {
        console.log('Database Supabase kosong, melakukan auto-seeding data awal dari sistem...');
        await this.pushAllToSupabase();
      }

      this.isSyncing = false;
      this.notify();
      return {
        success: true,
        message: 'Data berhasil disinkronkan dengan database cloud Supabase.',
      };
    } catch (err: unknown) {
      this.isSyncing = false;
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Gagal sinkronisasi data cloud: ${msg}` };
    }
  }

  // Push all local state to Supabase
  static async pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Kredensial Supabase belum terhubung.' };
    }

    try {
      // 1. Push app_settings
      await supabase.from('app_settings').upsert([
        {
          key: 'hospital_profile',
          value: this.hospitalProfile,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'sla_settings',
          value: this.slaSettings,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'issue_categories',
          value: this.issueCategories,
          updated_at: new Date().toISOString(),
        },
      ]);

      // 2. Push wards
      if (this.wards.length > 0) {
        await supabase.from('wards').upsert(
          this.wards.map((w) => ({
            id: w.id,
            name: w.name,
            code: w.code,
            floor: w.floor,
            capacity: w.capacity,
            is_active: w.is_active,
            created_at: w.created_at,
            updated_at: w.updated_at,
          }))
        );
      }

      // 3. Push profiles
      if (this.users.length > 0) {
        await supabase.from('profiles').upsert(
          this.users.map((u) => ({
            id: u.id,
            full_name: u.full_name,
            role: u.role,
            department: u.department,
            phone: u.phone,
            email: u.email,
            avatar_url: u.avatar_url,
            is_active: u.is_active,
            created_at: u.created_at,
            updated_at: u.updated_at,
          }))
        );
      }

      // 4. Push visits
      if (this.visits.length > 0) {
        await supabase.from('visits').upsert(
          this.visits.map((v) => ({
            id: v.id,
            visit_number: v.visit_number,
            patient_name: v.patient_name,
            ward_id: v.ward_id,
            ward_name: v.ward_name,
            room_number: v.room_number,
            visited_at: v.visited_at,
            visitor_id: v.visitor_id,
            visitor_name: v.visitor_name,
            companion_name: v.companion_name,
            companion_relation: v.companion_relation,
            social_observation: v.social_observation,
            social_notes: v.social_notes,
            psychological_observation: v.psychological_observation,
            psychological_notes: v.psychological_notes,
            spiritual_observation: v.spiritual_observation,
            spiritual_notes: v.spiritual_notes,
            comfort_score: v.comfort_score,
            cleanliness_score: v.cleanliness_score,
            communication_score: v.communication_score,
            responsiveness_score: v.responsiveness_score,
            overall_satisfaction_score: v.overall_satisfaction_score,
            has_issue: v.has_issue,
            general_notes: v.general_notes,
            created_at: v.created_at,
            updated_at: v.updated_at,
          }))
        );
      }

      // 5. Push issues
      if (this.issues.length > 0) {
        await supabase.from('issues').upsert(
          this.issues.map((i) => ({
            id: i.id,
            visit_id: i.visit_id,
            patient_name: i.patient_name,
            visit_number: i.visit_number,
            ward_name: i.ward_name,
            room_number: i.room_number,
            visitor_name: i.visitor_name,
            category: i.category,
            description: i.description,
            priority: i.priority,
            status: i.status,
            assigned_unit: i.assigned_unit,
            assigned_to: i.assigned_to,
            initial_action: i.initial_action,
            due_at: i.due_at,
            resolved_at: i.resolved_at,
            resolution_notes: i.resolution_notes,
            verified_by: i.verified_by,
            verified_by_name: i.verified_by_name,
            verified_at: i.verified_at,
            follow_up_logs: i.follow_up_logs,
            created_at: i.created_at,
            updated_at: i.updated_at,
          }))
        );
      }

      this.addAuditLog({
        actor_id: this.currentUser.id,
        actor_name: this.currentUser.full_name,
        action: 'PUSH_ALL_TO_CLOUD',
        table_name: 'all',
        metadata: {
          wards_count: this.wards.length,
          visits_count: this.visits.length,
          issues_count: this.issues.length,
        },
      });

      return {
        success: true,
        message: 'Seluruh profil RS, data pengguna, master ruangan, dan kunjungan berhasil diunggah ke Supabase!',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Gagal mengunggah data ke Supabase: ${msg}` };
    }
  }

  // Export full JSON state
  static exportAllData(): string {
    const payload = {
      app: 'SAPA_PASIEN_RSUD_AL_MULK',
      version: 1,
      exported_at: new Date().toISOString(),
      hospitalProfile: this.hospitalProfile,
      users: this.users,
      wards: this.wards,
      slaSettings: this.slaSettings,
      issueCategories: this.issueCategories,
      visits: this.visits,
      issues: this.issues,
      auditLogs: this.auditLogs,
    };
    return JSON.stringify(payload, null, 2);
  }

  // Import full JSON state
  static async importAllData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Format berkas JSON tidak valid.' };
      }

      if (data.hospitalProfile) {
        this.hospitalProfile = { ...INITIAL_HOSPITAL_PROFILE, ...data.hospitalProfile };
        this.saveHospitalProfile();
      }
      if (Array.isArray(data.users) && data.users.length > 0) {
        this.users = data.users;
        this.saveUsers();
      }
      if (Array.isArray(data.wards) && data.wards.length > 0) {
        this.wards = data.wards;
        this.saveWards();
      }
      if (Array.isArray(data.slaSettings) && data.slaSettings.length > 0) {
        this.slaSettings = data.slaSettings;
        this.saveSlaSettings();
      }
      if (Array.isArray(data.issueCategories) && data.issueCategories.length > 0) {
        this.issueCategories = data.issueCategories;
        this.saveIssueCategories();
      }
      if (Array.isArray(data.visits)) {
        this.visits = data.visits;
        this.saveVisits();
      }
      if (Array.isArray(data.issues)) {
        this.issues = data.issues;
        this.saveIssues();
      }
      if (Array.isArray(data.auditLogs)) {
        this.auditLogs = data.auditLogs;
        this.saveAudit();
      }

      this.addAuditLog({
        actor_id: this.currentUser.id,
        actor_name: this.currentUser.full_name,
        action: 'IMPORT_ALL_DATA',
        table_name: 'system',
        metadata: { imported_at: new Date().toISOString() },
      });

      // If Supabase is connected, push imported state to cloud
      if (isSupabaseConfigured()) {
        await this.pushAllToSupabase();
      }

      this.notify();
      return {
        success: true,
        message: 'Seluruh konfigurasi profil, pengguna, ruangan, dan data kunjungan berhasil dipulihkan!',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Gagal membaca file JSON: ${msg}` };
    }
  }

  // Reset to initial demo data
  static resetToDefaults() {
    this.visits = [...INITIAL_VISITS];
    this.issues = [...INITIAL_ISSUES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.wards = [...INITIAL_WARDS];
    this.users = [...DEMO_ACCOUNTS];
    this.hospitalProfile = { ...INITIAL_HOSPITAL_PROFILE };
    this.slaSettings = [...INITIAL_SLA_SETTINGS];
    this.issueCategories = [...INITIAL_ISSUE_CATEGORIES];
    this.saveVisits();
    this.saveIssues();
    this.saveAudit();
    this.saveWards();
    this.saveUsers();
    this.saveHospitalProfile();
    this.saveSlaSettings();
    this.saveIssueCategories();
    this.notify();
  }
}

// Auto init in browser
if (typeof window !== 'undefined') {
  DataStore.init();
}
