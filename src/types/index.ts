export type UserRole = 'administrator' | 'supervisor' | 'petugas' | 'pimpinan';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HospitalProfile {
  name: string;
  classification: string;
  address: string;
  phone: string;
  email?: string;
  operational_status: string;
  vision: string;
  logo_url: string;
  updated_at?: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  floor: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlaSetting {
  priority: IssuePriority;
  label: string;
  max_hours: number;
  description: string;
  color_badge: string;
}

export interface IssueCategorySetting {
  id: string;
  key: string;
  name: string;
  description: string;
  default_unit?: string;
  is_active: boolean;
}

export type SocialObservationKey =
  | 'dukungan_baik'
  | 'dukungan_perhatian'
  | 'kendala_komunikasi'
  | 'kendala_sosial'
  | 'tidak_ada_masalah'
  | 'lainnya';

export type PsychologicalObservationKey =
  | 'emosional_baik'
  | 'tampak_cemas'
  | 'kekhawatiran'
  | 'ketidaknyamanan'
  | 'perhatian_lanjutan'
  | 'tidak_ada_masalah'
  | 'lainnya';

export type SpiritualObservationKey =
  | 'terpenuhi'
  | 'dukungan_spiritual'
  | 'fasilitasi_ibadah'
  | 'pendampingan_rohani'
  | 'tidak_ada_khusus'
  | 'lainnya';

export type IssueCategory =
  | 'pelayanan'
  | 'fasilitas'
  | 'kebersihan'
  | 'komunikasi'
  | 'kenyamanan'
  | 'dukungan_sosial'
  | 'dukungan_psikologis'
  | 'dukungan_spiritual'
  | 'lainnya';

export type IssuePriority = 'rendah' | 'sedang' | 'tinggi' | 'kritis';

export type IssueStatus =
  | 'belum_ditindaklanjuti'
  | 'dalam_proses'
  | 'menunggu_konfirmasi'
  | 'selesai'
  | 'diteruskan';

export interface Visit {
  id: string;
  visit_number: string;
  patient_name: string;
  ward_id: string;
  ward_name?: string;
  room_number: string;
  visited_at: string;
  visitor_id: string;
  visitor_name?: string;
  companion_name?: string;
  companion_relation?: string;
  
  social_observation: string;
  social_notes?: string;
  
  psychological_observation: string;
  psychological_notes?: string;
  
  spiritual_observation: string;
  spiritual_notes?: string;
  
  comfort_score: number | null;
  cleanliness_score: number | null;
  communication_score: number | null;
  responsiveness_score: number | null;
  overall_satisfaction_score: number | null;
  
  has_issue: boolean;
  general_notes?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  issues?: Issue[];
}

export interface Issue {
  id: string;
  visit_id: string;
  category: IssueCategory;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  assigned_unit?: string;
  assigned_to?: string;
  initial_action?: string;
  due_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  verified_by?: string;
  verified_by_name?: string;
  verified_at?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Joins
  patient_name?: string;
  visit_number?: string;
  ward_name?: string;
  room_number?: string;
  visitor_name?: string;
  follow_up_logs?: FollowUpLog[];
}

export interface FollowUpLog {
  id: string;
  issue_id: string;
  action_description: string;
  status_after_action: IssueStatus;
  actor_id: string;
  actor_name?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name: string;
  action: string;
  table_name: string;
  record_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  todayVisitsCount: number;
  uniquePatientsCount: number;
  totalIssuesCount: number;
  highPriorityOpenIssuesCount: number;
  inProgressIssuesCount: number;
  resolvedIssuesCount: number;
  resolutionRatePercent: number | null;
  averageSatisfactionScore: number | null;
}
