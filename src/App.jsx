import React, { useState, useEffect } from 'react';
import logoMaxcloud from './assets/Logo-Maxcloud2.png';

const names = ['Diki', 'Bagus', 'Rafi', 'Lukman', 'Rizky'];
const displayOrder = [4, 3, 2, 1, 0]; // Rizky, Lukman, Rafi, Bagus, Diki
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

// Algoritma Generator Rotasi Shift (Libur Dinamis Maju 1 Hari)
function getShift(p, dayIndex) {
  const D = mod(dayIndex, 7);
  const W = Math.floor(dayIndex / 7); // Indeks Minggu

  const offDayThisWeek = mod(p + W, 5) + 2;

  if (D === offDayThisWeek) return 'L';

  const baseShifts = ['S', 'P', 'M', 'S', 'P2'];

  const cycleCompleted = W + (D > offDayThisWeek ? 1 : 0);

  return baseShifts[mod(p + cycleCompleted, 5)];
}

export default function ShiftApp() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4); // Mei (0-indexed)
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(`https://libur.deno.dev/api?year=${year}`);
        const data = await response.json();
        
        let holidaysArray = [];
        if (Array.isArray(data)) {
          holidaysArray = data.map(info => ({
            date: info.date,
            description: info.name || 'Libur'
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

  const holidaysThisMonth = holidays.filter(h => {
    if (!h.date) return false;
    const [hYear, hMonth] = h.date.split('-');
    return parseInt(hYear, 10) === year && parseInt(hMonth, 10) - 1 === month;
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Modernized shift colors with soft background, vivid text, and inner shadows for a pill-like feel
  const shiftColors = {
    'P': 'bg-blue-100/80 text-blue-700 border border-blue-200/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]',
    'P2': 'bg-teal-100/80 text-teal-700 border border-teal-200/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]',
    'S': 'bg-amber-100/80 text-amber-700 border border-amber-200/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]',
    'M': 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]',
    'L': 'bg-rose-500 text-white border border-rose-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] font-bold',
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Hitung rekapitulasi shift
  const shiftTallies = displayOrder.map(personIdx => {
    const tally = { P: 0, P2: 0, S: 0, M: 0, L: 0 };
    dates.forEach(date => {
      const dayIdx = getDayIndex(year, month, date);
      const shift = getShift(personIdx, dayIdx);
      if (tally[shift] !== undefined) {
        tally[shift]++;
      }
    });
    return { personIdx, name: names[personIdx], ...tally, totalKerja: dates.length - tally.L };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 p-4 md:p-8 font-sans print:bg-white print:p-0 print:min-h-0 text-slate-800">
      <style>{`
        @media print {
          @page { size: landscape A4; margin: 1.5in; }
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

      <div id="pdf-container" className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-white print:bg-white print-card print:border-none print:shadow-none print:rounded-none">

        {/* Kop Surat (Hanya tampil saat print) */}
        <div className="hidden print:flex items-center justify-between border-b-[3px] border-double border-gray-800 pb-2 mb-2 mx-6 mt-6">
          <div className="flex-shrink-0 w-20 flex justify-center">
            <img src={logoMaxcloud} alt="Logo Maxcloud" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-xl font-extrabold uppercase tracking-widest text-gray-900 m-0">PT Awan Data Indonesia</h1>
            <p className="text-[10px] text-gray-600 m-0 leading-tight">Jl. Sentra Kota Blk. F No.25 Lt.2, RT.001/RW.003, Jatibening Baru, Kec. Pd. Gede, Kota Bks, Jawa Barat 17412</p>
            <p className="text-[10px] text-gray-600 m-0 leading-tight">Telp: (021) 1234-5678 | Email: hrd@maxcloud.id </p>
          </div>
          <div className="w-20"></div> {/* Spacer for perfect centering */}
        </div>

        {/* Header & Controls */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:bg-transparent print:text-black print:p-0 print:mb-4 overflow-hidden">
          {/* Subtle glowing orb background effect - Hidden on print */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none print:hidden"></div>

          <div className="w-full relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md mb-6 print:hidden">Aplikasi Jadwal Shift CS</h1>

            <div id="controls-container" className="flex flex-col sm:flex-row gap-4 items-center print:hidden">
              <div className="relative flex items-center bg-white/10 hover:bg-white/20 transition-all border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-md shadow-inner">
                <label className="text-xs font-bold text-blue-100 uppercase tracking-widest mr-3">Bulan</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none pr-4"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i} className="text-slate-800">{m}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="relative flex items-center bg-white/10 hover:bg-white/20 transition-all border border-white/20 rounded-full px-5 py-2.5 backdrop-blur-md shadow-inner">
                <label className="text-xs font-bold text-blue-100 uppercase tracking-widest mr-3">Tahun</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none pr-4"
                >
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y} className="text-slate-800">{y}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div id="print-header" className="hidden print:block text-lg font-bold text-gray-900 mt-2 text-center w-full uppercase underline print:col-span-full">
              Periode {monthNames[month]} {year}
            </div>
          </div>

          <button
            id="export-btn"
            onClick={handleExportPDF}
            className="relative z-10 bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_25px_-5px_rgba(255,255,255,0.4)] shadow-lg print:hidden whitespace-nowrap border border-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* Legend */}
        <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex flex-wrap gap-4 text-sm justify-center print:bg-transparent print:border-none print:p-1 print:mb-2 print:text-[10px]">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full print:rounded-sm bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold print:text-[10px]">P</span>
            <span className="font-medium text-slate-600 print:text-black">Pagi <span className="opacity-70">(06.00-15.00)</span></span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full print:rounded-sm bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center font-bold print:text-[10px]">P2</span>
            <span className="font-medium text-slate-600 print:text-black">Pagi 2 <span className="opacity-70">(09.00-18.00)</span></span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full print:rounded-sm bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center font-bold print:text-[10px]">S</span>
            <span className="font-medium text-slate-600 print:text-black">Siang <span className="opacity-70">(14.00-23.00)</span></span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full print:rounded-sm bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold print:text-[10px]">M</span>
            <span className="font-medium text-slate-600 print:text-black">Malam <span className="opacity-70">(22.00-07.00)</span></span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 print:gap-1 print:p-0 print:shadow-none print:border-none print:bg-transparent">
            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full print:rounded-sm bg-rose-500 text-white border border-rose-600 flex items-center justify-center font-bold print:text-[10px]">L</span>
            <span className="font-medium text-slate-600 print:text-black">Libur</span>
          </div>
        </div>

        {/* Calendar Table */}
        <div id="table-container" className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6 overflow-x-hidden print:overflow-visible print:p-0">
          <table className="w-full table-fixed text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="w-[15%] sm:w-[12%] bg-slate-100/90 p-2 sm:p-3 print:p-1 border-b-2 border-r border-slate-200 text-left min-w-0 print:min-w-[70px] text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-extrabold print:text-black print:bg-white print:border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] print:shadow-none truncate">
                  Nama Karyawan
                </th>
                {dates.map(date => {
                  const dayIdx = getDayIndex(year, month, date);
                  const dayName = dayNames[mod(dayIdx, 7)];
                  const isWeekend = dayName === 'Sab' || dayName === 'Min';
                  const isSunday = dayName === 'Min';

                  return (
                    <th key={date} className={`p-1 sm:p-1.5 print:p-0.5 border-b-2 ${isSunday ? 'border-r-[3px] border-slate-300 print:border-gray-500' : 'border-r border-slate-100 print:border-gray-200'} min-w-0 ${isWeekend ? 'bg-rose-50/60 print:bg-red-50' : 'bg-slate-50/60 print:bg-gray-50'}`}>
                      <div className={`text-[8px] sm:text-[9px] md:text-[10px] print:text-[8px] font-bold uppercase tracking-widest leading-none mb-0.5 sm:mb-1 print:mb-0 ${isWeekend ? 'text-rose-500 print:text-red-600' : 'text-slate-400 print:text-gray-500'}`}>{dayName}</div>
                      <div className={`font-extrabold text-xs sm:text-sm print:text-xs leading-tight ${isWeekend ? 'text-rose-700 print:text-red-600' : 'text-slate-700 print:text-gray-800'}`}>{date}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayOrder.map((personIdx) => (
                <tr key={personIdx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="bg-white/95 group-hover:bg-slate-50/95 p-2 sm:p-3 print:p-1 border-b border-r border-slate-100 font-bold text-slate-800 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] print:shadow-none text-[11px] sm:text-xs print:text-xs print:border-gray-200 print:bg-white whitespace-nowrap">
                    {names[personIdx]}
                  </td>
                  {dates.map(date => {
                    const dayIdx = getDayIndex(year, month, date);
                    const shift = getShift(personIdx, dayIdx);
                    const isSunday = dayNames[mod(dayIdx, 7)] === 'Min';

                    return (
                      <td key={date} className={`p-0.5 sm:p-1 print:p-0 border-b ${isSunday ? 'border-r-[3px] border-slate-300 print:border-gray-500' : 'border-r border-slate-50 print:border-gray-100'}`}>
                        <div className={`w-full h-8 sm:h-9 print:h-5 flex items-center justify-center rounded-md print:rounded-none ${shiftColors[shift]} font-bold text-[10px] sm:text-xs print:text-[10px] transition-transform hover:scale-110 print:hover:scale-100 print:border-none`}>
                          {shift}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi & Tanda Tangan (Hanya Tampil di Print) */}
        <div className="hidden print:flex justify-between items-start pt-4 border-t border-gray-200 mx-6 mb-2 mt-2 page-break-inside-avoid">
          {/* Tabel Rekapitulasi */}
          <div className="w-auto">
            <h3 className="font-extrabold text-black text-[10px] uppercase tracking-wider mb-2">Rekapitulasi Shift Bulan Ini</h3>
            <table className="w-auto text-[9px] text-center border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-1.5 border border-gray-300 text-left">Nama</th>
                  <th className="p-1.5 border border-gray-300 text-blue-800">Pagi</th>
                  <th className="p-1.5 border border-gray-300 text-teal-800">Pagi 2</th>
                  <th className="p-1.5 border border-gray-300 text-amber-800">Siang</th>
                  <th className="p-1.5 border border-gray-300 text-indigo-800">Malam</th>
                  <th className="p-1.5 border border-gray-300 text-red-600">Libur</th>
                  <th className="p-1.5 border border-gray-300 font-extrabold">Total Kerja</th>
                </tr>
              </thead>
              <tbody>
                {shiftTallies.map(t => (
                  <tr key={t.personIdx}>
                    <td className="p-1.5 border border-gray-300 text-left font-bold text-black">{t.name}</td>
                    <td className="p-1.5 border border-gray-300">{t.P}</td>
                    <td className="p-1.5 border border-gray-300">{t.P2}</td>
                    <td className="p-1.5 border border-gray-300">{t.S}</td>
                    <td className="p-1.5 border border-gray-300">{t.M}</td>
                    <td className="p-1.5 border border-gray-300 text-red-600 font-bold">{t.L}</td>
                    <td className="p-1.5 border border-gray-300 font-extrabold bg-gray-50">{t.totalKerja}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Keterangan Libur Nasional */}
            <div className="mt-4">
              <h3 className="font-extrabold text-black text-[10px] uppercase tracking-wider mb-1">Keterangan Tanggal Merah / Libur Nasional</h3>
              {holidaysThisMonth.length > 0 ? (
                <ul className="text-[9px] list-disc list-inside text-gray-800">
                  {holidaysThisMonth.map((h, i) => {
                    const dateObj = new Date(h.date);
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    return <li key={i}><span className="font-semibold text-red-600">{dateStr}</span> - {h.description}</li>;
                  })}
                </ul>
              ) : (
                <p className="text-[9px] text-gray-800 italic">tidak ada tanggal merah/libur nasional dibulan ini</p>
              )}
            </div>
          </div>

          {/* Kolom Tanda Tangan */}
          <div className="flex flex-col items-center w-64 mt-1 mr-8">
            <p className="text-xs text-gray-800 mb-1">Bekasi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs font-bold text-gray-800 mb-20">Admin/HR</p>
            <p className="text-sm font-bold text-gray-900 underline underline-offset-4 px-4 w-full text-center">(.....................)</p>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-indigo-50 p-6 md:p-8 flex flex-col md:flex-row gap-6 print:hidden overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>

        <div className="flex-shrink-0 bg-indigo-50 p-4 rounded-2xl h-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-slate-600 text-sm space-y-3 leading-relaxed">
          <h3 className="font-extrabold text-indigo-900 text-lg mb-2">Informasi & Aturan Shift</h3>
          <p><span className="font-bold text-slate-800">1. Rotasi Libur Dinamis:</span> Hari libur semua orang kini otomatis bergeser maju 1 hari setiap minggunya (Rabu ➔ Kamis ➔ Jumat ➔ Sabtu ➔ Minggu ➔ kembali ke Rabu).</p>
          <p><span className="font-bold text-slate-800">2. Shift Konsisten:</span> Shift kerja akan terus menempel (bahkan melintasi batas hari Minggu ke Senin) dan <strong>TIDAK AKAN BERGANTI</strong> sampai karyawan tersebut mengambil jatah liburnya.</p>
          <p><span className="font-bold text-slate-800">3. Urutan Shift Mundur:</span> Sehabis libur, shift otomatis berganti dengan urutan <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold font-mono border border-indigo-100">Pagi ➔ Malam ➔ Siang ➔ Pagi 2</code>.</p>
          <p><span className="font-bold text-slate-800">4. Formasi Aman:</span> Karena libur berotasi di hari Rabu-Minggu, hari Senin & Selasa otomatis diisi 5 orang (Siang menjadi double), dan shift Malam dijamin selalu 1 orang setiap saat.</p>
        </div>
      </div>
    </div>
  );
}
