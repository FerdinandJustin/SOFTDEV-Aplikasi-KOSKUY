import React, { useState, useEffect } from 'react';
import AdminLogin from './admin_login';
import AdminDashboard from './admin_dashboard';
import AdminKamar from './admin_kamar';
import AdminLaporan from './admin_laporan';
import AdminAkun from './admin_akun';
import AdminTransaksi from './admin_transaksi';

export const API_URL = 'http://localhost/koskuy_api/api.php';

// Icon components
const IconDashboard = ({ filled }) => filled ? (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
    <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" style={{ width: 22, height: 22 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

const IconKamar = ({ filled }) => filled ? (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" style={{ width: 22, height: 22 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const IconLaporan = ({ filled }) => filled ? (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
    <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM9.75 14.25a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5H9.75Zm0-3a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 0-1.5H9.75Z" clipRule="evenodd" />
    <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" style={{ width: 22, height: 22 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const IconAkun = ({ filled }) => filled ? (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" style={{ width: 22, height: 22 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export default function AdminApp() {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState('login');
  const [pageParams, setPageParams] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (admin) {
      if (currentPage === 'login') setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [admin]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setAdmin(null);
    setCurrentPage('login');
    showToast('Berhasil keluar admin');
  };

  const navigateTo = (page, params = null) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <AdminLogin
            onLoginSuccess={(u) => { setAdmin(u); localStorage.setItem('admin_user', JSON.stringify(u)); }}
            showToast={showToast}
          />
        );
      case 'dashboard':
        return <AdminDashboard navigateTo={navigateTo} admin={admin} showToast={showToast} />;
      case 'kamar':
        return <AdminKamar navigateTo={navigateTo} admin={admin} showToast={showToast} />;
      case 'reports':
        return <AdminLaporan navigateTo={navigateTo} admin={admin} showToast={showToast} />;
      case 'transactions':
        return <AdminTransaksi navigateTo={navigateTo} admin={admin} showToast={showToast} initialCategory={pageParams?.category || ''} />;
      case 'account':
        return <AdminAkun navigateTo={navigateTo} admin={admin} onLogout={handleLogout} />;
      default:
        return <AdminDashboard navigateTo={navigateTo} admin={admin} showToast={showToast} />;
    }
  };

  const showNav = admin && currentPage !== 'login';

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
    { key: 'kamar', label: 'Kamar', Icon: IconKamar },
    { key: 'reports', label: 'Laporan', Icon: IconLaporan },
    { key: 'account', label: 'Akun', Icon: IconAkun },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Active Page View */}
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
          background: '#1A1A1A', color: 'white', padding: '12px 24px', borderRadius: '99px',
          fontSize: '0.875rem', fontWeight: 600, zIndex: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          animation: 'fadeInOut 2.5s ease-in-out forwards',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          {toast.message}
        </div>
      )}

      {/* Bottom Nav Bar — 4 tabs */}
      {showNav && (
        <nav style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '450px',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid #EBEBEB',
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0 12px', zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          {navItems.map(({ key, label, Icon }) => {
            const active = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => navigateTo(key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? '#FF385C' : '#6A6A6A',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s',
                }}
              >
                <Icon filled={active} />
                <span style={{ fontSize: '0.68rem', fontWeight: active ? 700 : 500 }}>{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
