import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Building, Layers, Home, Gem, Wifi, Wind, Shield, Utensils, Car, Tv } from 'lucide-react';
import { API_URL } from './cus_app';
import standarImg from '../standar.png';
import deluxeImg from '../deluxe.png';
import dapurImg from '../dapur.png';
import parkiranImg from '../parkiran.png';
import jemuranImg from '../jemuran.png';

export default function CusHome({ navigateTo, user, showToast }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Empty string is 'All'
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const tabs = ['Semua', 'Standard', 'Deluxe', 'Fasilitas Kos'];
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  // Debounce search query to prevent excessive API hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchRooms = async () => {
    // Only fetch if not on the facilities tab
    if (activeTab === 'Fasilitas Kos') return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_rooms&kategori=${selectedCategory}&search=${debouncedSearch}`);
      const responseText = await response.text();
      // Parse JSON
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', responseText);
        showToast('Format respon server salah', 'error');
        return;
      }

      if (response.ok && resData.status === 'success') {
        setRooms(resData.data);
      } else {
        showToast('Gagal memuat daftar kamar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync active tab with backend category filtering
    if (activeTab === 'Semua') {
      setSelectedCategory('');
    } else if (activeTab === 'Standard') {
      setSelectedCategory('Standard');
    } else if (activeTab === 'Deluxe') {
      setSelectedCategory('Deluxe');
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, debouncedSearch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getRoomImage = (kategori, gambar) => {
    if (gambar && gambar !== 'deluxe.png' && gambar !== 'standar.png' && !gambar.includes('images.unsplash.com')) {
      return gambar;
    }
    return kategori === 'Deluxe' ? deluxeImg : standarImg;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getFacilityImage = (gambar) => {
    if (!gambar) return dapurImg;
    if (gambar === 'dapur.png' || gambar.endsWith('/dapur.png')) return dapurImg;
    if (gambar === 'parkiran.png' || gambar.endsWith('/parkiran.png')) return parkiranImg;
    if (gambar === 'jemuran.png' || gambar.endsWith('/jemuran.png')) return jemuranImg;
    return gambar;
  };

  const fetchFacilities = async () => {
    setFacilitiesLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=get_facilities`);
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setFacilities(resData.data);
      } else {
        showToast('Gagal memuat daftar fasilitas', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Koneksi server gagal', 'error');
    } finally {
      setFacilitiesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Fasilitas Kos') {
      fetchFacilities();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] pb-24 font-sans">

      {/* Search Bar & Profile Header */}
      <div className="px-6 pt-6 pb-4 bg-white/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 h-12 bg-[#F7F7F7] rounded-full border border-[#E4E3E3] flex items-center px-4">
            <Search size={16} className="text-[#1B1C1C] mr-3 opacity-50" />
            <input
              type="text"
              placeholder="Cari tipe kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-sm font-semibold text-[#1B1C1C] focus:outline-none placeholder-gray-400"
            />
          </div>
          <div
            onClick={() => navigateTo('account')}
            className="w-10 h-10 bg-[#FF385C] text-white font-bold text-sm rounded-full border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:scale-95 transition"
          >
            {user ? user.username.charAt(0).toUpperCase() : 'T'}
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-[#E7E6E6] bg-white overflow-x-auto gap-2 scrollbar-none">
        {tabs.map((tab) => {
          let TabIcon = Building;
          if (tab === 'Semua') TabIcon = Layers;
          if (tab === 'Standard') TabIcon = Home;
          if (tab === 'Deluxe') TabIcon = Gem;
          if (tab === 'Fasilitas Kos') TabIcon = Wifi;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center gap-2 min-w-max px-2 transition ${activeTab === tab ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E4E3E3] rounded-xl flex items-center justify-center">
                <TabIcon size={18} className="text-[#222222]" />
              </div>
              <span
                className="text-xs font-semibold text-[#222222] border-b-2 border-transparent pb-1"
                style={activeTab === tab ? { borderColor: 'black' } : {}}
              >
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="px-6 mt-6">
        {activeTab === 'Fasilitas Kos' ? (
          /* ================= FACILITIES TAB ================= */
          <div className="flex flex-col gap-6">
            {facilitiesLoading ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted font-medium">Memuat data fasilitas...</p>
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[15px] border border-[#E7E6E6] p-6">
                <p className="text-sm text-gray-500 font-medium">Belum ada fasilitas yang ditambahkan</p>
              </div>
            ) : (
              facilities.map((fac) => (
                <div key={fac.id} className="bg-white rounded-xl border-2 border-[#DDDDDD] overflow-hidden shadow-sm">
                  {fac.gambar && (
                    <img 
                      src={getFacilityImage(fac.gambar)} 
                      alt={fac.nama} 
                      className="w-full h-48 object-cover" 
                      onError={(e) => { e.target.src = dapurImg; }}
                    />
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-[#1B1C1C] mb-3 text-center">{fac.nama}</h3>
                    <p className="text-sm text-black leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      {fac.deskripsi}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ================= ROOM CARDS TAB ================= */
          <div className="flex flex-col gap-8">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted font-medium">Memuat data kamar...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[15px] border border-[#E7E6E6] p-6">
                <Building size={40} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Kamar tidak ditemukan</p>
                <p className="text-xs text-gray-400 mt-1">Coba cari dengan kata kunci lain</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="w-full flex flex-col cursor-pointer group"
                  onClick={() => navigateTo('detail', room.id)}
                >
                  {/* Room Image */}
                  <div className="relative w-full aspect-[4/3] bg-gray-300 rounded-[15px] overflow-hidden mb-3 shadow-sm">
                    <img
                      src={getRoomImage(room.kategori, room.gambar)}
                      alt={room.nama}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                    {room.kategori === 'Deluxe' && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-extrabold text-[#222222] tracking-wider uppercase">
                        Guest Favorite
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-[#1B1C1C] group-hover:text-[#FF385C] transition">{room.nama}</h3>
                      <p className="text-sm text-[#6A6A6A] mt-1">{room.lokasi}</p>
                      <p className="text-xs font-semibold text-[#FF385C] mt-1">
                        Sisa {room.sisa_kamar !== undefined ? room.sisa_kamar : (room.kategori === 'Deluxe' ? 1 : 2)} kamar
                      </p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-[#1B1C1C]">{formatPrice(room.harga)}</span>
                        <span className="text-[15px] text-[#6A6A6A]">/ bulan</span>
                      </div>
                    </div>

                    {/* Rating & Booking */}
                    <div className="flex flex-col items-end justify-between h-[105px] gap-2">
                      {room.rating_rata > 0 ? (
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-[#E7E6E6] shadow-sm">
                          <span className="text-xs font-semibold text-[#1B1C1C]">{room.rating_rata}</span>
                          <Star size={12} className="text-[#FFB100] fill-[#FFB100] stroke-[#FFB100]" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-[#F9F7F7] px-2 py-1 rounded-full border border-[#E7E6E6] shadow-sm">
                          <span className="text-xs font-semibold text-[#9E9E9E]">-</span>
                          <Star size={12} className="text-[#C5C5D3]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering details card navigation
                          navigateTo('detail', room.id);
                        }}
                        className="bg-[#FF385C] text-white text-xs font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-opacity-95 transition"
                      >
                        Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
