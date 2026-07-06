import React, { useState, useEffect } from 'react';
import logoMaxcloud from './assets/Logo-Maxcloud2.png';

const employees = [
  { id: 'rizky', name: 'Rizky', division: 'L1', l1Index: 4 },
  { id: 'lukman', name: 'Lukman', division: 'L1', l1Index: 3 },
  { id: 'rafi', name: 'Rafi', division: 'L1', l1Index: 2 },
  { id: 'bagus', name: 'Bagus', division: 'L1', l1Index: 1 },
  { id: 'diki', name: 'Diki', division: 'L1', l1Index: 0 },
  { id: 'denni', name: 'Denni', division: 'L2' },
  { id: 'ihsan', name: 'Ihsan', division: 'L2' }
];

const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Utilitas Modulo murni untuk menangani nilai negatif (mundur tahun)
function mod(n, m) {
  return ((n % m) + m) % m;
}

// Menghitung indeks hari dari tanggal acuan (Senin, 25 Mei)
const epoch = Date.UTC(2026, 4, 25);
function getDayIndex(year, month, day) {
  const current = Date.UTC(year, month, day);
  return Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
}

function getL1Shift(p, dayIndex) {
  const D = mod(dayIndex, 7);
  const W = Math.floor(dayIndex / 7); // Indeks Minggu

  const offDayThisWeek = mod(p + W, 5) + 2;

  if (D === offDayThisWeek) return 'L';

  const baseShifts = ['S', 'P', 'M', 'S', 'P2'];

  const cycleCompleted = W + (D > offDayThisWeek ? 1 : 0);

  return baseShifts[mod(p + cycleCompleted, 5)];
}

// Algoritma Generator Rotasi Shift L1 dan L2
function getShift(emp, dayIndex) {
  if (emp.division === 'L1') {
    const rawShift = getL1Shift(emp.l1Index, dayIndex);
    if (rawShift === 'L') return 'L';
    return `${rawShift} (L1)`;
  } else if (emp.division === 'L2') {
    const D = mod(dayIndex, 7);
    const W = Math.floor(dayIndex / 7); // Indeks Minggu

    if (dayIndex < 40) { // Sebelum 4 Juli 2026
      if (D === 5 || D === 6) return 'L'; // Sabtu & Minggu libur
    } else { // Mulai 4 Juli 2026
      if (D === 5) { // Sabtu
        if (emp.name === 'Denni') {
          return (W % 2 === 0) ? 'S (L2)' : 'L';
        } else { // Ihsan
          return (W % 2 === 0) ? 'L' : 'S (L2)';
        }
      } else if (D === 6) { // Minggu
        if (emp.name === 'Denni') {
          return (W % 2 === 0) ? 'L' : 'S (L2)';
        } else { // Ihsan
          return (W % 2 === 0) ? 'S (L2)' : 'L';
        }
      }
    }

    // Weekdays (Senin - Jumat) tetap dengan pola rotasi mingguan yang ada
    if (emp.name === 'Denni') {
      return (W % 2 === 0) ? 'S (L2)' : 'P (L2)';
    } else { // Ihsan
      return (W % 2 === 0) ? 'P (L2)' : 'S (L2)';
    }
  }
  return 'L';
}

