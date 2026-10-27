import React, { useState, useEffect } from 'react';
import { ShieldAlert, Star, RefreshCw, PlusCircle, Calendar, MapPin, User } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';
import standarImg from '../standar.png';
import deluxeImg from '../deluxe.png';

export default function CusHistory({ navigateTo, user, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'extend' | 'complaint' | 'review' | null
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Extension form state
  const [extendMonths, setExtendMonths] = useState(1);

  // Complaint form state
  const [complaintText, setComplaintText] = useState('');

  // Review form state
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_booking_history&user_id=${user.id}`);
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setBookings(resData.data);
      } else {
        showToast('Gagal memuat riwayat sewa', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate lease progress
  const getLeaseProgress = (bk) => {
    if (!bk.tanggal_mulai || !bk.durasi_bulan) return { pct: 0, bulanBerjalan: 0, sisaBulan: bk.durasi_bulan || 0, selesai: '-' };
    const start = new Date(bk.tanggal_mulai);
    const now = new Date();
    const totalBulan = parseInt(bk.durasi_bulan);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + totalBulan);

    const msPassed = Math.max(0, now - start);
    const msTotal = endDate - start;
    const pct = Math.min(100, Math.max(0, Math.round(msPassed / msTotal * 100)));
    const bulanBerjalan = Math.min(totalBulan, Math.floor(msPassed / (1000 * 60 * 60 * 24 * 30)) + 1);
    const sisaBulan = Math.max(0, totalBulan - Math.floor(msPassed / (1000 * 60 * 60 * 24 * 30)));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const selesai = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    const mulai = `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
    return { pct, bulanBerjalan, sisaBulan, selesai, mulai };
  };

  // 1. EXTEND LEASE HANDLER — creates new booking for extension then goes to payment
  const handleExtendLease = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}?action=extend_booking&id=${selectedBooking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durasi_bulan: extendMonths })
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        showToast('Perpanjangan berhasil dibuat! Silakan selesaikan pembayaran.');
        closeModal();
        // Navigate to payment with new booking id for extension
        const newBookingId = resData.booking_id || resData.new_booking_id;
        if (newBookingId) {
          navigateTo('payment', newBookingId);
        } else {
          fetchHistory();
        }
      } else {
        showToast(resData.message || 'Gagal memperpanjang sewa', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. SUBMIT COMPLAINT HANDLER
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}?action=create_complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          booking_id: selectedBooking.id,
          detail_keluhan: complaintText
        })
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        showToast('Keluhan berhasil dikirim ke pemilik!');
        closeModal();
      } else {
        showToast(resData.message || 'Gagal mengirim keluhan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. SUBMIT REVIEW HANDLER
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}?action=create_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          kamar_id: selectedBooking.kamar_id,
          rating: ratingVal,
          komentar: reviewText
        })
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        showToast('Terima kasih atas ulasan Anda!');
        closeModal();
      } else {
        showToast(resData.message || 'Gagal mengirim ulasan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type, bk) => {
    setSelectedBooking(bk);
    setActiveModal(type);
    setExtendMonths(1);
    setComplaintText('');
    setRatingVal(5);
    setReviewText('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedBooking(null);
  };

  // Show only active & pending bookings; completed/rejected go to Riwayat Transaksi
  const allApprovedBookings = bookings.filter(b => b.status === 'Disetujui' || b.status === 'Sudah Bayar');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Running: started already
  const activeBookings = allApprovedBookings.filter(b => {
    const start = new Date(b.tanggal_mulai);
    start.setHours(0, 0, 0, 0);
    return start <= today;
  });
  // Upcoming: start date is in the future (extension not yet active)
  const upcomingBookings = allApprovedBookings.filter(b => {
    const start = new Date(b.tanggal_mulai);
    start.setHours(0, 0, 0, 0);
    return start > today;
  });
  const pendingBookings = bookings.filter(b => b.status === 'Menunggu Pembayaran');
  const hasAnyBooking = allApprovedBookings.length > 0 || pendingBookings.length > 0;

  const getRoomImage = (bk) => {
    if (bk.gambar && bk.gambar !== 'deluxe.png' && bk.gambar !== 'standar.png' && !bk.gambar.includes('images.unsplash.com')) {
      return bk.gambar;
    }
    return bk.kategori === 'Deluxe' ? deluxeImg : standarImg;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans'] pb-28">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="KosKuy Logo" className="w-7 h-7 object-contain" />
          <h1 className="text-xl font-extrabold text-[#FF385C] tracking-wide">KosKuy</h1>
        </div>
        <button
          onClick={fetchHistory}
          className="w-9 h-9 flex items-center justify-center text-[#6A6A6A] hover:text-[#FF385C] transition cursor-pointer"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="px-5 pt-5">
        <h2 className="text-2xl font-bold text-[#1B1C1C] mb-5">Sewa Aktif</h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-sm text-[#9E9E9E] font-medium">Memuat riwayat transaksi...</p>
          </div>
        ) : !hasAnyBooking ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#EBEBEB]">
            <ShieldAlert size={40} className="text-[#D3D3D3] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#222222] mb-1">Belum ada sewa kamar</p>
            <p className="text-xs text-[#9E9E9E] mb-5">Temukan kamar sewa idamanmu sekarang</p>
            <button
              className="bg-[#FF385C] text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer hover:bg-opacity-90 transition"
              onClick={() => navigateTo('home')}
            >
              Cari Kamar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Active / Running Bookings */}
            {activeBookings.map((bk) => {
              const progress = getLeaseProgress(bk);
              return (
                <div key={bk.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB]">
                  {/* Room Image */}
                  <div className="relative">
                    <img
                      src={getRoomImage(bk)}
                      alt={bk.nama}
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse"></div>
                      <span className="text-xs font-semibold text-[#222222]">Aktif</span>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#1B1C1C] mb-1">KosKuy – {bk.nama}</h3>
                    <div className="flex items-center gap-1 text-xs text-[#6A6A6A] mb-4">
                      <MapPin size={12} className="text-[#FF385C]" />
                      <span>{bk.lokasi || 'Jakarta Barat'}</span>
                    </div>

                    {/* Price + Next Payment */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-xs text-[#9E9E9E]">Tarif Bulanan</p>
                        <p className="text-base font-bold text-[#1B1C1C]">{formatPrice(bk.harga)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9E9E9E]">Pembayaran berikutnya</p>
                        <p className="text-base font-bold text-[#1B1C1C]">{progress.selesai}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => openModal('review', bk)}
                        className="flex-1 py-3 rounded-xl border-2 border-[#FF385C] text-[#FF385C] text-sm font-semibold text-center hover:bg-red-50 transition cursor-pointer"
                      >
                        Beri Ulasan
                      </button>
                      <button
                        onClick={() => openModal('extend', bk)}
                        className="flex-1 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-semibold text-center hover:bg-opacity-90 transition cursor-pointer"
                      >
                        Perpanjang sewa
                      </button>
                      <button
                        onClick={() => openModal('complaint', bk)}
                        className="w-12 h-12 rounded-xl border border-[#DDDDDD] flex items-center justify-center text-[#6A6A6A] hover:bg-gray-50 transition cursor-pointer shrink-0"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Masa Sewa Card */}
                  <div className="mx-4 mb-4 bg-[#F9F7F7] rounded-xl border border-[#EBEBEB] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={18} className="text-[#FF385C]" />
                      <span className="text-sm font-bold text-[#1B1C1C]">Masa Sewa</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6A6A6A] mb-2">
                      <span>Mulai: <strong className="text-[#1B1C1C]">{progress.mulai}</strong></span>
                      <span>Selesai: <strong className="text-[#1B1C1C]">{progress.selesai}</strong></span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#E8E8E8] rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-[#FF385C] rounded-full transition-all duration-300"
                        style={{ width: `${progress.pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6A6A6A]">Bulan {progress.bulanBerjalan} dari {bk.durasi_bulan}</span>
                      <span className="text-[#FF385C] font-semibold">sisa {progress.sisaBulan} bulan</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#DDDDDD] flex justify-between items-center cursor-pointer" onClick={() => showToast('Detail kontrak akan segera tersedia', 'info')}>
                      <span className="text-sm font-semibold text-[#1B1C1C]">Lihat Detail Kontrak</span>
                      <span className="text-[#9E9E9E] text-base">›</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Upcoming / Future Extension Bookings */}
            {upcomingBookings.map((bk) => {
              const progress = getLeaseProgress(bk);
              return (
                <div key={bk.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB] opacity-80">
                  {/* Room Image — dimmed overlay */}
                  <div className="relative">
                    <img
                      src={getRoomImage(bk)}
                      alt={bk.nama}
                      className="w-full h-52 object-cover grayscale-[30%]"
                    />
                    {/* Dim overlay */}
                    <div className="absolute inset-0 bg-black/20 rounded-none"></div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#8E8E93]"></div>
                      <span className="text-xs font-semibold text-[#8E8E93]">Akan Datang</span>
                    </div>
                    {/* Upcoming banner */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                        <Calendar size={14} className="text-[#8E8E93] shrink-0" />
                        <p className="text-xs font-semibold text-[#444]">Mulai aktif: <span className="text-[#1B1C1C]">{progress.mulai}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#1B1C1C] mb-1">KosKuy – {bk.nama}</h3>
                    <div className="flex items-center gap-1 text-xs text-[#6A6A6A] mb-4">
                      <MapPin size={12} className="text-[#8E8E93]" />
                      <span>{bk.lokasi || 'Jakarta Barat'}</span>
                    </div>

                    {/* Price info */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-xs text-[#9E9E9E]">Tarif Bulanan</p>
                        <p className="text-base font-bold text-[#1B1C1C]">{formatPrice(bk.harga)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9E9E9E]">Durasi Sewa</p>
                        <p className="text-base font-bold text-[#1B1C1C]">{bk.durasi_bulan} bulan</p>
                      </div>
                    </div>

                    {/* Info note: no action buttons for upcoming */}
                    <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 py-3 mb-0">
                      <p className="text-xs text-[#6A6A6A] text-center">
                        📅 Perpanjangan sewa ini akan aktif otomatis mulai <span className="font-bold text-[#1B1C1C]">{progress.mulai}</span>
                      </p>
                    </div>
                  </div>

                  {/* Masa Sewa Card */}
                  <div className="mx-4 mb-4 bg-[#F9F7F7] rounded-xl border border-[#EBEBEB] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={18} className="text-[#8E8E93]" />
                      <span className="text-sm font-bold text-[#6A6A6A]">Jadwal Sewa</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6A6A6A] mb-2">
                      <span>Mulai: <strong className="text-[#1B1C1C]">{progress.mulai}</strong></span>
                      <span>Selesai: <strong className="text-[#1B1C1C]">{progress.selesai}</strong></span>
                    </div>
                    {/* Progress bar (0% since not started) */}
                    <div className="w-full h-2 bg-[#E8E8E8] rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-[#C0C0C0] rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9E9E9E]">Belum dimulai</span>
                      <span className="text-[#8E8E93] font-semibold">{bk.durasi_bulan} bulan</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pending Payment */}
            {pendingBookings.map((bk) => (
              <div key={bk.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB]">
                <div className="relative">
                  <img
                    src={getRoomImage(bk)}
                    alt={bk.nama}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#F5A623]"></div>
                    <span className="text-xs font-semibold text-[#222222]">Belum Bayar</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#1B1C1C] mb-0.5">KosKuy – {bk.nama}</h3>
                  <div className="flex items-center gap-1 text-xs text-[#6A6A6A] mb-4">
                    <MapPin size={12} className="text-[#FF385C]" />
                    <span>{bk.lokasi || 'Jakarta Barat'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Total Tagihan</p>
                      <p className="text-base font-bold text-[#1B1C1C]">{formatPrice(bk.total_harga)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9E9E9E]">Durasi Sewa</p>
                      <p className="text-sm font-bold text-[#1B1C1C]">{bk.durasi_bulan} bulan</p>
                    </div>
                  </div>
                  <button
                    className="w-full bg-[#FF385C] text-white text-sm font-semibold py-3 rounded-xl hover:bg-opacity-90 transition cursor-pointer"
                    onClick={() => navigateTo('payment', bk.id)}
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== MODAL OVERLAYS ==================== */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-[150]"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-5"></div>
            <h3 className="text-base font-bold text-[#1B1C1C] mb-4">
              {activeModal === 'extend' && 'Perpanjang Masa Sewa'}
              {activeModal === 'complaint' && 'Ajukan Keluhan Kos'}
              {activeModal === 'review' && 'Beri Ulasan Kamar'}
            </h3>

            {/* EXTEND LEASE FORM */}
            {activeModal === 'extend' && (
              <form onSubmit={handleExtendLease}>
                <div className="bg-[#FFF5F7] border border-[#FFD6DE] rounded-xl p-3 mb-4">
                  <p className="text-xs text-[#FF385C] font-semibold">💳 Perpanjang sewa akan membuat tagihan baru dan Anda akan diarahkan ke halaman pembayaran.</p>
                </div>
                <label className="text-xs font-semibold text-[#6A6A6A] block mb-1.5">Durasi Tambahan (Bulan)</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF385C] mb-3"
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-xs text-[#9E9E9E] mb-4">
                  Estimasi Biaya: <span className="font-bold text-[#FF385C]">{formatPrice((selectedBooking?.harga || 0) * extendMonths)}</span>
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-[#DDDDDD] text-sm font-semibold text-[#6A6A6A] cursor-pointer">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-semibold cursor-pointer hover:bg-opacity-90 transition">
                    {submitting ? 'Menyimpan...' : 'Perpanjang'}
                  </button>
                </div>
              </form>
            )}

            {/* SUBMIT COMPLAINT FORM */}
            {activeModal === 'complaint' && (
              <form onSubmit={handleSubmitComplaint}>
                <label className="text-xs font-semibold text-[#6A6A6A] block mb-1.5">Detail Keluhan / Masalah</label>
                <textarea
                  required
                  rows="4"
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#FF385C] mb-4"
                  placeholder="Contoh: AC bocor, saluran pembuangan tersumbat, wifi mati..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-[#DDDDDD] text-sm font-semibold text-[#6A6A6A] cursor-pointer">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-semibold cursor-pointer hover:bg-opacity-90 transition">
                    {submitting ? 'Mengirim...' : 'Kirim Keluhan'}
                  </button>
                </div>
              </form>
            )}

            {/* ROOM REVIEW FORM */}
            {activeModal === 'review' && (
              <form onSubmit={handleSubmitReview}>
                <label className="text-xs font-semibold text-[#6A6A6A] block mb-2 text-center">Bintang Penilaian</label>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      onClick={() => setRatingVal(star)}
                      className="cursor-pointer transition"
                      style={star <= ratingVal ? { fill: '#FFB100', stroke: '#FFB100' } : { fill: 'none', stroke: '#D3D3D3' }}
                    />
                  ))}
                </div>
                <label className="text-xs font-semibold text-[#6A6A6A] block mb-1.5">Ulasan Singkat</label>
                <textarea
                  required
                  rows="3"
                  className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#FF385C] mb-4"
                  placeholder="Tulis ulasan tentang kamar, kebersihan, pemilik kos..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-[#DDDDDD] text-sm font-semibold text-[#6A6A6A] cursor-pointer">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-semibold cursor-pointer hover:bg-opacity-90 transition">
                    {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
