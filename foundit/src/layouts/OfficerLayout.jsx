import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard',         icon: 'dashboard',       path: '/officer/dashboard' },
  { label: 'Inventaris Temuan', icon: 'inventory_2',     path: '/officer/inventory' },
  { label: 'Daftar Kehilangan', icon: 'search_off',      path: '/officer/lost-list' },
];

const SETTINGS_ITEMS = [
  { label: 'Master Kategori',   icon: 'category',        path: '/officer/settings/categories' },
];

const OfficerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userName = localStorage.getItem('user_name') || 'UNKNOWN';

  const isSettingsActive = SETTINGS_ITEMS.some(i => location.pathname.startsWith(i.path));

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
      {/* ── TopBar ── */}
      <header className="w-full top-0 z-50 bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-6 py-3 fixed shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-3xl">shield</span>
            FoundIT Dashboard
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span className="font-semibold text-xs uppercase tracking-wide">Portal Petugas</span>
          </div>

          <button className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <span className="hidden md:block font-medium text-sm truncate max-w-[120px]">{userName}</span>
              <span className="material-symbols-outlined text-gray-400 text-sm hidden md:block">expand_more</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase">Petugas Jaga</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                </div>
                <Link to="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">home</span>
                  Kembali ke Beranda User
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative pt-[60px]">
        {/* Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-gray-900/50 z-[45] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-white border-r border-gray-200 flex flex-col z-[48] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-2">Menu Utama</div>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${active ? 'text-red-600' : 'text-gray-400'}`}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            {/* Settings group */}
            <div className="pt-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Pengaturan</div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isSettingsActive ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isSettingsActive ? 'text-gray-900' : 'text-gray-400'}`}>settings</span>
                  <span>Sistem</span>
                </div>
                <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform duration-200 ${isSettingsOpen || isSettingsActive ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {(isSettingsOpen || isSettingsActive) && (
                <div className="mt-1 space-y-1">
                  {SETTINGS_ITEMS.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 pl-10 rounded-md text-sm transition-colors ${
                          active ? 'text-red-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Info Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-none">Pos Jaga Utama</p>
                <p className="text-xs text-gray-500 mt-1">Status: Online</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64 min-h-[calc(100vh-60px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OfficerLayout;
