import React, { useState } from 'react';
import { sortEmployees } from '../utils/scheduleEngine';

export default function EmployeeManager({ employees, onSaveEmployees }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    division: 'L1',
    l1Index: 0,
    order: 1,
    status: 'active',
    activeStart: '',
    activeEnd: '',
  });

  const handleOpenAdd = () => {
    const l1Emps = employees.filter(e => e.division === 'L1');
    const usedL1Indices = l1Emps.map(e => e.l1Index);
    let nextIndex = 0;
    for (let i = 0; i < 10; i++) {
      if (!usedL1Indices.includes(i)) {
        nextIndex = i;
        break;
      }
    }

    setEditingEmployee(null);
    setFormData({
      id: `emp_${Date.now()}`,
      name: '',
      division: 'L1',
      l1Index: nextIndex,
      order: employees.length + 1,
      status: 'active',
      activeStart: '',
      activeEnd: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      id: emp.id,
      name: emp.name,
      division: emp.division,
      l1Index: emp.l1Index ?? 0,
      order: emp.order ?? 1,
      status: emp.status || 'active',
      activeStart: emp.activeStart || '',
      activeEnd: emp.activeEnd || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let updatedList;
    if (editingEmployee) {
      updatedList = employees.map(emp =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name: formData.name.trim(),
              division: formData.division,
              l1Index: formData.division === 'L1' ? Number(formData.l1Index) : undefined,
              order: Number(formData.order) || emp.order || 1,
              status: formData.status,
              activeStart: formData.activeStart || null,
              activeEnd: formData.activeEnd || null,
            }
          : emp
      );
    } else {
      const newEmp = {
        id: formData.id || `emp_${Date.now()}`,
        name: formData.name.trim(),
        division: formData.division,
        l1Index: formData.division === 'L1' ? Number(formData.l1Index) : undefined,
        order: Number(formData.order) || employees.length + 1,
        status: formData.status,
        activeStart: formData.activeStart || null,
        activeEnd: formData.activeEnd || null,
      };
      updatedList = [...employees, newEmp];
    }

    onSaveEmployees(sortEmployees(updatedList));
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const updated = employees.filter(emp => emp.id !== id);
    onSaveEmployees(sortEmployees(updated));
    setDeleteConfirmEmp(null);
  };

  const handleToggleStatus = (emp) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    const updated = employees.map(e =>
      e.id === emp.id ? { ...e, status: nextStatus } : e
    );
    onSaveEmployees(sortEmployees(updated));
  };

  // Quick Change Slot L1 directly from table (HANYA mengubah Slot Rotasi)
  const handleQuickSlotChange = (emp, newSlot) => {
    const targetSlot = Number(newSlot);
    const updated = employees.map(e =>
      e.id === emp.id ? { ...e, l1Index: targetSlot } : e
    );
    onSaveEmployees(sortEmployees(updated));
  };

  // Pindah Posisi Baris Naik (HANYA mengubah urutan tampilan 'order', TIDAK merubah slot/jadwal)
  const handleMoveUp = (emp) => {
    const sorted = sortEmployees(employees);
    const index = sorted.findIndex(e => e.id === emp.id);
    if (index <= 0) return;

    const prevEmp = sorted[index - 1];
    // Hanya geser urutan posisi dalam divisi yang sama
    if (emp.division === prevEmp.division) {
      const currentOrder = emp.order ?? (index + 1);
      const prevOrder = prevEmp.order ?? index;

      const updated = employees.map(e => {
        if (e.id === emp.id) return { ...e, order: prevOrder };
        if (e.id === prevEmp.id) return { ...e, order: currentOrder };
        return e;
      });
      onSaveEmployees(sortEmployees(updated));
    }
  };

  // Pindah Posisi Baris Turun (HANYA mengubah urutan tampilan 'order', TIDAK merubah slot/jadwal)
  const handleMoveDown = (emp) => {
    const sorted = sortEmployees(employees);
    const index = sorted.findIndex(e => e.id === emp.id);
    if (index >= sorted.length - 1) return;

    const nextEmp = sorted[index + 1];
    // Hanya geser urutan posisi dalam divisi yang sama
    if (emp.division === nextEmp.division) {
      const currentOrder = emp.order ?? (index + 1);
      const nextOrder = nextEmp.order ?? (index + 2);

      const updated = employees.map(e => {
        if (e.id === emp.id) return { ...e, order: nextOrder };
        if (e.id === nextEmp.id) return { ...e, order: currentOrder };
        return e;
      });
      onSaveEmployees(sortEmployees(updated));
    }
  };

  const sortedEmployees = sortEmployees(employees);

  const filteredEmployees = sortedEmployees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiv = filterDivision === 'ALL' || emp.division === filterDivision;
    return matchSearch && matchDiv;
  });

  const totalActiveL1 = employees.filter(e => e.division === 'L1' && e.status === 'active').length;
  const totalActiveL2 = employees.filter(e => e.division === 'L2' && e.status === 'active').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Karyawan</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{employees.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            👥
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Divisi L1 (Aktif)</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-black text-sky-600">{totalActiveL1}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                Rotasi 6 Slot
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Divisi L2 (Aktif)</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-black text-indigo-600">{totalActiveL2}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Weekly Switch
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" />
            </svg>
          </div>

          {/* Division Filter */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {['ALL', 'L1', 'L2'].map((div) => (
              <button
                key={div}
                type="button"
                onClick={() => setFilterDivision(div)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  filterDivision === div
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {div === 'ALL' ? 'Semua Divisi' : `Divisi ${div}`}
              </button>
            ))}
          </div>
        </div>

        {/* Add Employee Button */}
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Employee List Table */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Posisi & Karyawan</th>
                <th className="p-4">Divisi</th>
                <th className="p-4">Slot Rotasi (Rumus Shift)</th>
                <th className="p-4">Periode Keaktifan</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">
                    Tidak ada karyawan yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, empIdx) => {
                  const isActive = emp.status === 'active';
                  return (
                    <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-4 pl-6 font-black text-slate-900 flex items-center gap-3">
                        {/* Move Up / Down Buttons for Row Order ONLY */}
                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity mr-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(emp)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 flex items-center justify-center text-[10px] font-black transition-colors"
                            title="Geser Posisi Baris ke Atas (Tidak merubah jadwal)"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(emp)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 flex items-center justify-center text-[10px] font-black transition-colors"
                            title="Geser Posisi Baris ke Bawah (Tidak merubah jadwal)"
                          >
                            ▼
                          </button>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-indigo-50 border border-slate-200/50 flex items-center justify-center font-black text-indigo-700 text-xs">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-black flex items-center gap-2">
                            <span>{emp.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                              Baris #{empIdx + 1}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {emp.id}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                          emp.division === 'L1'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          Divisi {emp.division}
                        </span>
                      </td>

                      {/* Slot Selector (Rumus Shift) */}
                      <td className="p-4">
                        {emp.division === 'L1' ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={emp.l1Index ?? 0}
                              onChange={(e) => handleQuickSlotChange(emp, e.target.value)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none cursor-pointer"
                              title="Ubah Slot Rotasi Shift"
                            >
                              {[5, 4, 3, 2, 1, 0].map((slot) => (
                                <option key={slot} value={slot}>
                                  Slot #{slot}
                                </option>
                              ))}
                            </select>
                            <span className="text-[10px] text-slate-400 font-medium">Rumus Rotasi</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Rotasi Mingguan (L2)</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-slate-600">
                        {emp.activeStart || emp.activeEnd ? (
                          <div className="space-y-0.5">
                            {emp.activeStart && <p>Mulai: <span className="font-bold text-slate-800">{emp.activeStart}</span></p>}
                            {emp.activeEnd && <p className="text-rose-600 font-semibold">Resign: <span className="font-black">{emp.activeEnd}</span></p>}
                          </div>
                        ) : (
                          <span className="text-slate-400">Aktif Penuh</span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(emp)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {isActive ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp)}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Karyawan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmEmp(emp)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Karyawan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Konfigurasi profil divisi & pengaturan slot rotasi shift
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Farid"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Divisi
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="L1">Divisi L1 (Rotasi)</option>
                    <option value="L2">Divisi L2 (Weekly)</option>
                  </select>
                </div>

                {formData.division === 'L1' ? (
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      Slot Rotasi L1 (Rumus)
                    </label>
                    <select
                      value={formData.l1Index}
                      onChange={(e) => setFormData({ ...formData, l1Index: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {[5, 4, 3, 2, 1, 0].map((slot) => (
                        <option key={slot} value={slot}>
                          Slot #{slot}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      Status Karyawan
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Non-Aktif</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Aktif Mulai (Opsional)
                  </label>
                  <input
                    type="month"
                    value={formData.activeStart}
                    onChange={(e) => setFormData({ ...formData, activeStart: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika aktif dari awal</p>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Aktif Sampai / Resign (Opsional)
                  </label>
                  <input
                    type="month"
                    value={formData.activeEnd}
                    onChange={(e) => setFormData({ ...formData, activeEnd: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika masih aktif</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all text-sm"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
              🗑️
            </div>
            <h4 className="text-lg font-black text-slate-900">Hapus Karyawan?</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
              Karyawan <span className="font-bold text-slate-800">{deleteConfirmEmp.name}</span> akan dihapus dari daftar.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmp(null)}
                className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmEmp.id)}
                className="px-5 py-2.5 rounded-2xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 text-sm transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
