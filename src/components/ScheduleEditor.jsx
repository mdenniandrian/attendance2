import React, { useState } from 'react';
import {
  monthNames,
  dayNames,
  getDayIndex,
  formatDateKey,
  formatOverrideKey,
  getActiveEmployeesForMonth,
  resolveShift,
  shiftColors,
  shiftOptionsL1,
  shiftOptionsL2,
} from '../utils/scheduleEngine';

export default function ScheduleEditor({
  employees,
  overrides,
  onSaveOverrides,
  year,
  month,
  onYearChange,
  onMonthChange,
  holidays,
}) {
  const [selectedCell, setSelectedCell] = useState(null); // { emp, day, currentShift, isOverride }
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapDate, setSwapDate] = useState(1);
  const [swapEmpA, setSwapEmpA] = useState('');
  const [swapEmpB, setSwapEmpB] = useState('');
  const [isResetMonthConfirm, setIsResetMonthConfirm] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const activeEmployees = getActiveEmployeesForMonth(employees, year, month);

  const getHoliday = (d) => {
    const dateStr = formatDateKey(year, month, d);
    return holidays.find(h => h.date === dateStr);
  };

  // Set or update single shift override
  const handleSelectShift = (shiftValue) => {
    if (!selectedCell) return;
    const { emp, day } = selectedCell;
    const overrideKey = formatOverrideKey(year, month, day, emp.id);

    const updatedOverrides = { ...overrides };
    if (shiftValue === 'AUTO') {
      delete updatedOverrides[overrideKey];
    } else {
      updatedOverrides[overrideKey] = shiftValue;
    }

    onSaveOverrides(updatedOverrides);
    setSelectedCell(null);
  };

  // Handle Quick Swap between two employees on a specific date
  const handleExecuteSwap = (e) => {
    e.preventDefault();
    if (!swapEmpA || !swapEmpB || swapEmpA === swapEmpB) return;

    const empA = employees.find(emp => emp.id === swapEmpA);
    const empB = employees.find(emp => emp.id === swapEmpB);
    if (!empA || !empB) return;

    const shiftA = resolveShift(empA, year, month, Number(swapDate), overrides);
    const shiftB = resolveShift(empB, year, month, Number(swapDate), overrides);

    const keyA = formatOverrideKey(year, month, Number(swapDate), empA.id);
    const keyB = formatOverrideKey(year, month, Number(swapDate), empB.id);

    const updatedOverrides = {
      ...overrides,
      [keyA]: shiftB,
      [keyB]: shiftA,
    };

    onSaveOverrides(updatedOverrides);
    setIsSwapModalOpen(false);
  };

  // Reset all overrides for the currently selected month
  const handleResetMonth = () => {
    const updatedOverrides = { ...overrides };
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    Object.keys(updatedOverrides).forEach(key => {
      if (key.startsWith(monthPrefix)) {
        delete updatedOverrides[key];
      }
    });

    onSaveOverrides(updatedOverrides);
    setIsResetMonthConfirm(false);
  };

  // Count overrides for current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthOverrideCount = Object.keys(overrides).filter(k => k.startsWith(monthPrefix)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Controls & Tools Toolbar */}
      <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-white shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Month & Year Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm outline-none cursor-pointer pr-10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm outline-none cursor-pointer pr-10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {monthOverrideCount > 0 && (
            <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              {monthOverrideCount} Shift Dimodifikasi Manual
            </div>
          )}
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-3">
          {/* Quick Swap Button */}
          <button
            type="button"
            onClick={() => {
              if (activeEmployees.length >= 2) {
                setSwapEmpA(activeEmployees[0].id);
                setSwapEmpB(activeEmployees[1].id);
              }
              setIsSwapModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs flex items-center gap-2 border border-indigo-200 transition-all shadow-sm"
          >
            <span>🔄</span>
            <span>Tukar Shift (Swap)</span>
          </button>

          {/* Reset Month Button */}
          {monthOverrideCount > 0 && (
            <button
              type="button"
              onClick={() => setIsResetMonthConfirm(true)}
              className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs flex items-center gap-1.5 border border-rose-200 transition-all"
            >
              <span>↺</span>
              <span>Reset Bulan Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 text-xs text-indigo-900 font-medium">
        <span className="text-base">💡</span>
        <p>
          <span className="font-black">Petunjuk:</span> Klik pada kotak shift mana saja di tabel kalender untuk mengganti shift karyawan secara manual atau mengembalikannya ke rotasi otomatis.
        </p>
      </div>

      {/* Interactive Matrix Table */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white shadow-xl shadow-slate-100/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">
            Matriks Shift: {monthNames[month]} {year}
          </h4>
          <span className="text-xs font-bold text-slate-400">
            {activeEmployees.length} Karyawan Aktif
          </span>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full table-fixed text-center border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80">
                <th className="w-36 text-slate-500 font-black text-[10px] uppercase tracking-wider p-3 border-r border-slate-200 text-left pl-5">
                  Karyawan
                </th>
                {dates.map((d) => {
                  const dayIdx = getDayIndex(year, month, d);
                  const isWeekend = dayIdx % 7 === 5 || dayIdx % 7 === 6;
                  const holiday = getHoliday(d);
                  return (
                    <th
                      key={d}
                      className={`p-2 font-black text-[9px] border-r border-slate-200/60 min-w-[44px] ${
                        isWeekend || holiday ? 'text-rose-500 bg-rose-50/40' : 'text-slate-400'
                      }`}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="uppercase">{dayNames[dayIdx % 7]}</span>
                        <span className="text-xs font-black mt-0.5">{d}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployees.map((emp, empIdx) => {
                const nextEmp = activeEmployees[empIdx + 1];
                const isBoundary = nextEmp && emp.division !== nextEmp.division;
                const borderBottomClass = isBoundary ? 'border-b-[3px] border-b-slate-400' : 'border-b border-slate-100';

                return (
                  <tr key={emp.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className={`bg-white font-black text-slate-800 text-[11px] p-2 pl-4 border-r border-slate-200 text-left ${borderBottomClass}`}>
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] truncate">{emp.name}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded w-max mt-0.5 leading-none ${
                          emp.division === 'L1'
                            ? 'bg-sky-50 text-sky-600 border border-sky-200/60'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-200/60'
                        }`}>
                          {emp.division}
                        </span>
                      </div>
                    </td>
                    {dates.map((d) => {
                      const shift = resolveShift(emp, year, month, d, overrides);
                      const overrideKey = formatOverrideKey(year, month, d, emp.id);
                      const isOverridden = overrides && overrides[overrideKey] !== undefined;
                      const holiday = getHoliday(d);

                      return (
                        <td
                          key={d}
                          className={`p-1 border-r border-slate-100 relative group cursor-pointer ${borderBottomClass}`}
                          onClick={() =>
                            setSelectedCell({
                              emp,
                              day: d,
                              currentShift: shift,
                              isOverride: isOverridden,
                            })
                          }
                        >
                          <div
                            className={`w-full h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all hover:scale-110 shadow-sm relative ${
                              shiftColors[shift] || 'bg-slate-100 text-slate-700'
                            } ${isOverridden ? 'ring-2 ring-amber-400 ring-offset-1 font-black' : ''}`}
                          >
                            {shift.split(' ')[0]}

                            {/* Overridden Badge Marker */}
                            {isOverridden && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
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

      {/* Popover / Modal Shift Selector */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Ubah Shift Karyawan
                </span>
                <h4 className="text-lg font-black text-slate-900">
                  {selectedCell.emp.name} ({selectedCell.emp.division})
                </h4>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">
                  Tanggal: {selectedCell.day} {monthNames[month]} {year}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Shift Saat Ini:</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-sm">
                {selectedCell.currentShift} {selectedCell.isOverride && '(Override)'}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Pilih Shift Baru:
              </p>
              {(selectedCell.emp.division === 'L1' ? shiftOptionsL1 : shiftOptionsL2).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectShift(opt.value)}
                  className={`w-full p-3 rounded-2xl text-xs font-black flex items-center justify-between transition-all border ${
                    selectedCell.currentShift === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    selectedCell.currentShift === opt.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {opt.badge}
                  </span>
                </button>
              ))}

              {/* Reset to Auto Button */}
              {selectedCell.isOverride && (
                <button
                  type="button"
                  onClick={() => handleSelectShift('AUTO')}
                  className="w-full p-3 rounded-2xl text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-2 mt-3"
                >
                  <span>↺</span>
                  <span>Kembalikan ke Formula Otomatis (Auto)</span>
                </button>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-5 py-2.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Swap Shift Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Tukar Shift (Swap)</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tukar jadwal 2 karyawan pada tanggal tertentu secara instan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSwap} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Pilih Tanggal ({monthNames[month]} {year})
                </label>
                <select
                  value={swapDate}
                  onChange={(e) => setSwapDate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      Tanggal {d} {monthNames[month]} {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Karyawan A
                  </label>
                  <select
                    value={swapEmpA}
                    onChange={(e) => setSwapEmpA(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {activeEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.division})
                      </option>
                    ))}
                  </select>
                  {swapEmpA && (
                    <p className="text-[11px] font-bold text-indigo-600 mt-1.5 px-2">
                      Shift: {resolveShift(employees.find(e => e.id === swapEmpA) || {}, year, month, Number(swapDate), overrides)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Karyawan B
                  </label>
                  <select
                    value={swapEmpB}
                    onChange={(e) => setSwapEmpB(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {activeEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.division})
                      </option>
                    ))}
                  </select>
                  {swapEmpB && (
                    <p className="text-[11px] font-bold text-indigo-600 mt-1.5 px-2">
                      Shift: {resolveShift(employees.find(e => e.id === swapEmpB) || {}, year, month, Number(swapDate), overrides)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!swapEmpA || !swapEmpB || swapEmpA === swapEmpB}
                  className="px-6 py-2.5 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tukar Shift Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Month Confirmation Modal */}
      {isResetMonthConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
              ⚠️
            </div>
            <h4 className="text-lg font-black text-slate-900">Reset Shift Bulan Ini?</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
              Semua {monthOverrideCount} shift modifikasi manual pada periode <span className="font-bold text-slate-800">{monthNames[month]} {year}</span> akan dikembalikan ke rotasi otomatis murni.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsResetMonthConfirm(false)}
                className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetMonth}
                className="px-5 py-2.5 rounded-2xl font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200 text-sm transition-colors"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
