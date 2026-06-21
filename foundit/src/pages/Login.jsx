import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    if (token) {
      if (role === 'officer' || role === 'admin' || role === 'petugas') {
        navigate('/officer/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: username,
        password: password
      });

      if (response.data.status === 200) {
        const { token, user } = response.data.data;

        // Set Auth Session
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_name', user.fullname);
        localStorage.setItem('user_username', user.username);

        if (user.role === 'officer' || user.role === 'admin' || user.role === 'petugas') {
            navigate('/officer/dashboard');
        } else {
            navigate('/');
        }
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.messages.error || "Autentikasi Gagal.");
      } else {
        setError("Tidak dapat terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-body persona-grid bg-[#131313] text-[#e2e2e2] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -left-32 -top-32 w-96 h-96 bg-primary rotate-45 opacity-10"></div>
      <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-primary rotate-12 opacity-10"></div>
      <div className="absolute top-20 right-20 w-32 h-8 bg-primary -skew-x-12 opacity-20 hidden md:block"></div>
      <div className="absolute bottom-32 left-20 w-48 h-8 bg-white -skew-x-12 opacity-5 hidden md:block"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-block text-3xl md:text-4xl font-black uppercase tracking-tighter text-black bg-white border-4 border-black px-6 py-2 shadow-[8px_8px_0px_#d10000] p5-skew mb-6">
            <span className="inline-block p5-skew-reverse">FOUND-IT</span>
          </div>
          <p className="font-black text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
            OUR NETWORK // ACCESS TERMINAL
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-8 border-black p-8 md:p-10 p5-card-shadow relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary rotate-45 opacity-10"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-primary p-3 border-4 border-black shadow-[4px_4px_0px_theme(colors.black)]">
                <span className="material-symbols-outlined text-white text-3xl">
                  shield
                </span>
              </div>
              <div>
                <h1 className="font-black text-2xl uppercase tracking-tight text-black leading-none">
                  LOGIN
                </h1>
                <p className="font-bold text-xs uppercase text-black/50 tracking-widest">
                  AKSES KE SISTEM
                </p>
              </div>
            </div>

            {error && <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{error}</p>}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                  NIM / Username <span className="text-primary">*</span>
                </label>
                <input
                  required
                  className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                  placeholder="MASUKKAN NIM ANDA..."
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-black text-sm uppercase text-black mb-2 tracking-widest">
                  Password <span className="text-primary">*</span>
                </label>
                <input
                  required
                  className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 text-black font-bold placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="w-full py-5 bg-primary text-white font-black text-xl uppercase tracking-widest border-4 border-black p5-button hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 group mt-4"
                type="submit"
              >
                <span className="material-symbols-outlined text-2xl transition-transform duration-200">
                  login
                </span>
                {loading ? "Loading..." : "LOGIN"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center mt-8">
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-white/20">
            © 2026 PHANTOM THIEVES OF CODE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
