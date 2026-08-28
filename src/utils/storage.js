// Utility Storage untuk LocalStorage Manajemen Jadwal Shift & Autentikasi

export const STORAGE_KEYS = {
  EMPLOYEES: 'jadwal_shift_employees_v1',
  OVERRIDES: 'jadwal_shift_overrides_v1',
  AUTH: 'jadwal_shift_auth_v1',
  SESSION: 'jadwal_shift_session_v1',
};

// Default Credentials Admin (Username: admin, Password: admin)
export const DEFAULT_AUTH = {
  username: 'admin',
  passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA-256 dari "admin"
};

// Helper Enkripsi SHA-256 via Web Crypto API
export async function hashString(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

const isStorageAvailable = () => typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
const isSessionAvailable = () => typeof sessionStorage !== 'undefined' && typeof sessionStorage.getItem === 'function';

// Mengambil Data Kredensial Admin Tersimpan
export function loadAuth() {
  try {
    if (!isStorageAvailable()) return DEFAULT_AUTH;
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) {
      saveAuth(DEFAULT_AUTH);
      return DEFAULT_AUTH;
    }
    const parsed = JSON.parse(raw);
    return parsed?.username && parsed?.passwordHash ? parsed : DEFAULT_AUTH;
  } catch (error) {
    console.error('Gagal membaca kredensial dari LocalStorage:', error);
    return DEFAULT_AUTH;
  }
}

