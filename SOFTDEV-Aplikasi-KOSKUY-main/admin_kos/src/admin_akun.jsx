import React from 'react';
import logo from './logokuskuy.png';

export default function AdminAkun({ navigateTo, admin, onLogout }) {
  const menuItems = [
    {
      group: 'account',
      items: [
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          ),
          label: 'Profil Saya',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          ),
          label: 'Keamanan Akun',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          ),
          label: 'Pengaturan Notifikasi',
        },
      ],
    },
    {
      group: 'support',
      items: [
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          ),
          label: 'Pusat Bantuan',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 22, height: 22 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          ),
          label: 'Tentang Aplikasi',
        },
      ],
    },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: '80px',
    }}>
      {/* Header — just logo, no avatar per design */}
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid #F0F0F0',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <img src={logo} alt="KosKuy Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FF385C', letterSpacing: '0.5px' }}>KosKuy</span>
      </header>

      <main style={{ padding: '0 24px', maxWidth: '450px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Profile Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 0', borderBottom: '1px solid #F0F0F0' }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: '3px solid #EBEBEB',
            background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#B0B0B0" style={{ width: 44, height: 44 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111', margin: '0 0 2px' }}>
              {admin?.username ? (admin.username.charAt(0).toUpperCase() + admin.username.slice(1)) : 'Admin KosKuy'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6A6A6A', margin: '0 0 8px' }}>
              {admin?.email || 'admin@koskuy.com'}
            </p>
            <span style={{
              display: 'inline-block', padding: '3px 10px', border: '1.5px solid #DDDDDD',
              borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, color: '#444', letterSpacing: '0.5px',
            }}>
              ADMINISTRATOR
            </span>
          </div>
        </div>

        {/* Menu Groups */}
        {menuItems.map((group, gi) => (
          <div key={gi}>
            {group.items.map((item, i) => (
              <button
                key={i}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: '1px solid #F5F5F5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#333' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111' }}>{item.label}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#B0B0B0" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
            {gi === 0 && <div style={{ height: '12px' }} />}
          </div>
        ))}

        {/* Keluar Button */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            padding: '8px 0',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#FF385C" style={{ width: 22, height: 22 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FF385C' }}>Keluar</span>
        </button>
      </main>
    </div>
  );
}
