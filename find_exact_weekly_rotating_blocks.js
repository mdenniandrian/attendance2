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
  return mod(p + W - 6, 4) + 3;
}

// Variables:
// For each week W in [5, 10]:
//   A[W][p] represents employee p's shift in block 1 (before off day) in week W.
//   B[W][p] represents employee p's shift in block 2 (after off day) in week W.
// Constraints:
// For any dayIdx in [44, 70]:
//   W = Math.floor(dayIdx / 7)
//   D = mod(dayIdx, 7)
//   For each employee p:
//     D_off = getOffDay(p, W)
//     If D === D_off: off
//     Else: shift is A[W][p] (if D < D_off) or B[W][p] (if D > D_off)
//   We need the active shifts to be covered.

// Let's generate permutations of [0, 1, 2, 3] for A[W] and B[W]
const perms = [];
function permute(arr, m = []) {
  if (arr.length === 0) perms.push(m);
  else {
    for (let i = 0; i < arr.length; i++) {
      let curr = arr.slice();
      let next = curr.splice(i, 1);
      permute(curr.slice(), m.concat(next));
    }
  }
}
permute([0, 1, 2, 3]);

const A_val = [];
const B_val = [];

function checkDay(dayIdx) {
  const W = Math.floor(dayIdx / 7);
  const D = mod(dayIdx, 7);
  
  if (A_val[W] === undefined || B_val[W] === undefined) return true;
  
  const activeShifts = [];
  let p_off = -1;
  
  for (let p = 0; p < 4; p++) {
    const D_off = getOffDay(p, W);
    if (D === D_off) {
      p_off = p;
      continue;
    }
    
    if (D < D_off) {
      activeShifts.push(A_val[W][p]);
    } else {
      if (B_val[W] === undefined) return true;
      activeShifts.push(B_val[W][p]);
    }
  }
  
  if (D < 3) { // Mon-Wed
    const setW = new Set(activeShifts);
    if (setW.size !== 4) return false;
  } else { // Thu-Sun
    if (p_off === -1) return true;
    const missing = A_val[W][p_off]; // the off person is off in block 1 (before off day) on D
    // Wait, the off person's base shift on day D is missing.
    // D is D_off, which is the transition day.
    // So the missing shift is indeed the off person's shift in block 1 of week W.
    
    // Redirect P2 (1) to missing
    const redirected = activeShifts.map(s => s === 1 ? missing : s);
    const activeSet = new Set(redirected);
    if (activeSet.size !== 3 || activeSet.has(1)) return false;
  }
  return true;
}

function checkAllDays() {
  for (let d = 44; d <= 70; d++) {
    if (!checkDay(d)) return false;
  }
  return true;
}

function backtrack(w) {
  if (w > 10) {
    if (checkAllDays()) {
      return true;
    }
    return false;
  }
  
  for (const a_p of perms) {
    A_val[w] = a_p;
    for (const b_p of perms) {
      B_val[w] = b_p;
      
      // Early validation
      let ok = true;
      for (let d = 44; d < w * 7; d++) {
        if (!checkDay(d)) {
          ok = false;
          break;
        }
      }
      
      if (ok) {
        if (backtrack(w + 1)) return true;
      }
    }
  }
  A_val[w] = undefined;
  B_val[w] = undefined;
  return false;
}

console.log("Searching for valid weekly block shift sequence...");
if (backtrack(5)) {
  console.log("FOUND SEQUENCE!");
  for (let W = 5; W <= 10; W++) {
    console.log(`Week ${W}:`);
    console.log(`  Block 1 (Mon-Wed/Thu): Rizky=${baseShifts[A_val[W][0]]}, Lukman=${baseShifts[A_val[W][1]]}, Bagus=${baseShifts[A_val[W][2]]}, Diki=${baseShifts[A_val[W][3]]}`);
    console.log(`  Block 2 (Fri-Sun/Mon): Rizky=${baseShifts[B_val[W][0]]}, Lukman=${baseShifts[B_val[W][1]]}, Bagus=${baseShifts[B_val[W][2]]}, Diki=${baseShifts[B_val[W][3]]}`);
  }
} else {
  console.log("NO SEQUENCE FOUND!");
}
