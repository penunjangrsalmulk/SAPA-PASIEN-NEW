# SAPA PASIEN — RSUD Al-Mulk Kota Sukabumi

> **Sistem Monitoring Kunjungan dan Kepuasan Pasien Rawat Inap**  
> Aplikasi pelayanan rumah sakit yang berfokus pada pendokumentasian kunjungan humanis petugas, observasi komprehensif (sosiologis, psikologis, spiritual, kepuasan), eskalasi masalah hingga tuntas, dan analitik mutu pelayanan.

---

## 🏥 Tentang Aplikasi

**SAPA PASIEN** dibangun untuk Rumah Sakit Umum Daerah (RSUD) Al-Mulk Kota Sukabumi guna memastikan setiap pasien rawat inap mendapatkan pendampingan yang holistik dan empatik. Sistem ini menerapkan prinsip **Minimisasi Data Privasi** (tidak menyimpan data medis detail, diagnosis, atau NIK yang tidak relevan) serta penegakan kepatuhan waktu penanganan keluhan (*Service Level Agreement* / SLA).

---

## 🚀 Fitur Utama & Modul

1. **Modul 1 — Dashboard Dinamis**:
   - 8 Indikator Kinerja Utama (Total Kunjungan Hari Ini, Pasien Unik, Total Keluhan, Masalah Kritis/Tinggi Terbuka, Dalam Proses, Selesai, Rasio Penyelesaian, Rata-rata Skor Kepuasan).
   - Grafik interaktif Recharts: Tren Kunjungan Harian/Bulanan, Distribusi Masalah, Perbandingan Kunjungan per Ruangan, dan Status Tindak Lanjut.
   - Peringatan insiden melewati tenggat waktu (SLA Overdue) dan daftar kunjungan terbaru.

2. **Modul 2 — Input Kunjungan Pasien**:
   - **Bagian 1: Identitas & Kunjungan**: Tanggal & Waktu Kunjungan di posisi awal, Nama Pasien, Ruangan Rawat Inap, Pemilihan Nomor Kamar (angka 1–17), Petugas Pelapor otomatis, dan Pendamping Pasien.
   - **Bagian 2: Observasi Sosiologis**: Dukungan keluarga, komunikasi, atau kendala sosial.
   - **Bagian 3: Observasi Psikologis**: Pemantauan kecemasan, kenyamanan, atau kebutuhan dukungan lanjutan.
   - **Bagian 4: Observasi Spiritual**: Pemenuhan ibadah, pendampingan rohaniwan, dan doa bersama.
   - **Bagian 5: Kepuasan & Kenyamanan**: Penilaian objektif skala 1–5 untuk Kenyamanan, Kebersihan, Komunikasi, Respon Petugas, dan Pelayanan Keseluruhan.
   - **Bagian 6 & 7: Eskalasi Masalah & Tindak Lanjut Awal**: Kategori masalah, uraian, prioritas (Rendah, Sedang, Tinggi, Kritis), unit penanggung jawab (misal IPSRS, Keperawatan, Humas), target waktu (SLA), dan aksi awal.
   - Penomoran otomatis format standar: `VIS-YYYYMM-XXXX`.

3. **Modul 3 — Monitoring & Tindak Lanjut Pasien**:
   - Tabel monitoring realtime dengan filter multi-kriteria: Ruangan, Prioritas, Kategori, Status, dan Hanya Masalah Melewati SLA.
   - Pencarian cerdas (nama pasien, nomor registrasi, ruangan, kamar, atau keluhan).
   - Fitur Aksi lengkap:
     - 👁️ **Lihat Detail**: Lembar lengkap observasi multidimensi, skor kepuasan, dan jejak kronologis penanganan.
     - 💬 **Tindak Lanjut**: Pembaruan status penanganan oleh petugas/unit terkait.
     - 🛡️ **Verifikasi Mutu**: Verifikasi dan penutupan resmi masalah oleh Supervisor / Administrator.
     - 🗑️ **Hapus Data**: Penghapusan data kunjungan dengan modal konfirmasi keamanan dan pencatatan jejak audit (*audit trail*).
   - Ekspor data tabel ke format Excel (`.xlsx`).

4. **Modul 4 — Laporan & Analisis Mutu**:
   - **10 Indikator Kinerja Pelayanan Rumah Sakit**:
     1. Total Kunjungan
     2. Pasien Unik Dikunjungi
     3. Total Masalah / Keluhan
     4. Persentase Masalah Ditindaklanjuti
     5. Persentase Penyelesaian Tuntas
     6. Rata-rata Waktu Penyelesaian Masalah
     7. Masalah Melewati Target Waktu (SLA)
     8. Rata-rata Skor Kepuasan Pasien
     9. Distribusi Observasi Multidimensi (Sosiologis, Psikologis, Spiritual)
     10. Perbandingan Kunjungan Antar-Ruangan Rawat Inap
   - Pilihan periode: Harian, Mingguan, Bulanan, Triwulanan, dan Tahunan.
   - **Ekspor Dokumen**:
     - Unduh Excel (`.xlsx`) ringkasan indikator dan data rincian kunjungan.
     - Unduh PDF resmi (`.pdf`) lengkap dengan Kop Resmi Pemerintah Kota Sukabumi / RSUD Al-Mulk dan lembar tanda tangan pengesahan.

