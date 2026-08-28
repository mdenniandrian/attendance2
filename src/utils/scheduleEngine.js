// Mesin Algoritma Jadwal Shift dan Resolusi Override

export const epoch = Date.UTC(2026, 4, 25); // Acuan: Senin, 25 Mei 2026

export const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const shiftColors = {
  'P (L1)': 'bg-sky-500/10 text-sky-700 border border-sky-200/50 hover:bg-sky-500/20 shadow-sm ring-1 ring-sky-500/5',
  'P2 (L1)': 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-500/20 shadow-sm ring-1 ring-emerald-500/5',
  'S (L1)': 'bg-orange-500/10 text-orange-700 border border-orange-200/50 hover:bg-orange-500/20 shadow-sm ring-1 ring-orange-500/5',
  'M (L1)': 'bg-violet-500/10 text-violet-700 border border-violet-200/50 hover:bg-violet-500/20 shadow-sm ring-1 ring-violet-500/5',
  'P (L2)': 'bg-indigo-500/10 text-indigo-700 border border-indigo-200/50 hover:bg-indigo-500/20 shadow-sm ring-1 ring-indigo-500/5',
  'S (L2)': 'bg-teal-500/10 text-teal-700 border border-teal-200/50 hover:bg-teal-500/20 shadow-sm ring-1 ring-teal-500/5',
  'L': 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-md shadow-rose-200 ring-2 ring-rose-200/50 font-black',
};

export const shiftOptionsL1 = [
  { value: 'P (L1)', label: 'P - Pagi (06:00 - 15:00)', badge: 'P', color: 'sky' },
  { value: 'P2 (L1)', label: 'P2 - Pagi 2 (09:00 - 18:00)', badge: 'P2', color: 'emerald' },
  { value: 'S (L1)', label: 'S - Siang (14:00 - 23:00)', badge: 'S', color: 'orange' },
  { value: 'M (L1)', label: 'M - Malam (22:00 - 07:00)', badge: 'M', color: 'violet' },
  { value: 'L', label: 'L - Libur', badge: 'L', color: 'rose' },
];

export const shiftOptionsL2 = [
  { value: 'P (L2)', label: 'P - Pagi (06:00 - 15:00)', badge: 'P', color: 'indigo' },
  { value: 'S (L2)', label: 'S - Siang (15:00 - 00:00)', badge: 'S', color: 'teal' },
  { value: 'L', label: 'L - Libur', badge: 'L', color: 'rose' },
];

// Utilitas Modulo murni untuk menangani nilai negatif
export function mod(n, m) {
  return ((n % m) + m) % m;
}

// Menghitung indeks hari dari tanggal acuan
export function getDayIndex(year, month, day) {
  const current = Date.UTC(year, month, day);
  return Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
}

// Format kunci tanggal YYYY-MM-DD
export function formatDateKey(year, month, day) {
  const mStr = String(month + 1).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  return `${year}-${mStr}-${dStr}`;
}

// Format kunci override YYYY-MM-DD_empId
export function formatOverrideKey(year, month, day, empId) {
  return `${formatDateKey(year, month, day)}_${empId}`;
}

// Cek apakah karyawan aktif pada bulan tertentu
export function isEmployeeActiveInMonth(emp, year, month) {
  if (emp.status === 'inactive') return false;

  const currentYearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  if (emp.activeStart && currentYearMonth < emp.activeStart) {
    return false;
  }
  if (emp.activeEnd && currentYearMonth > emp.activeEnd) {
    return false;
  }
  return true;
}

// Helper untuk mengurutkan posisi karyawan (Divisi L1 di atas, posisi baris sesuai 'order' tanpa merubah slot)
export function sortEmployees(empList) {
  return [...empList].sort((a, b) => {
    // 1. Urutkan berdasarkan Divisi: L1 selalu di atas L2
    if (a.division !== b.division) {
      return a.division === 'L1' ? -1 : 1;
    }

    // 2. Jika ada nomor urutan posisi baris (order), gunakan itu
    if (a.order !== undefined && b.order !== undefined) {
      if (a.order !== b.order) return a.order - b.order;
    }

    // 3. Fallback: urutkan berdasarkan slot l1Index
    if (a.division === 'L1' && b.division === 'L1') {
      const idxA = a.l1Index ?? 0;
      const idxB = b.l1Index ?? 0;
      if (idxA !== idxB) {
        return idxB - idxA;
      }
    }

    return 0;
  });
}

// Mengambil daftar karyawan yang aktif pada bulan dan tahun tertentu, terurut otomatis
export function getActiveEmployeesForMonth(allEmployees, year, month) {
  const active = allEmployees.filter(emp => isEmployeeActiveInMonth(emp, year, month));
  return sortEmployees(active);
}

