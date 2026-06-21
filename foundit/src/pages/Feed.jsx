import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── Lightbox Modal (full dark overlay) ──────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + total) % total);
  };
  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % total);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [total, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col" onClick={onClose}>
      {/* Full black overlay */}
      <div className="absolute inset-0 bg-black opacity-95 pointer-events-none" />

      {/* Top bar */}
      <div
        className="relative z-10 flex-shrink-0 border-b-4 border-primary bg-black px-6 py-3 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="bg-primary p-1.5 border-2 border-black shadow-[3px_3px_0px_theme(colors.black)]">
            <span className="material-symbols-outlined text-white text-base leading-none">
              photo_library
            </span>
          </span>
          <div>
            <span className="font-black uppercase text-white text-sm tracking-widest">
              INTEL VIEWER
            </span>
            <span className="font-black text-primary text-xs ml-3 uppercase">
              {current + 1} <span className="text-white/40">/ {total}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="font-black text-[11px] uppercase text-white border-4 border-white/30 px-4 py-2 hover:bg-primary hover:border-primary transition-all flex items-center gap-2 shadow-[3px_3px_0px_#d10000]"
        >
          <span className="material-symbols-outlined text-base">close</span> ESC
        </button>
      </div>

      {/* Main image area */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center p-8 overflow-hidden"
        onClick={onClose}
      >
        <img
          src={images[current]}
          alt={`intel-${current}`}
          className="max-h-full max-w-full object-contain border-4 border-white/80 shadow-[0_0_60px_rgba(209,0,0,0.4)] transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 border-4 border-white/50 text-white p-3 hover:bg-primary hover:border-primary transition-all shadow-[4px_4px_0px_rgba(209,0,0,0.6)] z-10 group"
          >
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
              chevron_left
            </span>
          </button>
        )}

        {/* Next */}
        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 border-4 border-white/50 text-white p-3 hover:bg-primary hover:border-primary transition-all shadow-[4px_4px_0px_rgba(209,0,0,0.6)] z-10 group"
          >
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
              chevron_right
            </span>
          </button>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`transition-all border-2 ${
                  i === current
                    ? "w-8 h-3 bg-primary border-primary"
                    : "w-3 h-3 bg-transparent border-white/40 hover:border-primary"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="relative z-10 flex-shrink-0 border-t-4 border-white/10 bg-black/90 px-6 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex gap-3 overflow-x-auto justify-center pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-16 border-4 overflow-hidden transition-all duration-200 ${
                  i === current
                    ? "border-primary shadow-[0_0_12px_rgba(209,0,0,0.8)] scale-110"
                    : "border-white/20 opacity-40 hover:opacity-80 hover:border-white/60"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Single Image Viewer (inside card, with prev/next) ────────────────────────
const CardImageViewer = ({ images, onOpenLightbox }) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  if (!images || images.length === 0) return null;

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + total) % total);
  };
  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % total);
  };

  return (
    <div className="mb-8 relative group/viewer">
      {/* Main image */}
      <div
        className="border-4 border-black shadow-[8px_8px_0px_#d10000] overflow-hidden cursor-zoom-in relative bg-black aspect-[16/10]"
        onClick={() => onOpenLightbox(current)}
      >
        <img
          src={images[current]}
          alt={`img-${current}`}
          className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-500"
        />

        {/* Dark gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Zoom hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
          <div className="bg-black/80 border-4 border-white px-4 py-2 shadow-[4px_4px_0px_#d10000]">
            <span className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                zoom_in
              </span>
              CLICK TO EXPAND
            </span>
          </div>
        </div>

        {/* Image counter badge */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 bg-black border-2 border-primary px-3 py-1 shadow-[3px_3px_0px_#d10000]">
            <span className="font-black text-[10px] text-white uppercase tracking-widest">
              {current + 1} <span className="text-primary">/</span> {total}
            </span>
          </div>
        )}
      </div>

      {/* Prev/Next arrows — only if multiple images */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black border-4 border-white text-white p-2 hover:bg-primary hover:border-primary transition-all shadow-[3px_3px_0px_#d10000] opacity-0 group-hover/viewer:opacity-100"
          >
            <span className="material-symbols-outlined text-2xl">
              chevron_left
            </span>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black border-4 border-white text-white p-2 hover:bg-primary hover:border-primary transition-all shadow-[3px_3px_0px_#d10000] opacity-0 group-hover/viewer:opacity-100"
          >
            <span className="material-symbols-outlined text-2xl">
              chevron_right
            </span>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`transition-all border-2 ${
                i === current
                  ? "w-6 h-2.5 bg-primary border-primary"
                  : "w-2.5 h-2.5 bg-transparent border-black/40 hover:border-primary"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Contact Security Modal ───────────────────────────────────────────────────
const ContactSecurityModal = ({ post, onClose }) => {
  const [lostTicket, setLostTicket] = useState("");
  const [lostData, setLostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearchLostItem = async (e) => {
    e.preventDefault();
    if (!lostTicket) return;
    
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_BASE}/reports/ticket/${lostTicket}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        setLostData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mencari laporan kehilangan Anda. Pastikan tiket valid dan milik Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactWA = () => {
    const phone = "6287840233052";
    const userName = localStorage.getItem('user_name') || '[Nama Pengguna]';
    const userNim = localStorage.getItem('user_username') || '[NIM]';
    const text = `Selamat pagi/siang Tim Keamanan Kampus. Saya *${userName}* dengan nim *${userNim}*, ingin menanyakan status barang temuan secara manual.\n\nSaya memiliki laporan kehilangan dengan Tiket Kehilangan: *${lostTicket}*, dan saya melihat ada kemiripan dengan postingan Tiket Temuan: *${post.ticket_number}* yang dikelola oleh pihak posko.\n\nApakah saya diperbolehkan datang ke posko untuk mengecek dan mencocokkan fisik barangnya secara langsung? Saya akan membawa bukti-bukti kepemilikan yang sah. Terima kasih banyak.`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-90 pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl bg-black border-4 border-white shadow-[8px_8px_0px_#d10000] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between border-b-4 border-white">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white text-3xl">security</span>
            <div>
              <h3 className="font-black text-xl uppercase tracking-widest italic">Kontak Keamanan</h3>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Verifikasi Tiket Klaim</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-black hover:bg-white hover:text-black text-white border-2 border-transparent transition-colors shadow-[2px_2px_0px_theme(colors.white)]">
            <span className="material-symbols-outlined font-black">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!lostData ? (
            <div className="space-y-6">
              <div className="bg-white p-4 border-l-8 border-primary text-sm font-bold text-black uppercase">
                Masukkan nomor tiket Laporan Kehilangan milik Anda untuk memverifikasi kepemilikan sebelum menghubungi petugas.
              </div>
              <form onSubmit={handleSearchLostItem}>
                <label className="block text-white font-black uppercase text-sm mb-2">Tiket Laporan Kehilangan (TKT-xxx)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={lostTicket}
                    onChange={(e) => setLostTicket(e.target.value.toUpperCase())}
                    placeholder="TKT-..."
                    className="flex-1 bg-white border-4 border-white p-3 text-black font-bold uppercase placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest hover:bg-red-700 transition-colors border-4 border-white"
                  >
                    {loading ? 'WAIT...' : 'CARI'}
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-primary font-bold uppercase border-l-4 border-primary pl-2 bg-black/50 p-2">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary border-l-8 border-white p-4">
                <h4 className="font-black text-white uppercase">Data Kehilangan Ditemukan!</h4>
                <p className="text-white/80 text-sm mt-1">Silakan konfirmasi jika ini benar data kehilangan Anda.</p>
              </div>

              <div className="border-4 border-white p-4 bg-black relative">
                <div className="absolute top-0 right-0 bg-white text-black px-3 py-1 font-black text-xs uppercase tracking-widest border-b-4 border-l-4 border-white">
                  {lostData.ticket_number}
                </div>
                <h5 className="font-black text-xl text-white uppercase mb-1 w-3/4">{lostData.item_name}</h5>
                <p className="text-sm font-bold text-primary uppercase mb-3"><span className="material-symbols-outlined text-[14px] align-middle">location_on</span> {lostData.location_found}</p>
                
                <div className="bg-white/10 p-3 border-l-4 border-primary text-sm italic text-white/90">
                  "{lostData.description}"
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLostData(null)}
                  className="px-6 py-3 bg-black text-white border-4 border-white font-black uppercase hover:bg-white hover:text-black transition-colors"
                >
                  UBAH TIKET
                </button>
                <button
                  type="button"
                  onClick={handleContactWA}
                  className="px-6 py-3 bg-[#25D366] text-white border-4 border-[#25D366] font-black uppercase hover:bg-[#20bd5a] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">chat</span> KONFIRMASI & WA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const PostCard = ({ post, onOpenContact }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Sanitize images to relative paths to ensure Vite proxy handles them (avoids Mixed Content)
  const sanitizedImages =
    post.images?.map((url) => {
      try {
        if (url.startsWith("http")) {
          const urlObj = new URL(url);
          return urlObj.pathname;
        }
        return url;
      } catch {
        return url;
      }
    }) || [];

  let statusClasses = "";
  let statusIcon = "";
  switch (post.status) {
    case "REPORTED":
      statusClasses =
        "-rotate-3 bg-yellow-400 text-black border-black shadow-[3px_3px_0px_theme(colors.black)]";
      statusIcon = "campaign";
      break;
    case "SECURED":
      statusClasses =
        "rotate-2 bg-green-500 text-black border-black shadow-[3px_3px_0px_theme(colors.black)]";
      statusIcon = "shield";
      break;
    case "RESOLVED":
      statusClasses =
        "-rotate-2 bg-green-600 text-white border-black shadow-[3px_3px_0px_theme(colors.black)]";
      statusIcon = "check_circle";
      break;
    default:
      statusClasses =
        "rotate-2 bg-black text-white border-primary shadow-[3px_3px_0px_#d10000]";
      statusIcon = "info";
  }

  return (
    <>
      <div className="bg-white border-4 border-black p5-card-shadow overflow-hidden">
        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black ${post.headerDark ? "bg-black" : "bg-white"}`}
        >
          <div className="flex items-center gap-3">
            {post.avatar ? (
              <img
                alt="User"
                className={`w-12 h-12 border-2 bg-white object-cover grayscale shrink-0 ${post.headerDark ? "border-white" : "border-black"}`}
                src={post.avatar}
              />
            ) : (
              <div className="w-12 h-12 border-4 border-black bg-black shrink-0 flex items-center justify-center text-white font-black text-sm italic">
                {post.initials}
              </div>
            )}
            <div className="min-w-0">
              <h4
                className={`font-black text-sm uppercase italic truncate ${post.headerDark ? "text-white" : "text-black"}`}
              >
                {post.username}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p
                  className={`font-bold text-[10px] uppercase shrink-0 ${post.headerDark ? "text-primary" : "text-black/60"}`}
                >
                  {post.meta}
                </p>
                {post.location && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 ${post.headerDark ? "bg-primary text-white" : "bg-black text-white"}`}
                  >
                    <span className="material-symbols-outlined text-[10px]">
                      location_on
                    </span>
                    {post.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={`font-black text-[10px] px-3 py-1.5 uppercase border-2 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto ${statusClasses}`}
          >
            <span className="material-symbols-outlined text-sm">
              {statusIcon}
            </span>
            {post.status}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-[11px] font-black uppercase tracking-widest px-3 py-1 inline-block -skew-x-12 bg-black text-white"
            >
              <span className="text-white">{post.category}</span> // <span className="text-white">{post.category_detail}</span>
            </span>
            {post.ticket_number && (
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 inline-block border-2 border-black bg-white text-black -skew-x-12 shadow-[2px_2px_0px_#000]">
                {post.ticket_number}
              </span>
            )}
          </div>
          <h2 className="font-black text-3xl md:text-4xl text-black mb-4 uppercase leading-[0.9]">
            {post.title}
          </h2>
          <p className="text-black text-lg font-bold leading-tight mb-6">
            {post.description}
          </p>

          <CardImageViewer
            images={sanitizedImages}
            onOpenLightbox={(i) => setLightboxIndex(i)}
          />

          {post.status === "SECURED" && (
            <button 
              onClick={() => onOpenContact(post)}
              className="w-full py-5 bg-primary text-white font-black uppercase text-md tracking-widest border-4 border-black p5-button hover:bg-black transition-colors"
            >
              HUBUNGI KEAMANAN KAMPUS
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={sanitizedImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

// ─── Feed Page ────────────────────────────────────────────────────────────────
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactPost, setContactPost] = useState(null);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    date_start: "",
    date_end: "",
    status: "",
  });

  // Fetch Categories for Dropdown
  useEffect(() => {
    axios
      .get(`${API_BASE}/master/categories`)
      .then((res) => {
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const fetchFeed = () => {
    setLoading(true);

    // Build query params
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.category) params.append("category", filters.category);
    if (filters.date_start) params.append("date_start", filters.date_start);
    if (filters.date_end) params.append("date_end", filters.date_end);
    if (filters.status) params.append("status", filters.status);

    axios
      .get(`${API_BASE}/reports/found?${params.toString()}`)
      .then((res) => {
        if (res.data?.data) {
          setPosts(res.data.data);
        }
      })
      .catch((err) => console.error("Gagal mengambil feed:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilter = (e) => {
    e.preventDefault();
    fetchFeed();
  };

  return (
    <>
      <nav className="max-w-3xl mx-auto mb-8 flex items-center gap-2 font-black uppercase text-[12px] tracking-tighter text-white/40">
        <Link className="hover:text-primary" to="/">
          HOME
        </Link>
        <span className="text-primary">/</span>
        <span className="text-white">FEED TEMUAN</span>
      </nav>

      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="mb-16 bg-white p-8 border-8 border-black p5-card-shadow relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary rotate-45 opacity-10"></div>
          <div className="relative z-10">
            <h1 className="font-black text-5xl md:text-7xl text-black leading-[0.8] uppercase stencil-text mb-6">
              FEED TEMUAN
              <br />
              BARANG
            </h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <p className="font-black text-white bg-black text-xs tracking-tight uppercase px-4 py-2 p5-skew inline-block">
                <span className="inline-block p5-skew-reverse">
                  SINKRONISASI DATA... OK
                </span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`p-4 text-white p5-button transition-colors ${showFilter ? "bg-primary" : "bg-black"}`}
                >
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <Link
                  to="/report-found"
                  className="px-8 py-4 bg-primary text-white font-black text-sm uppercase p5-button flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>{" "}
                  LAPOR
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <form
            onSubmit={applyFilter}
            className="mb-16 bg-black p-6 border-4 border-primary shadow-[8px_8px_0px_#d10000] -rotate-1 relative z-10 animate-fade-in"
          >
            <h3 className="font-black text-2xl text-white uppercase mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                manage_search
              </span>
              FILTER RADAR
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">
                  Kata Kunci
                </label>
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Cari nama barang..."
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">SEMUA KATEGORI</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  name="date_start"
                  value={filters.date_start}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  name="date_end"
                  value={filters.date_end}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-primary font-bold text-xs uppercase mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-4">
                  {["", "REPORTED", "SECURED", "RESOLVED"].map(
                    (status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={filters.status === status}
                          onChange={handleFilterChange}
                          className="hidden"
                        />
                        <span
                          className={`w-5 h-5 border-2 flex items-center justify-center ${filters.status === status ? "border-primary bg-primary" : "border-white bg-black"}`}
                        >
                          {filters.status === status && (
                            <span className="w-2 h-2 bg-black"></span>
                          )}
                        </span>
                        <span
                          className={`font-bold text-sm uppercase ${filters.status === status ? "text-primary" : "text-white/70 group-hover:text-white"}`}
                        >
                          {status || "SEMUA"}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t-2 border-white/10 pt-6">
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    keyword: "",
                    category: "",
                    date_start: "",
                    date_end: "",
                    status: "",
                  });
                  setTimeout(fetchFeed, 0); // Re-fetch immediately without filters
                }}
                className="px-6 py-3 bg-white text-black font-black uppercase text-sm border-2 border-black hover:bg-gray-200 transition-colors"
              >
                RESET
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-white font-black uppercase text-sm border-2 border-primary hover:bg-red-700 shadow-[4px_4px_0px_#fff] transition-all"
              >
                TERAPKAN FILTER
              </button>
            </div>
          </form>
        )}

        {/* Posts */}
        <div className="space-y-20">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onOpenContact={(p) => setContactPost(p)}
            />
          ))}
          {!loading && posts.length === 0 && (
            <div className="text-center p-12 border-4 border-white bg-black text-white font-bold uppercase tracking-widest rotate-2">
              NO FEED DETECTED
            </div>
          )}
        </div>

        {/* Modals */}
        {contactPost && (
          <ContactSecurityModal 
            post={contactPost} 
            onClose={() => setContactPost(null)} 
          />
        )}

        {/* Loader */}
        {loading && (
          <div className="mt-24 flex flex-col items-center gap-6">
            <p className="font-black text-sm text-white uppercase tracking-[0.4em] animate-pulse">
              SINKRONISASI DATA...
            </p>
            <div className="w-72 h-10 bg-black border-4 border-white relative overflow-hidden shadow-[6px_6px_0px_#d10000]">
              <div className="absolute inset-y-0 left-0 bg-primary w-2/3 animate-p5-load"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Feed;
