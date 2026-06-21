import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const STATUS_CFG = {
  REPORTED: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'schedule', label: 'Reported' },
  SECURED:  { badge: 'bg-blue-50 text-blue-700 border-blue-200',   icon: 'verified_user', label: 'Secured' },
  RESOLVED: { badge: 'bg-green-50 text-green-700 border-green-200',     icon: 'check_circle', label: 'Resolved' },
};

const FILTERS = ['ALL', 'REPORTED', 'SECURED', 'RESOLVED'];

import Lightbox from '../../components/ui/Lightbox';

// ─── Verification & Compare Modal ───────────────────────────────────────────────
const VerifyModal = ({ item, onClose, onVerified }) => {
  const [lostTicket, setLostTicket] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const handleSearchLostItem = async (e) => {
    e.preventDefault();
    if (!lostTicket) return;
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/officer/compare-claim?found_ticket=${item.ticket_number}&lost_ticket=${lostTicket}`, { headers });
      if (res.data?.data) {
        setCompareData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengambil data komparasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClaim = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE}/officer/resolve-claim`, {
        found_ticket: item.ticket_number,
        lost_ticket: lostTicket
      }, { headers });
      
      onVerified(item.id, 'RESOLVED');
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menyelesaikan klaim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Verifikasi Klaim Barang Temuan</h3>
              <p className="text-sm font-medium text-gray-500">Tiket Temuan: <span className="text-gray-900 font-mono">{item.ticket_number || item.id}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {item.status === 'REPORTED' ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center mb-6">
                <span className="material-symbols-outlined text-5xl text-blue-500 mb-2">inventory_2</span>
                <h4 className="text-lg font-bold text-gray-900">Amankan Barang Temuan</h4>
                <p className="text-sm text-gray-500 mt-2">Barang ini masih berstatus <strong>Dilaporkan</strong>. Pastikan Anda telah menerima barang fisik dari penemu sebelum mengamankannya.</p>
                <p className="text-sm text-gray-500 mt-2">Setelah diamankan, sistem otomatis akan mencari kecocokan dengan data laporan kehilangan dan menghubungi pemiliknya.</p>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const token = localStorage.getItem("auth_token");
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    const res = await axios.post(`${API_BASE}/officer/secure-item/${item.id}`, {}, { headers });
                    alert(res.data.message + (res.data.matches_found > 0 ? ` Ditemukan ${res.data.matches_found} potensi kecocokan.` : ''));
                    onVerified(item.id, 'SECURED');
                    onClose();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Gagal mengamankan barang.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Ya, Amankan Barang Ini'}
              </button>
            </div>
          ) : !compareData ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center mb-6">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">person_search</span>
                <h4 className="text-lg font-bold text-gray-900">Cari Tiket Kehilangan</h4>
                <p className="text-sm text-gray-500">Masukkan nomor tiket dari pelapor yang kehilangan barang untuk melakukan pencocokan dengan barang temuan ini.</p>
              </div>
              <form onSubmit={handleSearchLostItem}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Tiket Kehilangan (TKT-xxx)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={lostTicket}
                    onChange={(e) => setLostTicket(e.target.value.toUpperCase())}
                    placeholder="Contoh: TKT-A1B2C3D"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm outline-none uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Mencari...' : 'Cari'}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-600">info</span>
                <div>
                  <h4 className="font-bold text-yellow-900">Komparasi Data</h4>
                  <p className="text-sm text-yellow-800">Mohon cocokkan barang secara fisik. Jika pelapor dapat membuktikan bahwa barang temuan ini adalah miliknya (mencocokkan ciri-ciri di Laporan Kehilangan), klik "Konfirmasi & Selesaikan".</p>
                </div>
              </div>

              {compareData.ai_match && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-600">auto_awesome</span>
                  <div>
                    <h4 className="font-bold text-green-900">Hasil Analisis AI: Kecocokan {compareData.ai_match.score}%</h4>
                    <p className="text-sm text-green-800">{compareData.ai_match.reason}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Found Item */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                    <span className="font-bold text-indigo-900">Data Temuan (Fisik)</span>
                    <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-100 px-2 py-1 rounded">{compareData.found.ticket_number}</span>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    <div 
                      className="aspect-video bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                      onClick={() => openLightbox(compareData.found.images || (compareData.found.image ? [compareData.found.image] : []))}
                    >
                      {compareData.found.image ? (
                        <>
                          <img src={compareData.found.image} alt="Found" className="w-full h-full object-cover transition-all" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-5xl">zoom_in</span>
                          </div>
                          {(compareData.found.images?.length > 1) && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                              {compareData.found.images.length} GAMBAR
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-4xl">hide_image</span></div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{compareData.found.item_name || compareData.found.title}</h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 col-span-2">
                          <p className="text-[10px] text-gray-500 mb-0.5">Penemu</p>
                          <p className="text-xs font-semibold text-gray-900 break-words leading-snug">{compareData.found.reporter_display || compareData.found.reporter}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Kategori</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.found.category} // {compareData.found.category_detail || '-'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Lokasi Temuan</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.found.location_found || compareData.found.location}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Waktu Kejadian</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.found.event_time || '-'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Waktu Lapor</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.found.date}</p>
                        </div>
                      </div>

                      {(compareData.found.phone_number || compareData.found.email) && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
                          <span className="font-semibold block mb-1 text-blue-900 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">contact_phone</span> Kontak Penemu:</span>
                          <p className="text-xs text-blue-800">{compareData.found.phone_number || '-'} / {compareData.found.email || '-'}</p>
                        </div>
                      )}

                      {compareData.found.account_number && (
                        <div className="bg-green-50 p-3 rounded border border-green-100 mb-4">
                          <span className="font-semibold block mb-1 text-green-900 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">account_balance</span> Rekening Pembayaran Imbalan:</span>
                          <p className="text-xs text-green-800">{compareData.found.bank_name || 'Bank'} - {compareData.found.account_number}</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-700 whitespace-pre-wrap mb-3">
                        <span className="font-semibold block mb-1 text-gray-900">Deskripsi Detail:</span>
                        {compareData.found.description}
                      </div>

                      <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-900 whitespace-pre-wrap">
                        <span className="font-semibold block mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lock</span> Ciri-Ciri Rahasia (Bila ada):</span>
                        {compareData.found.verification_description || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lost Item */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
                  <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex justify-between items-center">
                    <span className="font-bold text-rose-900">Laporan Kehilangan (Klaim)</span>
                    <span className="text-xs font-mono text-rose-600 font-bold bg-rose-100 px-2 py-1 rounded">{compareData.lost.ticket_number}</span>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    <div 
                      className="aspect-video bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                      onClick={() => openLightbox(compareData.lost.images || (compareData.lost.image ? [compareData.lost.image] : []))}
                    >
                      {compareData.lost.image ? (
                        <>
                          <img src={compareData.lost.image} alt="Lost" className="w-full h-full object-cover transition-all" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-5xl">zoom_in</span>
                          </div>
                          {(compareData.lost.images?.length > 1) && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                              {compareData.lost.images.length} GAMBAR
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined text-4xl">hide_image</span></div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{compareData.lost.item_name || compareData.lost.title}</h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 col-span-2">
                          <p className="text-[10px] text-gray-500 mb-0.5">Pemilik</p>
                          <p className="text-xs font-semibold text-gray-900 break-words leading-snug">{compareData.lost.reporter_display || compareData.lost.reporter}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Kategori</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.lost.category} // {compareData.lost.category_detail || '-'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Lokasi Hilang</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.lost.location_found || compareData.lost.location}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Waktu Kejadian</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.lost.event_time || '-'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Imbalan (Bounty)</p>
                          <p className="text-xs font-semibold text-green-600 truncate">Rp {Number(compareData.lost.bounty_amount || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                          <p className="text-[10px] text-gray-500 mb-0.5">Waktu Lapor</p>
                          <p className="text-xs font-semibold text-gray-900 truncate">{compareData.lost.date}</p>
                        </div>
                      </div>

                      {(compareData.lost.phone_number || compareData.lost.email) && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
                          <span className="font-semibold block mb-1 text-blue-900 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">contact_phone</span> Kontak Pemilik:</span>
                          <p className="text-xs text-blue-800">{compareData.lost.phone_number || '-'} / {compareData.lost.email || '-'}</p>
                        </div>
                      )}

                      {compareData.lost.bounty_amount > 0 && compareData.lost.account_number && (
                        <div className="bg-green-50 p-3 rounded border border-green-100 mb-4">
                          <span className="font-semibold block mb-1 text-green-900 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">account_balance</span> Rekening Pembayaran Imbalan:</span>
                          <p className="text-xs text-green-800">{compareData.lost.bank_name || 'Bank'} - {compareData.lost.account_number}</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-700 whitespace-pre-wrap mb-3">
                        <span className="font-semibold block mb-1 text-gray-900">Deskripsi Detail:</span>
                        {compareData.lost.description}
                      </div>

                      <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-900 whitespace-pre-wrap">
                        <span className="font-semibold block mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lock</span> Ciri-Ciri Rahasia:</span>
                        {compareData.lost.verification_description || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {compareData && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-3 rounded-b-xl">
            <button
              type="button"
              onClick={() => setCompareData(null)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              disabled={loading}
            >
              Cari Tiket Lain
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResolveClaim}
                disabled={loading}
                className="px-6 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Memproses...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">task_alt</span> Konfirmasi & Selesaikan</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox 
          images={lightboxImages} 
          startIndex={lightboxIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const OfficerInventory = () => {
  const [activeTab, setActiveTab] = useState('ALL');
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
      const res = await axios.get(`${API_BASE}/officer/inventory?type=FOUND`, { headers });
      if (res.data?.data) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'ALL' && item.status !== activeTab) return false;
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Temuan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan verifikasi barang temuan (Lost & Found).</p>
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
                  {tab === 'ALL' ? 'All' : STATUS_CFG[tab]?.label}
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
                    <th className="px-6 py-4 text-right">Verifikasi</th>
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
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedItem(item)}
                            disabled={item.status === 'RESOLVED'}
                            className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={item.status === 'RESOLVED' ? 'Sudah Selesai' : 'Verifikasi Kepemilikan'}
                          >
                            <span className="material-symbols-outlined text-xl">verified</span>
                          </button>
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
                          {item.status}
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

                    <button
                      onClick={() => setSelectedItem(item)}
                      disabled={item.status === 'RESOLVED'}
                      className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Verifikasi Kepemilikan
                    </button>
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
            <p className="text-sm text-gray-500">Tidak ada laporan temuan yang sesuai dengan filter atau kata kunci Anda.</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <VerifyModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onVerified={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default OfficerInventory;
