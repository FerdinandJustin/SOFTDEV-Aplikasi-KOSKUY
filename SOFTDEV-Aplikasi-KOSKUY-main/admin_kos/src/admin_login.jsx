import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { API_URL } from './admin_app';
import logo from './logokuskuy.png';

export default function AdminLogin({ onLoginSuccess, showToast }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        if (resData.user.role !== 'admin') {
          setErrorMsg('Akses ditolak. Akun Anda bukan administrator.');
        } else {
          showToast('Login Admin Berhasil. Selamat bekerja!');
          onLoginSuccess(resData.user);
        }
      } else {
        setErrorMsg(resData.message || 'Username atau password admin salah');
      }
    } catch (err) {
      setErrorMsg('Gagal menyambung ke backend API. Pastikan Apache di XAMPP Anda aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white px-6 py-8 font-sans">
      {/* Header & Logo */}
      <div className="mt-12 flex flex-col items-center">
        <div className="w-14 h-14 mb-4 flex items-center justify-center">
          <img src={logo} alt="KosKuy Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[#FF385C] mb-2">KosKuy</h1>
        <p className="text-sm text-[#757682] text-center mb-8">
          Masuk untuk mengakses portal penghuni Anda.
        </p>
      </div>

      {/* Form Login */}
      <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
        {/* Error Message */}
        {errorMsg && (
          <div className="w-full text-center py-2.5 px-4 mb-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-[#444651] mb-1">
            Alamat Email atau Username
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              required
              placeholder="nama@contoh.com"
              value={formData.username}
              onChange={handleChange}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm"
            />
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#757682]" />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-[#444651]">Kata Sandi</label>
            <button
              type="button"
              className="text-xs text-[#FF385C] hover:underline"
              onClick={() => showToast('Fitur lupa sandi sedang dikembangkan.', 'info')}
            >
              Lupa Sandi?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 pl-10 pr-10 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm tracking-widest"
            />
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#757682]" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-[#757682] hover:text-[#444651]"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[46px] mt-4 bg-[#FF385C] text-white text-sm font-medium rounded-[7.5px] shadow-sm hover:bg-opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Memproses...'
          ) : (
            <span className="flex items-center gap-2">
              Masuk
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>
      </form>

      {/* Footer */}
      <footer className="mt-auto text-xs text-[#C5C5D3] font-medium pt-8">
        ©2026 KosKuy Management.
      </footer>
    </div>
  );
}
