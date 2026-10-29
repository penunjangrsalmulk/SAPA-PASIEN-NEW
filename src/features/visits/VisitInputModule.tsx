import React, { useState, useMemo } from 'react';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Building,
  Heart,
  Smile,
  Shield,
  Star,
  Clock,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import {
  Visit,
  Issue,
  Ward,
  UserProfile,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from '../../types';
import { DataStore } from '../../lib/dataStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Wifi, WifiOff } from 'lucide-react';

interface VisitInputModuleProps {
  onSuccessNavigate: (tab: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const VisitInputModule: React.FC<VisitInputModuleProps> = ({
  onSuccessNavigate,
  onOpenSupabaseModal,
}) => {
  const currentUser: UserProfile = useMemo(() => DataStore.getCurrentUser(), []);
  const wards: Ward[] = useMemo(() => DataStore.getWards(), []);

  // Form State - Section 1: Tanggal Kunjungan & Identitas Pasien
  const [visitedAt, setVisitedAt] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [patientName, setPatientName] = useState('');
  const [wardId, setWardId] = useState(wards[0]?.id || '');
  const [roomNumber, setRoomNumber] = useState('1');
  const [companionName, setCompanionName] = useState('');
  const [companionRelation, setCompanionRelation] = useState('');

  // Form State - Section 2: Observasi Sosiologis
  const [socialObservation, setSocialObservation] = useState('Dukungan keluarga baik');
  const [socialNotes, setSocialNotes] = useState('');

  // Form State - Section 3: Observasi Psikologis
  const [psychologicalObservation, setPsychologicalObservation] = useState(
    'Kondisi emosional tampak baik'
  );
  const [psychologicalNotes, setPsychologicalNotes] = useState('');

  // Form State - Section 4: Observasi Spiritual
  const [spiritualObservation, setSpiritualObservation] = useState('Kebutuhan spiritual terpenuhi');
  const [spiritualNotes, setSpiritualNotes] = useState('');

  // Form State - Section 5: Kepuasan & Kenyamanan (1-5, null for unrated)
  const [comfortScore, setComfortScore] = useState<number | null>(null);
  const [cleanlinessScore, setCleanlinessScore] = useState<number | null>(null);
  const [communicationScore, setCommunicationScore] = useState<number | null>(null);
  const [responsivenessScore, setResponsivenessScore] = useState<number | null>(null);
  const [overallSatisfactionScore, setOverallSatisfactionScore] = useState<number | null>(null);

  // Screening questions
  const [hasComplaint, setHasComplaint] = useState(false);
  const [hasUnmetNeeds, setHasUnmetNeeds] = useState(false);
  const [needsFollowUp, setNeedsFollowUp] = useState(false);

  // Form State - Section 6 & 7: Keluhan & Masalah (conditional)
  const [hasIssue, setHasIssue] = useState(false);
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('pelayanan');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePriority, setIssuePriority] = useState<IssuePriority>('sedang');
  const [assignedUnit, setAssignedUnit] = useState('Keperawatan / Kepala Ruangan');
  const [assignedTo, setAssignedTo] = useState('');
  const [initialAction, setInitialAction] = useState('');
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString().slice(0, 16);
  });
  const [issueStatus, setIssueStatus] = useState<IssueStatus>('belum_ditindaklanjuti');
  const [generalNotes, setGeneralNotes] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [createdVisitResult, setCreatedVisitResult] = useState<Visit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto enable hasIssue if any screening question is true
  const handleScreeningChange = (
    complaint: boolean,
    unmetNeeds: boolean,
    followUp: boolean
  ) => {
    setHasComplaint(complaint);
    setHasUnmetNeeds(unmetNeeds);
    setNeedsFollowUp(followUp);
    if (complaint || unmetNeeds || followUp) {
      setHasIssue(true);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!visitedAt) newErrors.visitedAt = 'Tanggal dan waktu kunjungan wajib diisi';
    if (!patientName.trim()) newErrors.patientName = 'Nama Pasien wajib diisi';
    if (!wardId) newErrors.wardId = 'Pilih Ruangan Rawat Inap';
    if (!roomNumber) newErrors.roomNumber = 'Pilih nomor kamar (1-17)';

    if (hasIssue) {
      if (!issueDescription.trim()) {
        newErrors.issueDescription = 'Uraian masalah/keluhan wajib diisi';
      }
      if (!assignedUnit.trim()) {
        newErrors.assignedUnit = 'Unit penanggung jawab wajib ditentukan';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    const now = new Date();
    setVisitedAt(now.toISOString().slice(0, 16));
    setPatientName('');
    setWardId(wards[0]?.id || '');
    setRoomNumber('1');
    setCompanionName('');
    setCompanionRelation('');
    setSocialObservation('Dukungan keluarga baik');
    setSocialNotes('');
    setPsychologicalObservation('Kondisi emosional tampak baik');
    setPsychologicalNotes('');
    setSpiritualObservation('Kebutuhan spiritual terpenuhi');
    setSpiritualNotes('');
    setComfortScore(null);
    setCleanlinessScore(null);
    setCommunicationScore(null);
    setResponsivenessScore(null);
    setOverallSatisfactionScore(null);
    setHasComplaint(false);
    setHasUnmetNeeds(false);
    setNeedsFollowUp(false);
    setHasIssue(false);
    setIssueDescription('');
    setInitialAction('');
    setGeneralNotes('');
    setErrors({});
  };

  const handleSubmit = async (andAddNew = false) => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'visit_number'> = {
      patient_name: patientName.trim(),
      ward_id: wardId,
      room_number: `Kamar ${roomNumber}`,
      visited_at: new Date(visitedAt).toISOString(),
      visitor_id: currentUser.id,
      visitor_name: currentUser.full_name,
      companion_name: companionName.trim() || undefined,
      companion_relation: companionRelation.trim() || undefined,
      social_observation: socialObservation,
      social_notes: socialNotes.trim() || undefined,
      psychological_observation: psychologicalObservation,
      psychological_notes: psychologicalNotes.trim() || undefined,
      spiritual_observation: spiritualObservation,
      spiritual_notes: spiritualNotes.trim() || undefined,
      comfort_score: comfortScore,
      cleanliness_score: cleanlinessScore,
      communication_score: communicationScore,
      responsiveness_score: responsivenessScore,
      overall_satisfaction_score: overallSatisfactionScore,
      has_issue: hasIssue,
      general_notes: generalNotes.trim() || undefined,
    };

    let issuePayload: Omit<Issue, 'id' | 'visit_id' | 'created_at' | 'updated_at'> | undefined;

    if (hasIssue) {
      issuePayload = {
        category: issueCategory,
        description: issueDescription.trim(),
        priority: issuePriority,
        status: issueStatus,
        assigned_unit: assignedUnit,
        assigned_to: assignedTo.trim() || undefined,
        initial_action: initialAction.trim() || undefined,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
      };
    }

    try {
      const created = await DataStore.createVisit(visitData, issuePayload);
      setIsSubmitting(false);
      setShowPreviewModal(false);

      if (andAddNew) {
        setCreatedVisitResult(created);
        setTimeout(() => {
          resetForm();
          setCreatedVisitResult(null);
        }, 2000);
      } else {
        setCreatedVisitResult(created);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Gagal menyimpan kunjungan. Silakan periksa kembali data input.');
    }
  };

  const renderRatingGroup = (
    label: string,
    value: number | null,
    onChange: (val: number | null) => void
  ) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0 text-xs">
        <span className="text-slate-700 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`px-2 py-1 text-[11px] rounded transition-colors ${
              value === null
                ? 'bg-slate-200 text-slate-800 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Belum dinilai
          </button>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`w-7 h-7 rounded flex items-center justify-center font-bold font-mono transition-colors ${
                value === star
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const isCloudActive = isSupabaseConfigured();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cloud Integration Warning Banner for Vercel / Offline Mode */}
      {!isCloudActive && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>Mode Penyimpanan Lokal (Demo / Offline)</span>
                <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-[10px] font-semibold">
                  Belum Terhubung Cloud
                </span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Data yang diinput pada browser perangkat ini hanya tersimpan di memori lokal dan <strong>belum terintegrasi dengan Google AI Studio / Vercel pusat</strong>.
                Agar data tersimpan ke database cloud bersama, pastikan Administrator telah memasang <em>Environment Variables</em> di Vercel atau masukkan kredensial Supabase.
              </p>
            </div>
          </div>
          {onOpenSupabaseModal && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shrink-0 transition-colors shadow-xs"
            >
              Hubungkan Supabase
            </button>
          )}
        </div>
      )}

      {/* Title & Privacy Policy Kicker */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Standar Prosedur Pelayanan RSUD Al-Mulk</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Formulir Kunjungan Sapa Pasien Rawat Inap
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dokumentasikan observasi holistik sosiologis, emosional, spiritual, serta kepuasan pasien secara objektif dan tuntas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Prinsip Minimisasi Data: Diagnosis & NIK tidak disimpan.</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) setShowPreviewModal(true);
        }}
        className="space-y-6"
      >
        {/* BAGIAN 1: Identitas dan Kunjungan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              01. Identitas & Informasi Kunjungan
            </h3>
            <p className="text-xs text-slate-500">
              Data dasar pasien dan penempatan ruang rawat inap RSUD Al-Mulk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Tanggal & Waktu Kunjungan (Dipindahkan ke Awal) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal & Waktu Kunjungan <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans"
              />
              {errors.visitedAt && (
                <p className="text-red-500 text-[11px] mt-1">{errors.visitedAt}</p>
              )}
            </div>

            {/* Nama Pasien */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pasien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap pasien"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.patientName && (
                <p className="text-red-500 text-[11px] mt-1">{errors.patientName}</p>
              )}
            </div>

            {/* Ruangan Rawat Inap */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ruangan Rawat Inap <span className="text-red-500">*</span>
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pemilihan Nomor Kamar (Angka 1-17) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Kamar (1–17) <span className="text-red-500">*</span>
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              >
                {Array.from({ length: 17 }, (_, i) => String(i + 1)).map((num) => (
                  <option key={num} value={num}>
                    Kamar {num}
                  </option>
                ))}
              </select>
              {errors.roomNumber && (
                <p className="text-red-500 text-[11px] mt-1">{errors.roomNumber}</p>
              )}
            </div>

            {/* Petugas Pelapor */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Petugas Pelapor (Login Otomatis)
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.full_name} (${currentUser.role})`}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg"
              />
            </div>

            {/* Nama Pendamping Keluarga */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pendamping Keluarga
              </label>
              <input
                type="text"
                placeholder="Nama pendamping (jika ada)"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            {/* Hubungan Pendamping */}
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Hubungan Pendamping
              </label>
              <input
                type="text"
                placeholder="Contoh: Suami, Istri, Anak, Orang Tua"
                value={companionRelation}
                onChange={(e) => setCompanionRelation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: Observasi Sosiologis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              02. Observasi Faktor Sosiologis
            </h3>
            <p className="text-xs text-slate-500">
              Kondisi dukungan keluarga, dinamika komunikasi, dan kebutuhan pendampingan sosial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              'Dukungan keluarga baik',
              'Dukungan keluarga perlu diperhatikan',
              'Kendala komunikasi dengan keluarga',
              'Kendala sosial atau kebutuhan bantuan',
              'Tidak ditemukan masalah',
              'Lainnya',
            ].map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  socialObservation === opt
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="social"
                  checked={socialObservation === opt}
                  onChange={() => setSocialObservation(opt)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Observasi Sosiologis & Rencana Tindak Lanjut
            </label>
            <textarea
              rows={2}
              placeholder="Catatan ringkas situasi pendamping keluarga atau kebutuhan bantuan..."
              value={socialNotes}
              onChange={(e) => setSocialNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* BAGIAN 3: Observasi Psikologis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              03. Observasi Aspek Psikologis
            </h3>
            <p className="text-xs text-slate-500">
              Observasi ekspresi dan emosi pasien/keluarga (Catatan berupa fakta observasi non-diagnostik)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              'Kondisi emosional tampak baik',
              'Pasien atau keluarga tampak cemas',
              'Pasien atau keluarga menyampaikan kekhawatiran',
              'Pasien atau keluarga menyampaikan ketidaknyamanan',
              'Memerlukan perhatian atau dukungan lanjutan',
              'Tidak ditemukan masalah',
              'Lainnya',
            ].map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  psychologicalObservation === opt
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="psychological"
                  checked={psychologicalObservation === opt}
                  onChange={() => setPsychologicalObservation(opt)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Observasi Emosional (Pernyataan langsung / ekspresi)
            </label>
            <textarea
              rows={2}
              placeholder="Misal: Pasien mengungkapkan rasa cemas terkait rencana tindakan operasi besok pagi..."
              value={psychologicalNotes}
              onChange={(e) => setPsychologicalNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* BAGIAN 4: Observasi Spiritual */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              04. Observasi Kebutuhan Spiritual
            </h3>
            <p className="text-xs text-slate-500">
              Menghormati keyakinan, privasi dan keleluasaan beribadah pasien sesuai ketentuan RSUD Al-Mulk
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              'Kebutuhan spiritual terpenuhi',
              'Membutuhkan dukungan spiritual',
              'Meminta fasilitasi ibadah',
              'Meminta pendampingan rohani',
              'Tidak ada kebutuhan khusus yang disampaikan',
              'Lainnya',
            ].map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  spiritualObservation === opt
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="spiritual"
                  checked={spiritualObservation === opt}
                  onChange={() => setSpiritualObservation(opt)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Dukungan Spiritual (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan permintaan jadwal bimbingan rohaniwan atau perlengkapan ibadah..."
              value={spiritualNotes}
              onChange={(e) => setSpiritualNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* BAGIAN 5: Kepuasan dan Kenyamanan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              05. Penilaian Kepuasan & Kenyamanan Pasien (Skala 1–5)
            </h3>
            <p className="text-xs text-slate-500">
              Nilai berdasarkan umpan balik langsung. Opsi "Belum dinilai" disediakan agar tidak terjadi bias nol.
            </p>
          </div>

          <div className="space-y-1">
            {renderRatingGroup(
              '1. Kenyamanan ruang perawatan (suhu, ketenangan, pencahayaan)',
              comfortScore,
              setComfortScore
            )}
            {renderRatingGroup(
              '2. Kebersihan kamar dan kamar mandi',
              cleanlinessScore,
              setCleanlinessScore
            )}
            {renderRatingGroup(
              '3. Komunikasi dan keramahan petugas',
              communicationScore,
              setCommunicationScore
            )}
            {renderRatingGroup(
              '4. Respons terhadap kebutuhan / panggilan bel perawat',
              responsivenessScore,
              setResponsivenessScore
            )}
            {renderRatingGroup(
              '5. Penilaian pelayanan secara keseluruhan',
              overallSatisfactionScore,
              setOverallSatisfactionScore
            )}
          </div>

          {/* Screening Questions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-800">
              Uji Cepat Kebutuhan Masalah / Keluhan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasComplaint}
                  onChange={(e) =>
                    handleScreeningChange(e.target.checked, hasUnmetNeeds, needsFollowUp)
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Pasien/keluarga memiliki keluhan</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasUnmetNeeds}
                  onChange={(e) =>
                    handleScreeningChange(hasComplaint, e.target.checked, needsFollowUp)
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Ada kebutuhan belum terpenuhi</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsFollowUp}
                  onChange={(e) =>
                    handleScreeningChange(hasComplaint, hasUnmetNeeds, e.target.checked)
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">Memerlukan tindak lanjut unit</span>
              </label>
            </div>
          </div>
        </div>

        {/* Toggle Masalah Manual */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-4 h-4 ${hasIssue ? 'text-amber-600' : 'text-slate-400'}`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Dokumentasikan Masalah / Keluhan Spesifik?
              </p>
              <p className="text-[11px] text-slate-500">
                Aktifkan bagian ini untuk meneruskan masalah ke unit terkait dengan target waktu (SLA).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasIssue}
              onChange={(e) => setHasIssue(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* BAGIAN 6 & 7: Keluhan dan Masalah + Tindak Lanjut */}
        {hasIssue && (
          <div className="bg-white p-5 rounded-xl border-2 border-amber-300 space-y-4 shadow-xs">
            <div className="border-b border-amber-100 pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  06 & 07. Rincian Masalah & Rencana Tindak Lanjut Unit
                </h3>
                <p className="text-xs text-amber-800">
                  Wajib mengisi kategori, prioritas, unit tujuan, dan tindakan awal
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                Wajib Ditindaklanjuti
              </span>
            </div>

            {/* Patient Safety Escalation Alert */}
            {issuePriority === 'kritis' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">
                    Peringatan Keselamatan Pasien (Patient Safety):
                  </span>
                  Masalah kritis yang menyangkut keselamatan pasien harus segera dieskalasikan secara lisan/telepon langsung kepada Kepala Jaga/Dokter Penanggung Jawab dan Komite Mutu RSUD Al-Mulk sesuai SPO KPRS!
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Masalah <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pelayanan">Pelayanan Medis / Keperawatan</option>
                  <option value="fasilitas">Fasilitas & Sarana (IPSRS)</option>
                  <option value="kebersihan">Kebersihan Ruangan & Kamar Mandi</option>
                  <option value="komunikasi">Komunikasi & Informasi Petugas</option>
                  <option value="kenyamanan">Kenyamanan & Ketertiban Bangsal</option>
                  <option value="dukungan_sosial">Dukungan Sosial & Jaminan (Humas)</option>
                  <option value="dukungan_psikologis">Dukungan Psikologis Pasien</option>
                  <option value="dukungan_spiritual">Fasilitasi Ibadah / Bina Rohani</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat Prioritas <span className="text-red-500">*</span>
                </label>
                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value as IssuePriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rendah">Rendah (Penyelesaian &lt; 48 Jam)</option>
                  <option value="sedang">Sedang (Penyelesaian &lt; 24 Jam)</option>
                  <option value="tinggi">Tinggi (Penyelesaian Segera &lt; 6 Jam)</option>
                  <option value="kritis">Kritis (Respons Cepat &lt; 1 Jam)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: IPSRS, Gizi, Farmasi, Keperawatan"
                  value={assignedUnit}
                  onChange={(e) => setAssignedUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.assignedUnit && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.assignedUnit}</p>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Masalah / Keluhan Pasien <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Uraikan keluhan secara jelas, spesifik, dan objektif..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.issueDescription && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.issueDescription}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Petugas / PIC yang Dihubungi
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas unit tindak lanjut"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Waktu Penyelesaian (SLA)
                </label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Tindak Lanjut Awal
                </label>
                <select
                  value={issueStatus}
                  onChange={(e) => setIssueStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg capitalize"
                >
                  <option value="belum_ditindaklanjuti">Belum Ditindaklanjuti</option>
                  <option value="dalam_proses">Dalam Proses</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="diteruskan">Diteruskan ke Unit Terkait</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Tindakan Awal yang Telah Dilakukan di Ruangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mengganti linen segera, mengedukasi keluarga, membuat tiket perbaikan AC..."
                  value={initialAction}
                  onChange={(e) => setInitialAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Catatan Umum Kunjungan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Catatan Tambahan & Rekomendasi Petugas
          </label>
          <textarea
            rows={2}
            placeholder="Catatan umum mengenai interaksi, respon pasien terhadap sapaan, atau saran untuk tim jaga..."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Formulir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (validateForm()) setShowPreviewModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Data</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan & Tambah Kunjungan</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kunjungan'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal Pratinjau Kunjungan */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Konfirmasi & Pratinjau Dokumentasi Kunjungan
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Waktu Kunjungan:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {new Date(visitedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Nama Pasien:</span>{' '}
                  <span className="font-semibold text-slate-800">{patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Ruangan & Kamar:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {wards.find((w) => w.id === wardId)?.name} (Kamar {roomNumber})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Petugas Sapa:</span>{' '}
                  <span className="font-semibold text-slate-800">{currentUser.full_name}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="font-semibold text-slate-800">Observasi Multidimensi:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>
                    <strong className="text-slate-700">Sosiologis:</strong> {socialObservation}{' '}
                    {socialNotes && `(${socialNotes})`}
                  </li>
                  <li>
                    <strong className="text-slate-700">Psikologis:</strong>{' '}
                    {psychologicalObservation} {psychologicalNotes && `(${psychologicalNotes})`}
                  </li>
                  <li>
                    <strong className="text-slate-700">Spiritual:</strong> {spiritualObservation}{' '}
                    {spiritualNotes && `(${spiritualNotes})`}
                  </li>
                </ul>
              </div>

              {hasIssue && (
                <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Masalah Teridentifikasi: Prioritas {issuePriority.toUpperCase()}</span>
                  </div>
                  <p>{issueDescription}</p>
                  <p className="text-[11px] text-amber-800 pt-1">
                    Diteruskan ke: <strong>{assignedUnit}</strong> · Tindakan awal:{' '}
                    {initialAction || 'Dicatat dalam laporan'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Kembali Edit
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Konfirmasi & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses Tersimpan */}
      {createdVisitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Kunjungan Berhasil Didokumentasikan!
              </h3>
              <p className="text-xs text-slate-500">
                Data telah tersimpan ke repositori sistem SAPA PASIEN RSUD Al-Mulk.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs">
              <div className="text-[11px] text-slate-400">Nomor Registrasi Kunjungan:</div>
              <div className="text-base font-bold text-blue-700 mt-0.5">
                {createdVisitResult.visit_number}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Pasien: {createdVisitResult.patient_name} ({createdVisitResult.room_number})
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  setCreatedVisitResult(null);
                  resetForm();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                + Input Pasien Baru
              </button>

              <button
                onClick={() => {
                  setCreatedVisitResult(null);
                  onSuccessNavigate('monitoring');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Buka Tabel Monitoring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
