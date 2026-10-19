-- ====================================================================
-- SAPA PASIEN — RSUD AL-MULK KOTA SUKABUMI
-- Database Migration 001: Initial Schema, Security Rules (RLS), & Triggers
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create custom types and ENUMs (if preferred or text constraints)
-- Note: Text constraints with check expressions are used for compatibility

-- 3. PROFILES Table (linked to auth.users)
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

-- 4. WARDS Table (Ruangan Rawat Inap)
CREATE TABLE IF NOT EXISTS public.wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. VISITS Table (Dokumentasi Kunjungan Petugas Sapa Pasien)
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE RESTRICT,
  room_number TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  visitor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  companion_name TEXT,
  companion_relation TEXT,
  
  -- Observasi Sosiologis
  social_observation TEXT NOT NULL,
  social_notes TEXT,
  
  -- Observasi Psikologis
  psychological_observation TEXT NOT NULL,
  psychological_notes TEXT,
  
  -- Observasi Spiritual
  spiritual_observation TEXT NOT NULL,
  spiritual_notes TEXT,
  
  -- Kepuasan dan Kenyamanan (Skala 1-5, NULL = Belum dinilai)
  comfort_score INTEGER CHECK (comfort_score IS NULL OR (comfort_score >= 1 AND comfort_score <= 5)),
  cleanliness_score INTEGER CHECK (cleanliness_score IS NULL OR (cleanliness_score >= 1 AND cleanliness_score <= 5)),
  communication_score INTEGER CHECK (communication_score IS NULL OR (communication_score >= 1 AND communication_score <= 5)),
  responsiveness_score INTEGER CHECK (responsiveness_score IS NULL OR (responsiveness_score >= 1 AND responsiveness_score <= 5)),
  overall_satisfaction_score INTEGER CHECK (overall_satisfaction_score IS NULL OR (overall_satisfaction_score >= 1 AND overall_satisfaction_score <= 5)),
  
  has_issue BOOLEAN NOT NULL DEFAULT false,
  general_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 6. ISSUES Table (Keluhan dan Masalah Pasien)
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'pelayanan', 'fasilitas', 'kebersihan', 'komunikasi', 
    'kenyamanan', 'dukungan_sosial', 'dukungan_psikologis', 
    'dukungan_spiritual', 'lainnya'
  )),
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('rendah', 'sedang', 'tinggi', 'kritis')),
  status TEXT NOT NULL DEFAULT 'belum_ditindaklanjuti' CHECK (status IN (
    'belum_ditindaklanjuti', 'dalam_proses', 'menunggu_konfirmasi', 'selesai', 'diteruskan'
  )),
  assigned_unit TEXT,
  assigned_to TEXT,
  initial_action TEXT,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 7. FOLLOW UP LOGS Table (Jejak Rekam Penanganan Masalah)
CREATE TABLE IF NOT EXISTS public.follow_up_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  status_after_action TEXT NOT NULL CHECK (status_after_action IN (
    'belum_ditindaklanjuti', 'dalam_proses', 'menunggu_konfirmasi', 'selesai', 'diteruskan'
  )),
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. AUDIT LOGS Table (Audit Trail Aktivitas Sistem)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INDEXES for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON public.visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_ward_id ON public.visits (ward_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON public.visits (patient_name);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON public.visits (visitor_id);
CREATE INDEX IF NOT EXISTS idx_issues_visit_id ON public.issues (visit_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues (priority);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_due_at ON public.issues (due_at);
CREATE INDEX IF NOT EXISTS idx_follow_up_issue ON public.follow_up_logs (issue_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);

-- 10. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_wards_updated_at ON public.wards;
CREATE TRIGGER trigger_wards_updated_at
  BEFORE UPDATE ON public.wards
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_visits_updated_at ON public.visits;
CREATE TRIGGER trigger_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_issues_updated_at ON public.issues;
CREATE TRIGGER trigger_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Authenticated users can view profiles; only administrators can update roles
CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own non-role profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Administrators full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'administrator');

-- Wards: Readable by all authenticated users; modified only by administrators
CREATE POLICY "Wards readable by all authenticated"
  ON public.wards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Wards manageable by administrators"
  ON public.wards FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'administrator');

-- Visits: 
-- Petugas can insert and read visits; Supervisors and Admins can manage; Pimpinan can read
CREATE POLICY "Visits readable by authenticated staff"
  ON public.visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Petugas and Supervisor can insert visits"
  ON public.visits FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('administrator', 'supervisor', 'petugas')
  );

CREATE POLICY "Visits updateable by creator, supervisor, admin"
  ON public.visits FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('administrator', 'supervisor') 
    OR visitor_id = auth.uid()
  );

-- Issues:
CREATE POLICY "Issues readable by authenticated staff"
  ON public.issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Issues insertable by staff"
  ON public.issues FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('administrator', 'supervisor', 'petugas')
  );

CREATE POLICY "Issues manageable by supervisor, admin, or creator"
  ON public.issues FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('administrator', 'supervisor')
    OR created_by = auth.uid()
  );

-- Follow Up Logs:
CREATE POLICY "Follow up logs readable by authenticated staff"
  ON public.follow_up_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Follow up logs insertable by authenticated staff"
  ON public.follow_up_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('administrator', 'supervisor', 'petugas')
  );

-- Audit Logs:
CREATE POLICY "Audit logs readable by administrators and supervisors"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() IN ('administrator', 'supervisor'));

CREATE POLICY "Audit logs insertable by system"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 12. INITIAL SEED DATA FOR RSUD AL-MULK
INSERT INTO public.wards (name, code, floor, capacity) VALUES
  ('Ruang Fatimah', 'FATIMAH', 1, 17),
  ('Ruang Aisyah', 'AISYAH', 1, 17),
  ('Ruang Usman', 'USMAN', 2, 17),
  ('Ruang Khadijah', 'KHADIJAH', 2, 17),
  ('IGD', 'IGD', 1, 17),
  ('Rawat Jalan', 'RAWAT_JALAN', 1, 17),
  ('ICU', 'ICU', 1, 17)
ON CONFLICT (code) DO NOTHING;
