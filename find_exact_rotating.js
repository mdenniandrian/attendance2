function mod(n, m) {
  return ((n % m) + m) % m;
}

const shiftNames = ['P (L1)', 'P2 (L1)', 'S (L1)', 'M (L1)'];

// We want to find for each week W (from 5 to 10) a permutation S[W] of [0, 1, 2, 3] representing base shifts for Rizky, Lukman, Bagus, Diki
// The off day of employee p in week W is:
function getOffDay(p, W) {
  return mod(p + W - 6, 4) + 3; // range 3 to 6 (Kamis - Minggu)
}

// The working block for employee p starts on day mod(getOffDay(p, W-1) + 1, 7)
// and ends on day mod(getOffDay(p, W) - 1, 7).
// During this block, the employee works shift S_p(W).
// Let's determine the shift of employee p on dayIdx:
// The calendar day belongs to week W = Math.floor(dayIdx / 7).
// The day of week is D = mod(dayIdx, 7).
// For employee p, is dayIdx their off day?
// In week W, employee p is off on day D_off = getOffDay(p, W).
// If D === D_off, then they are Off (L).
// Otherwise, they are in the working block for week W_block:
// If D <= D_off, they are in block W_block = W.
// If D > D_off, they are in block W_block = W + 1.
// Let's verify:
// e.g. Rizky (p=0) in week 6 is off on Thursday (D=3).
// If D = 3: Off.
// If D = 0, 1, 2 (Mon, Tue, Wed): D < D_off, so they are in block W_block = 6. (Works S[6][0])
// If D = 4, 5, 6 (Fri, Sat, Sun): D > D_off, so they are in block W_block = 7. (Works S[7][0])
// This is exactly correct! Their shift is constant from Friday of week 6 to Wednesday of week 7, and changes on Friday of week 7 (after their off day on Thursday of week 7).
// Let's double check Lukman (p=1) in week 6 is off on Friday (D=4).
// If D = 4: Off.
// If D <= 3 (Mon, Tue, Wed, Thu): works S[6][1].
// If D >= 5 (Sat, Sun): works S[7][1].
// This is exactly correct!

function verifySchedule(S) {
  // S[W][p] is the base shift index of employee p in week W.
  for (let dayIdx = 44; dayIdx <= 70; dayIdx++) {
    const W = Math.floor(dayIdx / 7);
    const D = mod(dayIdx, 7);
    const activeShifts = [];
    let p_off = -1;

    for (let p = 0; p < 4; p++) {
      const D_off = getOffDay(p, W);
      if (D === D_off) {
        p_off = p;
        continue;
      }
      
      const W_block = D < D_off ? W : W + 1;
      activeShifts.push(S[W_block][p]);
    }

    if (D < 3) {
      // Mon - Wed: all 4 working
      const setW = new Set(activeShifts);
      if (setW.size !== 4) return false;
    } else {
      // Thu - Sun: 3 working. One is off (p_off).
      // The off employee's base shift in week W is S[W][p_off].
      // Wait, is the missing shift the off employee's shift in their current block?
      // Yes, since they are off today, their shift S[W][p_off] is missing.
      const missing = S[W][p_off];
      // The working employees are assigned shifts.
      // If one of the working employees is P2 (1), they redirect to the missing shift.
      const redirected = activeShifts.map(s => s === 1 ? missing : s);
      const activeSet = new Set(redirected);
      if (activeSet.size !== 3 || activeSet.has(1)) return false;
    }
  }
  return true;
}

const perms = [];
function permute(arr, m = []) {
  if (arr.length === 0) {
    perms.push(m);
  } else {
    for (let i = 0; i < arr.length; i++) {
      let curr = arr.slice();
      let next = curr.splice(i, 1);
      permute(curr.slice(), m.concat(next));
    }
  }
}
permute([0, 1, 2, 3]);

const S = [];
function backtrack(w) {
  if (w > 11) {
    if (verifySchedule(S)) {
      console.log("Found valid rotating weekly shift sequence:");
      for (let i = 5; i <= 11; i++) {
        console.log(`W=${i}: [${S[i].map(s => shiftNames[s]).join(', ')}]`);
      }
      return true;
    }
    return false;
  }

  for (const p of perms) {
    S[w] = p;
    
    // Early validation
    if (w >= 7) {
      let valid = true;
      for (let dayIdx = 44; dayIdx < (w - 1) * 7; dayIdx++) {
        const W = Math.floor(dayIdx / 7);
        const D = mod(dayIdx, 7);
        const activeShifts = [];
        let p_off = -1;

        for (let p = 0; p < 4; p++) {
          const D_off = getOffDay(p, W);
          if (D === D_off) {
            p_off = p;
            continue;
          }
          const W_block = D < D_off ? W : W + 1;
          activeShifts.push(S[W_block][p]);
        }

        if (D < 3) {
          const setW = new Set(activeShifts);
          if (setW.size !== 4) { valid = false; break; }
        } else {
          const missing = S[W][p_off];
          const redirected = activeShifts.map(s => s === 1 ? missing : s);
          const activeSet = new Set(redirected);
          if (activeSet.size !== 3 || activeSet.has(1)) { valid = false; break; }
        }
      }
      if (!valid) continue;
    }

    if (backtrack(w + 1)) return true;
  }
  return false;
}

backtrack(5);
