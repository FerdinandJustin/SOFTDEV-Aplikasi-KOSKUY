import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, Wifi, Wind, Car, Flame, ShowerHead, Tv, Sofa, DoorOpen, AirVent } from 'lucide-react';
import { API_URL } from './cus_app';
import logo from './logokuskuy.png';
import standarImg from '../standar.png';
import deluxeImg from '../deluxe.png';

export default function CusDetail({ roomId, navigateTo, user, showToast }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoomDetail = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_room_detail&id=${roomId}`);
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setRoom(resData.data);
      } else {
        showToast('Kamar tidak ditemukan', 'error');
        navigateTo('home');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
      navigateTo('home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetail();
    } else {
      navigateTo('home');
    }
  }, [roomId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-sans">
        <p className="text-sm text-muted font-medium">Memuat rincian kamar...</p>
      </div>
    );
  }

  if (!room) return null;

  const isDeluxe = room.kategori === 'Deluxe';
  const originalPriceVal = room.harga + 400000;
  const discountedPriceVal = room.harga;
  const remainingKamarText = `Sisa ${room.sisa_kamar !== undefined ? room.sisa_kamar : (isDeluxe ? 1 : 2)} Kamar`;
  const roomImage = (room.gambar && room.gambar !== 'deluxe.png' && room.gambar !== 'standar.png' && !room.gambar.includes('images.unsplash.com')) 
    ? room.gambar 
    : (isDeluxe ? deluxeImg : standarImg);

  // Hanya gunakan ulasan nyata dari database
  const reviewsToRender = (room.reviews && room.reviews.length > 0) ? room.reviews : [];

  // Parse fasilitas dari string database (misal: "WiFi, AC, Parkir, Water Heater")
  const fasilitasList = room.fasilitas
    ? room.fasilitas.split(',').map(f => f.trim()).filter(Boolean)
    : [];

  const getFacilityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('wifi') || n.includes('internet')) return <Wifi size={14} className="text-white" />;
    if (n.includes('ac') || n.includes('air cond')) return <Wind size={14} className="text-white" />;
    if (n.includes('parkir')) return <Car size={14} className="text-white" />;
    if (n.includes('water heater') || n.includes('pemanas')) return <Flame size={14} className="text-white" />;
    if (n.includes('shower') || n.includes('mandi')) return <ShowerHead size={14} className="text-white" />;
    if (n.includes('tv') || n.includes('televisi')) return <Tv size={14} className="text-white" />;
    if (n.includes('sofa') || n.includes('ruang')) return <Sofa size={14} className="text-white" />;
    if (n.includes('luas') || n.includes('kamar')) return <DoorOpen size={14} className="text-white" />;
    return <AirVent size={14} className="text-white" />;
  };

  const getReviewDate = (rev) => {
    if (rev.date) return rev.date;
    if (rev.created_at) {
      const dateObj = new Date(rev.created_at);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
    return 'Baru-baru ini';
  };

  const getReviewAvatarLetter = (rev) => {
    return rev.username ? rev.username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-['Plus_Jakarta_Sans'] pb-20 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 focus:outline-none cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#FF385C]" />
          <img src={logo} alt="KosKuy Logo" className="w-7 h-7 object-contain" />
          <h1 className="text-2xl font-extrabold text-[#FF385C] tracking-wider">KosKuy</h1>
        </button>
        <div 
          onClick={() => navigateTo('help')}
          className="w-10 h-10 bg-[#FF385C] text-white font-bold text-sm rounded-full flex items-center justify-center cursor-pointer shrink-0"
        >
          {user ? user.username.charAt(0).toUpperCase() : 'T'}
        </div>
      </div>

      {/* Foto Kamar Utama */}
      <div className="px-6 relative mt-2">
        <img 
          src={roomImage} 
          alt={room.nama} 
          className="w-full h-64 object-cover rounded-[15px]" 
        />
        <div 
          onClick={() => showToast('Disimpan ke Favorit', 'success')}
          className="absolute top-4 right-10 bg-white/80 backdrop-blur p-2.5 rounded-full shadow-sm cursor-pointer hover:scale-105 transition"
        >
          <Heart size={16} className="text-[#FF385C] fill-[#FF385C]" />
        </div>
      </div>

      {/* Judul & Info */}
      <div className="px-6 mt-6">
        <h2 className="text-3xl font-bold text-black">{room.nama}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-[#6A6A6A]">
          {room.rating_rata > 0 && (
            <div className="flex items-center gap-1 font-bold text-black font-['Be_Vietnam_Pro']">
              <div className="w-3.5 h-3.5 bg-[#222222] rounded-sm flex items-center justify-center">
                <Star size={8} className="text-white fill-white stroke-none" />
              </div>
              {room.rating_rata}
            </div>
          )}
          {reviewsToRender.length > 0 && (
            <span className="text-black underline cursor-pointer" onClick={() => showToast('Menampilkan ulasan di bawah', 'info')}>
              {reviewsToRender.length} Ulasan
            </span>
          )}
          <span>{room.lokasi || 'Jakarta Barat, Indonesia'}</span>
        </div>
      </div>

      {/* Fasilitas Utama */}
      {fasilitasList.length > 0 && (
        <div className="px-6 mt-8">
          <h3 className="text-lg font-bold text-black mb-4">Fasilitas utama</h3>
          <div className="grid grid-cols-2 gap-4">
            {fasilitasList.map((fac) => (
              <div key={fac} className="bg-[#F7F7F7] p-4 rounded-lg border border-[#DDDDDD] flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-7 h-7 bg-[#222222] rounded flex items-center justify-center">
                  {getFacilityIcon(fac)}
                </div>
                <span className="text-xs text-[#222222] font-semibold">{fac}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deskripsi Kamar */}
      <div className="px-6 mt-8">
        <h3 className="text-lg font-bold text-black mb-3">Tentang Kamar Ini</h3>
        <div className="text-[15px] text-[#3F3F3F] leading-relaxed space-y-4 font-['Plus_Jakarta_Sans']">
          {room.deskripsi ? (
            <p>{room.deskripsi}</p>
          ) : isDeluxe ? (
            <>
              <p>Tingkatkan standar kenyamanan Anda bersama Kamar Deluxe kami. Menawarkan ukuran ruangan yang lebih luas, tipe Deluxe memberikan kebebasan ekstra untuk Anda yang menghargai ruang gerak dan privasi maksimal di tengah kota.</p>
              <p>Manjakan diri Anda dengan kesejukan instan dari AC 1 PK yang kuat. Dilengkapi dengan Free Wi-Fi untuk produktivitas Anda dan area parkir luas yang aman. Pilihan terbaik untuk profesional yang menginginkan kenyamanan tanpa kompromi!</p>
            </>
          ) : (
            <>
              <p>Nikmati kenyamanan maksimal di Kamar Standard kami. Dirancang dengan sentuhan modern minimalis, kamar ini menawarkan fungsionalitas optimal, pencahayaan alami yang melimpah, dan furnitur premium untuk memastikan istirahat berkualitas Anda.</p>
              <p>Kamar ini sangat cocok untuk profesional muda yang mencari ketenangan di tengah hiruk-pikuk kota. Nikmati juga fasilitas Free Wi-Fi super cepat dan area parkir yang luas untuk kendaraan Anda. Akses mudah ke pusat bisnis dan berbagai area hiburan!</p>
            </>
          )}
        </div>
      </div>

      {/* Ulasan */}
      <div className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-[#FF385C] rounded-sm flex items-center justify-center">
            <Star size={12} className="text-white fill-white stroke-none" />
          </div>
          <h3 className="text-lg font-bold text-[#222222]">
            {room.rating_rata > 0 ? `${room.rating_rata} · ` : ''}{reviewsToRender.length} Ulasan
          </h3>
        </div>

        {reviewsToRender.length === 0 ? (
          <div className="text-center py-8 bg-[#F7F7F7] rounded-2xl border border-[#EBEBEB]">
            <div className="w-10 h-10 bg-[#EBEBEB] rounded-full flex items-center justify-center mx-auto mb-3">
              <Star size={18} className="text-[#BBBBBB]" />
            </div>
            <p className="text-sm font-semibold text-[#444444]">Belum ada ulasan</p>
            <p className="text-xs text-[#9E9E9E] mt-1">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <>
            {reviewsToRender.map((rev, idx) => (
              <div key={rev.id || idx} className="bg-[#F0F0F0]/90 p-5 rounded-[18px] mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#E3E2E2] rounded-full flex items-center justify-center text-[#5C3F41] font-bold text-lg font-serif">
                    {getReviewAvatarLetter(rev)}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#222222]">{rev.username}</h4>
                    <div className="flex items-center gap-2 text-sm text-[#6A6A6A]">
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={12} className="text-[#FF385C] fill-[#FF385C]" />
                        ))}
                        {[...Array(5 - (rev.rating || 5))].map((_, i) => (
                          <Star key={`empty-${i}`} size={12} className="text-[#E3E2E2] fill-[#E3E2E2]" />
                        ))}
                      </div>
                      {getReviewDate(rev)}
                    </div>
                  </div>
                </div>
                <p className="text-[15px] text-[#3F3F3F] leading-relaxed">{rev.komentar}</p>
              </div>
            ))}
            <button
              onClick={() => showToast('Semua ulasan telah ditampilkan', 'info')}
              className="w-full py-2.5 border border-[#222222] rounded-lg text-sm text-[#222222] text-center font-medium mt-2"
            >
              Tampilkan Semua Ulasan
            </button>
          </>
        )}
      </div>

      {/* Booking Bar - Below Reviews */}
      <div className="border-t border-[#D3CECE] p-6 flex justify-between items-center bg-white mt-8 mx-6 rounded-xl border">
        <div>
          <p className="text-[15px] font-medium text-[#FF385C] mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FF385C] rounded-sm"></span> {remainingKamarText}
          </p>
          <p className="text-[15px] text-[#6A6A6A] line-through">{formatPrice(originalPriceVal)}</p>
          <p className="text-[15px] text-black font-bold">{formatPrice(discountedPriceVal)} <span className="text-[#6A6A6A] font-normal">/ bulan</span></p>
        </div>
        <button 
          onClick={() => navigateTo('booking', room)}
          className="bg-[#FF385C] text-white text-xs font-semibold py-2.5 px-5 rounded-xl font-sans hover:bg-opacity-90 transition shadow-sm cursor-pointer"
        >
          Booking Sekarang
        </button>
      </div>
    </div>
  );
}