// Menyimpan Kredensial Admin ke LocalStorage
export function saveAuth(auth) {
  try {
    if (!isStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  } catch (error) {
    console.error('Gagal menyimpan kredensial ke LocalStorage:', error);
  }
}

// Verifikasi Username dan Password Login
export async function verifyAuth(username, password) {
  const currentAuth = loadAuth();
  if (username.trim() !== currentAuth.username) {
    return false;
  }
  const inputHash = await hashString(password);
  return inputHash === currentAuth.passwordHash;
}

// Update Kredensial Baru Admin
export async function updateAdminCredentials(newUsername, newPassword) {
  const passwordHash = await hashString(newPassword);
  const auth = {
    username: newUsername.trim(),
    passwordHash,
  };
  saveAuth(auth);
  return auth;
}

// Cek Status Sesi Login
export function checkIsAuthenticated() {
  try {
    const sessionVal = isSessionAvailable() ? sessionStorage.getItem(STORAGE_KEYS.SESSION) : null;
    const localVal = isStorageAvailable() ? localStorage.getItem(STORAGE_KEYS.SESSION) : null;
    return sessionVal === 'true' || localVal === 'true';
  } catch {
    return false;
  }
}

// Simpan Sesi Login
export function setAuthenticatedSession(remember = false) {
  try {
    if (isSessionAvailable()) sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    if (remember && isStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    }
  } catch (error) {
    console.error('Gagal menyimpan sesi login:', error);
  }
}

// Hapus Sesi Login (Logout)
export function clearAuthenticatedSession() {
  try {
    if (isSessionAvailable()) sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    if (isStorageAvailable()) localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (error) {
    console.error('Gagal menghapus sesi login:', error);
  }
}

// Data Karyawan Default Bawaan Sistem (6 Orang L1, 2 Orang L2, 1 Resigned)
export const DEFAULT_EMPLOYEES = [
  {
    id: 'rizky',
    name: 'Rizky',
    division: 'L1',
    l1Index: 5,
    order: 1,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'lukman',
    name: 'Lukman',
    division: 'L1',
    l1Index: 4,
    order: 2,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'rafi',
    name: 'Rafi',
    division: 'L1',
    l1Index: 3,
    order: 99,
    status: 'resigned',
    activeStart: '2025-01',
    activeEnd: '2026-06', // Aktif s/d Juni 2026
  },
  {
    id: 'syafiq',
    name: 'Syafiq',
    division: 'L1',
    l1Index: 3,
    order: 3,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'farid',
    name: 'Farid',
    division: 'L1',
    l1Index: 2,
    order: 4,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'bagus',
    name: 'Bagus',
    division: 'L1',
    l1Index: 1,
    order: 5,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'diki',
    name: 'Diki',
    division: 'L1',
    l1Index: 0,
    order: 6,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'denni',
    name: 'Denni',
    division: 'L2',
    order: 7,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
  {
    id: 'ihsan',
    name: 'Ihsan',
    division: 'L2',
    order: 8,
    status: 'active',
    activeStart: '2025-01',
    activeEnd: null,
  },
];

// Default Overrides untuk penyesuaian khusus (Juli & Agustus 2026)
export const DEFAULT_OVERRIDES = {
  // Overrides Juli 2026
  '2026-07-31_rizky': 'M (L1)',
  '2026-07-31_diki': 'S (L1)',
  '2026-07-08_lukman': 'S (L1)',
  '2026-07-09_lukman': 'S (L1)',
  '2026-07-10_lukman': 'S (L1)',
  '2026-07-11_lukman': 'S (L1)',
  '2026-07-23_bagus': 'P (L1)',
  '2026-07-24_bagus': 'P (L1)',
  '2026-07-25_bagus': 'P (L1)',
  '2026-07-26_diki': 'P (L1)',
  '2026-07-27_bagus': 'P (L1)',
  '2026-07-28_bagus': 'P (L1)',
  '2026-07-29_diki': 'P (L1)',

  // Overrides Lengkap Agustus 2026 (Sesuai Screenshot 100%)
  '2026-08-01_lukman': 'M (L1)',
  '2026-08-06_lukman': 'M (L1)',
  '2026-08-07_lukman': 'L',
  '2026-08-08_lukman': 'S (L1)',
  '2026-08-09_lukman': 'S (L1)',
  '2026-08-10_lukman': 'S (L1)',
  '2026-08-11_lukman': 'S (L1)',
  '2026-08-12_lukman': 'S (L1)',
  '2026-08-13_lukman': 'S (L1)',
  '2026-08-14_lukman': 'S (L1)',
  '2026-08-15_lukman': 'S (L1)',
  '2026-08-20_lukman': 'S (L1)',
  '2026-08-21_lukman': 'S (L1)',
  '2026-08-22_lukman': 'S (L1)',
  '2026-08-24_lukman': 'S (L1)',
  '2026-08-25_lukman': 'S (L1)',
  '2026-08-26_lukman': 'S (L1)',
  '2026-08-28_lukman': 'P (L1)',
  '2026-08-03_bagus': 'M (L1)',
  '2026-08-04_bagus': 'M (L1)',
  '2026-08-05_bagus': 'M (L1)',
  '2026-08-15_bagus': 'P (L1)',
  '2026-08-21_bagus': 'M (L1)',
  '2026-08-23_bagus': 'M (L1)',
  '2026-08-24_bagus': 'M (L1)',
  '2026-08-25_bagus': 'M (L1)',
  '2026-08-26_bagus': 'M (L1)',
  '2026-08-27_bagus': 'M (L1)',
  '2026-08-28_bagus': 'M (L1)',
  '2026-08-29_bagus': 'S (L1)',
  '2026-08-01_diki': 'S (L1)',
  '2026-08-06_diki': 'S (L1)',
  '2026-08-07_diki': 'S (L1)',
  '2026-08-08_diki': 'S (L1)',
  '2026-08-10_diki': 'P2 (L1)',
  '2026-08-11_diki': 'P2 (L1)',
  '2026-08-12_diki': 'P2 (L1)',
  '2026-08-22_diki': 'M (L1)',
  '2026-08-30_diki': 'S (L1)',
  '2026-08-31_diki': 'S (L1)',
};

// Mengambil Data Karyawan dari LocalStorage
export function loadEmployees() {
  try {
    if (!isStorageAvailable()) return DEFAULT_EMPLOYEES;
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      saveEmployees(DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveEmployees(DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }

    // Setia membaca data yang disimpan user di LocalStorage tanpa mereset slot atau posisi
    return parsed;
  } catch (error) {
    console.error('Gagal membaca karyawan dari LocalStorage:', error);
    return DEFAULT_EMPLOYEES;
  }
}

// Menyimpan Data Karyawan ke LocalStorage
export function saveEmployees(employees) {
  try {
    if (!isStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error('Gagal menyimpan karyawan ke LocalStorage:', error);
  }
}

// Mengambil Data Overrides dari LocalStorage
export function loadOverrides() {
  try {
    if (!isStorageAvailable()) return DEFAULT_OVERRIDES;
    const raw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    if (!raw) {
      saveOverrides(DEFAULT_OVERRIDES);
      return DEFAULT_OVERRIDES;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return DEFAULT_OVERRIDES;
  } catch (error) {
    console.error('Gagal membaca overrides dari LocalStorage:', error);
    return DEFAULT_OVERRIDES;
  }
}

// Menyimpan Data Overrides ke LocalStorage
export function saveOverrides(overrides) {
  try {
    if (!isStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
  } catch (error) {
    console.error('Gagal menyimpan overrides ke LocalStorage:', error);
  }
}

// Export Database Lengkap ke Format JSON
export function exportDatabaseJSON() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    employees: loadEmployees(),
    overrides: loadOverrides(),
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-jadwal-shift-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import Database dari File JSON
export function importDatabaseJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.employees || !Array.isArray(parsed.employees)) {
          throw new Error('Format file JSON tidak valid (karyawan tidak ditemukan)');
        }
        saveEmployees(parsed.employees);
        saveOverrides(parsed.overrides || {});
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

// Reset Database ke Setelan Default Awal
export function resetDatabaseToDefault() {
  saveEmployees(DEFAULT_EMPLOYEES);
  saveOverrides(DEFAULT_OVERRIDES);
  saveAuth(DEFAULT_AUTH);
  return {
    employees: DEFAULT_EMPLOYEES,
    overrides: DEFAULT_OVERRIDES,
  };
}
