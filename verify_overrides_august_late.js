function mod(n, m) {
  return ((n % m) + m) % m;
}

const epoch = Date.UTC(2026, 4, 25);
function getDayIndex(year, month, day) {
  const current = Date.UTC(year, month, day);
  return Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
}

const employees = [
  { id: 'rizky', name: 'Rizky', division: 'L1', l1Index: 4 },
  { id: 'lukman', name: 'Lukman', division: 'L1', l1Index: 3 },
  { id: 'rafi', name: 'Rafi', division: 'L1', l1Index: 2 },
  { id: 'bagus', name: 'Bagus', division: 'L1', l1Index: 1 },
  { id: 'diki', name: 'Diki', division: 'L1', l1Index: 0 }
];

function getL1Shift(p, dayIndex) {
  const D = mod(dayIndex, 7);
  const W = Math.floor(dayIndex / 7);
  const offDayThisWeek = mod(p + W, 5) + 2;

  if (D === offDayThisWeek) return 'L';
  const baseShifts = ['S', 'P', 'M', 'S', 'P2'];
  const cycleCompleted = W + (D > offDayThisWeek ? 1 : 0);
  
  const shiftIdx = mod(p + cycleCompleted, 5);
  const rawShift = baseShifts[shiftIdx];

  if (dayIndex >= 44 && (D === 0 || D === 1)) {
    if (offDayThisWeek === 2 && rawShift === 'S') {
      return 'P2';
    }
  }
  return rawShift;
}

function getRawL1Shift(empName, dayIndex, bypassRizkyOverride = false) {
  const current = new Date(epoch + dayIndex * 24 * 60 * 60 * 1000);
  const isJuly2026 = current.getUTCFullYear() === 2026 && current.getUTCMonth() === 6;
  const isAugust2026 = current.getUTCFullYear() === 2026 && current.getUTCMonth() === 7;
  const isSeptember2026 = current.getUTCFullYear() === 2026 && current.getUTCMonth() === 8;

  // Penyesuaian Rizky Pagi terus sampai 4 September 2026 (dayIndex 68 s/d 102)
  if (!bypassRizkyOverride && empName === 'Rizky' && dayIndex >= 68 && dayIndex <= 102) {
    if (dayIndex === 79) return 'P';
    if (dayIndex === 82) return 'L';
    if (dayIndex === 87) return 'P';
    if (dayIndex === 90) return 'L';
    const emp = employees.find(e => e.name === empName);
    if (emp) {
      const rawShift = getL1Shift(emp.l1Index, dayIndex);
      if (rawShift === 'L') return 'L';
    }
    return 'P';
  }

  if (dayIndex >= 44 && empName === 'Rafi') {
    return 'L';
  }
  if (dayIndex === 67 && empName === 'Rizky') {
    return 'M';
  }
  if (dayIndex === 67 && empName === 'Diki') {
    return 'S';
  }
  if (isJuly2026 && empName === 'Lukman' && dayIndex >= 44 && dayIndex <= 47) {
    return 'S';
  }
  if (isJuly2026 && empName === 'Bagus' && (dayIndex === 63 || dayIndex === 64)) {
    return 'P';
  }
  if (isJuly2026 && empName === 'Bagus' && dayIndex >= 59 && dayIndex <= 61) {
    return 'P';
  }
  if (isJuly2026 && empName === 'Diki' && (dayIndex === 62 || dayIndex === 65)) {
    return 'P';
  }

  // Overrides Agustus 2026
  if (isAugust2026) {
    if (dayIndex === 68) {
      if (empName === 'Lukman') return 'M';
      if (empName === 'Diki') return 'S';
    }
    // Bagus mulai tgl 3-13 Agustus Malam (dayIndex 70 s/d 80)
    if (empName === 'Bagus' && dayIndex >= 70 && dayIndex <= 80) {
      const emp = employees.find(e => e.name === empName);
      if (emp) {
        const raw = getL1Shift(emp.l1Index, dayIndex);
        if (raw === 'L') return 'L';
      }
      return 'M';
    }
    // Diki tgl 3-4 Agustus P2 (dayIndex 70 s/d 71)
    if (empName === 'Diki' && (dayIndex === 70 || dayIndex === 71)) {
      return 'P2';
    }
    // Diki tgl 6-8 Agustus Siang (dayIndex 73 s/d 75)
    if (empName === 'Diki' && dayIndex >= 73 && dayIndex <= 75) {
      return 'S';
    }
    // Diki tgl 9 Agustus Pagi (dayIndex 76)
    if (empName === 'Diki' && dayIndex === 76) {
      return 'P';
    }
    // Diki tgl 10-12 Agustus P2 (dayIndex 77 s/d 79)
    if (empName === 'Diki' && dayIndex >= 77 && dayIndex <= 79) {
      return 'P2';
    }
    // Bagus tgl 15 Agustus Pagi (dayIndex 82)
    if (empName === 'Bagus' && dayIndex === 82) {
      return 'P';
    }
    // Bagus tgl 21 Agustus Malam (dayIndex 88)
    if (empName === 'Bagus' && dayIndex === 88) {
      return 'M';
    }
    // Diki tgl 22 Agustus Malam (dayIndex 89)
    if (empName === 'Diki' && dayIndex === 89) {
      return 'M';
    }
    // Lukman tgl 20-26 Agustus Siang (dayIndex 87 s/d 93)
    if (empName === 'Lukman' && dayIndex >= 87 && dayIndex <= 93) {
      return 'S';
    }
    // Lukman tgl 28-29 Agustus Pagi (dayIndex 95 s/d 96)
    if (empName === 'Lukman' && (dayIndex === 95 || dayIndex === 96)) {
      return 'P';
    }
    // Bagus tgl 28-29 Agustus Malam (dayIndex 95 s/d 96)
    if (empName === 'Bagus' && (dayIndex === 95 || dayIndex === 96)) {
      return 'M';
    }
    // Diki tgl 31 Agustus Siang (dayIndex 98)
    if (empName === 'Diki' && dayIndex === 98) {
      return 'S';
    }
    if ((dayIndex === 77 || dayIndex === 78 || dayIndex === 82) && empName === 'Lukman') {
      return 'S';
    }
  }

  // Overrides September 2026
  if (isSeptember2026) {
    // Diki tgl 1-5 September Siang (dayIndex 99 s/d 103)
    if (empName === 'Diki' && dayIndex >= 99 && dayIndex <= 103) {
      return 'S';
    }
    // Bagus tgl 3-5 September Malam (dayIndex 101 s/d 103)
    if (empName === 'Bagus' && dayIndex >= 101 && dayIndex <= 103) {
      return 'M';
    }
  }

  const emp = employees.find(e => e.name === empName);
  if (!emp) return 'L';
  return getL1Shift(emp.l1Index, dayIndex);
}

