// ===== NAME CENSORING =====
function censorName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const censorFirst = name =>
    name.split('').map((c, i) => i % 2 === 1 ? '*' : c).join('');
  const first = censorFirst(parts[0]);
  const last = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
  return last ? `${first} ${last}` : first;
}

// ===== DATA =====
let _students = null;

async function loadStudents() {
  if (_students) return _students;
  const res = await fetch('data/students.json');
  _students = await res.json();
  return _students;
}

// ===== TICKER =====
function buildTicker(students) {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;

  // Pick a representative sample (50 students)
  const sample = [...students].sort((a,b) => b.attendance_days - a.attendance_days).slice(0, 50);

  // Duplicate for seamless loop
  const items = [...sample, ...sample];
  ticker.innerHTML = items.map(s => {
    const v = s.current_value;
    const valStr = '₱' + v.toLocaleString();
    const cls = v >= 0 ? 'up' : '';
    return `<span class="ticker-item">
      <span class="t-id">${s.id}</span>
      <span class="t-alias">${s.alias}</span>
      <span class="t-val ${cls}">${valStr}</span>
    </span>`;
  }).join('');
}

// ===== STUDENT CARD =====
function buildStudentCard(s) {
  const progress = Math.min(100, Math.max(0, ((s.current_value - (-66000)) / 66000) * 100));
  const valClass = s.current_value >= 0 ? 'green' : 'red';
  const valStr = '₱' + s.current_value.toLocaleString();

  const a = document.createElement('a');
  a.className = 'student-card';
  a.href = `student.html?id=${encodeURIComponent(s.id)}`;
  a.innerHTML = `
    <div class="student-card-top">
      <span class="student-id">${s.id}</span>
      <span class="student-grade">${s.grade}</span>
    </div>
    <div class="student-name">${s.alias}</div>
    <div class="student-hub">${s.hub} Hub · ${s.program}</div>
    <div class="student-value ${valClass}">${valStr}</div>
    <div class="student-progress-bar">
      <div class="student-progress-fill" style="width:${progress}%"></div>
    </div>
    <div class="student-stats">
      <span>📅 ${s.attendance_days}d</span>
      <span>📝 ${s.worksheets_done} sheets</span>
      <span>${s.milestone_hit ? '🚀 Milestone' : '✨ ' + s.hope_sessions + ' hope'}</span>
    </div>
  `;
  return a;
}