// Algoritma rotasi L1 master
export function getBaseL1Shift(l1Index, dayIndex) {
  const D = mod(dayIndex, 7); // 0: Sen, 1: Sel, 2: Rab, 3: Kam, 4: Jum, 5: Sab, 6: Min
  const W = Math.floor(dayIndex / 7); // Indeks Minggu
  const slot = l1Index ?? 0;

  // Skema Rotasi Blok Mulai 1 September 2026 (dayIndex >= 99)
  if (dayIndex >= 99) {
    const offDay = mod(slot + W, 6) + 1; // 1: Sel s/d 6: Min

    // 1. Libur mingguan bergilir tepat 1 hari per minggu: Selasa s/d Minggu
    // Hari Senin (0) seluruh personil masuk kerja (0 Libur)
    if (D === offDay) return 'L';

    // 2. Rotasi Blok Murni Tanpa Ada Shift Nyempil:
    // Pagi -> Malam -> Siang -> Pagi 2 -> Siang -> Pagi
    const seq = ['P', 'P', 'M', 'S', 'P2', 'S'];

    // Jika libur Selasa (offDay === 1), shift Senin dan hari-hari setelah Selasa
    // seluruhnya mengikuti shift Pagi mingguan (slot + W) tanpa perubahan tiba-tiba.
    let cycle;
    if (offDay === 1) {
      cycle = slot + W;
    } else {
      cycle = slot + W + (D > offDay ? 1 : 0);
    }

    return seq[mod(cycle, 6)];
  }

  // Skema Historis Sebelum 1 September 2026 (Rotasi 5 Slot Klasik)
  const offDayThisWeek = mod(slot + W, 5) + 2;
  if (D === offDayThisWeek) return 'L';

  const baseShifts = ['S', 'P', 'M', 'S', 'P2'];
  const cycleCompleted = W + (D > offDayThisWeek ? 1 : 0);
  const shiftIdx = mod(slot + cycleCompleted, 5);
  const rawShift = baseShifts[shiftIdx];

  if (dayIndex >= 44 && dayIndex <= 98 && (D === 0 || D === 1)) {
    if (offDayThisWeek === 2 && rawShift === 'S') {
      return 'P2';
    }
  }
  return rawShift;
}

// Resolusi Shift Otomatis / Override untuk 1 Karyawan pada Tanggal Tertentu
export function resolveShift(emp, year, month, day, overrides = {}) {
  const overrideKey = formatOverrideKey(year, month, day, emp.id);

  // 1. Prioritaskan Manual Custom Override dari Backoffice
  if (overrides && overrides[overrideKey] !== undefined) {
    return overrides[overrideKey];
  }

  const dayIndex = getDayIndex(year, month, day);
  const D = mod(dayIndex, 7);
  const W = Math.floor(dayIndex / 7);

  // 2. Divisi L1
  if (emp.division === 'L1') {
    // Khusus Rizky Pagi terus selama Agustus 2026 jika belum dioverride manual
    if (emp.name === 'Rizky' && dayIndex >= 68 && dayIndex <= 98) {
      if (dayIndex === 79) return 'P (L1)';
      if (dayIndex === 82) return 'L';
      if (dayIndex === 87) return 'P (L1)';
      if (dayIndex === 90) return 'L';
      const raw = getBaseL1Shift(emp.l1Index ?? 4, dayIndex);
      if (raw === 'L') return 'L';
      return 'P (L1)';
    }

    // Default Rafi L setelah 8 Juli hingga sebelum Syafiq masuk
    if (dayIndex >= 44 && dayIndex <= 98 && emp.id === 'rafi') {
      return 'L';
    }

    const raw = getBaseL1Shift(emp.l1Index ?? 0, dayIndex);
    if (raw === 'L') return 'L';
    return `${raw} (L1)`;
  }

  // 3. Divisi L2
  if (emp.division === 'L2') {
    let baseShift = 'L';
    if (dayIndex < 40) { // Sebelum 4 Juli 2026
      if (D === 5 || D === 6) {
        baseShift = 'L';
      } else {
        if (emp.name === 'Denni') {
          baseShift = (W % 2 === 0) ? 'S (L2)' : 'P (L2)';
        } else {
          baseShift = (W % 2 === 0) ? 'P (L2)' : 'S (L2)';
        }
      }
    } else { // Mulai 4 Juli 2026
      if (D === 5) {
        if (emp.name === 'Denni') {
          baseShift = (W % 2 === 0) ? 'S (L2)' : 'L';
        } else {
          baseShift = (W % 2 === 0) ? 'L' : 'S (L2)';
        }
      } else if (D === 6) {
        if (emp.name === 'Denni') {
          baseShift = (W % 2 === 0) ? 'L' : 'S (L2)';
        } else {
          baseShift = (W % 2 === 0) ? 'S (L2)' : 'L';
        }
      } else {
        if (emp.name === 'Denni') {
          baseShift = (W % 2 === 0) ? 'S (L2)' : 'P (L2)';
        } else {
          baseShift = (W % 2 === 0) ? 'P (L2)' : 'S (L2)';
        }
      }
    }

    // Mulai tanggal 10-30 Agustus 2026 (dayIndex 77 s/d 97)
    if (dayIndex >= 77 && dayIndex <= 97) {
      if (baseShift !== 'L') {
        return 'P (L2)';
      }
    }
    return baseShift;
  }

  return 'L';
}
