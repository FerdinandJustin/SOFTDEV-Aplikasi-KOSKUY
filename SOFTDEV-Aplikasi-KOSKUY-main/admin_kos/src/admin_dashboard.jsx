import React, { useState, useEffect } from 'react';
import { API_URL } from './admin_app';
import logo from './logokuskuy.png';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

export default function AdminDashboard({ navigateTo, admin, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bkRes, roomRes] = await Promise.all([
        fetch(`${API_URL}?action=get_all_bookings`),
        fetch(`${API_URL}?action=get_rooms`),
      ]);
      const bkData = await bkRes.json();
      const roomData = await roomRes.json();
      if (bkData.status === 'success') setBookings(bkData.data);
      if (roomData.status === 'success') setRooms(roomData.data);
    } catch (err) {
      showToast('Koneksi server gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived stats — booking that is Sudah Bayar or Disetujui counts as revenue
  const totalRevenue = bookings
    .filter(b => b.status === 'Sudah Bayar' || b.status === 'Disetujui')
    .reduce((sum, b) => sum + parseInt(b.total_harga || 0), 0);

  const occupiedStandardUsers = new Set();
  const occupiedDeluxeUsers = new Set();

  bookings.forEach(b => {
    if (b.status === 'Sudah Bayar' || b.status === 'Disetujui') {
      if (b.kategori === 'Standard') {
        occupiedStandardUsers.add(b.user_id);
      } else if (b.kategori === 'Deluxe') {
        occupiedDeluxeUsers.add(b.user_id);
      }
    }
  });

  const occupiedStandard = occupiedStandardUsers.size;
  const occupiedDeluxe = occupiedDeluxeUsers.size;

  const totalOccupied = occupiedStandard + occupiedDeluxe;
  const occupancyPct = Math.round((totalOccupied / 22) * 100);

  // Status badge color
  const statusStyle = (status) => {
    if (status === 'Sudah Bayar' || status === 'Disetujui') return { bg: '#DCFCE7', color: '#166534', label: 'Lunas' };
    if (status === 'Ditolak' || status === 'Dibatalkan') return { bg: '#FFE4E6', color: '#9F1239', label: 'Batal' };
    return { bg: '#FEF9C3', color: '#854D0E', label: 'Menunggu' };
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0,
        background: '#FFFFFF', zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="KosKuy Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF385C', letterSpacing: '1px' }}>KosKuy</span>
        </div>
        <button
          onClick={() => navigateTo && navigateTo('account')}
          style={{
            width: '40px', height: '40px', background: '#FF385C', borderRadius: '50%',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(255,56,92,0.3)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </button>
      </header>

      <main style={{ padding: '24px', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111', margin: 0 }}>Ringkasan Hari Ini</h1>
          <p style={{ fontSize: '0.85rem', color: '#6A6A6A', marginTop: '6px' }}>
            Selamat datang kembali, Admin. Berikut adalah status properti anda saat ini.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6A6A6A' }}>Memuat data...</div>
        ) : (
          <>
            {/* Hero Card: Total Pendapatan */}
            <div style={{
              background: 'linear-gradient(160deg, #FED2DA 0%, rgba(254,210,218,0.5) 60%, #FFFFFF 100%)',
              border: '1px solid #FECDD3', borderRadius: '16px', padding: '20px', marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#FF385C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: 18, height: 18 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#6A6A6A', margin: 0 }}>Total Pendapatan</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F6022E', margin: '4px 0 0' }}>{formatPrice(totalRevenue)}</p>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #FECDD3', margin: '16px 0 12px' }} />
              <button
                onClick={() => navigateTo && navigateTo('transactions')}
                style={{ background: 'none', border: 'none', color: '#FF385C', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Lihat Laporan Pendapatan
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Total Kamar Card with progress bar */}
            <div style={{
              border: '2px solid #EBEBEB', borderRadius: '16px', padding: '20px', marginBottom: '16px', background: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#FEE9ED', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#FF385C" style={{ width: 18, height: 18 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-1.5-3-1m-3.102-4.32 3 1m-3.02 6.356 3-1" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#6A6A6A', margin: 0 }}>Total Kamar</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111111', margin: '2px 0 0' }}>{totalOccupied} / 22</p>
                  </div>
                </div>
                <span style={{
                  background: '#FEE9ED', color: '#FF385C', fontSize: '0.75rem', fontWeight: 700,
                  padding: '4px 10px', borderRadius: '8px',
                }}>
                  {occupancyPct}% Terisi
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: '#E3E2E2', borderRadius: '99px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#FF385C', borderRadius: '99px', width: `${occupancyPct}%`, transition: 'width 0.6s ease' }} />
              </div>
              <button
                onClick={() => navigateTo && navigateTo('kamar')}
                style={{ background: 'none', border: 'none', color: '#FF385C', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}
              >
                Kelola Kamar
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Kamar Tersedia & Terisi (2-col grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Tersedia */}
              <div style={{ border: '2px solid #EBEBEB', borderRadius: '16px', padding: '16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '36px', height: '36px', background: '#DCFCE7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#166534" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6A6A6A', margin: 0 }}>Kamar Standard</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111111', margin: '4px 0 0' }}>{occupiedStandard} / 15</p>
                <button
                  onClick={() => navigateTo && navigateTo('transactions', { category: 'Standard' })}
                  style={{ background: 'none', border: 'none', color: '#FF385C', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}
                >
                  Daftar Penyewa
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
              {/* Terisi */}
              <div style={{ border: '2px solid #EBEBEB', borderRadius: '16px', padding: '16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '36px', height: '36px', background: '#ECE4F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#6B21A8" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6A6A6A', margin: 0 }}>Kamar Deluxe</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111111', margin: '4px 0 0' }}>{occupiedDeluxe} / 7</p>
                <button
                  onClick={() => navigateTo && navigateTo('transactions', { category: 'Deluxe' })}
                  style={{ background: 'none', border: 'none', color: '#FF385C', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}
                >
                  Daftar Penyewa
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Riwayat Transaksi */}
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111111', marginBottom: '12px' }}>Riwayat Transaksi</h2>
              <div style={{ border: '1px solid #EBEBEB', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '340px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F0F0F0', background: '#F9F9F9' }}>
                        {['Penyewa', 'Kamar', 'Harga', 'Status'].map(h => (
                          <th key={h} style={{ padding: '12px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#555', textAlign: h === 'Kamar' || h === 'Status' ? 'center' : 'left' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 6).map((bk) => {
                        const s = statusStyle(bk.status);
                        return (
                          <tr key={bk.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                            <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E9E8E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#6A6A6A" style={{ width: 12, height: 12 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                                  </svg>
                                </div>
                                <span style={{ fontWeight: 600, color: '#111111', whiteSpace: 'nowrap' }}>{bk.username}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#555', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {bk.nama_kamar} ({bk.kategori})
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#111111', whiteSpace: 'nowrap' }}>
                              {formatPrice(bk.total_harga)}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
                                fontSize: '0.72rem', fontWeight: 700,
                                background: s.bg, color: s.color,
                              }}>
                                {s.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#6A6A6A', fontSize: '0.85rem' }}>
                            Belum ada transaksi
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0' }}>
                  <button
                    onClick={() => navigateTo && navigateTo('transactions')}
                    style={{ background: 'none', border: 'none', color: '#FF385C', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Lihat Transaksi Lainnya
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
