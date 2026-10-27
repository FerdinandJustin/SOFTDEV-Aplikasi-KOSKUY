import React, { useState, useEffect } from 'react';
import { API_URL } from './admin_app';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getEndDate = (startDateStr, durationMonths) => {
  if (!startDateStr || !durationMonths) return '-';
  const date = new Date(startDateStr);
  date.setMonth(date.getMonth() + parseInt(durationMonths));
  return formatDate(date);
};

export default function AdminTransaksi({ navigateTo, admin, showToast, initialCategory }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState(initialCategory || '');
  const [filterYear, setFilterYear] = useState('2026');

  useEffect(() => {
    setFilterCategory(initialCategory || '');
  }, [initialCategory]);

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
      const response = await fetch(`${API_URL}?action=get_all_bookings`);
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
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Disetujui' || status === 'Sudah Bayar') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: '99px' }}>
          Lunas
        </span>
      );
    }
    if (status === 'Menunggu Pembayaran') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '4px 10px', borderRadius: '99px' }}>
          Menunggu
        </span>
      );
    }
    if (status === 'Ditolak' || status === 'Dibatalkan') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '4px 10px', borderRadius: '99px' }}>
          Batal
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6A6A6A', background: '#F0F0F0', padding: '4px 10px', borderRadius: '99px' }}>
        {status}
      </span>
    );
  };

  const filtered = bookings.filter((bk) => {
    const d = new Date(bk.created_at);
    const bkYear = String(d.getFullYear());
    const bkMonth = String(d.getMonth() + 1).padStart(2, '0');
    if (filterYear && bkYear !== filterYear) return false;
    if (filterMonth && bkMonth !== filterMonth) return false;
    if (filterCategory && bk.kategori !== filterCategory) return false;
    return true;
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 24px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0,
        background: '#FFFFFF', zIndex: 40,
      }}>
        <button
          onClick={() => navigateTo('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#FF385C' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111' }}>Riwayat Transaksi Admin</span>
      </header>

      <main style={{ padding: '24px', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B1C1C', margin: '0 0 4px' }}>Daftar Transaksi</h2>
        <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '20px' }}>Lihat dan kelola seluruh transaksi penyewaan kosKuy.</p>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ flex: 1.2, height: '40px', padding: '0 8px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.82rem', color: '#111111', background: '#FFFFFF', outline: 'none' }}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ flex: 1.2, height: '40px', padding: '0 8px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.82rem', color: '#111111', background: '#FFFFFF', outline: 'none' }}
          >
            <option value="">Semua Kamar</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ width: '80px', height: '40px', padding: '0 8px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.82rem', color: '#111111', background: '#FFFFFF', outline: 'none' }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9E9E9E', fontSize: '0.9rem' }}>Memuat transaksi...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid #EBEBEB', borderRadius: '16px', background: '#FFFFFF' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D3D3D3" style={{ width: 40, height: 40, margin: '0 auto 12px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#222222', margin: '0 0 4px' }}>Belum ada transaksi</p>
            <p style={{ fontSize: '0.75rem', color: '#9E9E9E', margin: 0 }}>Coba ubah filter bulan atau tahun</p>
          </div>
        ) : (
          <div style={{ border: '1px solid #EBEBEB', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF' }}>
            {filtered.map((bk, idx) => (
              <div
                key={bk.id}
                style={{
                  display: 'flex', gap: '14px', padding: '20px 16px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                {/* User icon */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#6A6A6A" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1B1C1C', margin: 0, lineHeight: 1.3 }}>
                      {bk.username}
                    </p>
                    {getStatusBadge(bk.status)}
                  </div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555555', margin: '4px 0 0' }}>
                    {bk.nama_kamar} ({bk.kategori})
                  </p>
                  
                  {/* Date ranges */}
                  <div style={{ marginTop: '8px', padding: '10px 12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #F0F0F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6A6A6A' }}>
                      <span>Tanggal Mulai:</span>
                      <span style={{ fontWeight: 700, color: '#222222' }}>{formatDate(bk.tanggal_mulai)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6A6A6A', marginTop: '4px' }}>
                      <span>Tanggal Berakhir:</span>
                      <span style={{ fontWeight: 700, color: '#222222' }}>{getEndDate(bk.tanggal_mulai, bk.durasi_bulan)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6A6A6A', marginTop: '4px' }}>
                      <span>Durasi Sewa:</span>
                      <span style={{ fontWeight: 700, color: '#222222' }}>{bk.durasi_bulan} Bulan</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9E9E9E' }}>TRX-{String(bk.id).padStart(6, '0')}</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1B1C1C', margin: 0 }}>{formatPrice(bk.total_harga)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
