import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, QrCode, CheckCircle, Clock, Calendar, ShieldCheck, Download, Share2 } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';
import standarImg from '../standar.png';
import deluxeImg from '../deluxe.png';

export default function CusPayment({ bookingId, navigateTo, user, showToast }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('select_method'); // 'select_method' | 'qris' | 'gopay' | 'va' | 'success'
  const [selectedMethod, setSelectedMethod] = useState('QRIS'); // 'QRIS' | 'E-WALLET' | 'VA'
  const [method, setMethod] = useState(''); // Chosen payment method name for success display
  const [processing, setProcessing] = useState(false);
  const [successTime, setSuccessTime] = useState(''); // Captured at exact moment payment confirmed

  // Shared Countdown Timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`${API_URL}?action=get_booking_history&user_id=${user.id}`);
        const resData = await response.json();
        if (response.ok && resData.status === 'success') {
          const activeBk = resData.data.find(b => String(b.id) === String(bookingId));
          if (activeBk) {
            setBooking(activeBk);
          } else {
            showToast('Pesanan tidak ditemukan', 'error');
            navigateTo('home');
          }
        }
      } catch (err) {
        console.error(err);
        showToast('Koneksi server gagal', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && user) {
      fetchBookingDetails();
    } else {
      navigateTo('home');
    }
  }, [bookingId, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dateObj = new Date(dateStr);
      const days = dateObj.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${days} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateFull = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dateObj = new Date(dateStr);
      const days = dateObj.getDate();
      const monthsArr = ['September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus'];
      // Just keep dynamic calculation
      const stdMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${days} ${stdMonths[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getEndDate = (startDateStr, months) => {
    if (!startDateStr) return '';
    try {
      const start = new Date(startDateStr);
      start.setMonth(start.getMonth() + parseInt(months || 1));
      const days = start.getDate();
      const stdMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${days} ${stdMonths[start.getMonth()]} ${start.getFullYear()}`;
    } catch (e) {
      return '';
    }
  };

  const getFormattedCurrentTime = () => {
    const now = new Date();
    const days = now.getDate();
    const stdMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    return `${days} ${stdMonths[now.getMonth()]} ${now.getFullYear()} ${hrs}:${mins}:${secs}`;
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handlePayNow = async (paymentType, paymentNo) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}?action=pay_booking&id=${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metode_pembayaran: paymentType,
          nomor_pembayaran: paymentNo
        })
      });
      const resData = await response.json();
      
      if (response.ok && resData.status === 'success') {
        setMethod(paymentType);
        // Capture exact timestamp at moment of confirmation
        const now = new Date();
        const stdMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const captured = `${now.getDate()} ${stdMonths[now.getMonth()]} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setSuccessTime(captured);
        showToast('Pembayaran berhasil dikonfirmasi');
        setStep('success');
      } else {
        showToast(resData.message || 'Gagal memproses pembayaran', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      const response = await fetch(`${API_URL}?action=update_booking_status&id=${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dibatalkan' })
      });
      if (response.ok) {
        showToast('Pesanan berhasil dibatalkan');
        navigateTo('home');
      } else {
        showToast('Gagal membatalkan pesanan', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    }
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s/g, ''));
    showToast("Nomor Virtual Account berhasil disalin!");
  };

  const handleCopyAmount = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.total_harga.toString());
      showToast("Nominal transaksi berhasil disalin!");
    }
  };

  const handleDownloadQr = () => {
    showToast("QR Code berhasil diunduh ke galeri Anda!");
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-['Plus_Jakarta_Sans']">
        <div className="w-8 h-8 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-[#9E9E9E] font-medium">Menyiapkan pembayaran...</p>
      </div>
    );
  }

  if (!booking) return null;

  const isDeluxe = booking.kategori === 'Deluxe';
  const roomImage = (booking.gambar && booking.gambar !== 'deluxe.png' && booking.gambar !== 'standar.png' && !booking.gambar.includes('images.unsplash.com')) 
    ? booking.gambar 
    : (isDeluxe ? deluxeImg : standarImg);

  const vaNumber = "12345 67890 12345";

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] text-[#1B1C1C] flex flex-col items-center antialiased">
      
      {/* -------------------- STEP 1: SELECT METHOD -------------------- */}
      {step === 'select_method' && (
        <>
          <header className="w-full max-w-md bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => navigateTo('home')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Kembali"
            >
              <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold tracking-wide">Pembayaran</h1>
            <div className="w-8"></div>
          </header>

          <main className="w-full max-w-md px-5 py-6 flex flex-col space-y-6 flex-grow">
            <div>
              <h2 className="text-2xl font-bold text-black mb-1">Metode Pembayaran</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pilih cara yang paling nyaman untuk menyelesaikan pesanan Anda.
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {/* QRIS */}
              <div 
                onClick={() => handleSelectMethod('QRIS')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${selectedMethod === 'QRIS' ? 'border-[#FF385C] bg-[#FFF0F2]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'QRIS' ? 'border-[#FF385C]' : 'border-gray-300'}`}>
                    {selectedMethod === 'QRIS' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">QRIS</span>
                    <span className="text-xs text-gray-500">Scan aplikasi M-Banking atau E-Wallet</span>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-[#FF385C]" />
              </div>

              {/* E-Wallet */}
              <div 
                onClick={() => handleSelectMethod('E-WALLET')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${selectedMethod === 'E-WALLET' ? 'border-[#FF385C] bg-[#FFF0F2]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'E-WALLET' ? 'border-[#FF385C]' : 'border-gray-300'}`}>
                    {selectedMethod === 'E-WALLET' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">E-Wallet</span>
                    <span className="text-xs text-gray-500">GoPay, OVO, Dana, ShopeePay.</span>
                  </div>
                </div>
                <Smartphone className="w-5 h-5 text-gray-400" />
              </div>

              {/* Virtual Account */}
              <div 
                onClick={() => handleSelectMethod('VA')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${selectedMethod === 'VA' ? 'border-[#FF385C] bg-[#FFF0F2]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'VA' ? 'border-[#FF385C]' : 'border-gray-300'}`}>
                    {selectedMethod === 'VA' && <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Virtual Account</span>
                    <span className="text-xs text-gray-500">BCA, Mandiri, BNI, BRI.</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Ringkasan Pesanan Card */}
            <div className="bg-[#F7F7F7] border border-[#DDDDDD] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">Ringkasan Pesanan</h3>
              
              <div className="flex gap-3 pb-3 border-b border-gray-200">
                <img 
                  src={roomImage} 
                  alt={booking.nama} 
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex flex-col justify-center text-left">
                  <span className="text-[10px] font-bold text-[#FF385C] tracking-[0.6px] uppercase">Kamar Kos</span>
                  <h4 className="text-sm font-bold text-black">KosKuy - {booking.nama}</h4>
                  <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {booking.durasi_bulan} Bulan
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> Mulai {formatDate(booking.tanggal_mulai)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sewa ({booking.durasi_bulan} Bulan)</span>
                  <span className="font-semibold text-black">{formatPrice(booking.harga * booking.durasi_bulan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya Layanan</span>
                  <span className="font-semibold text-black">0</span>
                </div>
                <hr className="border-gray-200 my-2" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-black text-base">Total</span>
                  <span className="font-bold text-[#FF385C] text-xl">{formatPrice(booking.total_harga)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedMethod === 'QRIS') setStep('qris');
                  else if (selectedMethod === 'E-WALLET') setStep('gopay');
                  else if (selectedMethod === 'VA') setStep('va');
                }}
                className="w-full py-3.5 bg-[#FF385C] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-95 transition shadow-sm"
              >
                <span>Lanjut Pembayaran</span>
                <span>&gt;</span>
              </button>
              <p className="text-[10px] text-center text-gray-400">Pembayaran Anda aman dan terenkripsi.</p>
            </div>
          </main>
        </>
      )}

      {/* -------------------- STEP 2: QRIS PAYMENT SCREEN -------------------- */}
      {step === 'qris' && (
        <>
          <header className="w-full max-w-md bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => setStep('select_method')}
              className="p-1 rounded-full hover:bg-gray-100 transition text-[#FF385C]"
              aria-label="Kembali"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Pembayaran</h1>
            <div className="w-6"></div>
          </header>

          <main className="w-full max-w-md px-5 py-6 flex flex-col space-y-6 flex-grow">
            <section className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-white border border-[#A6A6A6] rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Menunggu Pembayaran</h2>
                <p className="text-sm text-black/70 max-w-xs leading-relaxed">
                  Selesaikan pembayaran Anda dalam batas waktu di bawah ini.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDFD] border border-[#FF385C] rounded-md shadow-sm">
                <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-2xl font-bold text-[#FF385C] tracking-wider tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </section>

            <section className="bg-[#F7F7F7] border-2 border-[#DDDDDD] rounded-[11px] p-5 flex flex-col items-center space-y-4 shadow-sm">
              <div className="w-full flex justify-between items-center border-b border-black/10 pb-3 text-left">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#6A6A6A] tracking-[0.6px] uppercase">Metode Pembayaran</span>
                  <span className="text-base font-bold text-[#1B1C1C]">QRIS</span>
                </div>
                <img className="w-10 h-10 border border-[#C6C6C6] rounded-[5px] object-contain" src="./logoqris.png" alt="Logo QRIS" />
              </div>

              <div className="bg-white p-3 rounded-lg shadow-inner flex items-center justify-center my-2">
                <img 
                  className="w-64 h-64 object-contain" 
                  src="./qris.jpg" 
                  alt="QRIS Code Scan" 
                />
              </div>

              <p className="text-sm text-[#6A6A6A] text-center max-w-[288px] leading-relaxed">
                Scan QR code ini menggunakan aplikasi mobile banking atau e-wallet pilihan Anda.
              </p>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="w-full h-12 bg-white border-2 border-[#DDDDDD] hover:bg-gray-50 text-[#222222] font-bold text-sm rounded-[11px] flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download QR Code</span>
              </button>
            </section>

            <section className="space-y-2 text-left">
              <h3 className="text-sm font-bold text-black px-1">Rincian Transaksi</h3>
              <div className="bg-[#F7F7F7] border-2 border-[#DDDDDD] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#080404]">Total Transaksi</span>
                  <span className="text-lg font-bold text-black">{formatPrice(booking.total_harga)}</span>
                </div>
                <hr className="border-black/10" />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-black">ID Transaksi</span>
                  <span className="font-mono font-bold text-[#120B0B]">TRX-{booking.id}</span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="font-bold text-black">Properti</span>
                  <span className="font-bold text-right text-[#060404] leading-tight tracking-[0.5px]">
                    KosKuy -<br />
                    <span className="text-xs font-normal text-gray-500">Kamar {booking.kategori}</span>
                  </span>
                </div>
              </div>
            </section>

            <footer className="pt-4 flex flex-col space-y-3 w-full">
              <button 
                type="button"
                onClick={() => handlePayNow('QRIS', 'QRIS_KOSKUY_' + booking.id)}
                disabled={processing}
                className="w-full h-12 bg-[#FF385C] hover:bg-opacity-95 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-[0.99] tracking-wider"
              >
                {processing ? 'Memproses...' : 'Cek Status Pembayaran'}
              </button>
              
              <button 
                type="button"
                onClick={handleCancelOrder}
                className="w-full text-center text-xs font-bold text-black/60 hover:text-red-600 underline transition tracking-wider py-2"
              >
                Batalkan Pesanan
              </button>
            </footer>
          </main>
        </>
      )}

      {/* -------------------- STEP 3: E-WALLET (GOPAY) SCREEN -------------------- */}
      {step === 'gopay' && (
        <>
          <header className="w-full max-w-md bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => setStep('select_method')}
              className="p-1 rounded-full hover:bg-gray-100 transition text-[#FF385C]"
              aria-label="Kembali"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Pembayaran</h1>
            <div className="w-6"></div>
          </header>

          <main className="w-full max-w-md px-5 py-6 flex flex-col space-y-6 flex-grow">
            <section className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-white border border-[#A6A6A6] rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Menunggu Pembayaran</h2>
                <p className="text-sm text-black/70 max-w-xs leading-relaxed">
                  Selesaikan pembayaran Anda dalam batas waktu di bawah ini.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDFD] border border-[#FF385C] rounded-md shadow-sm">
                <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-2xl font-bold text-[#FF385C] tracking-wider tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </section>

            <section className="bg-[#F6F9FF] border-2 border-[#DDDDDD] rounded-[11px] p-5 flex flex-col items-center space-y-4 shadow-sm">
              <div className="w-full flex items-center gap-3 text-left">
                <img className="w-11 h-11 border-2 border-[#DDDDDD] rounded-xl object-cover" src="./gopay.png" alt="Gopay Logo" />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-black">Gopay</span>
                  <span className="text-xs text-gray-600 font-medium">Buka aplikasi untuk membayar</span>
                </div>
              </div>

              <a
                href="gopay://to/payment"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-[#428BFF] border-2 border-[#DDDDDD] hover:bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] text-center"
              >
                <span>Buka Aplikasi Gopay</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </section>

            <section className="space-y-2 text-left">
              <h3 className="text-sm font-bold text-black px-1">Rincian Transaksi</h3>
              <div className="bg-white border-2 border-[#DDDDDD] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Total Transaksi</span>
                    <span className="text-lg font-bold text-black">{formatPrice(booking.total_harga)}</span>
                  </div>
                  <button 
                    onClick={handleCopyAmount}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#FF385C] hover:bg-[#FFF0F2] px-2.5 py-1.5 rounded transition"
                  >
                    <svg className="w-3.5 h-3.5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>SALIN</span>
                  </button>
                </div>
                
                <hr className="border-black/10" />

                <div className="flex justify-between items-center text-sm px-1">
                  <span className="font-bold text-black">ID Transaksi</span>
                  <span className="font-mono font-bold text-[#120B0B]">TRX-{booking.id}</span>
                </div>
                <div className="flex justify-between items-start text-sm px-1">
                  <span className="font-bold text-black">Properti</span>
                  <span className="font-bold text-right text-[#060404] leading-tight tracking-[0.5px]">
                    KosKuy -<br />
                    <span className="text-xs font-normal text-gray-500">Kamar {booking.kategori}</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-[#F7F7F7] border-2 border-[#DDDDDD] rounded-xl p-5 space-y-4 shadow-sm text-left">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-gray-800">Cara Pembayaran</h3>
              </div>
              
              <ol className="list-decimal list-inside text-xs text-gray-800 space-y-3 leading-relaxed">
                <li className="pl-1">
                  Klik tombol <span className="font-bold">“Buka Aplikasi Gopay”</span> di atas.
                </li>
                <li className="pl-1">
                  Aplikasi Gopay akan otomatis terbuka memuat detail tagihan ini.
                </li>
                <li className="pl-1">
                  Periksa kembali detail pembayaran, lalu klik <span className="font-bold">“Bayar”</span>.
                </li>
                <li className="pl-1">
                  Masukkan PIN Gopay Anda untuk mengonfirmasi.
                </li>
                <li className="pl-1">
                  Setelah berhasil, kembali ke halaman ini dan klik <span className="font-bold">“Cek Status Pembayaran”</span>.
                </li>
              </ol>
            </section>

            <footer className="pt-4 flex flex-col space-y-3 w-full">
              <button 
                type="button"
                onClick={() => handlePayNow('E-WALLET', user.phone || '081234567890')}
                disabled={processing}
                className="w-full h-12 bg-[#FF385C] hover:bg-opacity-95 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-[0.99] tracking-wider"
              >
                {processing ? 'Memproses...' : 'Cek Status Pembayaran'}
              </button>
              
              <button 
                type="button"
                onClick={handleCancelOrder}
                className="w-full text-center text-xs font-bold text-black/60 hover:text-red-600 underline transition tracking-wider py-2"
              >
                Batalkan Pesanan
              </button>
            </footer>
          </main>
        </>
      )}

      {/* -------------------- STEP 4: VIRTUAL ACCOUNT SCREEN -------------------- */}
      {step === 'va' && (
        <>
          <header className="w-full max-w-md bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => setStep('select_method')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Kembali"
            >
              <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold tracking-wide">Pembayaran</h1>
            <div className="w-8"></div>
          </header>

          <main className="w-full max-w-md px-5 py-6 flex flex-col space-y-6 flex-grow">
            <section className="flex flex-col items-center text-center space-y-3 my-2">
              <div className="w-16 h-16 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Menunggu Pembayaran</h2>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Selesaikan pembayaran Anda dalam batas waktu di bawah ini.
                </p>
              </div>
 
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDFD] border-2 border-gray-300 rounded-md shadow-sm">
                <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-2xl font-bold text-[#FF385C] tracking-wider tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </section>

            <section className="bg-white border border-black rounded-lg p-5 space-y-4 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="font-bold text-base">BCA Virtual Account</span>
                <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded tracking-wider">BCA</div>
              </div>

              <div className="bg-white border border-gray-300 rounded-md p-3 relative flex flex-col space-y-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor Virtual Account</span>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold font-mono tracking-wider text-gray-900">{vaNumber}</span>
                  <button 
                    onClick={handleCopyVA}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#FF385C] hover:bg-[#FFF0F2] px-2.5 py-1.5 rounded transition"
                  >
                    <svg className="w-3.5 h-3.5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>SALIN</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-center text-[#6A6A6A] leading-relaxed">
                Salin nomor di atas dan gunakan aplikasi <br />M-Banking atau ATM untuk transfer.
              </p>
            </section>

            <section className="space-y-2 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 px-1">Rincian Transaksi</h3>
              <div className="bg-[#FBF9F9] border-2 border-[#DDDDDD] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Transaksi</span>
                  <span className="text-lg font-bold text-black">{formatPrice(booking.total_harga)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">ID Transaksi</span>
                  <span className="font-mono font-bold text-gray-900">TRX-{booking.id}</span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-gray-600">Properti</span>
                  <span className="font-bold text-right text-gray-900">
                    KosKuy -<br />
                    <span className="text-xs font-normal text-gray-500">Kamar {booking.kategori}</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-[#F7F7F7] border-2 border-[#DDDDDD] rounded-xl p-5 space-y-4 shadow-sm text-left">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-sm font-bold tracking-wider uppercase text-gray-800">Cara Pembayaran</h3>
              </div>
              
              <ol className="list-decimal list-inside text-xs text-gray-800 space-y-3 leading-relaxed">
                <li className="pl-1">
                  Buka aplikasi <span className="font-bold">BCA mobile</span> dan masuk ke m-BCA.
                </li>
                <li className="pl-1">
                  Pilih menu <span className="font-medium">m-Transfer</span>, lalu pilih <span className="font-medium">BCA Virtual Account</span>.
                </li>
                <li className="pl-1">
                  Klik ikon copy (salin) pada layar aplikasi Anda, lalu tempel nomor Virtual Account: <span className="font-mono font-bold">{vaNumber}</span> ke m-BCA.
                </li>
                <li className="pl-1">
                  Pastikan jumlah tagihan yang muncul sudah sesuai lalu tekan <span className="font-bold">OK</span>.
                </li>
                <li className="pl-1">
                  Masukkan PIN m-BCA Anda untuk menyelesaikan transaksi.
                </li>
                <li className="pl-1">
                  Kembali ke aplikasi pemesanan dan klik tombol merah “<span className="font-bold">Cek Status Pembayaran</span>”.
                </li>
              </ol>
            </section>

            <footer className="pt-4 flex flex-col space-y-3 w-full">
              <button 
                type="button"
                onClick={() => handlePayNow('VA', vaNumber)}
                disabled={processing}
                className="w-full h-12 bg-[#FF385C] text-white text-sm font-bold rounded-lg shadow-md hover:bg-opacity-90 active:scale-[0.99] transition-all tracking-wider uppercase"
              >
                {processing ? 'Memverifikasi...' : 'Cek Status Pembayaran'}
              </button>
              
              <button 
                type="button"
                onClick={handleCancelOrder}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-red-500 underline transition tracking-wider py-2"
              >
                Batalkan Pesanan
              </button>
            </footer>
          </main>
        </>
      )}

      {/* -------------------- STEP 5: SUCCESS PANEL -------------------- */}
      {step === 'success' && (
        <>
          <header className="w-full max-w-md bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="w-8"></div>
            <h1 className="text-lg font-semibold tracking-wide">Pembayaran</h1>
            <div className="w-8"></div>
          </header>

          <main className="w-full max-w-md px-5 py-6 flex flex-col items-center flex-grow">
            <div className="w-16 h-16 mt-2 mb-3 flex items-center justify-center">
              <img src={logo} alt="KosKuy Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#FF385C] tracking-wide mb-6">KosKuy</h2>

            {/* Checkmark Icon */}
            <div className="w-20 h-20 rounded-full border-4 border-[#00F48D] flex items-center justify-center mb-4 bg-[#E6FEF4] shadow-sm">
              <svg className="w-10 h-10 text-[#008A52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-black">Pembayaran Berhasil</h3>
            <p className="text-xs text-gray-400 mt-1 mb-8">{successTime}</p>

            {/* Transaction Details Card */}
            <div className="w-full border-2 border-[#DDDDDD] bg-white rounded-2xl p-5 space-y-4 shadow-sm mb-8 text-left">
              <h4 className="text-sm font-bold text-black uppercase tracking-wider pb-2 border-b border-gray-100">Rincian Transaksi</h4>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 font-medium">Total Transaksi</span>
                <span className="text-base font-bold text-black">{formatPrice(booking.total_harga)}</span>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Penyewa</span>
                <span className="text-sm font-semibold text-black">{user.username || 'Penyewa'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Properti</span>
                <span className="text-sm font-semibold text-black">KosKuy - Kamar {booking.kategori}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Periode</span>
                <span className="text-sm font-semibold text-black text-right">
                  {formatDateFull(booking.tanggal_mulai)} -<br/>
                  {getEndDate(booking.tanggal_mulai, booking.durasi_bulan)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">Metode Pembayaran</span>
                <span className="text-sm font-semibold text-black">{method}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500">ID Transaksi</span>
                <span className="text-sm font-mono font-bold text-gray-700">TRX-{booking.id}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col space-y-3">
              <button
                onClick={() => showToast('Bukti transaksi disimpan ke galeri')}
                className="w-full h-12 bg-white border-2 border-[#DDDDDD] hover:bg-gray-50 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Simpan Ke Galeri</span>
              </button>

              <button
                onClick={() => showToast('Bukti transaksi dibagikan')}
                className="w-full h-12 bg-white border-2 border-[#DDDDDD] hover:bg-gray-50 text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.748a3.001 3.001 0 110 2.504l5.244-2.622a3.001 3.001 0 110 2.504l-5.244-2.622z" />
                </svg>
                <span>Bagikan Bukti Transaksi</span>
              </button>

              <button
                onClick={() => navigateTo('history')}
                className="w-full h-12 bg-[#FF385C] text-white text-sm font-bold rounded-xl hover:bg-opacity-95 transition tracking-wide"
              >
                Kembali
              </button>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
