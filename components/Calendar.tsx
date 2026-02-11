
import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDates?: string[];
  mode?: 'select' | 'toggle';
}

export const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  onDateSelect, 
  availableDates = [], 
  mode = 'select' 
}) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const days = [];
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Ajustar para que empiece en Lunes

  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }

  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isToday = today === dateStr;
    const isAvailable = availableDates.includes(dateStr);
    const isDisabled = mode === 'select' && !isAvailable;

    days.push(
      <button
        key={d}
        onClick={() => onDateSelect(dateStr)}
        disabled={isDisabled && mode === 'select'}
        className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs transition-all relative
          ${isSelected ? 'bg-rose-500 text-white shadow-lg scale-110 z-10 font-bold' : 
            mode === 'toggle' && isAvailable ? 'bg-purple-100 text-purple-700 font-bold border border-purple-200' :
            isToday ? 'border-2 border-rose-300 text-rose-600' : 'text-slate-600 hover:bg-rose-50'}
          ${isDisabled && mode === 'select' ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {d}
        {mode === 'select' && isAvailable && !isSelected && (
          <div className="absolute bottom-1 w-1 h-1 bg-rose-300 rounded-full"></div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 shadow-inner border border-rose-50">
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={() => setViewDate(new Date(year, month - 1))} className="text-rose-400 p-2 hover:bg-rose-50 rounded-full transition-colors">❮</button>
        <h3 className="font-serif font-bold text-slate-700 text-sm">{monthNames[month]} {year}</h3>
        <button onClick={() => setViewDate(new Date(year, month + 1))} className="text-rose-400 p-2 hover:bg-rose-50 rounded-full transition-colors">❯</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} className="h-8 w-10 flex items-center justify-center text-[10px] font-bold text-rose-300 uppercase">{d}</div>
        ))}
        {days}
      </div>
    </div>
  );
};
