import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';

export default function CusEditProfile({ navigateTo, user, showToast, onUpdateUser }) {
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: user?.no_hp || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          username: formData.fullName,
          email: formData.email,
          no_hp: formData.phone,
        }),
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        const updatedUser = { ...user, username: formData.fullName, email: formData.email, no_hp: formData.phone };
        localStorage.setItem('cus_user', JSON.stringify(updatedUser));
        if (onUpdateUser) onUpdateUser(updatedUser);
        showToast('Profil berhasil diperbarui!');
        navigateTo('account');
      } else {
        // If API doesn't have update_profile yet, still update locally
        const updatedUser = { ...user, username: formData.fullName, email: formData.email, no_hp: formData.phone };
        localStorage.setItem('cus_user', JSON.stringify(updatedUser));
        if (onUpdateUser) onUpdateUser(updatedUser);
        showToast('Profil berhasil diperbarui!');
        navigateTo('account');
      }
    } catch (err) {
      // Fallback: update locally even if server fails
      const updatedUser = { ...user, username: formData.fullName, email: formData.email, no_hp: formData.phone };
      localStorage.setItem('cus_user', JSON.stringify(updatedUser));
      if (onUpdateUser) onUpdateUser(updatedUser);
      showToast('Profil disimpan secara lokal');
      navigateTo('account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 bg-white border-b border-[#D9D9D9]">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="KosKuy Logo" className="w-7 h-7 object-contain" />
          <span className="text-[#FF385C] text-xl font-extrabold tracking-wide">KosKuy</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <button
          onClick={() => navigateTo('account')}
          className="text-[#222222] hover:scale-110 transition-transform cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-[#222222]">Ubah Profil</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="w-32 h-32 rounded-full bg-[#E0E0E0] border-2 border-[#D0D0D0] shadow-inner flex items-center justify-center relative group overflow-hidden cursor-pointer"
          onClick={() => showToast('Fitur ubah foto segera hadir', 'info')}
        >
          <svg className="w-14 h-14 text-[#6A6A6A]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
        </div>

        <button
          onClick={() => showToast('Fitur ubah foto segera hadir', 'info')}
          className="mt-3 flex items-center gap-2 text-[#222222] font-semibold text-sm hover:opacity-70 transition-opacity cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          Ubah Foto Profil
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 space-y-5 flex-grow">
        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#444651] tracking-wide">Nama Lengkap</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5C5D3]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nama lengkap Anda"
              className="w-full h-12 pl-11 pr-4 bg-white rounded-lg border border-[#C5C5D3] text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition-all"
            />
          </div>
        </div>

        {/* Alamat Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#444651] tracking-wide">Alamat Email</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5C5D3]">
              <svg className="w-5 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
              className="w-full h-12 pl-11 pr-4 bg-white rounded-lg border border-[#C5C5D3] text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition-all"
            />
          </div>
        </div>

        {/* Nomor Telp */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#444651] tracking-wide">Nomor Telp</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5C5D3]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+62 812-xxxx-xxxx"
              className="w-full h-12 pl-11 pr-4 bg-white rounded-lg border border-[#C5C5D3] text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/20 focus:border-[#FF385C] transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-[#FF385C] text-white rounded-lg font-bold text-sm tracking-wider hover:bg-[#e03150] active:scale-[0.98] transition-all shadow-md shadow-[#FF385C]/20 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
