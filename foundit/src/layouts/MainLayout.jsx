import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userName = localStorage.getItem('user_name') || 'UNKNOWN';
  const userRole = localStorage.getItem('user_role') || 'STUDENT';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-body persona-grid text-[#e2e2e2] bg-[#131313]">
      {/* TopNavBar */}
      <header className="w-full top-0 z-50 border-b-8 border-black bg-surface-bright flex justify-between items-center px-4 md:px-6 py-4 fixed">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu for Mobile */}
          <button 
            className="lg:hidden p-2 border-4 border-white bg-black text-white hover:bg-primary transition-colors flex items-center justify-center shadow-[3px_3px_0px_#d10000]" 
            onClick={toggleSidebar}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-black bg-white border-4 border-black px-4 py-1 shadow-[5px_5px_0px_#d10000] p5-skew cursor-pointer">
            <span className="inline-block p5-skew-reverse">FOUND-IT</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* <div className="relative group hidden md:block">
            <input 
              className="bg-white border-4 border-black rounded-none pl-4 pr-10 py-1 text-sm font-black uppercase focus:ring-0 focus:border-primary outline-none w-48 shadow-[3px_3px_0px_#d10000] text-black" 
              placeholder="CARI..." 
              type="text" 
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-black pointer-events-none">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
          </div> */}
          
          <button className="text-white bg-black hover:bg-primary p-2 border-4 border-white shadow-[3px_3px_0px_#d10000] transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <div className="relative group">
            <button 
              className="text-black bg-white hover:bg-primary hover:text-white p-2 border-4 border-black shadow-[3px_3px_0px_#d10000] transition-all flex items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-black border-4 border-white shadow-[8px_8px_0px_#d10000] z-50 flex flex-col">
                <a className="block px-4 py-3 font-black uppercase text-xs text-white hover:bg-primary border-b-2 border-white/20" href="#">My Profile</a>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 font-black uppercase text-xs text-white hover:bg-primary">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-[45] lg:hidden" 
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-0 lg:top-[5.5rem] h-full lg:h-[calc(100vh-5.5rem)] w-72 border-r-8 border-primary flex flex-col py-8 z-[48] transform transition-transform duration-400 ease-in-out bg-surface-container ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
          <div className="px-6 mb-12 flex items-center gap-4 mt-24 lg:mt-4">
            <div className="w-16 h-16 border-4 border-white overflow-hidden bg-white shadow-[5px_5px_0px_#d10000] rotate-3">
              <img alt="User Avatar" className="w-full h-full object-cover grayscale contrast-125" src="/profile/user_image.png" />
            </div>
            <div className="-rotate-2 min-w-0">
              <h3 className="font-black text-white text-lg tracking-tighter uppercase leading-none truncate">{userName}</h3>
              <p className="font-bold uppercase text-[10px] text-primary bg-white px-1 mt-1 inline-block">{userRole}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-4 px-3">
            <Link className={`flex items-center gap-4 text-white px-6 py-4 font-black uppercase text-sm border-l-8 transition-all ${location.pathname === '/' ? 'active-slice border-white shadow-[5px_5px_0px_theme(colors.black)]' : 'border-transparent hover:border-white hover:bg-primary'}`} to="/">
              <span className="material-symbols-outlined">home</span>
              <span>HOME</span>
            </Link>
            <Link className={`flex items-center gap-4 text-white px-6 py-4 font-black uppercase text-sm border-l-8 transition-all ${location.pathname === '/report-found' ? 'active-slice border-white shadow-[5px_5px_0px_theme(colors.black)]' : 'border-transparent hover:border-white hover:bg-primary'}`} to="/report-found">
              <span className="material-symbols-outlined">add_box</span>
              <span>LAPOR TEMUAN</span>
            </Link>
            <Link className={`flex items-center gap-4 text-white px-6 py-4 font-black uppercase text-sm border-l-8 transition-all ${location.pathname === '/report-lost' ? 'active-slice border-white shadow-[5px_5px_0px_theme(colors.black)]' : 'border-transparent hover:border-white hover:bg-primary'}`} to="/report-lost">
              <span className="material-symbols-outlined">search_off</span>
              <span>LAPOR KEHILANGAN</span>
            </Link>
            <Link className={`flex items-center gap-4 text-white px-6 py-4 font-black uppercase text-sm border-l-8 transition-all ${location.pathname === '/my-posts' ? 'active-slice border-white shadow-[5px_5px_0px_theme(colors.black)]' : 'border-transparent hover:border-white hover:bg-primary'}`} to="/my-posts">
              <span className="material-symbols-outlined">history_edu</span>
              <span>LAPORAN SAYA</span>
            </Link>
          </nav>
          
          <div className="mt-auto px-6 pb-12">
            <button onClick={handleLogout} className="w-full py-4 p5-button bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white -rotate-1">
              SYSTEM_LOGOUT
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 lg:ml-72 mt-20 lg:mt-[5.5rem]">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-16 mt-auto border-t-8 border-primary bg-black flex flex-col items-center gap-10 lg:ml-72 lg:w-[calc(100%-18rem)]">
        <div className="flex flex-wrap justify-center gap-10">
          <a className="font-black tracking-widest text-xs text-white hover:text-primary px-4 py-2 uppercase border-2 border-white/20 hover:border-primary transition-all p5-skew" href="#">
            <span className="inline-block p5-skew-reverse">PROTOCOL</span>
          </a>
          <a className="font-black tracking-widest text-xs text-white hover:text-primary px-4 py-2 uppercase border-2 border-white/20 hover:border-primary transition-all p5-skew" href="#">
            <span className="inline-block p5-skew-reverse">GRID_MAP</span>
          </a>
          <a className="font-black tracking-widest text-xs text-white hover:text-primary px-4 py-2 uppercase border-2 border-white/20 hover:border-primary transition-all p5-skew" href="#">
            <span className="inline-block p5-skew-reverse">SUPPORT</span>
          </a>
        </div>
        <div className="bg-white px-8 py-3 border-4 border-black shadow-[8px_8px_0px_#d10000] -rotate-1">
          <p className="font-black tracking-tighter text-md text-black uppercase italic">© 2026 PHANTOM THIEVES OF CODE</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
