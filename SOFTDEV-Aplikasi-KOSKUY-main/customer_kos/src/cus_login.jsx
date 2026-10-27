import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';

export default function CusLogin({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isSuccessRegister, setIsSuccessRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegister) {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}?action=register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone
          })
        });
        const resData = await response.json();

        if (response.ok && resData.status === 'success') {
          showToast('Pendaftaran sukses!');
          setIsSuccessRegister(true);
          setFormData({
            username: formData.username,
            email: '',
            password: '',
            confirmPassword: '',
            phone: ''
          });
        } else {
          setErrorMsg(resData.message || 'Pendaftaran gagal');
        }
      } catch (err) {
        setErrorMsg('Tidak dapat menghubungi server backend. Pastikan XAMPP Apache berjalan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Login flow
      try {
        const response = await fetch(`${API_URL}?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        const resData = await response.json();

        if (response.ok && resData.status === 'success') {
          if (resData.user.role !== 'customer') {
            setErrorMsg('Akun ini adalah Admin. Silakan login pada Dashboard Admin.');
          } else {
            showToast(`Selamat datang kembali, ${resData.user.username}!`);
            onLoginSuccess(resData.user);
          }
        } else {
          setErrorMsg(resData.message || 'Username atau password salah');
        }
      } catch (err) {
        setErrorMsg('Koneksi ke backend gagal. Pastikan XAMPP Apache aktif dan database koskuy sudah di-import.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (isSuccessRegister) {
    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-white px-6 py-8 font-sans">
        
        {/* Header */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-14 h-14 mb-4 flex items-center justify-center">
            <img src={logo} alt="KosKuy Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[#FF385C] mb-2">KosKuy</h1>
          <p className="text-sm text-[#757682] text-center">
            Kembali Ke Beranda untuk Masuk
          </p>
        </div>

        {/* Icon Checkmark Besar */}
        <div className="flex flex-col items-center my-10">
          <div className="w-[62px] h-[62px] rounded-full border border-[#A6A6A6] flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-[#1AB436] rounded-full flex items-center justify-center">
              {/* Centang Putih */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#32DA78] text-center leading-tight">
            PENDAFTARAN<br/>BERHASIL
          </h2>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex flex-col items-center mt-auto">
          <button 
            type="button"
            onClick={() => {
              setIsSuccessRegister(false);
              setIsRegister(false);
            }}
            className="w-full max-w-sm h-[46px] bg-[#FF385C] text-white text-sm font-medium rounded-[7.5px] hover:bg-opacity-90 transition mb-10"
          >
            Kembali
          </button>
          <footer className="text-xs text-[#C5C5D3] font-medium">
            ©2026 KosKuy Management.
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white px-6 py-8 font-sans">

      {/* Header & Logo */}
      <div className={`${isRegister ? 'mt-4' : 'mt-12'} flex flex-col items-center`}>
        <div className="w-14 h-14 mb-4 flex items-center justify-center">
          <img src={logo} alt="KosKuy Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-[#FF385C] mb-2">KosKuy</h1>
        <p className={`text-sm text-[#757682] text-center ${isRegister ? 'mb-6 px-4' : 'mb-8'}`}>
          {isRegister ? 'Buat akun kosanmu sekarang.' : 'Temukan kos impianmu sekarang.'}
        </p>
      </div>

      {/* Form Login / Register */}
      <form className={`w-full max-w-sm ${isRegister ? 'space-y-4' : 'space-y-5'}`} onSubmit={handleSubmit}>

        {/* Error Message */}
        {errorMsg && (
          <div className="w-full text-center py-2.5 px-4 mb-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {!isRegister ? (
          /* ================= LOGIN MODE ================= */
          <>
            {/* Username/Email Input */}
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
                <User className="absolute left-3 top-3.5 w-5 h-5 text-[#757682]" />
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ================= REGISTER MODE ================= */
          <>
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-medium text-[#444651] mb-1">Nama Lengkap</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="John Doe"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm text-gray-700 placeholder-gray-300"
                />
                <User className="absolute left-4 top-3.5 w-4 h-4 text-[#C5C5D3]" />
              </div>
            </div>

            {/* Alamat Email */}
            <div>
              <label className="block text-xs font-medium text-[#444651] mb-1">Alamat Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm text-gray-700 placeholder-gray-300"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#C5C5D3]" />
              </div>
            </div>

            {/* Nomor Telp */}
            <div>
              <label className="block text-xs font-medium text-[#444651] mb-1">Nomor Telp</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+62 812 3456 7890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm text-gray-700 placeholder-gray-300"
                />
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#C5C5D3]" />
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-xs font-medium text-[#444651] mb-1">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-10 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm text-gray-700 placeholder-gray-300"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#C5C5D3]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#757682] hover:text-[#444651]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-xs font-medium text-[#444651] mb-1">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-10 rounded-lg border border-[#C5C5D3] focus:outline-none focus:border-[#FF385C] text-sm text-gray-700 placeholder-gray-300"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#C5C5D3]" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-[#757682] hover:text-[#444651]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        {isRegister ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-[#FF385C] text-white text-sm font-semibold rounded-[7.5px] shadow-[0px_8px_16px_rgba(30,58,138,0.12)] hover:bg-opacity-90 transition flex justify-center items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        ) : (
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            )}
          </button>
        )}
      </form>

      {/* Switch between Login and Register */}
      <div className={`${isRegister ? 'mt-6 text-[15px]' : 'mt-8 text-sm'} flex gap-1 justify-center`}>
        <span className="text-[#444651] font-medium">
          {isRegister ? 'Sudah Punya Akun?' : 'Pendatang baru di KosKuy?'}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMsg('');
          }}
          className="text-[#FF385C] font-semibold hover:underline"
        >
          {isRegister ? 'Masuk' : 'Daftar Disini'}
        </button>
      </div>

      {/* Footer */}
      <footer className={`mt-auto ${isRegister ? 'pt-6' : ''} text-xs text-[#C5C5D3] font-medium`}>
        ©2026 KosKuy Management.
      </footer>
    </div>
  );
}
