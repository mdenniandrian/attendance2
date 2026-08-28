function mod(n, m) {
  return ((n % m) + m) % m;
}

const epoch = Date.UTC(2026, 4, 25);
function getDayIndex(year, month, day) {
  const current = Date.UTC(year, month, day);
  return Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
}

const l1Emps = ['Rizky', 'Lukman', 'Bagus', 'Diki'];
const D_starts = [4, 5, 6, 0];
const D_offs = [3, 4, 5, 6];
const baseShifts = ['P (L1)', 'P2 (L1)', 'S (L1)', 'M (L1)'];
const A = [0, 1, 2, 2];

function getShift(empName, dayIndex) {
  const D = mod(dayIndex, 7);
  const p = l1Emps.indexOf(empName);

  if (p === -1) return 'L';

  if (D === D_offs[p]) {
    return 'L';
  }

  const B = Math.floor((dayIndex - D_starts[p]) / 7);
  const myBaseShift = baseShifts[mod(B + A[p], 4)];

  if (D < 3) { // Senin - Rabu: Full Team
    return myBaseShift;
  } else { // Kamis - Minggu: Libur bergantian
    // Who is off today?
    const p_off = mod(Math.floor(dayIndex / 7) + (D - 3), 4);
    const offBaseShift = baseShifts[mod(Math.floor((dayIndex - D_starts[p_off]) / 7) + A[p_off], 4)];

    if (myBaseShift === 'P2 (L1)') {
      // Redirect P2 person to cover the missing shift of the off employee
      return offBaseShift;
    }

    return myBaseShift;
  }
}

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
console.log("Simulasi Transisi L1 (1 - 31 Juli 2026):");
console.log("------------------------------------------------------------------------------------------------");
console.log("Tanggal      | Hari | Rizky   | Lukman  | Bagus   | Diki    | W");
console.log("------------------------------------------------------------------------------------------------");
for (let d = 1; d <= 31; d++) {
  const dayIdx = getDayIndex(2026, 6, d);
  const D = mod(dayIdx, 7);
  const W = Math.floor(dayIdx / 7);
  
  // Transition check: before July 8 use normal schedule, from July 8 onwards use new schedule
  let r, l, b, dk;
  if (dayIdx < 44) {
    // Just mock old shifts for display
    r = "Old"; l = "Old"; b = "Old"; dk = "Old";
  } else {
    r = getShift('Rizky', dayIdx);
    l = getShift('Lukman', dayIdx);
    b = getShift('Bagus', dayIdx);
    dk = getShift('Diki', dayIdx);
  }
  
  const dateStr = `2026-07-${d.toString().padStart(2, '0')}`;
  console.log(`${dateStr} | ${dayNames[D]}  | ${r.padEnd(7)} | ${l.padEnd(7)} | ${b.padEnd(7)} | ${dk.padEnd(7)} | W=${W}`);
}
