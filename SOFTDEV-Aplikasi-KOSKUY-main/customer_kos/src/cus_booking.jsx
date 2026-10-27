import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { API_URL } from './cus_app';
import standarImg from '../standar.png';
import deluxeImg from '../deluxe.png';

export default function CusBooking({ room, navigateTo, user, showToast }) {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) {
      navigateTo('home');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, [room]);

  if (!room) return null;

  const isDeluxe = room.kategori === 'Deluxe';
  const roomImage = (room.gambar && room.gambar !== 'deluxe.png' && room.gambar !== 'standar.png' && !room.gambar.includes('images.unsplash.com'))
    ? room.gambar
    : (isDeluxe ? deluxeImg : standarImg);

  const totalHarga = room.harga * duration;

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=create_booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          kamar_id: room.id,
          tanggal_mulai: startDate,
          durasi_bulan: duration
        })
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        showToast('Pesanan berhasil dibuat! Silakan bayar.');
        navigateTo('payment', resData.booking_id);
      } else {
        showToast(resData.message || 'Gagal membuat pesanan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans']">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-[#EBEBEB] sticky top-0 z-10">
        <button
          onClick={() => navigateTo('detail', room.id)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFF0F2] transition cursor-pointer"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} className="text-[#FF385C]" />
        </button>
        <h1 className="text-base font-bold text-[#1B1C1C]">Formulir Booking</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 pt-5 pb-8 flex flex-col gap-5">

        {/* Room Info Card — foto horizontal besar */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB]">
          <img
            src={roomImage}
            alt={room.nama}
            className="w-full h-52 object-cover"
          />
          <div className="p-4">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${
              isDeluxe
                ? 'bg-[#FFF8E6] text-[#B27B00]'
                : 'bg-[#E6FEF4] text-[#008A52]'
            }`}>
              {room.kategori}
            </span>
            <h2 className="text-base font-bold text-[#1B1C1C]">{room.nama}</h2>
            <p className="text-sm text-[#FF385C] font-bold mt-0.5">{formatPrice(room.harga)} <span className="text-[#9E9E9E] font-normal">/ bulan</span></p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-5">
          <h3 className="text-base font-bold text-[#1B1C1C] mb-5">Rincian Sewa</h3>

          <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">

            {/* Tanggal Mulai */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                <Calendar size={14} className="text-[#FF385C]" />
                Mulai Tanggal Masuk
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 px-4 border border-[#DDDDDD] rounded-xl text-sm text-[#1B1C1C] bg-white focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/10 transition font-['Plus_Jakarta_Sans'] cursor-pointer"
              />
            </div>

            {/* Durasi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                <Clock size={14} className="text-[#FF385C]" />
                Durasi Sewa (Bulan)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDuration(d => Math.max(1, d - 1))}
                  className="w-12 h-12 rounded-xl border border-[#DDDDDD] flex items-center justify-center text-[#1B1C1C] text-xl font-bold hover:border-[#FF385C] hover:text-[#FF385C] transition cursor-pointer shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="36"
                  required
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-12 px-4 border border-[#DDDDDD] rounded-xl text-sm text-center font-bold text-[#1B1C1C] bg-white focus:outline-none focus:border-[#FF385C] transition font-['Plus_Jakarta_Sans']"
                />
                <button
                  type="button"
                  onClick={() => setDuration(d => Math.min(36, d + 1))}
                  className="w-12 h-12 rounded-xl border border-[#DDDDDD] flex items-center justify-center text-[#1B1C1C] text-xl font-bold hover:border-[#FF385C] hover:text-[#FF385C] transition cursor-pointer shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rincian Harga */}
            <div className="bg-[#F9F7F7] border border-[#EBEBEB] rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-[#1B1C1C] mb-3">Rincian Harga</h4>
              <div className="flex justify-between text-sm">
                <span className="text-[#6A6A6A]">Sewa ({duration} Bulan)</span>
                <span className="font-semibold text-[#1B1C1C]">{formatPrice(room.harga * duration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6A6A6A]">Biaya Layanan</span>
                <span className="font-semibold text-[#1B1C1C]">0</span>
              </div>
              <div className="h-px bg-[#EBEBEB] my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-base font-bold text-[#1B1C1C]">Total</span>
                <span className="text-xl font-bold text-[#FF385C]">{formatPrice(totalHarga)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition ${
                loading
                  ? 'bg-[#DDDDDD] cursor-not-allowed text-[#9E9E9E]'
                  : 'bg-[#FF385C] hover:bg-opacity-90 cursor-pointer'
              }`}
            >
              {loading ? 'Memproses pesanan...' : (
                <>
                  <span>Lanjut ke Pembayaran</span>
                  <span>›</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#9E9E9E]">Pembayaran Anda aman dan terenkripsi.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
