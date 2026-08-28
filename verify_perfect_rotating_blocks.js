function mod(n, m) {
  return ((n % m) + m) % m;
}

const epoch = Date.UTC(2026, 4, 25);
function getDayIndex(year, month, day) {
  const current = Date.UTC(year, month, day);
  return Math.floor((current - epoch) / (1000 * 60 * 60 * 24));
}

const l1Emps = ['Rizky', 'Lukman', 'Bagus', 'Diki'];
const baseShifts = ['P (L1)', 'P2 (L1)', 'S (L1)', 'M (L1)'];

function getOffDay(p, W) {
  return mod(p + W - 6, 4) + 3; // Kamis - Minggu yang dirolling maju
}

function getShift(empName, dayIndex) {
  const D = mod(dayIndex, 7);
  const W = Math.floor(dayIndex / 7);
  const p = l1Emps.indexOf(empName);

  if (p === -1) return 'L';

  const myOffDay = getOffDay(p, W);

  if (D === myOffDay) {
    return 'L';
  }

  // Tentukan shift untuk block masing-masing karyawan
  // Rizky: Mon-Wed (1 + W), Fri-Sun (0 + W)
  // Lukman: Mon-Thu (0 + W), Sat-Sun (2 + W)
  // Bagus: Mon-Fri (2 + W), Sun (3 + W)
  // Diki: Mon-Sat (3 + W)
  let myBaseShift;
  if (p === 0) { // Rizky
    myBaseShift = baseShifts[mod((D < myOffDay ? 1 : 0) + W, 4)];
  } else if (p === 1) { // Lukman
    myBaseShift = baseShifts[mod((D < myOffDay ? 0 : 2) + W, 4)];
  } else if (p === 2) { // Bagus
    myBaseShift = baseShifts[mod((D < myOffDay ? 2 : 3) + W, 4)];
  } else { // Diki
    myBaseShift = baseShifts[mod(3 + W, 4)];
  }

  // No redirection needed! We just return the base shift directly!
  return myBaseShift;
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
  
  let r, l, b, dk;
  if (dayIdx < 44) {
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
