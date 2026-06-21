import React, { useState } from 'react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'ELEKTRONIK',  icon: 'devices',    color: '#3b82f6', specifics: ['SMARTPHONE', 'LAPTOP', 'TABLET', 'KAMERA', 'HEADPHONES'] },
  { id: 2, name: 'DOKUMEN',     icon: 'description',color: '#f59e0b', specifics: ['KTM', 'KTP', 'SIM', 'PASPOR', 'IJAZAH'] },
  { id: 3, name: 'AKSESORIS',   icon: 'watch',      color: '#10b981', specifics: ['JAM TANGAN', 'GELANG', 'CINCIN', 'KALUNG', 'KACAMATA'] },
  { id: 4, name: 'LAINNYA',     icon: 'category',   color: '#6b7280', specifics: ['DOMPET', 'KUNCI', 'TAS', 'PAKAIAN', 'LAINNYA'] },
];

// ─── Specific Tag ──────────────────────────────────────────────────────────────
const SpecificTag = ({ label, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md">
    <span className="font-semibold text-xs uppercase tracking-wide">{label}</span>
    <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors leading-none">
      <span className="material-symbols-outlined text-[14px]">close</span>
    </button>
  </div>
);

// ─── Category Form Modal ───────────────────────────────────────────────────────
const CategoryModal = ({ cat, onClose, onSave }) => {
  const [name,      setName]      = useState(cat?.name      || '');
  const [icon,      setIcon]      = useState(cat?.icon      || 'category');
  const [color,     setColor]     = useState(cat?.color     || '#3b82f6');
  const [specifics, setSpecifics] = useState(cat?.specifics || []);
  const [newSpec,   setNewSpec]   = useState('');

  const addSpec = () => {
    const val = newSpec.trim().toUpperCase();
    if (val && !specifics.includes(val)) { setSpecifics(p => [...p, val]); setNewSpec(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: cat?.id || Date.now(), name: name.toUpperCase(), icon, color, specifics });
    onClose();
  };

  const ICON_OPTIONS = ['devices', 'description', 'watch', 'category', 'badge', 'wallet', 'key', 'backpack', 'camera_alt', 'headphones'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">{cat ? 'edit' : 'add_circle'}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {cat ? 'Edit Kategori Utama' : 'Tambah Kategori Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="categoryForm" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kategori <span className="text-red-500">*</span></label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase shadow-sm"
              placeholder="Contoh: KENDARAAN"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Ikon Visual</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`p-3 rounded-lg border transition-all ${icon === ic ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Warna Aksen</label>
            <div className="flex items-center gap-4">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer bg-white border border-gray-200 shadow-sm"
              />
              <div className="px-4 py-2 rounded-lg font-bold text-sm tracking-wide text-white shadow-sm flex items-center gap-2" style={{ backgroundColor: color }}>
                <span className="material-symbols-outlined text-[18px]">palette</span> Preview Warna
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Specific Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelola Sub-Kategori Spesifik</label>
            <div className="flex gap-2 mb-3">
              <input
                value={newSpec} onChange={(e) => setNewSpec(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); }}}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase text-sm shadow-sm"
                placeholder="TAMBAH SUB-KATEGORI BARU..."
              />
              <button type="button" onClick={addSpec}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[100px]">
              {specifics.length > 0
                ? <div className="flex flex-wrap gap-2">
                    {specifics.map((s) => <SpecificTag key={s} label={s} onRemove={() => setSpecifics(p => p.filter(x => x !== s))} />)}
                  </div>
                : <p className="text-sm text-gray-400 text-center mt-6">Belum ada sub-kategori spesifik. Silakan tambahkan di atas.</p>
              }
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            Batal
          </button>
          <button type="submit" form="categoryForm" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span> Simpan Kategori
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Master Kategori Page ──────────────────────────────────────────────────────
const MasterKategori = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [modal,      setModal]      = useState(null);   // null | 'add' | categoryObj
  const [delTarget,  setDelTarget]  = useState(null);

  const handleSave = (cat) => {
    setCategories((prev) =>
      prev.some((c) => c.id === cat.id)
        ? prev.map((c) => c.id === cat.id ? cat : c)
        : [...prev, cat]
    );
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDelTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Kategori Barang</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola hierarki kategori dan sub-kategori spesifik untuk form pelaporan.</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Tambah Kategori
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
              <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 truncate">{cat.name}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{cat.specifics.length} Sub-Kategori</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs font-medium text-gray-500">ID Kategori: {cat.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal(cat)}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                </button>
                <button
                  onClick={() => setDelTarget(cat)}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>

            {/* Sub-categories */}
            <div className="p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sub-Kategori Spesifik ({cat.specifics.length})</p>
              {cat.specifics.length > 0
                ? <div className="flex flex-wrap gap-2">
                    {cat.specifics.map((s) => (
                      <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
                        {s}
                      </span>
                    ))}
                  </div>
                : <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                    <p className="text-sm text-gray-500">Belum ada sub-kategori yang didaftarkan untuk kategori ini.</p>
                  </div>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Category Form Modal */}
      {modal !== null && (
        <CategoryModal
          cat={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDelTarget(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kategori?</h3>
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-gray-900">"{delTarget.name}"</span> beserta <span className="font-bold text-gray-900">{delTarget.specifics.length}</span> sub-kategorinya secara permanen?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)} className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                Batal
              </button>
              <button onClick={() => handleDelete(delTarget.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterKategori;
