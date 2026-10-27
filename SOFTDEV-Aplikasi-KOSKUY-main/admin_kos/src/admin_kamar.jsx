import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from './admin_app';
import logo from './logokuskuy.png';

// Hanya 5 fasilitas sesuai permintaan + tombol Tambah
const FACILITY_OPTIONS = [
  { key: 'WiFi', label: 'WiFi', icon: '📶' },
  { key: 'AC', label: 'AC', icon: '❄️' },
  { key: 'Parkir', label: 'Parkir', icon: '🅿' },
  { key: 'Water Heater', label: 'Water Heater', icon: '🚿' },
  { key: 'K. Lebih Luas', label: 'K. Lebih Luas', icon: '🛏' },
];

// Kapasitas kamar yang diizinkan
const MAX_STANDARD = 15;
const MAX_DELUXE = 7;
const MAX_TOTAL = 22;

const formatPrice = (p) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);

const RoomImage = ({ src, alt }) => {
  const fallback = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80';
  const resolved =
    !src ? fallback
    : src === 'standar.png' ? 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
    : src === 'deluxe.png' ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    : src;
  return <img src={resolved} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = fallback; }} />;
};

// Upload gambar ke server XAMPP
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}?action=upload_image`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (data.status === 'success') return data.url;
  throw new Error(data.message || 'Upload gagal');
};

// ── Fasilitas Management Tab ──────────────────────────────────────────────────
function ManajemenFasilitas({ showToast, navigateTo }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('list'); // 'list' | 'add' | 'edit'
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', gambar: '' });
  const [saving, setSaving] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=get_facilities`);
      const data = await res.json();
      if (data.status === 'success') setFacilities(data.data);
    } catch {
      // If endpoint doesn't exist yet, use empty
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, []);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, gambar: url }));
      showToast('Foto berhasil diunggah!');
    } catch (e) {
      showToast(e.message || 'Gagal mengunggah foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const action = editData ? `edit_facility&id=${editData.id}` : 'add_facility';
      const res = await fetch(`${API_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editData ? 'Fasilitas berhasil diperbarui!' : 'Fasilitas berhasil ditambahkan!');
        setViewState('list');
        fetchFacilities();
      } else {
        showToast(data.message || 'Gagal menyimpan fasilitas', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus fasilitas ini?')) return;
    try {
      const res = await fetch(`${API_URL}?action=delete_facility&id=${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') { showToast('Fasilitas dihapus!'); fetchFacilities(); }
      else showToast(data.message || 'Gagal menghapus', 'error');
    } catch {
      showToast('Koneksi server gagal', 'error');
    }
  };

  const openAdd = () => { setEditData(null); setForm({ nama: '', deskripsi: '', gambar: '' }); setViewState('add'); };
  const openEdit = (f) => { setEditData(f); setForm({ nama: f.nama, deskripsi: f.deskripsi, gambar: f.gambar || '' }); setViewState('edit'); };

  const SAMPLE_FACILITIES = [
    { id: 's1', nama: 'Dapur Bersama', deskripsi: 'Tersedia dapur bersama yang dilengkapi berbagai fasilitas untuk menunjang kebutuhan memasak penghuni.\n• Kompor siap pakai\n• Alat masak lengkap\n• Alat makan tersedia\n• Area dapur bersih dan nyaman', gambar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80' },
    { id: 's2', nama: 'Area Parkiran', deskripsi: '• Area parkir luas untuk mobil dan motor\n• Akses keluar-masuk kendaraan yang mudah\n• Lingkungan parkir rapi dan nyaman untuk penghuni', gambar: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80' },
    { id: 's3', nama: 'Balkon', deskripsi: 'Tersedia balkon yang luas dan nyaman untuk bersantai. Balkon juga dilengkapi area mencuci dan menjemur pakaian serta mesin cuci yang dapat digunakan secara gratis.\n• Mesin cuci gratis\n• Area jemur pakaian\n• Balkon luas untuk bersantai\n• Ventilasi dan pencahayaan yang baik', gambar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  ];

  const displayFacilities = facilities.length > 0 ? facilities : SAMPLE_FACILITIES;

  if (viewState === 'add' || viewState === 'edit') {
    return (
      <div>
        {/* Sub-header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button onClick={() => setViewState('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#111' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: 0 }}>
            {editData ? 'Edit Manajemen Fasilitas' : 'Tambah Manajemen Fasilitas'}
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '20px', marginLeft: '32px' }}>Kelola detail seluruh fasilitas properti anda.</p>

        <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '20px' }}>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Nama Fasilitas</label>
              <input
                required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
                placeholder="Dapur Bersama"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Unggah Foto Fasilitas</label>
              <input
                ref={fileInputRef}
                type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); }}
              />
              {form.gambar ? (
                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={form.gambar} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setForm({ ...form, gambar: '' })} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(220,38,38,0.85)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed #DDDDDD', borderRadius: '12px', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#FFFFFF', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#AAAAAA'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#DDDDDD'}
                >
                  {uploading ? (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FF385C', margin: 0 }}>Mengunggah foto...</p>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9E9E9E" style={{ width: 28, height: 28 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9E9E9E', margin: 0 }}>Unggah Foto</p>
                      <p style={{ fontSize: '0.75rem', color: '#BBBBBB', margin: 0 }}>Maks. 5MB (JPG/PNG/WEBP)</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Deskripsi Fasilitas</label>
              <textarea
                required rows={5} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Tulis deskripsi fasilitas..."
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit" disabled={saving}
              style={{ padding: '14px 28px', background: saving ? '#DDDDDD' : '#FF385C', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>Manajemen Fasilitas</h1>
      <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '20px' }}>Kelola fasilitas dan detailnya properti anda.</p>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6A6A6A', padding: '40px 0' }}>Memuat...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayFacilities.map((f) => (
            <div key={f.id} style={{ border: '1px solid #EBEBEB', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF' }}>
              {f.gambar && (
                <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img src={f.gambar} alt={f.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{f.nama}</h3>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6A6A6A', margin: '0 0 8px' }}>Deskripsi</p>
                <p style={{ fontSize: '0.83rem', color: '#444', margin: 0, whiteSpace: 'pre-line', lineHeight: '1.6' }}>{f.deskripsi}</p>
                <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => openEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#111' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#C13515' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.184v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openAdd}
        style={{
          position: 'fixed', bottom: '90px', right: 'max(24px, calc(50% - 225px + 24px))', width: '56px', height: '56px',
          background: '#FF385C', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(255,56,92,0.4)', zIndex: 45,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}

// ── Room Form ─────────────────────────────────────────────────────────────────
function RoomForm({ initialData, onBack, onSave, isEdit, rooms }) {
  const [form, setForm] = useState({
    nama: initialData?.nama || '',
    kategori: initialData?.kategori || 'Standard',
    harga: initialData?.harga || '',
    lokasi: initialData?.lokasi || '',
    deskripsi: initialData?.deskripsi || '',
    gambar: initialData?.gambar || '',
  });
  const [selectedFacs, setSelectedFacs] = useState(() => {
    if (!initialData?.fasilitas) return [];
    return initialData.fasilitas.split(',').map(f => f.trim()).filter(Boolean);
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Hitung kapasitas saat ini
  const existingStandard = (rooms || []).filter(r => r.kategori === 'Standard' && (!isEdit || r.id !== initialData?.id)).length;
  const existingDeluxe = (rooms || []).filter(r => r.kategori === 'Deluxe' && (!isEdit || r.id !== initialData?.id)).length;
  const canAddStandard = isEdit ? true : existingStandard < MAX_STANDARD;
  const canAddDeluxe = isEdit ? true : existingDeluxe < MAX_DELUXE;

  const toggleFac = (key) => {
    setSelectedFacs(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, gambar: url }));
    } catch (e) {
      alert(e.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Cek kapasitas kamar
    if (!isEdit) {
      if (form.kategori === 'Standard' && existingStandard >= MAX_STANDARD) {
        alert(`Batas kamar Standard sudah penuh (${MAX_STANDARD} kamar)`);
        return;
      }
      if (form.kategori === 'Deluxe' && existingDeluxe >= MAX_DELUXE) {
        alert(`Batas kamar Deluxe sudah penuh (${MAX_DELUXE} kamar)`);
        return;
      }
    }
    setSaving(true);
    let finalGambar = (form.gambar || '').trim();
    if (!finalGambar) finalGambar = form.kategori === 'Deluxe'
      ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80';
    try {
      const action = isEdit ? `edit_room&id=${initialData.id}` : 'add_room';
      const res = await fetch(`${API_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, harga: parseInt(form.harga), fasilitas: selectedFacs.join(', '), gambar: finalGambar }),
      });
      const data = await res.json();
      if (data.status === 'success') onSave(isEdit ? 'Kamar berhasil diperbarui!' : 'Kamar baru berhasil ditambahkan!');
      else onSave(null, data.message || 'Gagal menyimpan');
    } catch {
      onSave(null, 'Koneksi server gagal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#111' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: 0 }}>
          {isEdit ? 'Edit Manajemen Kamar' : 'Tambah Manajemen Kamar'}
        </h2>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '20px', marginLeft: '32px' }}>
        Kelola ketersediaan, harga, dan detail seluruh kamar properti anda.
      </p>

      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Tipe Kamar */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Tipe Kamar</label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}
                style={{ width: '100%', padding: '12px 36px 12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', appearance: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
              >
                <option value="Standard">Kamar Standard</option>
                <option value="Deluxe">Kamar Deluxe</option>
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6A6A6A' }}>▾</span>
            </div>
          </div>

          {/* Nama Kamar */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Nama Kamar</label>
            <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Kamar Standard 101"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }} />
          </div>

          {/* Harga */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Harga Kamar</label>
            <input required type="number" value={form.harga} onChange={e => setForm({ ...form, harga: e.target.value })} placeholder="Rp 1.600.000"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }} />
          </div>

          {/* Keterangan / Lokasi */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Keterangan Kamar</label>
            <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} placeholder="Kamar Minimalis, PK AC 1/2"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }} />
          </div>

          {/* Fasilitas Toggle Grid — 5 pilihan + Tambah */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '12px' }}>Fasilitas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {FACILITY_OPTIONS.map(f => {
                const active = selectedFacs.includes(f.key);
                return (
                  <button key={f.key} type="button" onClick={() => toggleFac(f.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                      border: `1.5px solid ${active ? '#FF385C' : '#DDDDDD'}`,
                      borderRadius: '10px', background: active ? '#FFF0F2' : '#FAFAFA',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                      color: active ? '#FF385C' : '#444', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                    {f.label}
                  </button>
                );
              })}
              {/* Custom fasilitas tambahan */}
              {selectedFacs.filter(sf => !FACILITY_OPTIONS.map(o => o.key).includes(sf)).map(sf => (
                <button key={sf} type="button" onClick={() => toggleFac(sf)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1.5px solid #FF385C', borderRadius: '10px', background: '#FFF0F2', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', color: '#FF385C' }}
                >
                  ✓ {sf}
                </button>
              ))}
              {/* + Tambah */}
              <button type="button" onClick={() => {
                const v = window.prompt('Nama fasilitas baru:');
                if (v && v.trim() && !selectedFacs.includes(v.trim())) {
                  setSelectedFacs(prev => [...prev, v.trim()]);
                }
              }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 14px', border: '1.5px dashed #DDDDDD', borderRadius: '10px', background: '#FAFAFA', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', color: '#6A6A6A' }}
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Upload Foto dari Laptop */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Foto Kamar</label>
            <input
              ref={fileInputRef}
              type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); }}
            />
            {form.gambar && !['standar.png','deluxe.png'].includes(form.gambar) ? (
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden' }}>
                <img src={form.gambar} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setForm({ ...form, gambar: '' })}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(220,38,38,0.85)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #DDDDDD', borderRadius: '14px', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#FFFFFF', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#AAAAAA'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#DDDDDD'}
              >
                {uploading ? (
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FF385C', margin: 0 }}>Mengunggah foto...</p>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9E9E9E" style={{ width: 28, height: 28 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9E9E9E', margin: 0 }}>Unggah Foto</p>
                    <p style={{ fontSize: '0.75rem', color: '#BBBBBB', margin: 0 }}>JPG, PNG, WEBP — Maks. 5MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', display: 'block', marginBottom: '8px' }}>Deskripsi Kamar</label>
            <textarea rows={4} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Tulis Deskripsi Kamar..."
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #DDDDDD', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={saving}
            style={{ padding: '14px 28px', background: saving ? '#DDDDDD' : '#FF385C', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminKamar({ navigateTo, admin, showToast }) {
  const [activeTab, setActiveTab] = useState('kamar');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewState, setViewState] = useState('list'); // 'list' | 'add' | 'edit'
  const [editRoom, setEditRoom] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomRes, bkRes] = await Promise.all([
        fetch(`${API_URL}?action=get_rooms`),
        fetch(`${API_URL}?action=get_all_bookings`),
      ]);
      const roomData = await roomRes.json();
      const bkData = await bkRes.json();
      if (roomData.status === 'success') setRooms(roomData.data);
      if (bkData.status === 'success') setBookings(bkData.data);
    } catch {
      showToast('Koneksi server gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kamar ini secara permanen?')) return;
    try {
      const res = await fetch(`${API_URL}?action=delete_room&id=${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') { showToast('Kamar berhasil dihapus!'); fetchData(); }
      else showToast(data.message || 'Gagal menghapus', 'error');
    } catch {
      showToast('Koneksi server gagal', 'error');
    }
  };

  const handleSaveCallback = (successMsg, errMsg) => {
    if (successMsg) { showToast(successMsg); setViewState('list'); fetchData(); }
    else showToast(errMsg || 'Terjadi kesalahan', 'error');
  };

  // Derive status from real data (a room has no active booking = tersedia)
  // We'll use a simple heuristic: rooms returned from API are all listed; admin controls availability via count
  const filteredRooms = rooms;
  const tersediaCount = rooms.length; // all admin-listed rooms are considered "available to show"

  if (viewState === 'add' || viewState === 'edit') {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", paddingBottom: '90px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="KosKuy Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FF385C', letterSpacing: '1px' }}>KosKuy</span>
          </div>
          <button onClick={() => navigateTo && navigateTo('account')} style={{ width: '40px', height: '40px', background: '#FF385C', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
            </svg>
          </button>
        </header>
        <div style={{ padding: '24px', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
          <RoomForm initialData={editRoom} onBack={() => setViewState('list')} onSave={handleSaveCallback} isEdit={viewState === 'edit'} rooms={rooms} />
        </div>
      </div>
    );
  }

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

      <main style={{ padding: '20px 24px', maxWidth: '450px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Tab Segmented Control */}
        <div style={{ display: 'flex', background: '#F7F7F7', padding: '4px', borderRadius: '14px', gap: '4px', marginBottom: '20px' }}>
          {[{ key: 'kamar', label: 'Manajemen Kamar' }, { key: 'fasilitas', label: 'Manajemen Fasilitas' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.8rem', fontWeight: activeTab === t.key ? 700 : 500,
                background: activeTab === t.key ? '#FF385C' : 'transparent',
                color: activeTab === t.key ? '#FFFFFF' : '#6A6A6A',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'fasilitas' ? (
          <ManajemenFasilitas showToast={showToast} navigateTo={navigateTo} />
        ) : (
          <>
            {/* Title */}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', margin: '0 0 6px' }}>Manajemen Kamar</h1>
            <p style={{ fontSize: '0.82rem', color: '#6A6A6A', marginBottom: '14px' }}>
              Kelola ketersediaan, harga, dan detail seluruh kamar properti anda.
            </p>

            {/* Kapasitas indicator */}
            {(() => {
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
              return (
                <div style={{ background: '#FFF0F2', border: '1.5px solid #FECDD3', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF385C' }}>Kapasitas: {totalOccupied}/{MAX_TOTAL}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6A6A6A' }}>Standard: <strong>{occupiedStandard}/{MAX_STANDARD}</strong></span>
                  <span style={{ fontSize: '0.8rem', color: '#6A6A6A' }}>Deluxe: <strong>{occupiedDeluxe}/{MAX_DELUXE}</strong></span>
                </div>
              );
            })()}

            {/* Room Cards */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6A6A6A', padding: '40px 0' }}>Memuat kamar...</p>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6A6A6A' }}>
                <p style={{ fontWeight: 600 }}>Belum ada kamar</p>
                <p style={{ fontSize: '0.82rem' }}>Tekan tombol + untuk menambahkan kamar pertama</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {rooms.map(room => {
                  const facs = (room.fasilitas || '').split(',').map(f => f.trim()).filter(Boolean);
                  const isExpanded = expandedDesc[room.id];
                  return (
                    <article key={room.id} style={{ border: '1px solid #DDDDDD', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {/* Image */}
                      <div style={{ width: '100%', height: '200px', position: 'relative', background: '#F0F0F0', overflow: 'hidden' }}>
                        <RoomImage src={room.gambar} alt={room.nama} />
                        <span style={{
                          position: 'absolute', top: '12px', right: '12px',
                          background: '#00a53dff', color: 'white', fontSize: '0.72rem', fontWeight: 700,
                          padding: '4px 10px', borderRadius: '99px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }}>
                          tersedia
                        </span>
                      </div>
                      {/* Content */}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111', margin: 0 }}>{room.nama}</h3>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111' }}>{formatPrice(room.harga)}</span>
                            <span style={{ fontSize: '0.8rem', color: '#6A6A6A' }}> / bulan</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#6A6A6A', margin: '0 0 12px' }}>{room.lokasi || room.kategori}</p>

                        {/* Facilities Chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                          {facs.map((f, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px solid #EBEBEB', borderRadius: '6px', background: '#FBFBFB', fontSize: '0.72rem', fontWeight: 700, color: '#6A6A6A' }}>
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* Deskripsi Kamar Toggle */}
                        {room.deskripsi && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setExpandedDesc(prev => ({ ...prev, [room.id]: !prev[room.id] }))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #EBEBEB', borderRadius: '8px', background: '#FBFBFB', fontSize: '0.78rem', fontWeight: 700, color: '#6A6A6A', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                            >
                              {isExpanded ? '▲ Tutup Deskripsi' : 'Deskripsi Kamar'}
                            </button>
                            {isExpanded && (
                              <p style={{ fontSize: '0.82rem', color: '#444', padding: '10px', background: '#FAFAFA', borderRadius: '8px', margin: '6px 0 0', lineHeight: '1.6' }}>
                                {room.deskripsi}
                              </p>
                            )}
                          </div>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid #F0F0F0', margin: '14px 0' }} />

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <button onClick={() => { setEditRoom(room); setViewState('edit'); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#111' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(room.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#C13515' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.184v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* FAB — tampilkan hanya jika masih ada slot */}
            {rooms.length < MAX_TOTAL && (
              <button
                onClick={() => { setEditRoom(null); setViewState('add'); }}
                style={{
                  position: 'fixed', bottom: '90px', right: 'max(24px, calc(50% - 225px + 24px))', width: '56px', height: '56px',
                  background: '#FF385C', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(255,56,92,0.4)', zIndex: 45,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: 22, height: 22 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
            {rooms.length >= MAX_TOTAL && (
              <div style={{ textAlign: 'center', padding: '16px', marginTop: '8px', background: '#FFF0F2', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, color: '#FF385C' }}>
                Kapasitas maksimal 22 kamar telah tercapai
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
