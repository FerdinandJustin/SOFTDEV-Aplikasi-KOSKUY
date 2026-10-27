import React, { useState, useEffect } from 'react';
import { Search, Receipt, HelpCircle, User } from 'lucide-react';
import CusLogin from './cus_login';
import CusHome from './cus_home';
import CusDetail from './cus_detail';
import CusBooking from './cus_booking';
import CusPayment from './cus_payment';
import CusHistory from './cus_history';
import CusHelp from './cus_help';
import CusAccount from './cus_account';
import CusEditProfile from './cus_edit_profile';
import CusTransaction from './cus_transaction';

// API BASE URL pointing to localhost XAMPP phpMyAdmin API script
export const API_URL = 'http://localhost/koskuy_api/api.php';

export default function CusApp() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState('login');
  const [pageParam, setPageParam] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync session state to page routing
  useEffect(() => {
    if (user) {
      if (currentPage === 'login') {
        setCurrentPage('home');
      }
    } else {
      setCurrentPage('login');
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('cus_user');
    setUser(null);
    setCurrentPage('login');
    showToast('Berhasil keluar akun');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cus_user', JSON.stringify(updatedUser));
  };

  const navigateTo = (page, param = null) => {
    setCurrentPage(page);
    setPageParam(param);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <CusLogin onLoginSuccess={(u) => { setUser(u); localStorage.setItem('cus_user', JSON.stringify(u)); }} showToast={showToast} />;
      case 'home':
        return <CusHome navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'detail':
        return <CusDetail roomId={pageParam} navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'booking':
        return <CusBooking room={pageParam} navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'payment':
        return <CusPayment bookingId={pageParam} navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'history':
        return <CusHistory navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'help':
        return <CusHelp navigateTo={navigateTo} user={user} showToast={showToast} />;
      case 'account':
        return <CusAccount navigateTo={navigateTo} user={user} showToast={showToast} onLogout={handleLogout} />;
      case 'edit_profile':
        return <CusEditProfile navigateTo={navigateTo} user={user} showToast={showToast} onUpdateUser={handleUpdateUser} />;
      case 'transaction':
        return <CusTransaction navigateTo={navigateTo} user={user} showToast={showToast} />;
      default:
        return <CusHome navigateTo={navigateTo} user={user} showToast={showToast} />;
    }
  };

  // Pages that hide the navbar
  const hideNavPages = ['login', 'payment', 'booking', 'edit_profile', 'transaction'];
  const showNav = user && !hideNavPages.includes(currentPage);

  return (
    <div className="flex flex-col min-h-screen justify-between relative">

      {/* Active Page Content */}
      <div className="flex-1 pb-4">
        {renderPage()}
      </div>

      {/* Toast Alert overlay */}
      {toast && (
        <div className="toast">
          <span>{toast.message}</span>
        </div>
      )}

      {/* Bottom Navigation Menu */}
      {showNav && (
        <nav className="nav-bar">
          {/* Jelajahi (Home) */}
          <button
            className={`nav-item ${currentPage === 'home' || currentPage === 'detail' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <Search size={20} />
            <span className="mt-2 text-xs">Jelajahi</span>
          </button>

          {/* Pesanan (History) */}
          <button
            className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => navigateTo('history')}
          >
            <Receipt size={20} />
            <span className="mt-2 text-xs">Pesanan</span>
          </button>

          {/* Bantuan */}
          <button
            className={`nav-item ${currentPage === 'help' ? 'active' : ''}`}
            onClick={() => navigateTo('help')}
          >
            <HelpCircle size={20} />
            <span className="mt-2 text-xs">Bantuan</span>
          </button>

          {/* Akun */}
          <button
            className={`nav-item ${currentPage === 'account' ? 'active' : ''}`}
            onClick={() => navigateTo('account')}
          >
            <User size={20} />
            <span className="mt-2 text-xs">Akun</span>
          </button>
        </nav>
      )}
    </div>
  );
}
