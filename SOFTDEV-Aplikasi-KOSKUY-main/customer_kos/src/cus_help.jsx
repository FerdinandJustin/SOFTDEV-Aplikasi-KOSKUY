import React, { useState, useEffect, useRef } from 'react';
import { Camera, Send, Droplets, Shield, Monitor, MoreHorizontal, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';

export default function CusHelp({ navigateTo, user, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const fileInputRef = useRef(null);

  const categories = [
    { id: 'fasilitas', label: 'Fasilitas', icon: <Monitor size={16} /> },
    { id: 'listrik', label: 'Listrik / Air', icon: <Droplets size={16} /> },
    { id: 'keamanan', label: 'Keamanan', icon: <Shield size={16} /> },
    { id: 'lainnya', label: 'Dan Lainnya', icon: <MoreHorizontal size={16} /> },
  ];

  const fetchUserComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const response = await fetch(`${API_URL}?action=get_complaints&user_id=${user.id}`);
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setComplaints(resData.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserComplaints();
    }
  }, [user]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}?action=upload_image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setImageUrl(data.url);
        setImageFile(file);
        showToast('Foto berhasil diunggah!');
      } else {
        showToast(data.message || 'Gagal mengunggah foto', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal saat mengunggah', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      showToast('Pilih kategori keluhan', 'error');
      return;
    }
    if (!detail.trim()) {
      showToast('Isi detail keluhan Anda', 'error');
      return;
    }
    setSending(true);
    try {
      const payload = {
        user_id: user.id,
        booking_id: null,
        detail_keluhan: detail.trim(),
        kategori: selectedCategory,
        gambar: imageUrl || null
      };

      const response = await fetch(`${API_URL}?action=create_complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        showToast('Keluhan berhasil dikirim!');
        setSelectedCategory(null);
        setDetail('');
        setImageUrl('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchUserComplaints();
      } else {
        showToast(resData.message || 'Gagal mengirim keluhan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSending(false);
    }
  };

  const getCategoryIcon = (kategori) => {
    switch (kategori) {
      case 'listrik':
        return <Droplets size={18} className="text-[#6A6A6A]" />;
      case 'keamanan':
        return <Shield size={18} className="text-[#6A6A6A]" />;
      case 'fasilitas':
        return <Monitor size={18} className="text-[#6A6A6A]" />;
      default:
        return <MoreHorizontal size={18} className="text-[#6A6A6A]" />;
    }
  };

  const getCategoryLabel = (kategori) => {
    switch (kategori) {
      case 'listrik': return 'Listrik / Air';
      case 'keamanan': return 'Keamanan';
      case 'fasilitas': return 'Fasilitas';
      default: return 'Lainnya';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Selesai') {
      return {
        bg: 'bg-green-50 border-green-200 text-green-700',
        label: 'SELESAI',
        icon: <CheckCircle2 size={12} className="text-green-600 inline mr-1" />
      };
    }
    if (status === 'Diproses') {
      return {
        bg: 'bg-blue-50 border-blue-200 text-blue-700',
        label: 'DIPROSES',
        icon: <Clock size={12} className="text-blue-600 inline mr-1" />
      };
    }
    return {
      bg: 'bg-gray-50 border-gray-200 text-gray-700',
      label: 'PENDING',
      icon: <Clock size={12} className="text-gray-500 inline mr-1" />
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  // Filter complaints based on view state
  const displayedComplaints = showAllHistory
    ? complaints
    : complaints.filter(c => c.status !== 'Selesai');

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans'] pb-24">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <img src={logo} alt="KosKuy Logo" className="w-7 h-7 object-contain" />
        <h1 className="text-xl font-extrabold text-[#FF385C] tracking-wide">KosKuy</h1>
      </div>

      <div className="px-5 pt-5">
        <h2 className="text-2xl font-bold text-[#1B1C1C]">Pusat Bantuan</h2>
        <p className="text-sm text-[#6A6A6A] mt-1 mb-5">Kami siap membantu menyelesaikan masalah di kost Anda.</p>

        {/* Complaint Form Card */}
        <form onSubmit={handleSend} className="bg-white rounded-2xl p-5 shadow-sm border border-[#EBEBEB] mb-6">
          <h3 className="text-base font-bold text-[#1B1C1C] mb-4">Ajukan Keluhan Baru</h3>

          {/* Category Selector */}
          <p className="text-[10px] font-bold text-[#9E9E9E] tracking-widest mb-3">KATEGORI MASALAH</p>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'border-[#FF385C] bg-red-50 text-[#FF385C]'
                    : 'border-[#DDDDDD] bg-white text-[#222222] hover:border-[#AAAAAA]'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Detail */}
          <h4 className="text-sm font-bold text-[#1B1C1C] mb-2">Detail Keluhan</h4>
          <textarea
            rows={4}
            placeholder="Jelaskan masalah yang Anda alami secara detail..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm text-[#3F3F3F] resize-none focus:outline-none focus:border-[#FF385C] transition mb-5"
          />

          {/* Photo Upload */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-bold text-[#1B1C1C]">Bukti Foto</h4>
              <span className="text-xs text-[#9E9E9E]">(Opsional)</span>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative border border-[#DDDDDD] rounded-xl overflow-hidden group">
                <img src={imageUrl} alt="Bukti keluhan" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-md transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-[#DDDDDD] rounded-xl flex flex-col items-center justify-center py-8 gap-2 cursor-pointer hover:border-[#AAAAAA] transition bg-white"
              >
                {uploading ? (
                  <div className="text-sm font-semibold text-[#FF385C]">Mengunggah foto...</div>
                ) : (
                  <>
                    <Camera size={28} className="text-[#9E9E9E]" />
                    <p className="text-sm font-medium text-[#9E9E9E]">Unggah Bukti Foto</p>
                    <p className="text-xs text-[#BBBBBB]">Maks. 5MB (JPG/PNG)</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending || uploading}
            className="w-full bg-[#FF385C] text-white text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition cursor-pointer"
          >
            {sending ? 'Mengirim...' : (
              <>Kirim Keluhan <Send size={16} /></>
            )}
          </button>
        </form>

        {/* Active Complaints */}
        <h3 className="text-base font-bold text-[#1B1C1C] mb-3">
          {showAllHistory ? 'Riwayat Keluhan Anda' : 'Keluhan Aktif Anda'}
        </h3>
        
        {loadingComplaints ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-[#EBEBEB]">
            <p className="text-xs text-[#9E9E9E]">Memuat data keluhan...</p>
          </div>
        ) : displayedComplaints.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-[#EBEBEB]">
            <p className="text-xs text-[#9E9E9E]">
              {showAllHistory ? 'Belum ada riwayat keluhan' : 'Tidak ada keluhan aktif saat ini'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            {displayedComplaints.map((c) => {
              const badge = getStatusBadge(c.status);
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-[#EBEBEB] p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center shrink-0">
                        {getCategoryIcon(c.kategori)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1B1C1C]">
                          {getCategoryLabel(c.kategori)}
                        </p>
                        <p className="text-[10px] text-[#9E9E9E] font-medium mb-1">
                          {c.nama_kamar ? `Kamar: ${c.nama_kamar}` : 'Fasilitas Umum'} • {formatDate(c.created_at)}
                        </p>
                        <p className="text-xs text-[#6A6A6A] leading-relaxed mb-3">{c.detail_keluhan}</p>
                        
                        {c.gambar && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-gray-100 max-w-[150px]">
                            <img src={c.gambar} alt="Bukti keluhan" className="w-full h-20 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle History Button */}
        {complaints.length > 0 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full bg-white border border-[#DDDDDD] rounded-2xl py-4 text-sm font-semibold text-[#222222] hover:bg-gray-50 transition cursor-pointer mt-2"
          >
            {showAllHistory ? 'Tampilkan Keluhan Aktif Saja' : 'Lihat Semua Riwayat Keluhan'}
          </button>
        )}
      </div>
    </div>
  );
}
