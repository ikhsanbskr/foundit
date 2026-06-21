import React, { useState, useRef, useEffect } from 'react';

const P5Select = ({ options = [], placeholder = 'SELECT...', value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || '');
  const ref = useRef(null);

  useEffect(() => {
    setSelected(value || '');
  }, [value]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    setSelected(opt.value);
    setIsOpen(false);
    if (onChange) onChange(opt.value);
  };

  const selectedLabel = options.find(o => o.value === selected)?.label || '';

  return (
    <div ref={ref} className="relative">
      {/* Hidden native select for form validation */}
      {required && (
        <select
          required
          value={selected}
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        >
          <option value=""></option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}

      {/* Custom trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 pr-12 text-left font-black uppercase appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer flex items-center justify-between ${selected ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <span className={`material-symbols-outlined text-black text-3xl font-black absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          arrow_drop_down
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-black border-4 border-primary shadow-[8px_8px_0px_#d10000] max-h-64 overflow-y-auto">
          {options.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-5 py-4 font-black uppercase text-sm transition-all duration-100 flex items-center gap-3 group
                ${selected === opt.value
                  ? 'bg-primary text-white border-l-8 border-white'
                  : 'text-white border-l-8 border-transparent hover:border-primary hover:bg-white/10'
                }
                ${i < options.length - 1 ? 'border-b border-white/10' : ''}
              `}
            >
              <span className={`material-symbols-outlined text-lg transition-transform duration-150 ${selected === opt.value ? 'text-white' : 'text-primary'} group-hover:translate-x-1`}>
                {selected === opt.value ? 'check_box' : 'arrow_right'}
              </span>
              <span className="p5-skew inline-block">
                <span className="inline-block p5-skew-reverse">{opt.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default P5Select;
