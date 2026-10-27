import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from './admin_app';
import logo from './logokuskuy.png';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

function StarDisplay({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill={s <= rating ? '#FF385C' : 'none'} stroke={s <= rating ? '#FF385C' : '#D1D5DB'}
          strokeWidth={1.5} style={{ width: size, height: size }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ))}
    </div>
  );
}

// ── Ulasan Tab ─────────────────────────────────────────────────────────────────
function TabUlasan({ showToast }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(6);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = ratingFilter > 0 ? `${API_URL}?action=get_all_reviews&rating=${ratingFilter}` : `${API_URL}?action=get_all_reviews`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        setReviews(data.data);
        setStats(data.stats);
      }
    } catch {
      showToast('Gagal memuat ulasan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [ratingFilter]);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}?action=reply_review&id=${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balasan_admin: replyText }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('Balasan berhasil disimpan!');
        setReplyTarget(null);
        setReplyText('');
        fetchReviews();
      } else {
        showToast(data.message || 'Gagal menyimpan balasan', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter(r =>
    search === '' || r.username?.toLowerCase().includes(search.toLowerCase()) ||
    r.komentar?.toLowerCase().includes(search.toLowerCase()) ||
    r.nama_kamar?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '14px', padding: '16px', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6A6A6A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rata – Rata Rating</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111' }}>{stats.avg_rating || '0'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF385C" style={{ width: 22, height: 22 }}>
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '14px', padding: '16px', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6A6A6A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Review</p>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111' }}>{stats.total?.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #F0F0F0', marginBottom: '16px' }}>
        <button onClick={() => setRatingFilter(0)}
          style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: ratingFilter === 0 ? 800 : 500, color: ratingFilter === 0 ? '#111' : '#6A6A6A', borderBottom: ratingFilter === 0 ? '2px solid #111' : '2px solid transparent', marginBottom: '-2px' }}>
          Semua ({reviews.length})
        </button>
        <button onClick={() => setRatingFilter(ratingFilter > 0 ? 0 : 1)}
          style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: ratingFilter > 0 ? 800 : 500, color: ratingFilter > 0 ? '#111' : '#6A6A6A', borderBottom: ratingFilter > 0 ? '2px solid #111' : '2px solid transparent', marginBottom: '-2px' }}>
          Bintang 1–5
        </button>
      </div>

      {/* Rating quick filter */}
      {ratingFilter > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {[1, 2, 3, 4, 5].map(r => (
            <button key={r} onClick={() => setRatingFilter(r)}
              style={{ padding: '4px 10px', borderRadius: '99px', border: `1.5px solid ${ratingFilter === r ? '#FF385C' : '#DDDDDD'}`, background: ratingFilter === r ? '#FFF0F2' : 'transparent', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: ratingFilter === r ? '#FF385C' : '#6A6A6A' }}>
              {r}★
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6A6A6A', padding: '40px 0' }}>Memuat ulasan...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6A6A6A' }}>
          <p style={{ fontWeight: 600 }}>Belum ada ulasan</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.slice(0, page).map(r => (
              <div key={r.id} style={{ border: '1.5px solid #EBEBEB', borderRadius: '16px', padding: '16px', background: '#FFFFFF' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6A6A6A" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', margin: 0 }}>{r.username}</p>
                      <p style={{ fontSize: '0.75rem', color: '#6A6A6A', margin: '2px 0 0' }}>
                        {r.nama_kamar} • {formatDate(r.created_at)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StarDisplay rating={r.rating} />
                    <span style={{ fontSize: '0.7rem', color: '#6A6A6A', border: '1px solid #EBEBEB', borderRadius: '6px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      🌐 Publik
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: '1.6', margin: '0 0 10px' }}>{r.komentar}</p>

                {/* Admin Reply (if exists) */}
                {r.balasan_admin && (
                  <div style={{ background: '#F8F8F8', border: '1px solid #EBEBEB', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111' }}>Balasan Admin</span>
                      <span style={{ fontSize: '0.72rem', color: '#6A6A6A' }}>{formatDate(r.tanggal_balasan)}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#444', margin: 0, lineHeight: '1.5' }}>{r.balasan_admin}</p>
                  </div>
                )}

                {/* Reply Input (if active) */}
                {replyTarget === r.id && (
                  <div style={{ marginBottom: '10px' }}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Tulis balasan admin..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #FF385C', borderRadius: '10px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleReply(r.id)} disabled={submitting}
                        style={{ padding: '8px 16px', background: '#111', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {submitting ? '...' : 'Kirim'}
                      </button>
                      <button onClick={() => { setReplyTarget(null); setReplyText(''); }}
                        style={{ padding: '8px 16px', background: 'transparent', color: '#6A6A6A', border: '1px solid #DDDDDD', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => { setReplyTarget(r.id); setReplyText(r.balasan_admin || ''); }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Lihat Lebih Lengkap...
                  </button>
                  {r.balasan_admin ? (
                    <button onClick={() => { setReplyTarget(r.id); setReplyText(r.balasan_admin); }}
                      style={{ padding: '8px 16px', background: 'transparent', color: '#111', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Edit Balas
                    </button>
                  ) : (
                    <button onClick={() => { setReplyTarget(r.id); setReplyText(''); }}
                      style={{ padding: '8px 16px', background: '#111', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Balas
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length > page && (
            <button onClick={() => setPage(prev => prev + 6)}
              style={{ width: '100%', padding: '14px', marginTop: '16px', background: '#F0F0F0', border: 'none', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, color: '#333', cursor: 'pointer', fontFamily: 'inherit' }}>
              Muat Lebih Banyak Ulasan
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Keluhan Tab ────────────────────────────────────────────────────────────────
function TabKeluhan({ showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, high_priority: 0, need_attention: 0, unresolved: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(5);
  const [processing, setProcessing] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=get_complaints_admin`);
      const data = await res.json();
      if (data.status === 'success') {
        setComplaints(data.data);
        setStats(data.stats);
      }
    } catch {
      showToast('Gagal memuat keluhan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleProcess = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Diproses' : 'Selesai';
    setProcessing(id);
    try {
      const res = await fetch(`${API_URL}?action=update_complaint_status&id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(`Keluhan berhasil di-update ke ${nextStatus}`);
        fetchComplaints();
      } else {
        showToast(data.message || 'Gagal update status', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleTogglePriority = async (id, currentPriority) => {
    const newPriority = currentPriority === 'Tinggi' ? 'Normal' : 'Tinggi';
    try {
      await fetch(`${API_URL}?action=update_complaint_status&id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: complaints.find(c => c.id == id)?.status || 'Pending', prioritas: newPriority }),
      });
      fetchComplaints();
    } catch { /* silent */ }
  };

  const filtered = complaints.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return c.status === 'Pending';
    if (activeFilter === 'proses') return c.status === 'Diproses';
    return true;
  });

  const statusBadge = (status) => {
    if (status === 'Selesai') return { bg: '#DCFCE7', color: '#166534', label: 'SELESAI' };
    if (status === 'Diproses') return { bg: '#DBEAFE', color: '#1E40AF', label: 'DIPROSES' };
    return { bg: '#F3F4F6', color: '#374151', label: 'TERTUNDA' };
  };

  return (
    <div>
      {/* Stats Grid 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '14px', padding: '16px', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6A6A6A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Keluhan</p>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{stats.total}</span>
        </div>
        <div style={{ border: '1.5px solid #FECDD3', borderRadius: '14px', padding: '16px', background: '#FFF0F2' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FF385C', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prioritas Tinggi</p>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#FF385C' }}>{stats.high_priority}!</span>
        </div>
        <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '14px', padding: '16px', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6A6A6A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Membutuhkan Perhatian</p>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{stats.need_attention}</span>
        </div>
        <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '14px', padding: '16px', background: '#FFFFFF' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6A6A6A', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Belum Terselesaikan</p>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{stats.unresolved}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #F0F0F0', marginBottom: '16px' }}>
        {[
          { key: 'all', label: `Semua (${complaints.length})` },
          { key: 'pending', label: 'Belum Ditugaskan' },
          { key: 'proses', label: 'Dalam Pengerjaan' },
        ].map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: activeFilter === f.key ? 800 : 500, color: activeFilter === f.key ? '#111' : '#6A6A6A', borderBottom: activeFilter === f.key ? '2px solid #111' : '2px solid transparent', marginBottom: '-2px', whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6A6A6A', padding: '40px 0' }}>Memuat keluhan...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6A6A6A' }}>
          <p style={{ fontWeight: 600 }}>Tidak ada keluhan</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.slice(0, page).map(c => {
              const s = statusBadge(c.status);
              const isHighPrio = (c.prioritas || 'Normal') === 'Tinggi';
              return (
                <div key={c.id} style={{ border: '1.5px solid #EBEBEB', borderRadius: '16px', padding: '16px', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6A6A6A" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', margin: 0 }}>
                            {c.nama_kamar ? `Keluhan Kamar - ${c.nama_kamar}` : 'Keluhan Umum'}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6A6A6A', margin: '2px 0 0' }}>
                            {c.kategori ? `[${c.kategori.charAt(0).toUpperCase() + c.kategori.slice(1)}] ` : ''}{c.nama_kamar || 'Umum'} • {c.username}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#B0B0B0', margin: '2px 0 0' }}>{formatDate(c.created_at)}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          {isHighPrio && (
                            <span style={{ background: '#FF385C', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                              PRIORITAS TINGGI
                            </span>
                          )}
                          <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: '1.6', margin: '0 0 12px' }}>
                    {c.detail_keluhan}
                  </p>

                  {c.gambar && (
                    <div style={{ marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #EBEBEB' }}>
                      <img src={c.gambar} alt="Bukti Keluhan" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', margin: '10px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handleTogglePriority(c.id, c.prioritas || 'Normal')}
                      style={{ background: 'none', border: 'none', color: isHighPrio ? '#FF385C' : '#6A6A6A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      {isHighPrio ? '⬇ Turunkan Prioritas' : '⬆ Prioritas Tinggi'}
                    </button>
                    {c.status !== 'Selesai' && (
                      <button onClick={() => handleProcess(c.id, c.status)} disabled={processing === c.id}
                        style={{ padding: '9px 20px', background: '#111111', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {processing === c.id ? '...' : c.status === 'Pending' ? 'Proses' : 'Selesaikan'}
                      </button>
                    )}
                    {c.status === 'Selesai' && (
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>✓ Selesai</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > page && (
            <button onClick={() => setPage(prev => prev + 5)}
              style={{ width: '100%', padding: '14px', marginTop: '16px', background: '#F0F0F0', border: 'none', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, color: '#333', cursor: 'pointer', fontFamily: 'inherit' }}>
              Muat Lebih Banyak Ulasan
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Laporan Component ─────────────────────────────────────────────────────
export default function AdminLaporan({ navigateTo, admin, showToast }) {
  const [activeTab, setActiveTab] = useState('ulasan');
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", paddingBottom: '80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="KosKuy Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF385C', letterSpacing: '1px' }}>KosKuy</span>
        </div>
        <button onClick={() => navigateTo && navigateTo('account')} style={{ width: '40px', height: '40px', background: '#FF385C', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,56,92,0.3)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
          </svg>
        </button>
      </header>

      <main style={{ padding: '24px', maxWidth: '450px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Title */}
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>Manajemen Ulasan</h1>
        <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '20px' }}>Pantau dan tanggapi masukkan penyewa di seluruh properti.</p>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6A6A6A' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari ulasan..."
              style={{ width: '100%', padding: '11px 14px 11px 36px', border: '1.5px solid #EBEBEB', borderRadius: '12px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }}
            />
          </div>
          <button style={{ width: '44px', height: '44px', border: '1.5px solid #EBEBEB', borderRadius: '12px', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#6A6A6A" style={{ width: 18, height: 18 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', background: '#F7F7F7', padding: '4px', borderRadius: '14px', gap: '4px', marginBottom: '20px' }}>
          {[{ key: 'ulasan', label: 'Ulasan' }, { key: 'keluhan', label: 'Keluhan' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', fontWeight: activeTab === t.key ? 700 : 500,
                background: activeTab === t.key ? '#FF385C' : 'transparent',
                color: activeTab === t.key ? '#FFFFFF' : '#6A6A6A',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'ulasan' ? (
          <TabUlasan showToast={showToast} search={search} />
        ) : (
          <TabKeluhan showToast={showToast} />
        )}
      </main>
    </div>
  );
}
