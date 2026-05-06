import React, { useState } from 'react';

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
  
  // 1. Hitung hari libur DINAMIS untuk orang ini pada minggu ini (W)
  // Libur otomatis bergeser maju sehari tiap minggu (Siklus: Rab -> Kam -> Jum -> Sab -> Min -> Rab)
  const offDayThisWeek = mod(p + W, 5) + 2; 

  // 2. Cek jatah libur hari ini
  if (D === offDayThisWeek) return 'L';

  // 3. Base shift dirancang secara matematis agar persis sesuai syarat:
  // - Shift berputar mundur: P -> M -> S -> P2 -> S
  // - S di index 0 akan otomatis aktif di hari Sen/Sel (menjadi shift double)
  const baseShifts = ['S', 'P', 'M', 'S', 'P2'];
  
  // Menghitung siklus shift karyawan (Siklus HANYA bertambah 1 setelah melewati hari liburnya di minggu tersebut)
  const cycleCompleted = W + (D > offDayThisWeek ? 1 : 0);
  
  return baseShifts[mod(p + cycleCompleted, 5)];
}

export default function ShiftApp() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4); // Mei (0-indexed)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const shiftColors = {
    'P': 'bg-blue-100 text-blue-800 border-blue-200',
    'P2': 'bg-teal-100 text-teal-800 border-teal-200',
    'S': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'M': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'L': 'bg-red-500 text-white border-red-600 font-bold',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Header & Controls */}
        <div className="bg-gray-800 text-white p-6">
<<<<<<< HEAD
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Aplikasi Jadwal Shift CS Maxcloud 2026</h1>
=======
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Aplikasi Jadwal Shift Maxcloud 2026</h1>
>>>>>>> e5eea00 (change tittle)
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300 uppercase tracking-wider font-semibold">Bulan</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300 uppercase tracking-wider font-semibold">Tahun</label>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-wrap gap-4 text-sm justify-center">
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-800">P</span> Pagi (06.00-15.00)</div>
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-teal-100 border border-teal-200 flex items-center justify-center font-bold text-teal-800">P2</span> Pagi 2 (09.00-18.00)</div>
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-yellow-100 border border-yellow-200 flex items-center justify-center font-bold text-yellow-800">S</span> Siang (14.00-23.00)</div>
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-800">M</span> Malam (22.00-07.00)</div>
          <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-red-500 border border-red-600 flex items-center justify-center font-bold text-white">L</span> Libur</div>
        </div>

        {/* Calendar Table */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 p-3 border-b-2 border-r-2 border-gray-200 text-left min-w-[120px]">
                  Nama Karyawan
                </th>
                {dates.map(date => {
                  const dayIdx = getDayIndex(year, month, date);
                  const dayName = dayNames[mod(dayIdx, 7)];
                  const isWeekend = dayName === 'Sab' || dayName === 'Min';
                  
                  return (
                    <th key={date} className={`p-2 border-b-2 border-r border-gray-200 min-w-[50px] ${isWeekend ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className={`text-xs ${isWeekend ? 'text-red-600' : 'text-gray-500'}`}>{dayName}</div>
                      <div className="font-bold text-base">{date}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayOrder.map((personIdx) => (
                <tr key={personIdx} className="hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 bg-white z-10 p-3 border-b border-r-2 border-gray-200 font-bold text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {names[personIdx]}
                  </td>
                  {dates.map(date => {
                    const dayIdx = getDayIndex(year, month, date);
                    const shift = getShift(personIdx, dayIdx);
                    
                    return (
                      <td key={date} className="p-1 border-b border-r border-gray-100">
                        <div className={`w-full h-10 flex items-center justify-center rounded border ${shiftColors[shift]} font-semibold text-sm`}>
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
        
      </div>
      
      <div className="max-w-6xl mx-auto mt-6 text-gray-500 text-sm text-left bg-blue-50 border border-blue-200 p-5 rounded-lg space-y-2">
        <p className="font-bold text-blue-800 text-base mb-2">🔥 NOTES:</p>
        <p>1. <strong>Rotasi Libur Dinamis:</strong> Hari libur semua orang kini otomatis bergeser maju 1 hari setiap minggunya (Rabu ➔ Kamis ➔ Jumat ➔ Sabtu ➔ Minggu ➔ kembali ke Rabu).</p>
        <p>2. <strong>Shift Konsisten:</strong> Shift kerja akan terus menempel (bahkan melintasi batas hari Minggu ke Senin) dan <strong>TIDAK AKAN BERGANTI</strong> sampai karyawan tersebut mengambil jatah liburnya.</p>
        <p>3. <strong>Urutan Shift Mundur:</strong> Sehabis libur, shift otomatis berganti dengan urutan <code className="bg-blue-100 px-1 rounded text-blue-800">Pagi ➔ Malam ➔ Siang ➔ Pagi 2</code>.</p>
        <p>4. <strong>Formasi Aman:</strong> Karena libur berotasi di hari Rabu-Minggu, hari Senin & Selasa otomatis diisi 5 orang (Siang menjadi double), dan shift Malam dijamin selalu 1 orang setiap saat.</p>
      </div>
    </div>
  );
}
