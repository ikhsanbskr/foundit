import React, { useState, useEffect } from 'react';

const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const total = images?.length || 0;

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

  if (!images || total === 0) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black opacity-95 pointer-events-none" />

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

export default Lightbox;