5. **Modul 5 — Pengaturan & Master Data**:
   - Profil resmi RSUD Al-Mulk Kota Sukabumi.
   - Master 7 Ruangan Rawat Inap:
     - **Ruang Fatimah**
     - **Ruang Aisyah**
     - **Ruang Usman**
     - **Ruang Khadijah**
     - **IGD**
     - **Rawat Jalan**
     - **ICU**
   - Standar Waktu Respons (SLA): Kritis (<1 jam), Tinggi (<6 jam), Sedang (<24 jam), Rendah (<48 jam).
   - Manajemen Peran Pengguna (*Role-Based Access Control* / RBAC): Administrator, Supervisor, Petugas, Pimpinan/Direksi.
   - Pusat Integrasi Supabase dan Penampil Log Jejak Audit (*System Audit Trail*).

---

## 🛠️ Teknologi & Dependensi

- **Frontend**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL dengan Row Level Security / RLS & Realtime)
- **Komponen & Visualisasi**:
  - [Lucide React](https://lucide.dev/) (Koleksi ikon UI)
  - [Recharts](https://recharts.org/) (Grafik analitik data)
- **Dokumentasi & Ekspor**:
  - [xlsx](https://www.npmjs.com/package/xlsx) (Ekspor spreadsheet Excel)
  - [jspdf](https://www.npmjs.com/package/jspdf) (Generasi laporan PDF ber-kop surat resmi)

---

## ⚙️ Cara Menjalankan Proyek di Lingkungan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/username/sapa-pasien.git
cd sapa-pasien
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env.local` atau `.env`:
```bash
cp .env.example .env
```
Isi kredensial Supabase Anda:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```
*(Catatan: Aplikasi memiliki mode penyimpanan lokal otomatis dengan data awal RSUD Al-Mulk, sehingga aplikasi tetap dapat berjalan penuh tanpa koneksi awal Supabase)*.

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat: [http://localhost:3000](http://localhost:3000)

### 5. Membangun untuk Produksi (*Production Build*)
```bash
npm run build
```
File siap saji (*production bundle*) akan dibuat di dalam direktori `dist/`.

---

## 🗄️ Sinkronisasi Data Dua Arah: Google AI Studio ↔ Vercel

Secara default, browser mengisolasi *localStorage* per domain (Google AI Studio `ais-dev-*.run.app` dan Vercel `*.vercel.app` terpisah). Agar perubahan profil rumah sakit, foto, pengguna, master ruangan, dan kunjungan di Google AI Studio langsung terhubung dan tampil di Vercel:

### Opsi A: Sinkronisasi Cloud Supabase Real-Time (Otomatis & Permanen)
1. **Jalankan Skrip SQL Migrasi**:
   Salin skrip di `supabase/migrations/001_initial_schema.sql` (atau klik tombol **Salin SQL Migrasi** di menu Pengaturan) dan jalankan pada menu **SQL Editor** di dashboard Supabase Anda.
2. **Koneksikan di Google AI Studio**:
   Buka menu **Pengaturan &gt; Sinkronisasi Cloud & Vercel**, masukkan `Project URL` dan `Anon Key` Supabase Anda, lalu klik **Uji & Simpan Koneksi** dan klik **Unggah Data Lokal ke Cloud (Push)**.
3. **Koneksikan di Vercel**:
   - Buka dashboard [Vercel](https://vercel.com) &gt; Pilih proyek &gt; **Settings** &gt; **Environment Variables**.
   - Tambahkan:
     - `VITE_SUPABASE_URL` = URL Supabase Anda
     - `VITE_SUPABASE_ANON_KEY` = Anon Key Supabase Anda
   - Lakukan **Redeploy** di Vercel.
   - *Alternatif tanpa redeploy:* Anda juga dapat membuka situs web Vercel Anda, masuk ke menu **Pengaturan &gt; Sinkronisasi Cloud**, lalu masukkan URL & Anon Key yang sama.
4. **Selesai**: Setiap ada penambahan/perubahan di Google AI Studio maupun Vercel, data akan langsung tersinkronisasi 100% dua arah secara real-time.

### Opsi B: Ekspor & Impor Cadangan Data JSON (Instan Tanpa Database)
1. Di Google AI Studio, buka **Pengaturan &gt; Sinkronisasi Cloud & Vercel** &gt; Klik **Unduh File Cadangan Data (.json)**.
2. Buka situs Vercel Anda, buka tab yang sama, lalu klik **Pilih & Impor File JSON ke Sini**.
3. Seluruh hasil editan langsung berpindah ke Vercel dalam 1 detik.

---

## 🌐 Panduan Deployment (Vercel)

Aplikasi ini telah dilengkapi file konfigurasi `vercel.json` untuk mendukung *Single Page Application* (SPA) routing:

1. Buat repositori baru di GitHub dan lakukan `git push`.
2. Buka dashboard [Vercel](https://vercel.com) dan impor repositori.
3. Framework Preset: **Vite**.
4. Tambahkan *Environment Variables* (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
5. Klik **Deploy**.

---

## 📄 Lisensi

Dikembangkan untuk kebutuhan pelayanan publik **RSUD Al-Mulk Kota Sukabumi**.  
Hak Cipta © 2026 RSUD Al-Mulk Kota Sukabumi.
