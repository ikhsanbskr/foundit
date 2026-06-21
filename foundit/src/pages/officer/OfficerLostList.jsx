import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const STATUS_CFG = {
  REPORTED: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'schedule', label: 'Reported' },
  RESOLVED: { badge: 'bg-green-50 text-green-700 border-green-200',     icon: 'check_circle', label: 'Resolved' },
};

const FILTERS = ['All', 'Reported', 'Resolved'];

const formatWA = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) return '62' + clean.slice(1);
  if (clean.startsWith('8')) return '62' + clean;
  return clean;
};

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
    <div className="fixed inset-0 z-[99999] flex flex-col" onClick={onClose}>
      {/* Full black overlay */}
      <div className="absolute inset-0 bg-black opacity-95 pointer-events-none" />

      {/* Top bar */}
      <div
        className="relative z-10 flex-shrink-0 border-b-4 border-red-600 bg-black px-6 py-3 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="bg-red-600 p-1.5 border-2 border-black shadow-[3px_3px_0px_theme(colors.black)]">
            <span className="material-symbols-outlined text-white text-base leading-none">
              photo_library
            </span>
          </span>
          <div>
            <span className="font-black uppercase text-white text-sm tracking-widest">
              IMAGE VIEWER
            </span>
            <span className="font-black text-red-600 text-xs ml-3 uppercase">
              {current + 1} <span className="text-white/40">/ {total}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="font-black text-[11px] uppercase text-white border-4 border-white/30 px-4 py-2 hover:bg-red-600 hover:border-red-600 transition-all flex items-center gap-2 shadow-[3px_3px_0px_#d10000]"
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
          alt={`img-${current}`}
          className="max-h-full max-w-full object-contain border-4 border-white/80 shadow-[0_0_60px_rgba(209,0,0,0.4)] transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 border-4 border-white/50 text-white p-3 hover:bg-red-600 hover:border-red-600 transition-all shadow-[4px_4px_0px_rgba(209,0,0,0.6)] z-10 group"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 border-4 border-white/50 text-white p-3 hover:bg-red-600 hover:border-red-600 transition-all shadow-[4px_4px_0px_rgba(209,0,0,0.6)] z-10 group"
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
                    ? "w-8 h-3 bg-red-600 border-red-600"
                    : "w-3 h-3 bg-transparent border-white/40 hover:border-red-600"
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
                    ? "border-red-600 shadow-[0_0_12px_rgba(209,0,0,0.8)] scale-110"
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Reset imgIndex when item changes
  useEffect(() => {
    setImgIndex(0);
  }, [item]);

  if (!item) return null;
  
  const images = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
  const total = images.length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Detail Kehilangan</h3>
              <p className="text-sm font-medium text-gray-500">Tiket: <span className="text-gray-900 font-mono">{item.ticket_number || item.id}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div 
            className="aspect-video bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            onClick={() => setLightboxOpen(true)}
          >
            {total > 0 ? (
              <>
                <img src={images[imgIndex]} alt="Item" className="w-full h-full object-cover transition-all" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-5xl">zoom_in</span>
                </div>
                {total > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImgIndex((c) => (c - 1 + total) % total); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImgIndex((c) => (c + 1) % total); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
                      {imgIndex + 1} / {total}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-4xl">hide_image</span></div>
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 text-xl mb-2">{item.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-100 col-span-2">
                <p className="text-xs text-gray-500 mb-1">Pelapor</p>
                <p className="text-sm font-semibold text-gray-900 break-words leading-snug">{item.reporter_display || item.reporter}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Kategori // Sub</p>
                <p className="text-sm font-semibold text-gray-900">{item.category} // {item.category_detail || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Lokasi Hilang</p>
                <p className="text-sm font-semibold text-gray-900">{item.location}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Waktu Kejadian</p>
                <p className="text-sm font-semibold text-gray-900">{item.event_time || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Waktu Lapor</p>
                <p className="text-sm font-semibold text-gray-900">{item.date}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Imbalan (Bounty)</p>
                <p className="text-sm font-semibold text-green-600">Rp {Number(item.bounty_amount || 0).toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap mb-4">
              <span className="font-semibold block mb-2 text-gray-900">Deskripsi:</span>
              {item.description}
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-100 text-sm text-yellow-900 whitespace-pre-wrap">
              <span className="font-semibold block mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">lock</span> Ciri-Ciri Spesifik (Rahasia):</span>
              {item.verification_description || '-'}
            </div>
          </div>
        </div>
      </div>
      
      {lightboxOpen && total > 0 && (
        <Lightbox 
          images={images} 
          startIndex={imgIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const OfficerLostList = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/officer/inventory?type=LOST`, { headers });
      if (res.data?.data) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const effectiveStatus = item.status === 'SECURED' ? 'REPORTED' : item.status;
    if (activeTab !== 'All' && effectiveStatus.toUpperCase() !== activeTab.toUpperCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.ticket_number?.toLowerCase().includes(q) ||
        item.reporter?.toLowerCase().includes(q) ||
        item.id.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Laporan Kehilangan</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar referensi barang yang dilaporkan hilang oleh pengguna (Read-only).</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {FILTERS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[100px] px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {tab === 'All' ? 'All' : STATUS_CFG[tab.toUpperCase()]?.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 lg:max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input
              type="text"
              placeholder="Cari Tiket, barang, pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block pl-10 p-2.5 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="text-center py-16">
             <span className="material-symbols-outlined text-5xl text-red-600 animate-spin">sync</span>
             <p className="font-semibold text-sm mt-4 text-gray-500">Memuat Data...</p>
           </div>
        ) : filteredItems.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Barang / Tiket</th>
                    <th className="px-6 py-4">Pelapor & Lokasi Temuan</th>
                    <th className="px-6 py-4">Waktu Lapor</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const cfg = STATUS_CFG[item.status] || STATUS_CFG.REPORTED;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-300">hide_image</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{item.ticket_number || item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-gray-400">person</span>{item.reporter}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>{item.location}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {item.phone_number && (
                              <a
                                href={`https://wa.me/${formatWA(item.phone_number)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                              >
                                <span className="material-symbols-outlined text-[18px] mr-1">chat</span> Hubungi WA
                              </a>
                            )}
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const cfg = STATUS_CFG[item.status] || STATUS_CFG.REPORTED;
                return (
                  <div key={item.id} className="p-4 flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-300">hide_image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{item.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mb-2">{item.ticket_number || item.id}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}>
                          <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">person</span>
                        <span className="truncate">{item.reporter}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">schedule</span>
                        <span className="truncate">{item.date.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      {item.phone_number && (
                        <a
                          href={`https://wa.me/${formatWA(item.phone_number)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 flex items-center justify-center gap-1 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span> Hubungi WA
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 py-2 flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500">Tidak ada laporan kehilangan yang sesuai dengan filter atau kata kunci Anda.</p>
          </div>
        )}
      </div>

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default OfficerLostList;
