import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  REPORTED: { bg: 'bg-yellow-400', text: 'text-black', icon: 'campaign', border: 'border-black', shadow: 'shadow-[3px_3px_0px_theme(colors.black)]', rotate: '-rotate-3' },
  SECURED: { bg: 'bg-green-500', text: 'text-black', icon: 'shield', border: 'border-black', shadow: 'shadow-[3px_3px_0px_theme(colors.black)]', rotate: 'rotate-2' },
  RESOLVED: { bg: 'bg-green-600', text: 'text-white', icon: 'check_circle', border: 'border-black', shadow: 'shadow-[3px_3px_0px_theme(colors.black)]', rotate: '-rotate-2' },
  DEFAULT: { bg: 'bg-black', text: 'text-white', icon: 'info', border: 'border-primary', shadow: 'shadow-[3px_3px_0px_#d10000]', rotate: 'rotate-2' },
};

const TYPE_CONFIG = {
  TEMUAN:     { bg: 'bg-primary',   text: 'text-white', icon: 'add_box',    route: '/report-found' },
  KEHILANGAN: { bg: 'bg-black',     text: 'text-white', icon: 'search_off', route: '/report-lost' },
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
const DeleteDialog = ({ post, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onCancel}>
    <div className="absolute inset-0 bg-black/90" />
    <div
      className="relative z-10 bg-white border-8 border-black p-8 max-w-sm w-full shadow-[16px_16px_0px_#d10000] -rotate-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-primary p-3 border-4 border-black shadow-[4px_4px_0px_theme(colors.black)]">
          <span className="material-symbols-outlined text-white text-3xl">warning</span>
        </div>
        <div>
          <h3 className="font-black text-xl uppercase text-black leading-tight">DELETE POST?</h3>
          <p className="font-bold text-xs uppercase text-black/50">Action cannot be undone</p>
        </div>
      </div>
      <p className="font-bold text-sm uppercase text-black mb-6 border-l-4 border-primary pl-3">
        "{post.title}" akan dihapus secara permanen dari sistem.
      </p>
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          className="flex-1 py-4 bg-primary text-white font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_theme(colors.black)] hover:bg-black transition-colors"
        >
          DELETE
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-4 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_theme(colors.black)] hover:bg-gray-100 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </div>
  </div>
);

