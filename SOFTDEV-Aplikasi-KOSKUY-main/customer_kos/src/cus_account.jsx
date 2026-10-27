import React from 'react';
import { Receipt, Bell, HelpCircle, LogOut, ChevronRight, User } from 'lucide-react';
import logo from './logokuskuy.png';

export default function CusAccount({ navigateTo, user, showToast, onLogout }) {
  const menuItems = [
    {
      icon: <Receipt size={22} className="text-[#222222]" />,
      label: 'Riwayat Transaksi',
      desc: 'Lihat dan unduh riwayat pembayaran serta invoice Anda.',
      action: () => navigateTo('transaction'),
    },
    {
      icon: <Bell size={22} className="text-[#222222]" />,
      label: 'Notifikasi',
      desc: 'Atur pengingat pembayaran dan pesan baru.',
      action: () => showToast('Fitur notifikasi segera hadir', 'info'),
    },
    {
      icon: <HelpCircle size={22} className="text-[#222222]" />,
      label: 'Bantuan',
      desc: 'Pusat bantuan dan dukungan pelanggan KosKuy.',
      action: () => navigateTo('help'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7] font-['Plus_Jakarta_Sans'] pb-28">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <img src={logo} alt="KosKuy Logo" className="w-7 h-7 object-contain" />
        <h1 className="text-xl font-extrabold text-[#FF385C] tracking-wide">KosKuy</h1>
      </div>

      <div className="px-6 pt-8 pb-6 bg-white flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-[#E8E8E8] flex items-center justify-center mb-4 shadow-sm">
          <User size={44} className="text-[#9E9E9E]" />
        </div>

        {/* User Info */}
        <h2 className="text-xl font-bold text-[#222222]">{user?.username || 'Pengguna'}</h2>
        <p className="text-sm text-[#6A6A6A] mt-1">{user?.email || '-'}</p>
        <p className="text-sm text-[#6A6A6A]">{user?.no_hp || ''}</p>

        {/* Edit Profile */}
        <button
          onClick={() => navigateTo('edit_profile')}
          className="mt-4 flex items-center gap-1.5 text-sm text-[#222222] font-medium border border-[#DDDDDD] px-4 py-2 rounded-full hover:bg-gray-50 transition cursor-pointer"
        >
          <span className="text-base">✏️</span> Ubah Profil
        </button>
      </div>

      {/* Menu Items */}
      <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full bg-white rounded-[14px] border border-[#EBEBEB] p-5 flex items-start justify-between gap-3 text-left hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <div className="flex flex-col gap-2">
              {item.icon}
              <div>
                <p className="text-sm font-bold text-[#222222]">{item.label}</p>
                <p className="text-xs text-[#6A6A6A] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E] shrink-0 mt-1" />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-[14px] border border-[#EBEBEB] p-5 flex items-start justify-between gap-3 text-left hover:bg-red-50 transition cursor-pointer shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <LogOut size={22} className="text-[#FF385C]" />
            <div>
              <p className="text-sm font-bold text-[#FF385C]">Keluar</p>
              <p className="text-xs text-[#6A6A6A] mt-0.5">Akhiri sesi Anda di perangkat ini.</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#9E9E9E] shrink-0 mt-1" />
        </button>
      </div>
    </div>
  );
}
