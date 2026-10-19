import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Calendar,
  Building,
  User,
  ShieldCheck,
  FileText,
  MessageSquare,
  X,
  History,
  Send,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Visit, Issue, Ward, UserProfile, IssueStatus, IssuePriority } from '../../types';
import { DataStore } from '../../lib/dataStore';

interface MonitoringModuleProps {
  onNavigateToVisits: () => void;
}

export const MonitoringModule: React.FC<MonitoringModuleProps> = ({ onNavigateToVisits }) => {
  const currentUser: UserProfile = useMemo(() => DataStore.getCurrentUser(), []);
  const wards: Ward[] = useMemo(() => DataStore.getWards(), []);

  const [visits, setVisits] = useState<Visit[]>(DataStore.getVisits());
  const [issues, setIssues] = useState<Issue[]>(DataStore.getIssues());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'priority' | 'patient'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [selectedVisitForDetail, setSelectedVisitForDetail] = useState<Visit | null>(null);
  const [selectedIssueForAction, setSelectedIssueForAction] = useState<Issue | null>(null);
  const [selectedIssueForVerify, setSelectedIssueForVerify] = useState<Issue | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Follow-up form inputs
  const [actionDescription, setActionDescription] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus>('dalam_proses');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Subscribe to realtime changes in DataStore
  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setVisits(DataStore.getVisits());
      setIssues(DataStore.getIssues());
    });
    return () => unsub();
  }, []);

  const maskPatientName = (name: string) => {
    if (currentUser.role === 'pimpinan') {
      const parts = name.split(' ');
      return parts[0] + ' ' + (parts[1] ? parts[1].charAt(0) + '***' : '***');
    }
    return name;
  };

  // Build combined items for the monitoring table
  // Each visit can have 0 or more issues
  const monitoringRows = useMemo(() => {
    const rows: Array<{
      visit: Visit;
      issue?: Issue;
      isOverdue: boolean;
    }> = [];

    visits.forEach((v) => {
      const relatedIssues = issues.filter((i) => i.visit_id === v.id);
      if (relatedIssues.length === 0) {
        rows.push({ visit: v, isOverdue: false });
      } else {
        relatedIssues.forEach((iss) => {
          const isOverdue =
            iss.status !== 'selesai' &&
            !!iss.due_at &&
            new Date(iss.due_at).getTime() < new Date().getTime();
          rows.push({ visit: v, issue: iss, isOverdue });
        });
      }
    });

    return rows;
  }, [visits, issues]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return monitoringRows.filter(({ visit, issue, isOverdue }) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = visit.patient_name.toLowerCase().includes(q);
        const matchNumber = visit.visit_number.toLowerCase().includes(q);
        const matchWard = visit.ward_name?.toLowerCase().includes(q) || false;
        const matchRoom = visit.room_number?.toLowerCase().includes(q) || false;
        const matchDesc = issue?.description?.toLowerCase().includes(q) || false;
        if (!matchName && !matchNumber && !matchWard && !matchRoom && !matchDesc) return false;
      }

      // Ward filter
      if (selectedWard !== 'all' && visit.ward_id !== selectedWard) return false;

      // Priority filter
      if (selectedPriority !== 'all') {
        if (!issue || issue.priority !== selectedPriority) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (!issue) {
          if (selectedStatus !== 'optimal') return false;
        } else if (issue.status !== selectedStatus) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!issue || issue.category !== selectedCategory) return false;
      }

      // Overdue filter
      if (onlyOverdue && !isOverdue) return false;

      return true;
    });
  }, [
    monitoringRows,
    searchQuery,
    selectedWard,
    selectedPriority,
    selectedStatus,
    selectedCategory,
    onlyOverdue,
  ]);

  // Sort
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (sortField === 'date') {
        const tA = new Date(a.visit.visited_at).getTime();
        const tB = new Date(b.visit.visited_at).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      }

      if (sortField === 'priority') {
        const priorityRank: Record<string, number> = {
          kritis: 4,
          tinggi: 3,
          sedang: 2,
          rendah: 1,
        };
        const rankA = a.issue ? priorityRank[a.issue.priority] || 0 : 0;
        const rankB = b.issue ? priorityRank[b.issue.priority] || 0 : 0;
        return sortOrder === 'asc' ? rankA - rankB : rankB - rankA;
      }

      if (sortField === 'patient') {
        return sortOrder === 'asc'
          ? a.visit.patient_name.localeCompare(b.visit.patient_name)
          : b.visit.patient_name.localeCompare(a.visit.patient_name);
      }

      return 0;
    });
  }, [filteredRows, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage, itemsPerPage]);

  const toggleSort = (field: 'date' | 'priority' | 'patient') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Submit Follow-up Action
  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForAction || !actionDescription.trim()) return;

    setIsSubmittingAction(true);
    await DataStore.addFollowUp(
      selectedIssueForAction.id,
      actionDescription.trim(),
      newStatus,
      resolutionNotes.trim() || undefined
    );
    setIsSubmittingAction(false);
    setSelectedIssueForAction(null);
    setActionDescription('');
    setResolutionNotes('');
  };

  // Submit Verification
  const handleVerifyResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForVerify) return;

    setIsSubmittingAction(true);
    await DataStore.verifyIssue(selectedIssueForVerify.id, verificationNotes.trim());
    setIsSubmittingAction(false);
    setSelectedIssueForVerify(null);
    setVerificationNotes('');
  };

  // Delete Visit Record
  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;
    setIsDeleting(true);
    try {
      await DataStore.deleteVisit(visitToDelete.id);
      setVisitToDelete(null);
      if (selectedVisitForDetail?.id === visitToDelete.id) {
        setSelectedVisitForDetail(null);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data kunjungan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = sortedRows.map(({ visit, issue }) => ({
      'Nomor Kunjungan': visit.visit_number,
      'Nama Pasien': maskPatientName(visit.patient_name),
      'Ruangan Rawat Inap': visit.ward_name,
      'Nomor Kamar': visit.room_number,
      'Waktu Kunjungan': new Date(visit.visited_at).toLocaleString('id-ID'),
      'Petugas Sapa': visit.visitor_name,
      'Observasi Sosiologis': visit.social_observation,
      'Observasi Psikologis': visit.psychological_observation,
      'Observasi Spiritual': visit.spiritual_observation,
      'Skor Kepuasan Keseluruhan': visit.overall_satisfaction_score || 'Belum dinilai',
      'Keluhan / Masalah': issue ? issue.description : 'Optimal (Tidak ada masalah)',
      Kategori: issue ? issue.category : '-',
      Prioritas: issue ? issue.priority : '-',
      'Unit Penanggung Jawab': issue?.assigned_unit || '-',
      'Status Tindak Lanjut': issue ? issue.status.replace(/_/g, ' ') : 'Selesai / Optimal',
      'Target Waktu (SLA)': issue?.due_at
        ? new Date(issue.due_at).toLocaleString('id-ID')
        : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monitoring Sapa Pasien');
    XLSX.writeFile(
      wb,
      `SAPA_PASIEN_RSUD_AL_MULK_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Module Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>RSUD Al-Mulk</span>
            <span aria-hidden="true">·</span>
            <span>Modul Monitoring Realtime</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Daftar Kunjungan & Monitoring Tindak Lanjut Pasien
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status respon ruangan, riwayat observasi, dan pastikan setiap keluhan diselesaikan sesuai standar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {(currentUser.role === 'petugas' ||
            currentUser.role === 'supervisor' ||
            currentUser.role === 'administrator') && (
            <button
              onClick={onNavigateToVisits}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <span>+ Input Kunjungan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pasien, no registrasi kunjungan, ruangan, nomor kamar, atau keluhan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Quick Overdue Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={onlyOverdue}
                onChange={(e) => {
                  setOnlyOverdue(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Hanya Masalah Melewati SLA
              </span>
            </label>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <select
            value={selectedWard}
            onChange={(e) => {
              setSelectedWard(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">Semua Ruangan</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">Semua Prioritas</option>
            <option value="kritis">Kritis</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="belum_ditindaklanjuti">Belum Ditindaklanjuti</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="selesai">Selesai</option>
            <option value="diteruskan">Diteruskan</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">Semua Kategori</option>
            <option value="pelayanan">Pelayanan</option>
            <option value="fasilitas">Fasilitas (IPSRS)</option>
            <option value="kebersihan">Kebersihan</option>
            <option value="komunikasi">Komunikasi</option>
            <option value="kenyamanan">Kenyamanan</option>
            <option value="dukungan_sosial">Dukungan Sosial</option>
            <option value="dukungan_psikologis">Psikologis</option>
            <option value="dukungan_spiritual">Spiritual</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Main Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5 whitespace-nowrap">No Kunjungan</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                  onClick={() => toggleSort('patient')}
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Pasien</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Ruangan & Kamar</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    <span>Waktu Kunjungan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Ringkasan Masalah</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                  onClick={() => toggleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    <span>Prioritas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Petugas / PJ</th>
                <th className="py-3 px-3 whitespace-nowrap">Status</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Tidak ada data ditemukan</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map(({ visit, issue, isOverdue }) => {
                  return (
                    <tr
                      key={`${visit.id}-${issue?.id || 'none'}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Visit Number */}
                      <td className="py-3 px-3.5 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {visit.visit_number}
                      </td>

                      {/* Patient Name */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {maskPatientName(visit.patient_name)}
                        </div>
                      </td>

                      {/* Ward & Room */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{visit.ward_name}</div>
                        <div className="text-[11px] text-slate-500">{visit.room_number}</div>
                      </td>

                      {/* Visited At */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {new Date(visit.visited_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-slate-400">
                          {new Date(visit.visited_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </td>

                      {/* Issue Summary */}
                      <td className="py-3 px-3 max-w-[240px]">
                        {issue ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {issue.category}
                            </span>
                            <p className="text-slate-800 font-medium line-clamp-2">
                              {issue.description}
                            </p>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {issue ? (
                          <span
                            className={`text-[11px] font-semibold uppercase ${
                              issue.priority === 'kritis'
                                ? 'text-red-700 font-bold'
                                : issue.priority === 'tinggi'
                                ? 'text-amber-700 font-bold'
                                : issue.priority === 'sedang'
                                ? 'text-blue-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {issue.priority}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Reporter & Assigned Unit */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <div>Pelapor: {visit.visitor_name}</div>
                        <div className="text-[11px] text-slate-400">
                          PJ: {issue?.assigned_unit || '-'}
                        </div>
                      </td>

                      {/* Status & Overdue Warning */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {issue ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                                issue.status === 'selesai'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : issue.status === 'dalam_proses'
                                  ? 'bg-blue-50 text-blue-800'
                                  : issue.status === 'menunggu_konfirmasi'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {issue.status.replace(/_/g, ' ')}
                            </span>

                            {isOverdue && (
                              <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Melewati SLA</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                        {/* Detail Button */}
                        <button
                          onClick={() => setSelectedVisitForDetail(visit)}
                          title="Lihat Detail Observasi"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Action Follow-up Button (for staff/supervisor/admin if issue exists) */}
                        {issue &&
                          (currentUser.role === 'petugas' ||
                            currentUser.role === 'supervisor' ||
                            currentUser.role === 'administrator') && (
                            <button
                              onClick={() => {
                                setSelectedIssueForAction(issue);
                                setNewStatus(issue.status);
                                setResolutionNotes(issue.resolution_notes || '');
                              }}
                              title="Tindak Lanjut Masalah"
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {/* Verify Button (for supervisor/admin only if issue is in progress or completed) */}
                        {issue &&
                          issue.status !== 'selesai' &&
                          (currentUser.role === 'supervisor' ||
                            currentUser.role === 'administrator') && (
                            <button
                              onClick={() => setSelectedIssueForVerify(issue)}
                              title="Verifikasi Penyelesaian"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {/* Delete Button (Hapus Data Kunjungan) */}
                        {(currentUser.role === 'petugas' ||
                          currentUser.role === 'supervisor' ||
                          currentUser.role === 'administrator') && (
                          <button
                            onClick={() => setVisitToDelete(visit)}
                            title="Hapus Data Kunjungan"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-semibold">{paginatedRows.length}</span> dari{' '}
            <span className="font-semibold">{sortedRows.length}</span> data
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Detail Kunjungan Holistik */}
      {selectedVisitForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detail Rekam Kunjungan Sapa Pasien
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  {selectedVisitForDetail.visit_number} · RSUD Al-Mulk Kota Sukabumi
                </p>
              </div>
              <button
                onClick={() => setSelectedVisitForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">Nama Pasien:</span>
                  <span className="font-bold text-slate-900">
                    {maskPatientName(selectedVisitForDetail.patient_name)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Ruangan & Kamar:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedVisitForDetail.ward_name} ({selectedVisitForDetail.room_number})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Petugas Sapa:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedVisitForDetail.visitor_name}
                  </span>
                </div>
              </div>

              {/* Multidimensional Observations */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1">
                  Observasi Multidimensi Pasien
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1">
                    <span className="font-bold text-blue-900 block">Faktor Sosiologis</span>
                    <p className="font-medium text-slate-800">
                      {selectedVisitForDetail.social_observation}
                    </p>
                    {selectedVisitForDetail.social_notes && (
                      <p className="text-slate-600 text-[11px] pt-1">
                        Catatan: {selectedVisitForDetail.social_notes}
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg space-y-1">
                    <span className="font-bold text-teal-900 block">Faktor Psikologis</span>
                    <p className="font-medium text-slate-800">
                      {selectedVisitForDetail.psychological_observation}
                    </p>
                    {selectedVisitForDetail.psychological_notes && (
                      <p className="text-slate-600 text-[11px] pt-1">
                        Catatan: {selectedVisitForDetail.psychological_notes}
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1">
                    <span className="font-bold text-emerald-900 block">Kebutuhan Spiritual</span>
                    <p className="font-medium text-slate-800">
                      {selectedVisitForDetail.spiritual_observation}
                    </p>
                    {selectedVisitForDetail.spiritual_notes && (
                      <p className="text-slate-600 text-[11px] pt-1">
                        Catatan: {selectedVisitForDetail.spiritual_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Satisfaction Ratings */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 border-b pb-1">
                  Skor Evaluasi Kepuasan Pasien
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Kenyamanan</span>
                    <span className="text-lg font-bold font-mono text-slate-800">
                      {selectedVisitForDetail.comfort_score || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Kebersihan</span>
                    <span className="text-lg font-bold font-mono text-slate-800">
                      {selectedVisitForDetail.cleanliness_score || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Komunikasi</span>
                    <span className="text-lg font-bold font-mono text-slate-800">
                      {selectedVisitForDetail.communication_score || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Responsif</span>
                    <span className="text-lg font-bold font-mono text-slate-800">
                      {selectedVisitForDetail.responsiveness_score || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-[11px] text-blue-700 font-semibold block">
                      Keseluruhan
                    </span>
                    <span className="text-lg font-bold font-mono text-blue-900">
                      {selectedVisitForDetail.overall_satisfaction_score || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Issues & Timeline */}
              {selectedVisitForDetail.issues && selectedVisitForDetail.issues.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 border-b pb-1">
                    Keluhan & Jejak Tindak Lanjut Unit
                  </h4>
                  {selectedVisitForDetail.issues.map((iss) => (
                    <div
                      key={iss.id}
                      className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 uppercase">
                          Kategori: {iss.category} (Prioritas: {iss.priority})
                        </span>
                        <span className="capitalize font-semibold text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                          {iss.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{iss.description}</p>
                      <div className="text-[11px] text-slate-500">
                        Unit PJ: <strong>{iss.assigned_unit || '-'}</strong> · PIC:{' '}
                        <strong>{iss.assigned_to || '-'}</strong>
                      </div>

                      {/* Follow up history logs */}
                      {iss.follow_up_logs && iss.follow_up_logs.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-amber-200/60 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                            <History className="w-3 h-3 text-slate-500" />
                            Riwayat Tindak Lanjut:
                          </span>
                          {iss.follow_up_logs.map((log) => (
                            <div
                              key={log.id}
                              className="text-[11px] bg-white p-2 rounded border border-amber-100 flex items-start justify-between gap-2"
                            >
                              <div>
                                <span className="font-medium text-slate-900">
                                  {log.action_description}
                                </span>
                                <span className="text-slate-400 block text-[10px]">
                                  Oleh: {log.actor_name}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {(currentUser.role === 'petugas' ||
                currentUser.role === 'supervisor' ||
                currentUser.role === 'administrator') ? (
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedVisitForDetail;
                    setSelectedVisitForDetail(null);
                    setVisitToDelete(toDelete);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Kunjungan Ini</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedVisitForDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Form Tindak Lanjut Masalah */}
      {selectedIssueForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Perbarui Tindak Lanjut Masalah
                </h3>
                <p className="text-xs text-slate-500">
                  Pasien: {selectedIssueForAction.patient_name} ({selectedIssueForAction.ward_name})
                </p>
              </div>
              <button
                onClick={() => setSelectedIssueForAction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[11px] block">Keluhan Pasien:</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {selectedIssueForAction.description}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Uraian Tindakan yang Dilakukan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan langkah konkret perbaikan atau koordinasi yang telah dijalankan..."
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Status Setelah Tindakan
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg capitalize"
                >
                  <option value="dalam_proses">Dalam Proses</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi Pasien / Unit</option>
                  <option value="selesai">Selesai (Masalah Telah Tuntas)</option>
                  <option value="diteruskan">Diteruskan ke Manajemen / Unit Lain</option>
                </select>
              </div>

              {newStatus === 'selesai' && (
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Catatan Hasil Penyelesaian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: AC telah diperbaiki teknisi dan kamar kembali sejuk..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForAction(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingAction ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Verifikasi Penyelesaian (Supervisor & Administrator) */}
      {selectedIssueForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verifikasi Mutu & Penyelesaian
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssueForVerify(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyResolution} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Sebagai <strong>{currentUser.role.toUpperCase()}</strong>, Anda akan menandai
                masalah ini resmi selesai dan terverifikasi dalam jejak audit RSUD Al-Mulk.
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Uraian Masalah:</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {selectedIssueForVerify.description}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pasien: {selectedIssueForVerify.patient_name} ({selectedIssueForVerify.ward_name})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Catatan Supervisi / Hasil Verifikasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah dikonfirmasi ke pasien bahwa fasilitas berfungsi baik."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForVerify(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verifikasi & Tutup Masalah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Konfirmasi Hapus Data Kunjungan */}
      {visitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/70">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Hapus Data Kunjungan</span>
              </div>
              <button
                onClick={() => setVisitToDelete(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus data kunjungan ini? Seluruh observasi serta tindak lanjut yang terkait akan dihapus secara permanen dari sistem.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {visitToDelete.visit_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nama Pasien:</span>
                  <span className="font-semibold text-slate-900">
                    {visitToDelete.patient_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ruangan & Kamar:</span>
                  <span className="text-slate-800">
                    {visitToDelete.ward_name} ({visitToDelete.room_number})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Waktu Kunjungan:</span>
                  <span className="text-slate-800">
                    {new Date(visitToDelete.visited_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Petugas Sapa:</span>
                  <span className="text-slate-800">
                    {visitToDelete.visitor_name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Tindakan ini tidak dapat dibatalkan. Riwayat penghapusan akan dicatat ke dalam audit trail sistem RSUD Al-Mulk.
                </span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVisitToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
