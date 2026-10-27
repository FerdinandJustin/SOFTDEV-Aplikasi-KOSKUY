import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Receipt, RefreshCw } from 'lucide-react';
import { API_URL } from './cus_app';

export default function CusTransaction({ navigateTo, user, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));

  const months = [
    { value: '', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  const years = ['2024', '2025', '2026', '2027'];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_booking_history&user_id=${user.id}`);
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setBookings(resData.data);
      } else {
        showToast('Gagal memuat riwayat transaksi', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(d.getDate()).padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    if (status === 'Disetujui' || status === 'Sudah Bayar') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
          <CheckCircle2 size={11} />
          Lunas
        </span>
      );
    }
    if (status === 'Menunggu Pembayaran') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
          <Clock size={11} />
          Menunggu
        </span>
      );
    }
    if (status === 'Ditolak' || status === 'Dibatalkan') {
      return (
        <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEE2E2] px-2.5 py-1 rounded-full">
          Batal
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-[#6A6A6A] bg-[#F0F0F0] px-2.5 py-1 rounded-full">
        {status}
      </span>
    );
  };

  // Filter by month/year based on created_at
  const filtered = bookings.filter((bk) => {
    const d = new Date(bk.created_at);
    const bkYear = String(d.getFullYear());
    const bkMonth = String(d.getMonth() + 1).padStart(2, '0');
    if (filterYear && bkYear !== filterYear) return false;
    if (filterMonth && bkMonth !== filterMonth) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans']">

      {/* Header — konsisten dengan halaman lain */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-[#EBEBEB] sticky top-0 z-10">
        <button
          onClick={() => navigateTo('history')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#FFF0F2] transition cursor-pointer"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} className="text-[#FF385C]" />
        </button>

        <h1 className="text-base font-bold text-[#1B1C1C]">Riwayat Transaksi</h1>

        <button
          onClick={fetchBookings}
          className="w-9 h-9 flex items-center justify-center text-[#6A6A6A] hover:text-[#FF385C] transition cursor-pointer"
          aria-label="Refresh"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="px-5 pt-5 pb-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#1B1C1C]">Transaksi Saya</h2>
        <p className="text-sm text-[#6A6A6A] mt-1 mb-5">Lihat dan lacak semua riwayat pembayaran Anda.</p>

        {/* Filter Bar */}
        <div className="flex gap-3 mb-5">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-1 h-10 px-3 border border-[#DDDDDD] rounded-xl text-sm text-[#1B1C1C] bg-white focus:outline-none focus:border-[#FF385C] cursor-pointer font-['Plus_Jakarta_Sans']"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-28 h-10 px-3 border border-[#DDDDDD] rounded-xl text-sm text-[#1B1C1C] bg-white focus:outline-none focus:border-[#FF385C] cursor-pointer font-['Plus_Jakarta_Sans']"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#9E9E9E]">Memuat transaksi...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={28} className="text-[#C8C8C8]" />
            </div>
            <p className="text-sm font-bold text-[#222222]">Belum ada transaksi</p>
            <p className="text-xs text-[#9E9E9E] mt-1">Coba ubah filter bulan atau tahun</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-sm">
            {filtered.map((bk, idx) => (
              <div
                key={bk.id}
                className={`flex items-start gap-4 px-5 py-5 ${idx < filtered.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt size={17} className="text-[#FF385C]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1B1C1C] leading-snug">
                    Sewa Bulanan – {bk.nama}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#9E9E9E]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{formatDate(bk.created_at)}</span>
                    <span className="text-[#D0D0D0]">•</span>
                    <span className="font-mono text-[10px] truncate">TRX-{String(bk.id).padStart(6, '0')}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-base font-bold text-[#1B1C1C]">{formatPrice(bk.total_harga)}</p>
                    {getStatusBadge(bk.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
