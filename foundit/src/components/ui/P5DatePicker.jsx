import React, { useState, useRef, useEffect } from 'react';

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const pad = (n) => String(n).padStart(2, '0');

const P5DatePicker = ({ value, onChange, required = false }) => {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar'); // 'calendar' | 'time'
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d)) {
        setSelectedDate(d);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setHour(d.getHours());
        setMinute(d.getMinutes());
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitChange = (date, h, m) => {
    if (date && onChange) {
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`;
      onChange(iso);
    }
  };

  const handleDateClick = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(d);
    emitChange(d, hour, minute);
    setView('time');
  };

  const handleConfirm = () => {
    emitChange(selectedDate, hour, minute);
    setIsOpen(false);
    setView('calendar');
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else { setViewMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else { setViewMonth(m => m + 1); }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);

  const displayValue = selectedDate
    ? `${pad(selectedDate.getDate())} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()} // ${pad(hour)}:${pad(minute)}`
    : '';

  return (
    <div ref={ref} className="relative">
      {/* Hidden input for form validation */}
      {required && (
        <input
          required
          type="text"
          value={displayValue}
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-4 border-black shadow-[6px_6px_0px_#d10000] p-4 pr-12 text-left font-black uppercase appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer ${displayValue ? 'text-black' : 'text-gray-400'}`}
      >
        {displayValue || 'SELECT DATE & TIME...'}
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-black text-2xl font-black">calendar_today</span>
        </div>
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute z-50 w-full sm:w-[360px] mt-2 bg-black border-4 border-primary shadow-[8px_8px_0px_#d10000] overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <span className="font-black text-white text-sm uppercase tracking-widest">
              {view === 'calendar' ? 'SELECT DATE' : 'SELECT TIME'}
            </span>
            <span className="material-symbols-outlined text-white text-xl">
              {view === 'calendar' ? 'calendar_month' : 'schedule'}
            </span>
          </div>

          {view === 'calendar' && (
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-2 text-white hover:text-primary hover:bg-white/10 border-2 border-white/20 hover:border-primary transition-all">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-black text-white uppercase tracking-widest text-sm">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button type="button" onClick={nextMonth} className="p-2 text-white hover:text-primary hover:bg-white/10 border-2 border-white/20 hover:border-primary transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-primary uppercase">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getFullYear() === viewYear;
                  const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex items-center justify-center font-black text-sm transition-all duration-100
                        ${isSelected
                          ? 'bg-primary text-white border-2 border-white shadow-[2px_2px_0px_#fff] -skew-x-3'
                          : isToday
                            ? 'bg-white/10 text-primary border-2 border-primary'
                            : 'text-white hover:bg-white/10 hover:text-primary border-2 border-transparent hover:border-primary/50'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'time' && (
            <div className="p-6">
              {/* Selected date display */}
              <div className="text-center mb-6 bg-white/5 border-2 border-white/20 p-3">
                <span className="font-black text-primary text-xs uppercase tracking-widest">
                  {selectedDate && `${pad(selectedDate.getDate())} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
                </span>
              </div>

              {/* Time selectors */}
              <div className="flex items-center justify-center gap-4">
                {/* Hour */}
                <div className="flex flex-col items-center gap-2">
                  <button type="button" onClick={() => setHour(h => (h + 1) % 24)} className="text-white hover:text-primary p-1 border-2 border-white/20 hover:border-primary transition-all">
                    <span className="material-symbols-outlined">expand_less</span>
                  </button>
                  <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_#d10000] flex items-center justify-center">
                    <input 
                      type="text"
                      value={pad(hour)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '') { setHour(0); return; }
                        const num = parseInt(val, 10);
                        if (num >= 0 && num <= 23) setHour(num);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full h-full bg-transparent text-center font-black text-2xl text-black outline-none"
                    />
                  </div>
                  <button type="button" onClick={() => setHour(h => (h - 1 + 24) % 24)} className="text-white hover:text-primary p-1 border-2 border-white/20 hover:border-primary transition-all">
                    <span className="material-symbols-outlined">expand_more</span>
                  </button>
                  <span className="text-[10px] font-black text-white/40 uppercase">HOUR</span>
                </div>

                <span className="font-black text-3xl text-primary animate-pulse mt-[-2rem]">:</span>

                {/* Minute */}
                <div className="flex flex-col items-center gap-2">
                  <button type="button" onClick={() => setMinute(m => (m + 5) % 60)} className="text-white hover:text-primary p-1 border-2 border-white/20 hover:border-primary transition-all">
                    <span className="material-symbols-outlined">expand_less</span>
                  </button>
                  <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_#d10000] flex items-center justify-center">
                    <input 
                      type="text"
                      value={pad(minute)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '') { setMinute(0); return; }
                        const num = parseInt(val, 10);
                        if (num >= 0 && num <= 59) setMinute(num);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full h-full bg-transparent text-center font-black text-2xl text-black outline-none"
                    />
                  </div>
                  <button type="button" onClick={() => setMinute(m => (m - 5 + 60) % 60)} className="text-white hover:text-primary p-1 border-2 border-white/20 hover:border-primary transition-all">
                    <span className="material-symbols-outlined">expand_more</span>
                  </button>
                  <span className="text-[10px] font-black text-white/40 uppercase">MIN</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className="flex-1 py-3 bg-white/10 text-white font-black text-xs uppercase tracking-widest border-2 border-white/20 hover:border-primary hover:text-primary transition-all"
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest border-2 border-white shadow-[3px_3px_0px_#fff] hover:bg-white hover:text-black transition-all p5-skew"
                >
                  <span className="inline-block p5-skew-reverse">CONFIRM</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default P5DatePicker;