function getShift(emp, dayIndex, isMapped = false) {
  if (emp.division === 'L1') {
    // Bagus tgl 6 September Malam (dayIndex 104)
    if (emp.name === 'Bagus' && dayIndex === 104) {
      return 'M';
    }

    // September copy logic
    if (dayIndex >= 104) {
      return getShift(emp, dayIndex - 35, true);
    }

    const raw = getRawL1Shift(emp.name, dayIndex, isMapped);
    if (dayIndex >= 44) {
      const activeL1 = ['Rizky', 'Lukman', 'Bagus', 'Diki'];
      const shifts = activeL1.map(name => {
        if (name === 'Bagus' && dayIndex === 104) return 'M';
        return getRawL1Shift(name, dayIndex, isMapped);
      });
      
      const hasP = shifts.includes('P');
      const hasS = shifts.includes('S');
      const hasM = shifts.includes('M');
      
      let missingShift = null;
      if (!hasM) missingShift = 'M';
      else if (!hasS) missingShift = 'S';
      else if (!hasP) missingShift = 'P';
      
      if (missingShift && raw === 'P2') {
        const firstP2Index = activeL1.findIndex(name => {
          const sVal = (name === 'Bagus' && dayIndex === 104) ? 'M' : getRawL1Shift(name, dayIndex, isMapped);
          return sVal === 'P2';
        });
        if (firstP2Index !== -1 && activeL1[firstP2Index] === emp.name) {
          return missingShift;
        }
      }
    }
    return raw;
  }
  return 'L';
}

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
console.log("Simulasi Overrides Baru (Late August):");
console.log("------------------------------------------------------------------------------------------------");
console.log("Tanggal      | Hari | Rizky   | Lukman  | Bagus   | Diki    | P   | S   | M");
console.log("------------------------------------------------------------------------------------------------");

const startIdx = getDayIndex(2026, 7, 20); // August 20
const endIdx = getDayIndex(2026, 7, 31); // August 31

for (let idx = startIdx; idx <= endIdx; idx++) {
  const current = new Date(epoch + idx * 24 * 60 * 60 * 1000);
  const m = current.getUTCMonth();
  const d = current.getUTCDate();
  
  const r = getShift(employees[0], idx);
  const l = getShift(employees[1], idx);
  const b = getShift(employees[3], idx);
  const dk = getShift(employees[4], idx);
  
  const active = [r, l, b, dk];
  const pCount = active.filter(s => s === 'P').length;
  const sCount = active.filter(s => s === 'S').length;
  const mCount = active.filter(s => s === 'M').length;
  
  const dateStr = `2026-${(m+1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  const warn = (pCount === 0 || sCount === 0 || mCount === 0) ? " !!! MISSING COVERAGE !!!" : "";
  
  console.log(`${dateStr} | ${dayNames[mod(idx, 7)]}  | ${r.padEnd(7)} | ${l.padEnd(7)} | ${b.padEnd(7)} | ${dk.padEnd(7)} | ${pCount}   | ${sCount}   | ${mCount}${warn}`);
}