export default function ShiftApp() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [isYearlyPrint, setIsYearlyPrint] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
        const data = await response.json();
        
        let holidaysArray = [];
        if (Array.isArray(data)) {
          holidaysArray = data.map(info => ({
            date: info.date,
            description: info.localName || info.name || 'Libur'
          }));
        }
        
        setHolidays(holidaysArray);
      } catch (error) {
        console.error('Failed to fetch holidays', error);
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, [year]);

  const renderMonths = isYearlyPrint ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [month];

  const monthlyHolidays = isYearlyPrint ? holidays : holidays.filter(h => {
    if (!h.date) return false;
    const [hYear, hMonth] = h.date.split('-');
    return parseInt(hYear, 10) === year && parseInt(hMonth, 10) - 1 === month;
  });

  const getHoliday = (y, m, d) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  // Ultra-modernized shift colors with vibrant backgrounds, high contrast, and subtle shadows
  const shiftColors = {
    'P (L1)': 'bg-sky-500/10 text-sky-700 border border-sky-200/50 hover:bg-sky-500/20 shadow-sm ring-1 ring-sky-500/5',
    'P2 (L1)': 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-500/20 shadow-sm ring-1 ring-emerald-500/5',
    'S (L1)': 'bg-orange-500/10 text-orange-700 border border-orange-200/50 hover:bg-orange-500/20 shadow-sm ring-1 ring-orange-500/5',
    'M (L1)': 'bg-violet-500/10 text-violet-700 border border-violet-200/50 hover:bg-violet-500/20 shadow-sm ring-1 ring-violet-500/5',
    'P (L2)': 'bg-indigo-500/10 text-indigo-700 border border-indigo-200/50 hover:bg-indigo-500/20 shadow-sm ring-1 ring-indigo-500/5',
    'S (L2)': 'bg-teal-500/10 text-teal-700 border border-teal-200/50 hover:bg-teal-500/20 shadow-sm ring-1 ring-teal-500/5',
    'L': 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-md shadow-rose-200 ring-2 ring-rose-200/50 font-black',
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportYearlyPDF = () => {
    setIsYearlyPrint(true);
    setTimeout(() => {
      window.print();
      setIsYearlyPrint(false);
    }, 100);
  };

  // Hitung rekapitulasi shift
  const shiftTallies = employees.map(emp => {
    const tally = {
      'P (L1)': 0,
      'P2 (L1)': 0,
      'S (L1)': 0,
      'M (L1)': 0,
      'P (L2)': 0,
      'S (L2)': 0,
      'L': 0
    };
    let totalKerja = 0;
    renderMonths.forEach(m => {
      const daysInM = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= daysInM; d++) {
        const dayIdx = getDayIndex(year, m, d);
        const shift = getShift(emp, dayIdx);
        if (tally[shift] !== undefined) {
          tally[shift]++;
        }
        if (shift !== 'L') {
          totalKerja++;
        }
      }
    });
    return { id: emp.id, name: emp.name, division: emp.division, ...tally, totalKerja };
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans print:bg-white print:p-0 print:min-h-0 text-slate-800 relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Elements - Screen Only */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Watermark Maxcloud (Hanya tampil saat print) - Moved to top level for persistent display */}
      <div className="hidden print:block fixed inset-0 z-50 pointer-events-none w-full h-full" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='rgba(0,0,0,0.04)' font-family='sans-serif' font-weight='900' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 150 150)'%3EMaxcloud%3C/text%3E%3C/svg%3E")`, backgroundRepeat: 'repeat' }}></div>

      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 0.2in 0.5in 0in 0.5in; 
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background-color: white !important;
          }
          ::-webkit-scrollbar { display: none; }
          .print-card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div id="pdf-container" className="relative max-w-7xl mx-auto bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white/60 print:bg-white print-card print:border-none print:shadow-none print:rounded-none print:overflow-visible overflow-visible">

        <table className="w-full">
          <thead className="hidden print:table-header-group">
            <tr>
              <td>
                {/* Kop Surat (Hanya tampil saat print) */}
        <div className="hidden print:flex items-center justify-between border-b-[3px] border-double border-gray-800 pb-2 mb-2 mx-6 mt-6">
          <div className="flex-shrink-0 w-50 flex justify-center">
            <img src={logoMaxcloud} alt="Logo Maxcloud" className="h-20 w-auto object-contain" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-xl font-extrabold uppercase tracking-widest text-gray-900 m-0">PT Awan Data Indonesia</h1>
            <p className="text-[10px] text-gray-600 m-0 leading-tight">Jl. Sentra Kota Blk. F No.25 Lt.2, RT.001/RW.003, Jatibening Baru, Kec. Pd. Gede, Kota Bks, Jawa Barat 17412</p>
            <p className="text-[10px] text-gray-600 m-0 leading-tight">Telp: (021) 1234-5678 | Email: hrd@maxcloud.id </p>
          </div>
          <div className="w-20"></div> {/* Spacer for perfect centering */}
        </div>
              </td>
            </tr>
          </thead>
          <tbody className="block print:table-row-group">
            <tr className="block print:table-row">
              <td className="block print:table-cell">

        {/* Header & Controls */}
        <div className="relative bg-white/40 border-b border-white/40 p-8 sm:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 print:bg-transparent print:bg-none print:text-black print:p-0 print:mb-4">
          <div className="w-full relative z-10">
            <div className="flex items-center gap-6 mb-8 print:hidden">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <img src={logoMaxcloud} alt="Maxcloud Logo" className="h-12 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Jadwal Shift CS</h1>
                <p className="text-slate-500 font-medium">Manajemen Operasional PT Awan Data Indonesia</p>
              </div>
            </div>

            <div id="controls-container" className="flex flex-col sm:flex-row gap-4 items-center print:hidden">
              <div className="group relative flex items-center bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl px-6 py-3 transition-all shadow-sm hover:shadow-md">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Bulan</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer appearance-none pr-8 min-w-[120px]"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <div className="absolute right-6 pointer-events-none group-hover:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="group relative flex items-center bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl px-6 py-3 transition-all shadow-sm hover:shadow-md">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Tahun</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer appearance-none pr-8 min-w-[80px]"
                >
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute right-6 pointer-events-none group-hover:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 print:hidden">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="group bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-indigo-200 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span>Export Laporan</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <button
                  onClick={() => { setIsExportMenuOpen(false); handleExportPDF(); }}
                  className="px-6 py-4 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-slate-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  Laporan Bulanan
                </button>
                <button
                  onClick={() => { setIsExportMenuOpen(false); handleExportYearlyPDF(); }}
                  className="px-6 py-4 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  Laporan Tahunan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/30 px-8 py-6 flex flex-col gap-4 border-b border-slate-100/50 print:bg-transparent print:border-none print:p-1 print:mb-2 text-xs">
          {/* Division L1 */}
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2 print:text-[8px]">Divisi L1:</span>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-10 h-6 print:w-8 print:h-4 rounded-lg bg-sky-500/10 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-[9px]">P (L1)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Pagi <span className="opacity-50 font-medium">(06.00 - 15.00 WIB)</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-12 h-6 print:w-10 print:h-4 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-[9px]">P2 (L1)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Pagi 2 <span className="opacity-50 font-medium">(09.00 - 18.00 WIB)</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-10 h-6 print:w-8 print:h-4 rounded-lg bg-orange-500/10 text-orange-700 border border-orange-200 flex items-center justify-center font-black text-[9px]">S (L1)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Siang <span className="opacity-50 font-medium">(14.00 - 23.00 WIB)</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-10 h-6 print:w-8 print:h-4 rounded-lg bg-violet-500/10 text-violet-700 border border-violet-200 flex items-center justify-center font-black text-[9px]">M (L1)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Malam <span className="opacity-50 font-medium">(22.00 - 07.00 WIB)</span></span>
            </div>
          </div>

          {/* Division L2 */}
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2 print:text-[8px]">Divisi L2:</span>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-10 h-6 print:w-8 print:h-4 rounded-lg bg-indigo-500/10 text-indigo-700 border border-indigo-200 flex items-center justify-center font-black text-[9px]">P (L2)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Pagi <span className="opacity-50 font-medium">(06.00 - 15.00 WIB)</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-10 h-6 print:w-8 print:h-4 rounded-lg bg-teal-500/10 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-[9px]">S (L2)</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Siang <span className="opacity-50 font-medium">(15.00 - 00.00 WIB)</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-default print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
              <span className="w-6 h-6 print:w-5 print:h-4 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black text-[9px]">L</span>
              <span className="font-bold text-slate-600 print:text-black text-[11px] print:text-[9px]">Libur</span>
            </div>
          </div>
        </div>

        {/* Calendar Tables */}
        {renderMonths.map((m) => {
          const daysInMonth = new Date(year, m + 1, 0).getDate();
          const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div key={m} className="print:break-inside-avoid print:mb-6">
              <div className="px-6 pb-10 overflow-x-auto print:overflow-visible print:p-0">
                <div className="hidden print:block text-xs font-bold text-slate-500 mb-2 text-right w-full uppercase tracking-tighter">
                  Periode: {monthNames[m]} {year}
                </div>
                <table className="w-full table-fixed text-center border-collapse border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="w-28 text-slate-500 font-black text-[10px] uppercase tracking-wider p-2 border-r border-slate-200 print:bg-white print:w-24">Karyawan</th>
                      {dates.map(d => {
                        const dayIdx = getDayIndex(year, m, d);
                        const isWeekend = dayIdx % 7 === 5 || dayIdx % 7 === 6;
                        const holiday = getHoliday(year, m, d);
                        const isToday = today.getFullYear() === year && today.getMonth() === m && today.getDate() === d;
                        return (
                          <th
                            key={d}
                            className={`p-1.5 font-black text-[9px] border-r border-slate-200/60 print:bg-white relative group ${
                              isToday 
                                ? 'bg-indigo-600/10 text-indigo-700 ring-2 ring-indigo-600/30'
                                : (isWeekend || holiday ? 'text-rose-500 bg-rose-50/30' : 'text-slate-400')
                            }`}
                          >
                            <div className="flex flex-col items-center leading-tight">
                              <span className="uppercase">{dayNames[dayIdx % 7]}</span>
                              <span className={`text-xs mt-0.5 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md font-black' : ''}`}>{d}</span>
                            </div>
                            {holiday && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:block bg-slate-900/95 backdrop-blur text-white text-[9px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all duration-200">
                                <div className="font-black text-rose-400 mb-0.5">Libur Nasional</div>
                                <div className="font-bold">{holiday.description}</div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-slate-900/95"></div>
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp, empIdx) => {
                      const nextEmp = employees[empIdx + 1];
                      const isBoundary = nextEmp && emp.division !== nextEmp.division;
                      const borderBottomClass = isBoundary ? 'border-b-[3px] border-b-slate-400' : 'border-b border-slate-100';

                      return (
                        <tr key={emp.id} className="group hover:bg-indigo-50/20 transition-colors">
                          <td className={`bg-white font-black text-slate-700 text-[11px] p-2 border-r border-slate-200 print:bg-white text-left ${borderBottomClass}`}>
                            <div className="flex flex-col">
                              <span className="font-bold text-[11px] print:text-[10px]">{emp.name}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded w-max mt-0.5 leading-none ${
                                emp.division === 'L1' ? 'bg-slate-100 text-slate-500 border border-slate-200/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-200/50'
                              }`}>
                                {emp.division}
                              </span>
                            </div>
                          </td>
                          {dates.map(d => {
                            const dayIdx = getDayIndex(year, m, d);
                            const shift = getShift(emp, dayIdx);
                            const holiday = getHoliday(year, m, d);
                            const isTodayColumn = today.getFullYear() === year && today.getMonth() === m && today.getDate() === d;
                            return (
                              <td
                                key={d}
                                className={`p-0.5 border-r border-slate-100 transition-colors print:bg-white print:p-0.5 relative group ${borderBottomClass} ${
                                  isTodayColumn ? 'bg-indigo-50/35 print:bg-transparent' : 'bg-white'
                                }`}
                              >
                                <div className={`w-full h-8 sm:h-9 flex items-center justify-center rounded-lg text-[10px] sm:text-[11px] font-black transition-all duration-300 hover:scale-105 print:h-6 print:rounded-md ${shiftColors[shift]} ${holiday ? 'ring-2 ring-rose-400/20' : ''}`}>
                                  {shift.split(' ')[0]}
                                </div>
                                {holiday && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-slate-900/95 backdrop-blur text-white text-[9px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all duration-200">
                                    <div className="font-black text-rose-400 mb-0.5">Libur Nasional</div>
                                    <div className="font-bold">{holiday.description}</div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900/95"></div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Rekapitulasi & Tanda Tangan (Hanya Tampil di Print) */}
        <div className="hidden print:flex justify-between items-start pt-4 border-t border-slate-200 mx-8 mb-4 mt-2 print:break-inside-avoid">
          {/* Tabel Rekapitulasi */}
          <div className="w-auto">
            <h3 className="font-black text-slate-900 text-[9px] uppercase tracking-widest mb-2">
              Rekapitulasi Shift {isYearlyPrint ? 'Satu Tahun' : 'Bulan Ini'}
            </h3>
            <table className="text-[9px] border-collapse bg-white border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="border border-slate-200 p-1 text-left">Karyawan</th>
                  <th className="border border-slate-200 p-1 text-[8px]">P</th>
                  <th className="border border-slate-200 p-1 text-[8px]">P2</th>
                  <th className="border border-slate-200 p-1 text-[8px]">S</th>
                  <th className="border border-slate-200 p-1 text-[8px]">M</th>
                  <th className="border border-slate-200 p-1 text-rose-500">L</th>
                  <th className="border border-slate-200 p-1 bg-slate-100">Total</th>
                </tr>
              </thead>
              <tbody>
                {shiftTallies.map(t => (
                  <tr key={t.id} className="text-slate-700 font-bold">
                    <td className="border border-slate-200 p-1 font-black">
                      <div className="flex items-center gap-1">
                        <span>{t.name}</span>
                        <span className="text-[7px] text-slate-400 font-medium">({t.division})</span>
                      </div>
                    </td>
                    <td className="border border-slate-200 p-1 text-center font-medium">
                      {t.division === 'L1' ? (t['P (L1)'] || '-') : (t['P (L2)'] || '-')}
                    </td>
                    <td className="border border-slate-200 p-1 text-center font-medium">
                      {t.division === 'L1' ? (t['P2 (L1)'] || '-') : '-'}
                    </td>
                    <td className="border border-slate-200 p-1 text-center font-medium">
                      {t.division === 'L1' ? (t['S (L1)'] || '-') : (t['S (L2)'] || '-')}
                    </td>
                    <td className="border border-slate-200 p-1 text-center font-medium">
                      {t.division === 'L1' ? (t['M (L1)'] || '-') : '-'}
                    </td>
                    <td className="border border-slate-200 p-1 text-center text-rose-500">{t.L || '-'}</td>
                    <td className="border border-slate-200 p-1 text-center bg-slate-50 font-black">{t.totalKerja}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* List Libur Nasional */}
            {monthlyHolidays.length > 0 && (
              <div className="mt-4 max-w-2xl">
                <h4 className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                  Keterangan Tanggal Merah
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {monthlyHolidays.map((h, i) => (
                    <div key={i} className="text-[8px] text-slate-600 flex gap-1 items-start leading-tight">
                      <span className="font-black text-rose-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(h.date))}
                      </span>
                      <span>- {h.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Tanda Tangan */}
          <div className="flex flex-col items-center w-48 mt-1">
            <p className="text-[8px] text-slate-500 mb-0.5">Bekasi, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
            <p className="text-[10px] font-black text-slate-900 mb-12 uppercase tracking-tighter">Admin / HR Operational</p>
            <div className="w-32 h-0.5 bg-slate-900 mb-1"></div>
            <p className="text-[9px] font-black text-slate-900">( ......................... )</p>
          </div>
        </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Informasi & Aturan Shift - Redesigned Card */}
      <div className="max-w-7xl mx-auto mt-12 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12 print:hidden relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:bg-indigo-500/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Informasi & Aturan Shift</h2>
              <p className="text-slate-500 font-medium">Panduan operasional Customer Service</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Siklus Kerja
              </h3>
              <ul className="text-sm text-slate-600 space-y-3 font-medium">
                <li>
                  <span className="font-bold text-indigo-600 block">Divisi L1</span>
                  Mengikuti rotasi <span className="font-bold">5 hari kerja & 1 hari libur</span> (5-1) yang berputar otomatis setiap minggunya.
                </li>
                <li>
                  <span className="font-bold text-indigo-600 block">Divisi L2</span>
                  Masuk <span className="font-bold">5 hari kerja</span> (Senin - Jumat) dengan libur tetap di hari Sabtu & Minggu. Shift (Pagi/Siang) berganti setiap 1 minggu sekali.
                </li>
              </ul>
            </div>
            <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Waktu Shift
              </h3>
              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div>
                  <span className="font-bold text-emerald-600 block mb-1">Divisi L1</span>
                  <ul className="space-y-1">
                    <li className="flex justify-between"><span>Pagi (P / P2)</span> <span className="font-black text-slate-900">06:00 - 15:00 / 09:00 - 18:00</span></li>
                    <li className="flex justify-between"><span>Siang (S)</span> <span className="font-black text-slate-900">14:00 - 23:00</span></li>
                    <li className="flex justify-between"><span>Malam (M)</span> <span className="font-black text-slate-900">22:00 - 07:00</span></li>
                  </ul>
                </div>
                <div className="border-t border-slate-200/50 pt-2">
                  <span className="font-bold text-emerald-600 block mb-1">Divisi L2</span>
                  <ul className="space-y-1">
                    <li className="flex justify-between"><span>Pagi (P)</span> <span className="font-black text-slate-900">06:00 - 15:00</span></li>
                    <li className="flex justify-between"><span>Siang (S)</span> <span className="font-black text-slate-900">15:00 - 00:00</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Ketentuan Libur
              </h3>
              <ul className="text-sm text-slate-600 space-y-3 font-medium">
                <li>
                  <span className="font-bold text-rose-500 block">Divisi L1</span>
                  Hari libur bergeser maju 1 hari setiap minggu secara otomatis.
                </li>
                <li>
                  <span className="font-bold text-rose-500 block">Divisi L2</span>
                  Hari libur tetap pada hari Sabtu & Minggu.
                </li>
                <li className="text-xs text-slate-500 leading-tight">
                  * Catatan: Untuk Tanggal Merah / Libur Nasional, operasional tetap berjalan sesuai jadwal yang tertera.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
