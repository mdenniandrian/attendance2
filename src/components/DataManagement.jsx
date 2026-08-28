import React, { useState, useRef } from 'react';
import {
  exportDatabaseJSON,
  importDatabaseJSON,
  resetDatabaseToDefault,
  updateAdminCredentials,
  loadAuth,
} from '../utils/storage';

export default function DataManagement({
  employees,
  overrides,
  onDatabaseReload,
}) {
  const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error', message }
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Password / Security State
  const currentAuth = loadAuth();
  const [newUsername, setNewUsername] = useState(currentAuth.username || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMsg, setAuthMsg] = useState(null);

  const handleExport = () => {
    exportDatabaseJSON();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await importDatabaseJSON(file);
      setImportStatus({
        type: 'success',
        message: `Database berhasil dipulihkan! (${data.employees.length} karyawan, ${Object.keys(data.overrides || {}).length} shift overrides).`,
      });
      onDatabaseReload(data.employees, data.overrides || {});
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Gagal mengimpor file JSON.',
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    const defaultData = resetDatabaseToDefault();
    onDatabaseReload(defaultData.employees, defaultData.overrides);
    setIsResetConfirmOpen(false);
    setImportStatus({
      type: 'success',
      message: 'Database berhasil direset kembali ke setelan default awal (termasuk username: admin, password: admin)!',
    });
  };

  const handleUpdateAuth = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setAuthMsg({ type: 'error', text: 'Username tidak boleh kosong.' });
      return;
    }
    if (newPassword.length < 3) {
      setAuthMsg({ type: 'error', text: 'Password minimal 3 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    try {
      await updateAdminCredentials(newUsername, newPassword);
      setAuthMsg({ type: 'success', text: 'Username dan Password admin berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setAuthMsg({ type: 'error', text: 'Gagal memperbarui kredensial.' });
    }
  };

  const totalOverrides = Object.keys(overrides).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Alert Status */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{importStatus.type === 'success' ? '✅' : '❌'}</span>
            <p className="text-sm font-bold">{importStatus.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setImportStatus(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
            💾
          </div>
          <h4 className="font-black text-slate-900 text-lg">Penyimpanan Browser</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Data tersimpan otomatis di LocalStorage browser perangkat Anda.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Status:</span>
            <span className="text-emerald-600 font-black flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tersimpan Aktif
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4">
            👥
          </div>
          <h4 className="font-black text-slate-900 text-lg">Karyawan Terdaftar</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Total profil karyawan aktif & non-aktif yang dikelola sistem.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Jumlah:</span>
            <span className="text-slate-900 font-black">{employees.length} Orang</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
            ⚡
          </div>
          <h4 className="font-black text-slate-900 text-lg">Shift Dimodifikasi</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Total custom override dan swap shift yang telah disesuaikan manual.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Jumlah Override:</span>
            <span className="text-amber-700 font-black">{totalOverrides} Entri</span>
          </div>
        </div>
      </div>

      {/* Security & Password Section */}
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            🔒
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Keamanan & Password Backoffice</h4>
            <p className="text-xs text-slate-500 font-medium">
              Ubah kredensial username dan password untuk melindungi akses ke Management Backoffice.
            </p>
          </div>
        </div>

        {authMsg && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              authMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span>{authMsg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{authMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAuth} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Username Admin
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Password Baru
            </label>
            <input
              type="password"
              placeholder="Minimal 3 karakter..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              placeholder="Ulangi password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={!newPassword || !confirmPassword}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all"
            >
              Simpan Perubahan Kredensial
            </button>
          </div>
        </form>
      </div>

      {/* Action Sections: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup & Export */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-xl shadow-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📥</span>
              <h4 className="text-lg font-black text-slate-900">Cadangkan Data (Export Backup)</h4>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
              Unduh seluruh database daftar karyawan, status keaktifan, dan seluruh riwayat modifikasi shift ke dalam satu file berkas JSON. Sangat disarankan dilakukan secara berkala.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh File Cadangan JSON</span>
          </button>
        </div>

        {/* Restore & Import */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-xl shadow-slate-100/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📤</span>
              <h4 className="text-lg font-black text-slate-900">Pulihkan Data (Import Backup)</h4>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
              Pulihkan data dari file cadangan JSON yang telah diexport sebelumnya. Data yang ada di browser saat ini akan ditimpa dengan data dari file cadangan.
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="w-full py-4 bg-white hover:bg-slate-50 border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Pilih File Backup JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset to Default */}
      <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h4 className="text-base font-black text-rose-900 flex items-center gap-2">
            <span>⚠️</span> Reset ke Pengaturan Bawaan Pabrik
          </h4>
          <p className="text-xs text-rose-700 font-medium mt-1 max-w-xl">
            Tindakan ini akan mengembalikan daftar karyawan awal (Rizky, Lukman, Rafi/Syafiq, Bagus, Diki, Denni, Ihsan), kredensial default (admin / admin), dan menghapus custom overrides yang dibuat secara manual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-6 py-3 bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-300 rounded-2xl font-black text-xs transition-all shadow-sm whitespace-nowrap"
        >
          Reset Database Default
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
              ⚠️
            </div>
            <h4 className="text-lg font-black text-slate-900">Reset Semua Data?</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
              Seluruh perubahan karyawan, custom override, dan password akan digantikan dengan data default bawaan sistem.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-2xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 text-sm transition-colors"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
