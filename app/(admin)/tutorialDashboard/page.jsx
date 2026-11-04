'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Pencil,
  X, 
  BookOpen, 
  Terminal, 
  Image as ImageIcon, 
  Eye, 
  UploadCloud, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import Modal from '@/app/components/Modal';

export default function TutorialDashboardPage() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [previewTutorial, setPreviewTutorial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    kategori: 'Sistem Operasi',
    level: 'Pemula',
    deskripsi: '',
    command: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  // Kategori sesuai ENUM MySQL
  const kategoriList = [
    'Sistem Operasi',
    'Hardware & Software',
    'Jaringan',
    'Storage & Driver',
  ];

  // Level sesuai ENUM MySQL
  const levelList = ['Pemula', 'Menengah', 'Mahir'];

  // Helper membedah data langkah (JSON)
  const parseLangkahHelper = (langkahRaw) => {
    if (!langkahRaw) return { deskripsi: '', command: '', imageUrl: '' };
    try {
      const parsed = JSON.parse(langkahRaw);
      return {
        deskripsi: parsed.deskripsi || parsed.penjelasan || '',
        command: parsed.command || parsed.perintah || '',
        imageUrl: parsed.imageUrl || parsed.gambar || '',
      };
    } catch (_e) {
      return {
        deskripsi: String(langkahRaw || ''),
        command: '',
        imageUrl: '',
      };
    }
  };

  // 1. Fetch data dari Database MySQL via API
  const refreshTutorials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tutorials');
      if (!res.ok) throw new Error('Gagal mengambil data dari database');
      const data = await res.json();
      setTutorials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const res = await fetch('/api/tutorials');
        if (!res.ok) throw new Error('Gagal mengambil data dari database');
        const data = await res.json();
        if (!ignore) {
          setTutorials(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  // Filter Data berdasarkan Search & Kategori
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((item) => {
      const matchSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === 'All' || item.kategori === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [tutorials, searchTerm, selectedCategory]);

  // Handle Pilih File Gambar
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: '',
      kategori: 'Sistem Operasi',
      level: 'Pemula',
      deskripsi: '',
      command: '',
    });
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setExistingImageUrl('');
    setFormError('');
    setEditingId(null);
  };

  // Buka Modal Tambah
  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsFormModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (tutorial) => {
    resetForm();
    setModalMode('edit');
    setEditingId(tutorial.id);

    const parsedLangkah = parseLangkahHelper(tutorial.langkah);
    setFormData({
      title: tutorial.title || '',
      kategori: tutorial.kategori || 'Sistem Operasi',
      level: tutorial.level || 'Pemula',
      deskripsi: parsedLangkah.deskripsi || '',
      command: parsedLangkah.command || '',
    });
    setExistingImageUrl(parsedLangkah.imageUrl || '');
    setIsFormModalOpen(true);
  };

  // Submit Tambah atau Edit Tutorial ke Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Judul tutorial wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const bodyFormData = new FormData();
      bodyFormData.append('title', formData.title.trim());
      bodyFormData.append('kategori', formData.kategori);
      bodyFormData.append('level', formData.level);
      bodyFormData.append('deskripsi', formData.deskripsi.trim());
      bodyFormData.append('command', formData.command.trim());

      // Jika ada file gambar baru yang dipilih
      if (imageFile) {
        bodyFormData.append('image', imageFile);
      } else {
        // Pertahankan gambar lama (atau kosong jika telah dihapus)
        bodyFormData.append('imageUrl', existingImageUrl);
      }

      const url = modalMode === 'edit' ? `/api/tutorials/${editingId}` : '/api/tutorials';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: bodyFormData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || `Gagal ${modalMode === 'edit' ? 'memperbarui' : 'menyimpan'} tutorial.`);
      }

      // Refresh data dari database
      await refreshTutorials();
      setIsFormModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus Tutorial dari Database
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus tutorial "${title}"?`)) return;

    try {
      const res = await fetch(`/api/tutorials/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus data');
      }
      // Hapus dari state lokal
      setTutorials((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper memeriksa kelengkapan konten untuk badge di tabel
  const getLangkahOverview = (langkahRaw) => {
    const parsed = parseLangkahHelper(langkahRaw);
    return {
      hasImage: Boolean(parsed.imageUrl),
      hasCommand: Boolean(parsed.command),
      text: parsed.deskripsi || '',
    };
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> Tutorial Troubleshooting List
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} /> Tambah Tutorial Baru
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari judul atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABEL DATA TUTORIAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Judul Tutorial</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Fitur Solusi</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                      <span>Mengambil data dari database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTutorials.length > 0 ? (
                filteredTutorials.map((item) => {
                  const overview = getLangkahOverview(item.langkah);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{item.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2563eb]">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.level === 'Pemula'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.level === 'Menengah'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {overview.hasCommand && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-200 text-xs font-mono font-medium shadow-sm"
                              title="Terdapat perintah command prompt"
                            >
                              <Terminal size={12} className="text-emerald-400" /> CMD
                            </span>
                          )}
                          {overview.hasImage && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                              title="Terdapat screenshot panduan"
                            >
                              <ImageIcon size={12} /> Gambar
                            </span>
                          )}
                          {!overview.hasCommand && !overview.hasImage && (
                            <span className="text-xs text-slate-400 italic">Teks saja</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Preview (Lihat Tampilan Modal) */}
                          <button
                            onClick={() => setPreviewTutorial(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Preview Tampilan Solusi"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Tutorial"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus Tutorial"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Tidak ada tutorial yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT TUTORIAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-modal-backdrop">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8 animate-modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${modalMode === 'edit' ? 'bg-amber-500' : 'bg-indigo-600'} text-white flex items-center justify-center font-bold`}>
                  {modalMode === 'edit' ? <Pencil size={16} /> : '+'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {modalMode === 'edit' ? `Edit Tutorial #${editingId}` : 'Tambah Tutorial Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalMode === 'edit' 
                      ? 'Perbarui detail masalah, screenshot panduan, dan perintah terminal.' 
                      : 'Masukkan solusi, screenshot, dan perintah terminal (jika ada).'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Judul Tutorial */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judul Tutorial / Masalah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Contoh: Komputer Sering Blue Screen (BSOD)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Maksimal 50 karakter (sesuai skema database).</span>
              </div>

              {/* Kategori & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {kategoriList.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tingkat Kesulitan / Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {levelList.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Penjelasan / Deskripsi Langkah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Penjelasan & Langkah Solusi
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan penjelasan langkah-langkah penanganan masalah secara detail di sini..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                />
              </div>

              {/* Upload Screenshot / Foto */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-indigo-600" /> Screenshot / Gambar Panduan (Opsional)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                    <UploadCloud size={18} className="text-indigo-600" />
                    <span>{existingImageUrl || imageFile ? 'Ganti File Gambar' : 'Pilih Foto Screenshot'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Keterangan file baru yang dipilih */}
                  {imageFile && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 truncate max-w-xs">{imageFile.name} (File baru)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          if (imagePreview) URL.revokeObjectURL(imagePreview);
                          setImagePreview('');
                        }}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                      >
                        ✕ Batalkan
                      </button>
                    </div>
                  )}

                  {/* Keterangan gambar lama jika dalam mode edit dan tidak ada upload baru */}
                  {!imageFile && existingImageUrl && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium text-slate-700 truncate max-w-xs">Gambar tersimpan saat ini</span>
                      <button
                        type="button"
                        onClick={() => setExistingImageUrl('')}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                        title="Hapus gambar saat ini"
                      >
                        ✕ Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Foto (Gambar baru atau gambar yang tersimpan) */}
                {(imagePreview || existingImageUrl) && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-300 bg-white p-2">
                    <p className="text-[11px] text-slate-400 mb-1">
                      {imagePreview ? 'Preview Foto Baru:' : 'Foto Tersimpan Saat Ini:'}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview || existingImageUrl}
                      alt="Preview screenshot panduan"
                      className="max-h-48 rounded object-contain mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Perintah Terminal / Command Prompt (Opsional) */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={15} /> Perintah Terminal / Command Prompt (Opsional)
                  </label>
                  <span className="text-[11px] text-slate-400">Akan tampil dengan background hitam</span>
                </div>

                <p className="text-xs text-slate-400 mb-2">
                  Masukkan baris perintah yang perlu diketik user di CMD / Terminal. Jika lebih dari 1 baris, tekan Enter.
                </p>

                <textarea
                  rows={3}
                  placeholder={`Contoh:\nsfc /scannow\nDISM.exe /Online /Cleanup-image /Restorehealth`}
                  value={formData.command}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-slate-700 rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed placeholder:text-slate-600"
                />

                {/* Live Terminal Preview */}
                {formData.command.trim() && (
                  <div className="mt-3 p-3 bg-black/80 rounded-lg border border-slate-800 text-xs font-mono">
                    <div className="text-slate-500 text-[10px] mb-1 select-none">Preview Tampilan Command Prompt:</div>
                    {formData.command.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-2 text-slate-200">
                        <span className="text-emerald-400 select-none">C:\Windows\System32&gt;</span>
                        <span className="text-white font-semibold">{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 px-6 py-2.5 ${
                    modalMode === 'edit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm`}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Menyimpan...' : modalMode === 'edit' ? 'Simpan Perubahan' : 'Simpan Tutorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW DETAIL TUTORIAL */}
      <Modal
        isOpen={Boolean(previewTutorial)}
        tutorial={previewTutorial}
        onClose={() => setPreviewTutorial(null)}
      />
    </div>
  );
}