// ─── Lightbox Component ────────────────────────────────────────────────────────
const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex];
  
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      {/* Main Image Container */}
      <div 
        className="relative z-10 max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={currentImage} 
          alt="Preview" 
          className="max-w-full max-h-[85vh] object-contain shadow-2xl border-4 border-white/10 rounded-lg"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm shadow-xl"
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm shadow-xl"
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white font-mono font-bold text-sm rounded-full backdrop-blur-sm border border-white/20 shadow-xl">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AI Matches Dialog ──────────────────────────────────────────────────────────
const MatchesDialog = ({ post, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_BASE}/reports/matches/${post.ticket_number}`, { headers })
      .then(res => {
        setMatches(res.data.data || []);
      })
      .catch(err => {
        console.error("Gagal memuat matches:", err);
      })
      .finally(() => setLoading(false));
  }, [post.ticket_number]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <div 
        className="relative z-10 bg-white border-8 border-black p-8 max-w-2xl w-full shadow-[16px_16px_0px_#d10000] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
          <div>
            <h3 className="font-black text-2xl uppercase text-black leading-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">memory</span>
              AI MATCH RESULTS
            </h3>
            <p className="font-bold text-xs uppercase text-black/50 mt-1">TICKET: {post.ticket_number || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black text-white hover:bg-primary transition-colors border-2 border-transparent">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
          <p className="text-black font-bold text-sm leading-relaxed uppercase tracking-wide">
            <span className="material-symbols-outlined text-primary text-lg align-text-bottom mr-1">campaign</span>
            Jika Anda yakin barang temuan ini adalah milik Anda, segera kunjungi <strong className="text-primary">Pusat Penerimaan Barang (Lost & Found)</strong> dengan membawa bukti kepemilikan untuk proses verifikasi dan klaim.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
            <p className="font-black text-sm uppercase mt-4 tracking-widest text-black/70 animate-pulse">SCANNING DATABASE...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border-4 border-black border-dashed">
            <span className="material-symbols-outlined text-5xl text-black/20 mb-3 block">search_off</span>
            <h4 className="font-black text-xl uppercase text-black/40 mb-1">NO MATCHES YET</h4>
            <p className="font-bold text-xs text-black/40 uppercase tracking-wide">Belum ada barang temuan yang terdeteksi cocok dengan laporanmu.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map(m => (
              <div key={m.match_id} className="border-4 border-black flex flex-col sm:flex-row p-4 gap-5 bg-white shadow-[6px_6px_0px_theme(colors.black)] relative">
                
                {/* Image */}
                <div className="sm:w-40 flex-shrink-0">
                  {m.images && m.images.length > 0 ? (
                    <img src={m.images[0].startsWith('http') ? new URL(m.images[0]).pathname : m.images[0]} alt="Match" className="w-full h-32 sm:h-full object-cover border-4 border-black" />
                  ) : (
                    <div className="w-full h-32 sm:h-full bg-[#111] border-4 border-black flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-white/30 text-3xl mb-1">hide_image</span>
                      <span className="font-black text-[9px] text-white/30 uppercase tracking-widest">NO PHOTO</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-black text-lg uppercase leading-tight line-clamp-1">{m.item_name}</h4>
                    <div className="bg-primary text-white font-black px-2 py-1 text-xs border-2 border-black -skew-x-6 flex-shrink-0">
                      {Math.round(m.confidence_score)}% MATCH
                    </div>
                  </div>
                  
                  <p className="text-xs font-bold text-black/60 mb-3 line-clamp-2">{m.description}</p>
                  
                  <div className="bg-blue-50 text-blue-900 text-[11px] font-bold p-3 border-l-4 border-blue-600 mb-3 leading-relaxed">
                    <span className="font-black uppercase text-blue-700 mr-1">AI REASON:</span>
                    {m.ai_reason}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[10px] font-black text-black/50 uppercase tracking-widest mt-auto items-center">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span> {m.location_found}</span>
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">schedule</span> {m.event_time ? m.event_time.substring(0, 16) : '-'}</span>
                    <Link
                      to={`/?keyword=${encodeURIComponent(m.ticket_number)}`}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-primary transition-colors border-2 border-black shadow-[2px_2px_0px_#d10000]"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      LIHAT FEED
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const MyPostCard = ({ post, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.DEFAULT;
  const typeCfg   = TYPE_CONFIG[post.type]     || TYPE_CONFIG.TEMUAN;
  const hasImages = post.images && post.images.length > 0;

  return (
    <>
      <div className={`bg-white border-4 border-black p5-card-shadow overflow-hidden transition-all ${post.status === 'RESOLVED' ? 'opacity-60' : ''}`}>
        <div className="flex flex-col md:flex-row">
          {/* Image Panel */}
          <div className="md:w-56 flex-shrink-0 relative bg-black border-b-4 md:border-b-0 md:border-r-4 border-black">
            {hasImages ? (
              <>
                <img
                  src={post.images[0].startsWith('http') ? new URL(post.images[0]).pathname : post.images[0]}
                  alt={post.title}
                  className="w-full h-48 md:h-full object-cover grayscale contrast-125"
                />
                {post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black border-2 border-primary px-2 py-0.5">
                    <span className="font-black text-[9px] text-white uppercase">+{post.images.length - 1} FOTO</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-48 md:h-full flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                <span className="material-symbols-outlined text-4xl text-white/20">hide_image</span>
                <span className="font-black text-[10px] uppercase text-white/20 tracking-widest">NO PHOTO</span>
              </div>
            )}

            {/* Type badge overlay */}
            <div className={`absolute top-3 left-0 ${typeCfg.bg} ${typeCfg.text} px-3 py-1 border-r-4 border-b-4 border-black shadow-[2px_2px_0px_theme(colors.black)] flex items-center gap-1.5`}>
              <span className="material-symbols-outlined text-sm">{typeCfg.icon}</span>
              <span className="font-black text-[10px] uppercase tracking-widest">{post.type}</span>
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 -skew-x-6 inline-block">
                    <span className="text-white">{post.category}</span> // <span className="text-white">{post.category_detail}</span>
                  </span>
                  {post.ticket_number && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 inline-block border-2 border-black bg-white text-black -skew-x-6 shadow-[2px_2px_0px_#000]">
                      {post.ticket_number}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-xl md:text-2xl uppercase text-black leading-tight">{post.title}</h3>
              </div>

              {/* Status badge */}
              <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-2 font-black text-[10px] uppercase tracking-widest ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} ${statusCfg.shadow} ${statusCfg.rotate || ''}`}>
                <span className={`material-symbols-outlined text-sm ${post.status === 'REPORTED' ? 'animate-pulse' : ''}`}>
                  {statusCfg.icon}
                </span>
                {post.status}
              </div>
            </div>

            {/* Description */}
            <p className="text-black/70 text-sm font-bold leading-relaxed line-clamp-2">{post.description}</p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 border-t-2 border-black/10 pt-4">
              <div className="flex items-center gap-1.5 text-black/50">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-black text-xs uppercase tracking-wide">{post.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-black/50">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-black text-xs uppercase tracking-wide">{post.date}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-auto pt-2">
              {!['SECURED', 'RESOLVED'].includes(post.status) && (
                <>
                  <Link
                    to={`${typeCfg.route}/edit/${post.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black text-white font-black text-xs uppercase border-4 border-black shadow-[3px_3px_0px_#d10000] hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    EDIT
                  </Link>

                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-black text-xs uppercase border-4 border-black shadow-[3px_3px_0px_theme(colors.black)] hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    DELETE
                  </button>
                </>
              )}

              {post.type === 'TEMUAN' ? (
                <Link
                  to={`/?keyword=${encodeURIComponent(post.title)}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-black text-xs uppercase border-4 border-black shadow-[3px_3px_0px_theme(colors.black)] hover:bg-black hover:text-white transition-colors ml-auto"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  LIHAT DI FEED
                </Link>
              ) : (
                <button
                  onClick={() => setShowDetail(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-black text-xs uppercase border-4 border-black shadow-[3px_3px_0px_theme(colors.black)] hover:bg-black hover:text-white transition-colors ml-auto"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  DETAIL LAPORAN
                </button>
              )}
              {post.type === 'KEHILANGAN' && (
                <button
                  onClick={() => setShowMatches(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-black text-xs uppercase border-4 border-black shadow-[3px_3px_0px_theme(colors.black)] hover:bg-black transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">memory</span>
                  HASIL AI
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <DeleteDialog
          post={post}
          onConfirm={() => { onDelete(post.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {showMatches && (
        <MatchesDialog post={post} onClose={() => setShowMatches(false)} />
      )}

      {showDetail && (
        <DetailDialog post={post} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

// ─── Detail Dialog ──────────────────────────────────────────────────────────────
const DetailDialog = ({ post, onClose }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imagesUrls = post.images?.map(img => img.startsWith('http') ? new URL(img).pathname : img) || [];

  return (
    <>
      {lightboxOpen && (
        <Lightbox 
          images={imagesUrls}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex(prev => prev > 0 ? prev - 1 : imagesUrls.length - 1)}
          onNext={() => setLightboxIndex(prev => prev < imagesUrls.length - 1 ? prev + 1 : 0)}
        />
      )}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
        <div 
          className="relative z-10 bg-white border-8 border-black p-8 max-w-2xl w-full shadow-[16px_16px_0px_#d10000] max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
            <div>
              <h3 className="font-black text-2xl uppercase text-black leading-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
                DETAIL LAPORAN
              </h3>
              <p className="font-bold text-xs uppercase text-black/50 mt-1">TICKET: {post.ticket_number || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black text-white hover:bg-primary transition-colors border-2 border-transparent">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Photos */}
            {imagesUrls.length > 0 && (
              <div>
                <h4 className="font-black text-sm uppercase mb-2">FOTO BARANG</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {imagesUrls.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt="" 
                      className="w-32 h-32 object-cover border-4 border-black flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => {
                        setLightboxIndex(i);
                        setLightboxOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border-4 border-black p-3 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-black uppercase text-gray-600 mb-1">NAMA BARANG</span>
              <span className="font-bold text-sm uppercase text-black">{post.title}</span>
            </div>
            <div className="bg-gray-50 border-4 border-black p-3 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-black uppercase text-gray-600 mb-1">KATEGORI</span>
              <span className="font-bold text-sm uppercase text-black">{post.category} / {post.category_detail || '-'}</span>
            </div>
            <div className="bg-gray-50 border-4 border-black p-3 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-black uppercase text-gray-600 mb-1">LOKASI KEHILANGAN</span>
              <span className="font-bold text-sm uppercase text-black">{post.location}</span>
            </div>
            <div className="bg-gray-50 border-4 border-black p-3 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-black uppercase text-gray-600 mb-1">WAKTU KEJADIAN</span>
              <span className="font-bold text-sm uppercase text-black">{post.event_time || '-'}</span>
            </div>
          </div>

          <div className="bg-gray-50 border-4 border-black p-4">
            <span className="block text-[10px] font-black uppercase text-gray-600 mb-1">DESKRIPSI UMUM</span>
            <p className="font-bold text-sm whitespace-pre-wrap text-black">{post.description}</p>
          </div>

          {post.verification_description && (
            <div className="bg-yellow-100 border-4 border-black p-4">
              <span className="block text-[10px] font-black uppercase text-yellow-800 mb-1">CIRI-CIRI RAHASIA (VERIFIKASI)</span>
              <p className="font-bold text-sm whitespace-pre-wrap text-black">{post.verification_description}</p>
            </div>
          )}

          <div className="bg-green-100 border-4 border-black p-4">
            <span className="block text-[10px] font-black uppercase text-green-800 mb-1">IMBALAN (BOUNTY)</span>
            <p className="font-black text-lg text-black">Rp {parseFloat(post.bounty_amount || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => (
  <div className={`flex-1 min-w-[140px] border-4 border-black p-5 flex flex-col gap-2 ${accent ? 'bg-primary shadow-[6px_6px_0px_theme(colors.black)]' : 'bg-white shadow-[6px_6px_0px_#d10000]'}`}>
    <span className={`material-symbols-outlined text-2xl ${accent ? 'text-white' : 'text-primary'}`}>{icon}</span>
    <span className={`font-black text-4xl leading-none ${accent ? 'text-white' : 'text-black'}`}>{value}</span>
    <span className={`font-black text-[10px] uppercase tracking-widest ${accent ? 'text-white/70' : 'text-black/50'}`}>{label}</span>
  </div>
);

// ─── My Posts Page ────────────────────────────────────────────────────────────
const TABS = ['ALL', 'TEMUAN', 'KEHILANGAN'];

const MyPosts = () => {
  const [activeTab, setActiveTab]     = useState('ALL');
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    date_start: '',
    date_end: '',
    status: ''
  });

  // Fetch Categories for Dropdown
  useEffect(() => {
    axios.get(`${API_BASE}/master/categories`)
      .then(res => {
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  const fetchMyPosts = () => {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.category) params.append('category', filters.category);
    if (filters.date_start) params.append('date_start', filters.date_start);
    if (filters.date_end) params.append('date_end', filters.date_end);
    if (filters.status) params.append('status', filters.status);

    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get(`${API_BASE}/reports/my-posts?${params.toString()}`, { headers })
      .then(res => {
        if (res.data?.data) {
          setPosts(res.data.data);
        }
      })
      .catch(err => {
        console.error("Gagal mengambil data my-posts:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilter = (e) => {
    e.preventDefault();
    fetchMyPosts();
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.delete(`${API_BASE}/reports/${id}`, { headers })
      .then(res => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch(err => {
        console.error("Gagal menghapus post:", err);
        alert(err.response?.data?.message || "Gagal menghapus laporan.");
      });
  };

  const filtered = activeTab === 'ALL'
    ? posts
    : posts.filter((p) => p.type === activeTab);

  const total     = posts.length;
  const found     = posts.filter((p) => p.type === 'TEMUAN').length;
  const lost      = posts.filter((p) => p.type === 'KEHILANGAN').length;
  const reported  = posts.filter((p) => p.status === 'REPORTED').length;
  const secured   = posts.filter((p) => p.status === 'SECURED').length;
  const resolved  = posts.filter((p) => p.status === 'RESOLVED').length;

  return (
    <>
      <nav className="max-w-4xl mx-auto mb-8 flex items-center gap-2 font-black uppercase text-[12px] tracking-tighter text-white/40">
        <Link className="hover:text-primary" to="/">HOME</Link>
        <span className="text-primary">/</span>
        <span className="text-white">POST SAYA</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* ── Header Banner ── */}
        <div className="bg-white border-8 border-black p5-card-shadow mb-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary" style={{ clipPath: 'polygon(0 0, 60% 0, 45% 100%, 0 100%)' }} />
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="font-black uppercase text-4xl md:text-5xl text-white leading-none stencil-text mb-2">
                LAPORAN SAYA
              </div>
              <p className="font-black text-xs uppercase text-white/70 tracking-widest">SEMUA LAPORAN & TEMUAN KAMU</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link to="/report-found" className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black text-xs uppercase border-4 border-black shadow-[4px_4px_0px_theme(colors.black)] hover:bg-primary hover:text-white hover:border-primary transition-all p5-button">
                <span className="material-symbols-outlined text-base">add_box</span> LAPOR TEMUAN
              </Link>
              <Link to="/report-lost" className="flex items-center gap-2 px-5 py-3 bg-black text-white font-black text-xs uppercase border-4 border-primary shadow-[4px_4px_0px_#d10000] hover:bg-primary transition-all p5-button">
                <span className="material-symbols-outlined text-base">search_off</span> LAPOR HILANG
              </Link>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`p-3 text-white border-4 p5-button transition-colors ${showFilter ? 'bg-primary border-black' : 'bg-black border-primary shadow-[4px_4px_0px_#d10000]'}`}
              >
                <span className="material-symbols-outlined text-xl">filter_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <form onSubmit={applyFilter} className="mb-12 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_#d10000] -rotate-1 relative z-10 animate-fade-in">
            <h3 className="font-black text-2xl text-black uppercase mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">manage_search</span>
              FILTER POSTINGAN
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">Kata Kunci</label>
                <input 
                  type="text" 
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Cari judul..." 
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">Kategori</label>
                <select 
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">SEMUA KATEGORI</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">Dari Tanggal</label>
                <input 
                  type="date" 
                  name="date_start"
                  value={filters.date_start}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-primary font-bold text-xs uppercase mb-2">Sampai Tanggal</label>
                <input 
                  type="date" 
                  name="date_end"
                  value={filters.date_end}
                  onChange={handleFilterChange}
                  className="w-full bg-white border-2 border-black p-3 font-bold text-black uppercase focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-primary font-bold text-xs uppercase mb-2">Status</label>
                <div className="flex flex-wrap gap-4">
                  {['', 'REPORTED', 'VERIFIED', 'ACTIVE', 'CLAIMED', 'RESOLVED'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="status" 
                        value={status} 
                        checked={filters.status === status}
                        onChange={handleFilterChange}
                        className="hidden"
                      />
                      <span className={`w-5 h-5 border-2 flex items-center justify-center ${filters.status === status ? 'border-primary bg-primary' : 'border-black bg-white'}`}>
                        {filters.status === status && <span className="w-2 h-2 bg-white"></span>}
                      </span>
                      <span className={`font-bold text-sm uppercase ${filters.status === status ? 'text-primary' : 'text-black/70 group-hover:text-black'}`}>
                        {status || 'SEMUA'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t-2 border-black/10 pt-6">
              <button 
                type="button" 
                onClick={() => {
                  setFilters({ keyword: '', category: '', date_start: '', date_end: '', status: '' });
                  setTimeout(fetchMyPosts, 0); // Re-fetch immediately without filters
                }}
                className="px-6 py-3 bg-white text-black font-black uppercase text-sm border-2 border-black hover:bg-gray-200 transition-colors"
              >
                RESET
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-primary text-white font-black uppercase text-sm border-2 border-primary hover:bg-red-700 shadow-[4px_4px_0px_#000] transition-all"
              >
                TERAPKAN FILTER
              </button>
            </div>
          </form>
        )}

        {/* ── Stats ── */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap gap-4">
            <StatCard icon="history_edu" label="Total Post" value={total} accent />
            <StatCard icon="add_box"     label="Temuan"     value={found} />
            <StatCard icon="search_off"  label="Kehilangan" value={lost} />
          </div>
          <div className="flex flex-wrap gap-4">
            <StatCard icon="campaign" label="Reported" value={reported} />
            <StatCard icon="shield" label="Secured" value={secured} />
            <StatCard icon="check_circle" label="Resolved"  value={resolved} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 mb-8 border-4 border-black shadow-[6px_6px_0px_#d10000] overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-all border-r-4 border-black last:border-r-0 flex items-center justify-center gap-2
                ${activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
            >
              {tab === 'TEMUAN' && <span className="material-symbols-outlined text-base">add_box</span>}
              {tab === 'KEHILANGAN' && <span className="material-symbols-outlined text-base">search_off</span>}
              {tab === 'ALL' && <span className="material-symbols-outlined text-base">grid_view</span>}
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 border ${activeTab === tab ? 'bg-black text-white border-black' : 'bg-black/10 border-black/20'}`}>
                {tab === 'ALL' ? total : tab === 'TEMUAN' ? found : lost}
              </span>
            </button>
          ))}
        </div>

        {/* ── Post List ── */}
        {filtered.length > 0 ? (
          <div className="space-y-6">
            {filtered.map((post) => (
              <MyPostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-8 border-black p-16 text-center p5-card-shadow">
            <span className="material-symbols-outlined text-6xl text-black/20 mb-4 block">inbox</span>
            <h3 className="font-black text-2xl uppercase text-black mb-2">NO POSTS FOUND</h3>
            <p className="font-bold text-sm uppercase text-black/40 tracking-widest mb-8">
              {activeTab === 'ALL'
                ? 'Kamu belum membuat laporan apapun.'
                : activeTab === 'TEMUAN'
                  ? 'Belum ada laporan temuan.'
                  : 'Belum ada laporan kehilangan.'}
            </p>
            <Link
              to={activeTab === 'KEHILANGAN' ? '/report-lost' : '/report-found'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-black text-sm uppercase border-4 border-black shadow-[5px_5px_0px_theme(colors.black)] hover:bg-black transition-colors p5-button"
            >
              <span className="material-symbols-outlined">add_circle</span>
              BUAT LAPORAN PERTAMA
            </Link>
          </div>
        )}
        
        {loading && (
          <div className="text-center p-12">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin block mb-2">sync</span>
            <p className="font-black text-xs text-white uppercase tracking-widest">LOADING...</p>
          </div>
        )}

        {/* ── Footer loader ── */}
        {filtered.length > 0 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="font-black text-xs text-white uppercase tracking-[0.4em] animate-pulse">
              {filtered.length} RECORD{filtered.length > 1 ? 'S' : ''} LOADED
            </p>
            <div className="w-48 h-2 bg-black/20 border-2 border-white/10 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${(filtered.length / (total || 1)) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyPosts;
