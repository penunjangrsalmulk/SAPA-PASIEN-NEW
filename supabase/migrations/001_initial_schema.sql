-- ====================================================================
-- SAPA PASIEN — RSUD AL-MULK KOTA SUKABUMI
-- Universal Cloud Database Schema & Realtime Setup (001_universal_schema.sql)
-- Mendukung Sinkronisasi Dua Arah Real-time antara Google AI Studio & Vercel
-- ====================================================================

-- 1. TABEL PENGATURAN APLIKASI & PROFIL RUMAH SAKIT (app_settings)
-- Menyimpan Profil RSUD Al-Mulk (nama, foto/logo, alamat, kontak), Master SLA, dan Kategori
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL PENGGUNA & HAK AKSES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'supervisor', 'petugas', 'pimpinan')),
  department TEXT DEFAULT 'RSUD Al-Mulk',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL MASTER RUANGAN RAWAT INAP (wards)
CREATE TABLE IF NOT EXISTS public.wards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 17,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL DOKUMENTASI KUNJUNGAN (visits)
CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY,
  visit_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  ward_id TEXT NOT NULL,
  ward_name TEXT,
  room_number TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  companion_name TEXT,
  companion_relation TEXT,
  social_observation TEXT NOT NULL,
  social_notes TEXT,
  psychological_observation TEXT NOT NULL,
  psychological_notes TEXT,
  spiritual_observation TEXT NOT NULL,
  spiritual_notes TEXT,
  comfort_score INTEGER CHECK (comfort_score IS NULL OR (comfort_score >= 1 AND comfort_score <= 5)),
  cleanliness_score INTEGER CHECK (cleanliness_score IS NULL OR (cleanliness_score >= 1 AND cleanliness_score <= 5)),
  communication_score INTEGER CHECK (communication_score IS NULL OR (communication_score >= 1 AND communication_score <= 5)),
  responsiveness_score INTEGER CHECK (responsiveness_score IS NULL OR (responsiveness_score >= 1 AND responsiveness_score <= 5)),
  overall_satisfaction_score INTEGER CHECK (overall_satisfaction_score IS NULL OR (overall_satisfaction_score >= 1 AND overall_satisfaction_score <= 5)),
  has_issue BOOLEAN NOT NULL DEFAULT false,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL KELUHAN & MASALAH PASIEN (issues)
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  patient_name TEXT,
  visit_number TEXT,
  ward_name TEXT,
  room_number TEXT,
  visitor_name TEXT,
  category TEXT NOT NULL,
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
  verified_by TEXT,
  verified_by_name TEXT,
  verified_at TIMESTAMPTZ,
  follow_up_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL JEJAK AUDIT SISTEM (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INDEKS KINERJA QUERY
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON public.visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_ward_id ON public.visits (ward_id);
CREATE INDEX IF NOT EXISTS idx_issues_visit_id ON public.issues (visit_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);

-- 8. KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)
-- Diaktifkan dengan hak akses publik (anon key) agar sinkronisasi antara AI Studio & Vercel berjalan lancar
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Buat policy bebas hambatan untuk public anon key & authenticated
DROP POLICY IF EXISTS "Settings universal access" ON public.app_settings;
CREATE POLICY "Settings universal access" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles universal access" ON public.profiles;
CREATE POLICY "Profiles universal access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Wards universal access" ON public.wards;
CREATE POLICY "Wards universal access" ON public.wards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Visits universal access" ON public.visits;
CREATE POLICY "Visits universal access" ON public.visits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Issues universal access" ON public.issues;
CREATE POLICY "Issues universal access" ON public.issues FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Audit logs universal access" ON public.audit_logs;
CREATE POLICY "Audit logs universal access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 9. AKTIFKAN REALTIME PUBLICATION UNTUK SINKRONISASI OTOMATIS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wards;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already in publication, ignore
    NULL;
END $$;

-- 10. DATA BAWAAN AWAL RSUD AL-MULK
INSERT INTO public.wards (id, name, code, floor, capacity) VALUES
  ('ward-01', 'Ruang Fatimah', 'FATIMAH', 1, 17),
  ('ward-02', 'Ruang Aisyah', 'AISYAH', 1, 17),
  ('ward-03', 'Ruang Usman', 'USMAN', 2, 17),
  ('ward-04', 'Ruang Khadijah', 'KHADIJAH', 2, 17),
  ('ward-05', 'IGD', 'IGD', 1, 17),
  ('ward-06', 'Rawat Jalan', 'RAWAT_JALAN', 1, 17),
  ('ward-07', 'ICU', 'ICU', 1, 17)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, department, phone, email, is_active) VALUES
  ('usr-admin-01', 'Dr. H. Ahmad Fauzi, Sp.PK', 'administrator', 'Manajemen Mutu & SIMRS', '0812-3456-7890', 'admin@rsudalmulk.id', true),
  ('usr-super-01', 'Ns. Siti Nurhaliza, S.Kep', 'supervisor', 'Supervisi Keperawatan & Pelayanan', '0813-9876-5432', 'supervisor@rsudalmulk.id', true),
  ('usr-staff-01', 'Budi Santoso, Amd.Kep', 'petugas', 'Tim Sapa Pasien Rawat Inap', '0815-1122-3344', 'petugas@rsudalmulk.id', true),
  ('usr-exec-01', 'dr. Hj. Endang Sulastri, MARS', 'pimpinan', 'Direksi RSUD Al-Mulk Kota Sukabumi', '0811-5566-7788', 'direksi@rsudalmulk.id', true)
ON CONFLICT (id) DO NOTHING;
