import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building,
  HeartHandshake,
  Clock,
  Printer,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Visit, Issue, Ward, UserProfile } from '../../types';
import { DataStore } from '../../lib/dataStore';

export const ReportsModule: React.FC = () => {
  const currentUser: UserProfile = useMemo(() => DataStore.getCurrentUser(), []);
  const wards: Ward[] = useMemo(() => DataStore.getWards(), []);

  const [visits, setVisits] = useState<Visit[]>(DataStore.getVisits());
  const [issues, setIssues] = useState<Issue[]>(DataStore.getIssues());

  // Report Type & Filters
  const [reportType, setReportType] = useState<
    'harian' | 'mingguan' | 'bulanan' | 'triwulanan' | 'tahunan' | 'ruangan' | 'keluhan' | 'kepuasan'
  >('bulanan');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setVisits(DataStore.getVisits());
      setIssues(DataStore.getIssues());
    });
    return () => unsub();
  }, []);

  // Filter logic based on reportType
  const filteredVisits = useMemo(() => {
    const now = new Date();
    return visits.filter((v) => {
      const vDate = new Date(v.visited_at);

      if (reportType === 'harian') {
        const isToday =
          vDate.getDate() === now.getDate() &&
          vDate.getMonth() === now.getMonth() &&
          vDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (reportType === 'mingguan') {
        const diffDays = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else if (reportType === 'bulanan') {
        const diffDays = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      } else if (reportType === 'triwulanan') {
        const diffDays = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 90) return false;
      } else if (reportType === 'tahunan') {
        const diffDays = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 365) return false;
      }

      if (selectedWard !== 'all' && v.ward_id !== selectedWard) return false;

      return true;
    });
  }, [visits, reportType, selectedWard]);

  const filteredIssues = useMemo(() => {
    const visitIds = new Set(filteredVisits.map((v) => v.id));
    return issues.filter((i) => {
      if (!visitIds.has(i.visit_id)) return false;
      if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
      return true;
    });
  }, [issues, filteredVisits, selectedCategory]);

  // 10 Indicators Computation:
  // 1. Jumlah kunjungan
  const totalVisits = filteredVisits.length;

  // 2. Jumlah pasien unik yang dikunjungi
  const uniquePatients = useMemo(() => {
    const set = new Set(filteredVisits.map((v) => v.patient_name.trim().toLowerCase()));
    return set.size;
  }, [filteredVisits]);

  // 3. Jumlah masalah yang ditemukan
  const totalIssues = filteredIssues.length;

  // 4. Persentase masalah yang ditindaklanjuti
  const followedUpCount = useMemo(() => {
    return filteredIssues.filter((i) => i.status !== 'belum_ditindaklanjuti').length;
  }, [filteredIssues]);

  const followUpRateStr = useMemo(() => {
    if (totalIssues === 0) return 'Tidak ada data';
    return `${Math.round((followedUpCount / totalIssues) * 100)}%`;
  }, [followedUpCount, totalIssues]);

  // 5. Persentase tindak lanjut selesai
  const resolvedCount = useMemo(() => {
    return filteredIssues.filter((i) => i.status === 'selesai').length;
  }, [filteredIssues]);

  const resolutionRateStr = useMemo(() => {
    if (totalIssues === 0) return 'Tidak ada data';
    return `${Math.round((resolvedCount / totalIssues) * 100)}%`;
  }, [resolvedCount, totalIssues]);

  // 6. Rata-rata waktu penyelesaian masalah (hours)
  const averageResolutionHours = useMemo(() => {
    const resolvedWithTimes = filteredIssues.filter(
      (i) => i.status === 'selesai' && i.resolved_at && i.created_at
    );
    if (resolvedWithTimes.length === 0) return 'Tidak ada data';

    let totalMs = 0;
    resolvedWithTimes.forEach((i) => {
      const created = new Date(i.created_at).getTime();
      const resolved = new Date(i.resolved_at!).getTime();
      totalMs += Math.max(0, resolved - created);
    });

    const avgHours = (totalMs / resolvedWithTimes.length / (1000 * 60 * 60)).toFixed(1);
    return `${avgHours} Jam`;
  }, [filteredIssues]);

  // 7. Jumlah masalah yang melewati tenggat
  const overdueCount = useMemo(() => {
    const nowTime = new Date().getTime();
    return filteredIssues.filter(
      (i) => i.status !== 'selesai' && i.due_at && new Date(i.due_at).getTime() < nowTime
    ).length;
  }, [filteredIssues]);

  // 8. Rata-rata skor kepuasan berdasarkan respons valid
  const avgSatisfaction = useMemo(() => {
    let sum = 0;
    let count = 0;
    filteredVisits.forEach((v) => {
      [
        v.comfort_score,
        v.cleanliness_score,
        v.communication_score,
        v.responsiveness_score,
        v.overall_satisfaction_score,
      ].forEach((s) => {
        if (s !== null && s !== undefined && s > 0) {
          sum += s;
          count++;
        }
      });
    });

    if (count === 0) return 'Tidak ada data';
    return `${(sum / count).toFixed(2)} / 5.0`;
  }, [filteredVisits]);

  // 9. Distribusi observasi sosiologis, psikologis, dan spiritual
  const observationDist = useMemo(() => {
    const socialMap: Record<string, number> = {};
    const psychoMap: Record<string, number> = {};
    const spiritMap: Record<string, number> = {};

    filteredVisits.forEach((v) => {
      socialMap[v.social_observation] = (socialMap[v.social_observation] || 0) + 1;
      psychoMap[v.psychological_observation] =
        (psychoMap[v.psychological_observation] || 0) + 1;
      spiritMap[v.spiritual_observation] = (spiritMap[v.spiritual_observation] || 0) + 1;
    });

    return { socialMap, psychoMap, spiritMap };
  }, [filteredVisits]);

  // 10. Perbandingan jumlah kunjungan antar-ruangan
  const wardComparison = useMemo(() => {
    return wards.map((w) => {
      const wardVisits = filteredVisits.filter((v) => v.ward_id === w.id);
      const wardIssues = filteredIssues.filter((i) => i.ward_name?.includes(w.code) || false);
      return {
        ward: w.name,
        visitsCount: wardVisits.length,
        capacity: w.capacity,
      };
    });
  }, [wards, filteredVisits, filteredIssues]);

  // EXPORT TO EXCEL
  const handleExportExcel = () => {
    const summaryData = [
      ['LAPORAN ANALISIS PELAYANAN & KEPUASAN PASIEN RAWAT INAP'],
      ['RUMAH SAKIT UMUM DAERAH (RSUD) AL-MULK KOTA SUKABUMI'],
      [`Periode: ${reportType.toUpperCase()} | Dicetak: ${new Date().toLocaleString('id-ID')}`],
      [''],
      ['10 INDIKATOR KINERJA PELAYANAN UTAMA'],
      ['Indikator', 'Nilai'],
      ['1. Total Kunjungan Sapa Pasien', totalVisits],
      ['2. Total Pasien Unik Dikunjungi', uniquePatients],
      ['3. Total Masalah/Keluhan Teridentifikasi', totalIssues],
      ['4. Persentase Masalah Ditindaklanjuti', followUpRateStr],
      ['5. Persentase Penyelesaian Tuntas', resolutionRateStr],
      ['6. Rata-rata Waktu Penyelesaian Masalah', averageResolutionHours],
      ['7. Masalah Melewati Target Waktu (SLA)', overdueCount],
      ['8. Rata-rata Skor Kepuasan Pasien', avgSatisfaction],
      [''],
      ['DATA DETAIL KUNJUNGAN'],
      [
        'No Kunjungan',
        'Nama Pasien',
        'Ruangan',
        'Nomor Kamar',
        'Waktu',
        'Petugas Sapa',
        'Kepuasan Keseluruhan',
        'Ada Masalah',
      ],
      ...filteredVisits.map((v) => [
        v.visit_number,
        currentUser.role === 'pimpinan' ? v.patient_name.split(' ')[0] + ' ***' : v.patient_name,
        v.ward_name,
        v.room_number,
        new Date(v.visited_at).toLocaleDateString('id-ID'),
        v.visitor_name,
        v.overall_satisfaction_score || 'Belum dinilai',
        v.has_issue ? 'Ya' : 'Tidak',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan SAPA PASIEN');
    XLSX.writeFile(
      wb,
      `Laporan_SAPA_PASIEN_RSUD_Al_Mulk_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // EXPORT TO PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // RSUD Al-Mulk Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PEMERINTAH KOTA SUKABUMI', 105, 18, { align: 'center' });
    doc.setFontSize(16);
    doc.text('RUMAH SAKIT UMUM DAERAH AL-MULK', 105, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      'Jl. Pelabuhan II KM. 6, Kel. Cikondang, Kec. Citamiang, Kota Sukabumi | Telp. (0266) 625-1000',
      105,
      31,
      { align: 'center' }
    );
    doc.setLineWidth(0.8);
    doc.line(15, 34, 195, 34);
    doc.setLineWidth(0.2);
    doc.line(15, 35, 195, 35);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('LAPORAN EVALUASI & MONITORING SAPA PASIEN RAWAT INAP', 105, 43, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Jenis Laporan: ${reportType.toUpperCase()} | Ruangan: ${selectedWard === 'all' ? 'Semua Ruangan' : selectedWard} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`,
      105,
      48,
      { align: 'center' }
    );

    // Summary Indicators Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('I. INDIKATOR PELAYANAN UTAMA', 15, 58);

    const kpiRows = [
      ['Total Kunjungan Pasien', `${totalVisits} Kunjungan`],
      ['Total Pasien Unik Dikunjungi', `${uniquePatients} Pasien`],
      ['Total Keluhan Teridentifikasi', `${totalIssues} Keluhan`],
      ['Persentase Masalah Ditindaklanjuti', `${followUpRateStr}`],
      ['Persentase Penyelesaian Tuntas', `${resolutionRateStr}`],
      ['Rata-rata Waktu Penyelesaian', `${averageResolutionHours}`],
      ['Masalah Melewati Target Waktu (SLA)', `${overdueCount} Masalah`],
      ['Rata-rata Skor Kepuasan Pasien', `${avgSatisfaction}`],
    ];

    let startY = 64;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    kpiRows.forEach(([label, val]) => {
      doc.text(label, 20, startY);
      doc.text(String(val), 140, startY);
      doc.setDrawColor(230, 230, 230);
      doc.line(20, startY + 1.5, 190, startY + 1.5);
      startY += 6;
    });

    // Sample Records
    startY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('II. RINGKASAN REKAP KUNJUNGAN PASIEN TERAKHIR', 15, startY);

    startY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('No Reg', 15, startY);
    doc.text('Nama Pasien', 55, startY);
    doc.text('Ruangan & Kamar', 105, startY);
    doc.text('Kepuasan', 155, startY);
    doc.text('Status Masalah', 175, startY);
    doc.line(15, startY + 1.5, 195, startY + 1.5);

    doc.setFont('helvetica', 'normal');
    filteredVisits.slice(0, 8).forEach((v) => {
      startY += 5.5;
      doc.text(v.visit_number, 15, startY);
      doc.text(
        currentUser.role === 'pimpinan' ? v.patient_name.split(' ')[0] + ' ***' : v.patient_name,
        55,
        startY
      );
      doc.text(
        `${v.ward_name ? v.ward_name.slice(0, 16) : '-'} (${v.room_number})`,
        105,
        startY
      );
      doc.text(v.overall_satisfaction_score ? `${v.overall_satisfaction_score}/5` : '-', 155, startY);
      doc.text(v.has_issue ? 'Ada Catatan' : 'Optimal', 175, startY);
    });

    // Signature Block
    const signY = 240;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Kota Sukabumi, ' + new Date().toLocaleDateString('id-ID'), 140, signY);
    doc.text('Mengetahui / Penanggung Jawab Mutu,', 140, signY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('RSUD Al-Mulk Kota Sukabumi', 140, signY + 25);
    doc.setFont('helvetica', 'normal');
    doc.text('NIP. 19780512 200501 1 008', 140, signY + 30);

    doc.save(
      `Laporan_SAPA_PASIEN_RSUD_Al_Mulk_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>RSUD Al-Mulk</span>
            <span aria-hidden="true">·</span>
            <span>Modul Analisis & Pelaporan Mutu</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Analisis Pelayanan Kunjungan & Kepuasan Pasien
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan 10 indikator kinerja pelayanan sapa pasien, analisis observasi multidimensi, dan ekspor dokumen resmi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Pilih Jenis & Periode Laporan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            {[
              { id: 'harian', label: 'Harian' },
              { id: 'mingguan', label: 'Mingguan' },
              { id: 'bulanan', label: 'Bulanan' },
              { id: 'triwulanan', label: 'Triwulanan' },
              { id: 'tahunan', label: 'Tahunan' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setReportType(p.id as any)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  reportType === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Ward filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">Semua Ruangan</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 10 Indikator Utama Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Indikator 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">1. Total Kunjungan</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalVisits}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Seluruh kunjungan tercatat</div>
        </div>

        {/* Indikator 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">2. Pasien Unik Dikunjungi</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {uniquePatients}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dihitung per nama pasien unik</div>
        </div>

        {/* Indikator 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">3. Masalah / Keluhan</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalIssues}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total insiden teridentifikasi</div>
        </div>

        {/* Indikator 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">4. Masalah Ditindaklanjuti</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            {followUpRateStr}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {followedUpCount} dari {totalIssues} keluhan
          </div>
        </div>

        {/* Indikator 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">5. Tindak Lanjut Selesai</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {resolutionRateStr}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {resolvedCount} masalah tuntas
          </div>
        </div>

        {/* Indikator 6 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">6. Rata-rata Waktu Selesai</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {averageResolutionHours}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sejak pelaporan hingga selesai</div>
        </div>

        {/* Indikator 7 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">7. Melewati Target (SLA)</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              overdueCount > 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {overdueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Memerlukan intervensi segera</div>
        </div>

        {/* Indikator 8 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-400 text-xs mb-1">8. Rata-rata Kepuasan</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {avgSatisfaction}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Skala 1.0 s/d 5.0 respons valid</div>
        </div>
      </div>

      {/* Indikator 9: Distribusi Observasi Multidimensi */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            9. Distribusi Observasi Sosiologis, Psikologis, dan Spiritual
          </h3>
          <p className="text-xs text-slate-500">
            Pemetaan proporsi observasi kebutuhan pasien rawat inap RSUD Al-Mulk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Sosiologis */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-blue-900 mb-2 border-b border-slate-200 pb-1">
              Faktor Sosiologis & Keluarga
            </h4>
            <div className="space-y-1.5">
              {Object.entries(observationDist.socialMap).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-700 truncate pr-2">{key}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Psikologis */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-teal-900 mb-2 border-b border-slate-200 pb-1">
              Kondisi Psikologis & Emosional
            </h4>
            <div className="space-y-1.5">
              {Object.entries(observationDist.psychoMap).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-700 truncate pr-2">{key}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spiritual */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-emerald-900 mb-2 border-b border-slate-200 pb-1">
              Kebutuhan Fasilitasi Spiritual
            </h4>
            <div className="space-y-1.5">
              {Object.entries(observationDist.spiritMap).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-700 truncate pr-2">{key}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indikator 10: Perbandingan Antar Ruangan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            10. Perbandingan Jumlah Kunjungan Antar-Ruangan
          </h3>
          <p className="text-xs text-slate-500">
            Cakupan kunjungan sapa pasien di masing-masing bangsal perawatan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Nama Ruangan Rawat Inap</th>
                <th className="py-2.5 px-3">Kapasitas Tempat Tidur</th>
                <th className="py-2.5 px-3">Jumlah Kunjungan</th>
                <th className="py-2.5 px-3">Rasio Cakupan Kunjungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardComparison.map((wc, idx) => {
                const ratio = Math.min(100, Math.round((wc.visitsCount / wc.capacity) * 100));
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{wc.ward}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {wc.capacity} Bed
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-blue-700">
                      {wc.visitsCount}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-500">{ratio}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
