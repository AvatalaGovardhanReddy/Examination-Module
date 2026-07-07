// ============================================================
// IN-EXAM MODULE - render functions
// ------------------------------------------------------------
// Activities that happen during the examination period.
// ============================================================

// ============================================================
// 4.1 EXAM-DAY ATTENDANCE
// Invigilator marks attendance -> Exam Branch verifies -> attendance is locked.
// ============================================================
const attendanceStatuses = ['Present', 'Absent', 'Malpractice', 'Withheld', 'Other'];

function getAttendanceSession() {
  const session = data.attendanceSession || (data.attendanceSession = {});
  session.exam = session.exam || 'Sem IV Regular Apr 2026';
  session.date = session.date || '10 Apr 2026';
  session.session = session.session || 'Morning';
  session.subject = session.subject || 'DS & Algorithms';
  session.room = session.room || 'Lab 101';
  session.invigilator = session.invigilator || 'Dr. Meena Iyer';
  session.status = session.status || 'Draft';
  session.records = session.records || {};
  data.students.forEach((s, idx) => {
    if (!session.records[s.id]) {
      session.records[s.id] = {
        status: idx === 6 ? 'Absent' : 'Present',
        booklet: idx === 6 ? '' : `AS-${String(idx + 101).padStart(5, '0')}`,
        supplementary: idx % 3,
        remarks: '',
        sheetSaved: false,
      };
    }
  });
  return session;
}

function attendanceCounts() {
  const session = getAttendanceSession();
  return data.students.reduce((acc, s) => {
    const status = session.records[s.id]?.status || 'Present';
    acc[status] = (acc[status] || 0) + 1;
    if (status === 'Present' || status === 'Malpractice') acc.answerSheets += 1;
    return acc;
  }, { Present: 0, Absent: 0, Malpractice: 0, Withheld: 0, Other: 0, answerSheets: 0 });
}

function attendanceBadge(status) {
  const cls = status === 'Locked' ? 'badge-success' : status === 'Verified' ? 'badge-info' : status === 'Submitted' ? 'badge-warning' : 'badge-neutral';
  return `<span class="badge ${cls}">${status}</span>`;
}

function updateAttendanceRecord(studentId, field, value) {
  const session = getAttendanceSession();
  if (session.status === 'Locked') return;
  const rec = session.records[studentId];
  rec[field] = field === 'supplementary' ? Math.max(0, Number(value) || 0) : value;
  if (field === 'status' || field === 'booklet' || field === 'supplementary') rec.sheetSaved = false;
  if (field === 'status' && (value === 'Absent' || value === 'Withheld')) {
    rec.booklet = '';
    rec.supplementary = 0;
    rec.sheetSaved = false;
  }
  if (field === 'status') showPage('attendance');
}

function changeAttendanceRoom(room) {
  const session = getAttendanceSession();
  if (session.status === 'Locked') {
    showToast('Attendance is locked and cannot be changed');
    return;
  }
  session.room = room;
  session.status = 'Draft';
  session.submittedAt = null;
  session.verifiedAt = null;
  session.lockedAt = null;
  session.submittedBy = null;
  session.verifiedBy = null;
  session.lockedBy = null;
  showPage('attendance');
}

function submitAttendance() {
  const session = getAttendanceSession();
  if (session.status === 'Locked') {
    showToast('Attendance is already locked');
    return;
  }
  const missing = data.students.filter(s => {
    const rec = session.records[s.id];
    return (rec.status === 'Present' || rec.status === 'Malpractice') && !String(rec.booklet || '').trim();
  });
  if (missing.length) {
    showActionModal('Booklet Number Required', `${missing.length} present/malpractice student(s) are missing answer sheet numbers. Please enter booklet numbers before submitting.`, { icon: 'fa-exclamation-triangle', iconColor: 'var(--danger)', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  session.status = 'Submitted';
  session.submittedAt = new Date().toLocaleString();
  session.submittedBy = loggedInUser?.label || 'Invigilator';
  session.verifiedAt = null;
  session.lockedAt = null;
  session.verifiedBy = null;
  session.lockedBy = null;
  showActionModal('Attendance Submitted', `${session.room} attendance has been submitted to the Exam Branch for verification.`, { icon: 'fa-check-circle', iconColor: '#059669', showCancel: false, confirmLabel: 'OK', onConfirm: () => showPage('attendance') });
}

function verifyAttendance() {
  const session = getAttendanceSession();
  if (session.status === 'Draft') {
    showActionModal('Submit Required', 'Invigilator must submit room-wise attendance before Exam Branch verification.', { icon: 'fa-info-circle', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  if (session.status === 'Locked') {
    showToast('Attendance is already locked');
    return;
  }
  session.status = 'Verified';
  session.verifiedAt = new Date().toLocaleString();
  session.verifiedBy = loggedInUser?.label || 'Exam Branch';
  showActionModal('Attendance Verified', 'Exam Branch has verified the submitted attendance. You can now lock it for D-Form and result processing.', { icon: 'fa-clipboard-check', iconColor: '#2563eb', showCancel: false, confirmLabel: 'OK', onConfirm: () => showPage('attendance') });
}

function lockAttendance() {
  const session = getAttendanceSession();
  if (session.status !== 'Verified') {
    showActionModal('Verification Required', 'Attendance can be locked only after Exam Branch verification.', { icon: 'fa-lock', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  session.status = 'Locked';
  session.lockedAt = new Date().toLocaleString();
  session.lockedBy = loggedInUser?.label || 'Exam Branch';
  showActionModal('Attendance Locked', 'Attendance is locked and ready for answer sheet tracking, D-Form generation, result processing and special case handling.', { icon: 'fa-lock', iconColor: '#059669', confirmLabel: 'Generate D-Form', confirmIcon: 'fa-arrow-right', onConfirm: () => goToPage('dform', 'dform.html') });
}

function renderAttendance() {
  const session = getAttendanceSession();
  const counts = attendanceCounts();
  const locked = session.status === 'Locked';
  const roomOptions = data.rooms.map(r => `<option ${r.name === session.room ? 'selected' : ''}>${r.name}</option>`).join('');
  const rows = data.students.map(s => {
    const rec = session.records[s.id];
    const disabled = locked ? 'disabled' : '';
    const sheetDisabled = locked || rec.status === 'Absent' || rec.status === 'Withheld' ? 'disabled' : '';
    const statusOptions = attendanceStatuses.map(st => `<option ${rec.status === st ? 'selected' : ''}>${st}</option>`).join('');
    return `<tr><td>${s.id}</td><td>${s.name}<div class="text-muted" style="font-size:11px">${s.program} / Sem ${s.sem}</div></td><td>${session.subject}</td><td><select class="form-control" style="width:auto;min-width:120px;padding:4px 8px" ${disabled} onchange="updateAttendanceRecord('${s.id}','status',this.value)">${statusOptions}</select></td><td><input class="form-control" style="width:130px;padding:4px 8px" placeholder="Booklet #" value="${rec.booklet || ''}" ${sheetDisabled} oninput="updateAttendanceRecord('${s.id}','booklet',this.value)"></td><td><input type="number" min="0" class="form-control" style="width:70px;padding:4px 8px" value="${rec.supplementary || 0}" ${sheetDisabled} oninput="updateAttendanceRecord('${s.id}','supplementary',this.value)"></td><td><input class="form-control" style="width:160px;padding:4px 8px" placeholder="Remarks" value="${rec.remarks || ''}" ${disabled} oninput="updateAttendanceRecord('${s.id}','remarks',this.value)"></td></tr>`;
  }).join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> Workflow: Invigilator Login -> Open Room-Wise Student List -> Mark Attendance -> Submit Attendance -> Exam Branch Verification -> Lock Attendance.</div>
      <div class="filter-bar">
        <select class="form-control" disabled><option>${session.date} - ${session.session}</option></select>
        <select class="form-control" onchange="changeAttendanceRoom(this.value)" ${locked ? 'disabled' : ''}>${roomOptions}</select>
        <span class="chip"><i class="fas fa-clipboard-check"></i> ${attendanceBadge(session.status)}</span>
        <span class="chip"><i class="fas fa-user-check" style="color:#059669"></i> ${counts.Present} Present</span>
        <span class="chip"><i class="fas fa-user-times" style="color:#dc2626"></i> ${counts.Absent} Absent</span>
        <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="submitAttendance()" ${locked ? 'disabled' : ''}><i class="fas fa-check"></i> Submit Attendance</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Room</div><div class="value" style="font-size:18px">${session.room}</div><div class="sub">${session.invigilator}</div></div>
        <div class="stat-card"><div class="label">Submitted</div><div class="value" style="font-size:16px">${session.submittedAt || 'Pending'}</div><div class="sub">${session.submittedBy || 'Invigilator action'}</div></div>
        <div class="stat-card"><div class="label">Verified</div><div class="value" style="font-size:16px">${session.verifiedAt || 'Pending'}</div><div class="sub">${session.verifiedBy || 'Exam Branch action'}</div></div>
        <div class="stat-card"><div class="label">Locked</div><div class="value" style="font-size:16px">${session.lockedAt || 'Pending'}</div><div class="sub">${session.lockedBy || 'Final lock'}</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-clipboard-list"></i> ${session.room} - Student Attendance</h3><div class="flex gap-2"><button class="btn btn-sm" onclick="verifyAttendance()" ${session.status === 'Locked' ? 'disabled' : ''}><i class="fas fa-search"></i> Verify</button><button class="btn btn-sm btn-success" onclick="lockAttendance()" ${session.status === 'Locked' ? 'disabled' : ''}><i class="fas fa-lock"></i> Lock Attendance</button></div></div>
        <div class="card-body">
          <div class="filter-bar" style="margin-bottom:12px">
            <span class="chip">Registered: ${data.students.length}</span>
            <span class="chip">Answer Sheets: ${counts.answerSheets}</span>
            <span class="chip">Malpractice: ${counts.Malpractice}</span>
            <span class="chip">Withheld: ${counts.Withheld}</span>
            <span class="chip">Other: ${counts.Other}</span>
          </div>
          <div class="table-wrap">
            <table>
              <tr><th>Student ID</th><th>Name</th><th>Subject</th><th>Attendance</th><th>Answer Sheet #</th><th>Suppl.</th><th>Remarks</th></tr>
              ${rows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 4.2 ANSWER SHEET NUMBER CAPTURE
// ============================================================
function isSheetEligible(status) {
  return status === 'Present' || status === 'Malpractice';
}

function answerSheetDuplicateMap() {
  const session = getAttendanceSession();
  const seen = {};
  data.students.forEach(s => {
    const rec = session.records[s.id];
    const booklet = String(rec.booklet || '').trim().toUpperCase();
    if (isSheetEligible(rec.status) && booklet) {
      seen[booklet] = seen[booklet] || [];
      seen[booklet].push(s.id);
    }
  });
  return seen;
}

function updateAnswerSheetRecord(studentId, field, value) {
  const session = getAttendanceSession();
  if (session.status === 'Locked') {
    showToast('Attendance is locked and answer sheet mapping cannot be changed');
    return;
  }
  const rec = session.records[studentId];
  rec[field] = field === 'supplementary' ? Math.max(0, Number(value) || 0) : value.trim();
  rec.sheetSaved = false;
}

function validateAnswerSheetMapping() {
  const session = getAttendanceSession();
  const missing = [];
  data.students.forEach(s => {
    const rec = session.records[s.id];
    if (isSheetEligible(rec.status) && !String(rec.booklet || '').trim()) missing.push(`${s.name} (${s.id})`);
  });
  if (missing.length) {
    showActionModal('Booklet Number Required', `${missing.length} present student(s) do not have an answer sheet number. Enter the main booklet number before saving.`, { icon: 'fa-exclamation-triangle', iconColor: 'var(--danger)', showCancel: false, confirmLabel: 'OK' });
    return false;
  }

  const duplicates = Object.entries(answerSheetDuplicateMap()).filter(([_, ids]) => ids.length > 1);
  if (duplicates.length) {
    const duplicateText = duplicates.map(([booklet, ids]) => `${booklet}: ${ids.join(', ')}`).join(' | ');
    showActionModal('Duplicate Booklet Number', `Duplicate answer sheet numbers found. ${duplicateText}. Please correct them before saving.`, { icon: 'fa-copy', iconColor: 'var(--danger)', showCancel: false, confirmLabel: 'OK' });
    return false;
  }
  showActionModal('Validation Passed', 'All present students have unique answer sheet numbers and supplementary counts are valid.', { icon: 'fa-check-circle', iconColor: '#059669', showCancel: false, confirmLabel: 'OK' });
  return true;
}

function saveAnswerSheetMapping() {
  if (!validateAnswerSheetMapping()) return;
  const session = getAttendanceSession();
  session.sheetMappingSavedAt = new Date().toLocaleString();
  session.sheetMappingSavedBy = loggedInUser?.label || 'Invigilator';
  data.students.forEach(s => {
    const rec = session.records[s.id];
    if (isSheetEligible(rec.status)) rec.sheetSaved = true;
  });
  showActionModal('Mapping Saved', 'Answer sheet number mapping has been saved and is available for barcode tracking, D-Form and dispatch reports.', { icon: 'fa-save', iconColor: '#059669', showCancel: false, confirmLabel: 'OK', onConfirm: () => showPage('answer-sheet') });
}

function renderAnswerSheet() {
  const session = getAttendanceSession();
  const counts = attendanceCounts();
  const duplicateMap = answerSheetDuplicateMap();
  const modeText = currentMode === 'affiliated'
    ? 'Affiliated mode: record university-issued booklet numbers and use this mapping for collection and dispatch reports.'
    : currentMode === 'hybrid'
      ? 'Hybrid mode: capture college barcode numbers and keep university booklet references ready for dispatch.'
      : 'Autonomous mode: link answer sheet numbers with barcode-based tracking for evaluation and result processing.';
  const eligibleRows = data.students.map(s => {
    const rec = session.records[s.id];
    const eligible = isSheetEligible(rec.status);
    const booklet = String(rec.booklet || '').trim();
    const duplicate = booklet && duplicateMap[booklet.toUpperCase()]?.length > 1;
    const saved = eligible && rec.sheetSaved;
    const disabled = eligible && session.status !== 'Locked' ? '' : 'disabled';
    const badge = !eligible
      ? `<span class="badge badge-neutral">${rec.status}</span>`
      : duplicate
        ? '<span class="badge badge-danger">Duplicate</span>'
        : saved
          ? '<span class="badge badge-success">Saved</span>'
          : '<span class="badge badge-warning">Pending</span>';
    return `<tr><td>${s.id} - ${s.name}<div class="text-muted" style="font-size:11px">${session.room} / ${session.subject}</div></td><td><span class="badge ${rec.status === 'Present' ? 'badge-success' : rec.status === 'Malpractice' ? 'badge-danger' : 'badge-neutral'}">${rec.status}</span></td><td><input class="form-control" style="width:150px;padding:4px 8px" placeholder="${currentMode === 'affiliated' ? 'UNI booklet #' : 'Barcode / booklet #'}" value="${rec.booklet || ''}" ${disabled} oninput="updateAnswerSheetRecord('${s.id}','booklet',this.value)"></td><td><input type="number" min="0" class="form-control" style="width:80px;padding:4px 8px" value="${rec.supplementary || 0}" ${disabled} oninput="updateAnswerSheetRecord('${s.id}','supplementary',this.value)"></td><td>${badge}</td></tr>`;
  }).join('');
  const savedCount = data.students.filter(s => {
    const rec = session.records[s.id];
    return isSheetEligible(rec.status) && rec.sheetSaved;
  }).length;
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> Student Marked Present -> Enter Answer Sheet Number -> Enter Supplementary Count -> Validate Duplicate Number -> Save Mapping.</div>
      <div class="alert alert-info"><i class="fas fa-barcode"></i> ${modeText}</div>
      <div class="filter-bar">
        <select class="form-control" disabled><option>${session.date} - ${session.session}</option></select>
        <select class="form-control" disabled><option>${session.room} - ${session.subject}</option></select>
        <span class="chip"><i class="fas fa-user-check" style="color:#059669"></i> ${counts.Present} Present</span>
        <span class="chip"><i class="fas fa-save"></i> ${savedCount}/${counts.answerSheets} Saved</span>
        <button class="btn btn-sm" style="margin-left:auto" onclick="validateAnswerSheetMapping()"><i class="fas fa-check-double"></i> Validate Duplicate Number</button>
        <button class="btn btn-primary btn-sm" onclick="saveAnswerSheetMapping()"><i class="fas fa-save"></i> Save Mapping</button>
        <button class="btn btn-sm" onclick="showActionModal('Export Answer Sheet Report','The answer sheet / booklet number mapping report has been exported.', {icon:'fa-file-export', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-file-export"></i> Export Answer Sheet Report</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Present Students</div><div class="value" style="color:var(--success)">${counts.Present}</div><div class="sub">Eligible for booklet entry</div></div>
        <div class="stat-card"><div class="label">Answer Sheets</div><div class="value" style="color:var(--primary)">${counts.answerSheets}</div><div class="sub">Present + special cases</div></div>
        <div class="stat-card"><div class="label">Saved Mapping</div><div class="value" style="font-size:18px">${session.sheetMappingSavedAt || 'Pending'}</div><div class="sub">${session.sheetMappingSavedBy || 'Awaiting save'}</div></div>
        <div class="stat-card"><div class="label">Duplicate Check</div><div class="value" style="color:${Object.values(duplicateMap).some(ids => ids.length > 1) ? 'var(--danger)' : 'var(--success)'}">${Object.values(duplicateMap).filter(ids => ids.length > 1).length}</div><div class="sub">Duplicate number(s)</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-file-alt"></i> Answer Sheet Number Mapping</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Student</th><th>Attendance</th><th>Answer Sheet / Booklet #</th><th>Suppl. Count</th><th>Mapping Status</th></tr>
              ${eligibleRows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 4.3 MALPRACTICE & SPECIAL CASE RECORDING
// ============================================================
function getSpecialCaseResultAction(type) {
  const actions = {
    'Malpractice': 'Block result until committee decision',
    'Court Case': 'Withhold result until legal clearance',
    'Withheld Result': 'Withhold result from publication',
    'Blank Booklet': 'Review before marks processing',
    'Mismatch': 'Verify student/booklet mapping',
    'Other': 'Manual Exam Branch review',
  };
  return actions[type] || actions.Other;
}

function specialCaseCounts() {
  return data.malpracticeCases.reduce((acc, c) => {
    acc.total += 1;
    if (/submitted|review/i.test(c.status || '')) acc.review += 1;
    if (/resolved|processed|cleared/i.test(c.status || '')) acc.cleared += 1;
    if (/withhold|block/i.test(c.resultAction || getSpecialCaseResultAction(c.type))) acc.hold += 1;
    return acc;
  }, { total: 0, review: 0, cleared: 0, hold: 0 });
}

function updateSpecialCaseStatus(index, status) {
  const c = data.malpracticeCases[index];
  if (!c) return;
  const statusClass = status === 'Resolved' || status === 'Cleared for Processing'
    ? 'badge-success'
    : status === 'Blocked' || status === 'Result Withheld'
      ? 'badge-danger'
      : 'badge-warning';
  c.status = status;
  c.statusClass = statusClass;
  c.reviewedBy = loggedInUser?.label || 'Exam Branch';
  c.reviewedAt = new Date().toLocaleString();
  showPage('malpractice');
  showToast('Case status updated to ' + status);
}

function openSpecialCaseDetail(index) {
  const c = data.malpracticeCases[index];
  if (!c) return;
  const body = `
    <div class="table-wrap">
      <table>
        <tr><th>Case ID</th><td>${c.id || 'Pending ID'}</td></tr>
        <tr><th>Student</th><td>${c.student}</td></tr>
        <tr><th>Subject</th><td>${c.subject}</td></tr>
        <tr><th>Case Type</th><td>${c.type}</td></tr>
        <tr><th>Remarks</th><td>${c.remarks}</td></tr>
        <tr><th>Proof</th><td>${c.proofName || 'No proof attached'}</td></tr>
        <tr><th>Submitted</th><td>${c.submittedAt || c.date || 'Not recorded'} by ${c.submittedBy || 'Invigilator'}</td></tr>
        <tr><th>Exam Branch Status</th><td>${c.status}</td></tr>
        <tr><th>Post-Exam Action</th><td>${c.resultAction || getSpecialCaseResultAction(c.type)}</td></tr>
      </table>
    </div>
  `;
  openModal('Special Case Details', body, `
    <button class="btn" onclick="closeModal()">Close</button>
    <button class="btn btn-sm" onclick="closeModal();updateSpecialCaseStatus(${index}, 'Under Review')">Under Review</button>
    <button class="btn btn-sm btn-danger" onclick="closeModal();updateSpecialCaseStatus(${index}, 'Result Withheld')">Withhold</button>
    <button class="btn btn-sm btn-success" onclick="closeModal();updateSpecialCaseStatus(${index}, 'Cleared for Processing')">Clear</button>
  `);
}

function renderMalpractice() {
  const counts = specialCaseCounts();
  const rows = data.malpracticeCases.map((c, i) => {
    const action = c.resultAction || getSpecialCaseResultAction(c.type);
    return `<tr><td>${c.id || 'SC-' + String(i + 1).padStart(3, '0')}<div class="text-muted" style="font-size:11px">${c.date}</div></td><td>${c.student}</td><td>${c.subject}</td><td><span class="badge ${c.typeClass}">${c.type}</span></td><td>${c.remarks}<div class="text-muted" style="font-size:11px"><i class="fas fa-paperclip"></i> ${c.proofName || 'No proof attached'}</div></td><td><span class="badge ${c.statusClass}">${c.status}</span><div class="text-muted" style="font-size:11px">${c.submittedToBranch ? 'Submitted to Exam Branch' : 'Draft case'}</div></td><td>${action}</td><td><button class="btn btn-sm" onclick="openSpecialCaseDetail(${i})">View</button></td></tr>`;
  }).join('');
  return `
    <div class="page-content">
      <div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> Identify Special Case -> Select Student -> Mark Case Type -> Add Remarks / Attach Proof -> Submit to Exam Branch.</div>
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> These records carry forward to post-exam processing so results can be withheld, blocked, reviewed or cleared according to exam rules.</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        <select class="form-control"><option>All Case Types</option><option>Malpractice</option><option>Court Case</option><option>Withheld Result</option><option>Blank Booklet</option><option>Mismatch</option></select>
        <button class="btn btn-primary btn-sm" onclick="openRecordCaseModal()"><i class="fas fa-plus"></i> Record New Case</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Total Cases</div><div class="value" style="color:var(--primary)">${counts.total}</div><div class="sub">Recorded in exam period</div></div>
        <div class="stat-card"><div class="label">Under Review</div><div class="value" style="color:var(--warning)">${counts.review}</div><div class="sub">Exam Branch action</div></div>
        <div class="stat-card"><div class="label">Hold / Block</div><div class="value" style="color:var(--danger)">${counts.hold}</div><div class="sub">Impacts result processing</div></div>
        <div class="stat-card"><div class="label">Cleared</div><div class="value" style="color:var(--success)">${counts.cleared}</div><div class="sub">Can process result</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-exclamation-circle"></i> Special Cases Recorded</h3><span class="text-muted">${data.malpracticeCases.length} case(s)</span></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Case</th><th>Student</th><th>Subject</th><th>Case Type</th><th>Remarks / Proof</th><th>Status</th><th>Post-Exam Action</th><th></th></tr>
              ${rows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 4.4 D-FORM / ATTENDANCE REPORT GENERATION
// ============================================================
function canGenerateDForm() {
  const session = getAttendanceSession();
  return session.status === 'Verified' || session.status === 'Locked';
}

function generateDForm() {
  const session = getAttendanceSession();
  if (!canGenerateDForm()) {
    showActionModal('Verification Required', 'Exam Branch must verify attendance before generating the D-Form / attendance summary.', { icon: 'fa-clipboard-check', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  session.dformGeneratedAt = new Date().toLocaleString();
  session.dformGeneratedBy = loggedInUser?.label || 'Exam Branch';
  showActionModal('D-Form Generated', 'D-Form / attendance summary has been generated. Lock attendance before downloading the official report.', { icon: 'fa-file-invoice', iconColor: '#059669', showCancel: false, confirmLabel: 'OK', onConfirm: () => showPage('dform') });
}

function lockAttendanceForDForm() {
  const session = getAttendanceSession();
  if (!session.dformGeneratedAt) {
    showActionModal('Generate D-Form First', 'Generate the D-Form / attendance summary before locking attendance from this page.', { icon: 'fa-file-invoice', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  lockAttendance();
}

function dFormReportRows() {
  const session = getAttendanceSession();
  return data.students.map(s => {
    const rec = session.records[s.id];
    return {
      id: s.id,
      name: s.name,
      status: rec.status,
      booklet: rec.booklet || '-',
      supplementary: rec.supplementary || 0,
      remarks: rec.remarks || '-',
    };
  });
}

function downloadDFormReport() {
  const session = getAttendanceSession();
  if (!session.dformGeneratedAt) {
    showActionModal('Generate Required', 'Generate the D-Form / attendance summary before downloading the report.', { icon: 'fa-file-invoice', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  if (session.status !== 'Locked') {
    showActionModal('Lock Required', 'Lock attendance before downloading the official D-Form report.', { icon: 'fa-lock', showCancel: false, confirmLabel: 'OK' });
    return;
  }
  const counts = attendanceCounts();
  const header = [
    ['Exam', session.exam],
    ['Date', session.date],
    ['Session', session.session],
    ['Room', session.room],
    ['Subject', session.subject],
    ['Generated At', session.dformGeneratedAt],
    ['Locked At', session.lockedAt],
    ['Registered', data.students.length],
    ['Present', counts.Present],
    ['Absent', counts.Absent],
    ['Malpractice', counts.Malpractice],
    ['Withheld', counts.Withheld],
    ['Answer Sheets', counts.answerSheets],
  ].map(r => r.join(',')).join('\r\n');
  const rows = dFormReportRows().map(r => [r.id, r.name, r.status, r.booklet, r.supplementary, r.remarks].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  downloadBlob('d-form-attendance-summary.csv', `${header}\r\n\r\nStudent ID,Name,Attendance,Answer Sheet,Supplementary,Remarks\r\n${rows}`, 'text/csv;charset=utf-8');
  showSuccessToast('Downloaded d-form-attendance-summary.csv');
}

function renderDForm() {
  const session = getAttendanceSession();
  const counts = attendanceCounts();
  const rows = dFormReportRows().map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td><span class="badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Absent' ? 'badge-danger' : r.status === 'Malpractice' ? 'badge-warning' : 'badge-neutral'}">${r.status}</span></td><td>${r.booklet}</td><td>${r.supplementary}</td><td>${r.remarks}</td></tr>`).join('');
  const modeText = currentMode === 'affiliated'
    ? 'Affiliated mode: use this D-Form / attendance summary for university submission and dispatch documentation.'
    : currentMode === 'hybrid'
      ? 'Hybrid mode: retain the official college record and prepare the attendance summary for university-facing submissions where required.'
      : 'Autonomous mode: this D-Form becomes part of the official examination record.';
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> Attendance Completed -> Exam Branch Verifies -> Generate D-Form / Attendance Summary -> Lock Attendance -> Download Report.</div>
      <div class="alert alert-info"><i class="fas fa-university"></i> ${modeText}</div>
      <div class="filter-bar">
        <select class="form-control" disabled><option>${session.exam}</option></select>
        <select class="form-control" disabled><option>${session.date} - ${session.subject}</option></select>
        <span class="chip"><i class="fas fa-clipboard-check"></i> ${attendanceBadge(session.status)}</span>
        <button class="btn btn-primary btn-sm" onclick="generateDForm()" ${canGenerateDForm() ? '' : 'disabled'}><i class="fas fa-file-alt"></i> Generate D-Form</button>
        <button class="btn btn-sm" onclick="lockAttendanceForDForm()" ${session.status === 'Locked' ? 'disabled' : ''}><i class="fas fa-lock"></i> Lock Attendance</button>
        <button class="btn btn-sm" style="margin-left:auto" onclick="downloadDFormReport()"><i class="fas fa-download"></i> Download Report</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Attendance Verified</div><div class="value" style="font-size:16px">${session.verifiedAt || 'Pending'}</div><div class="sub">${session.verifiedBy || 'Exam Branch verification'}</div></div>
        <div class="stat-card"><div class="label">D-Form Generated</div><div class="value" style="font-size:16px">${session.dformGeneratedAt || 'Pending'}</div><div class="sub">${session.dformGeneratedBy || 'Generate after verification'}</div></div>
        <div class="stat-card"><div class="label">Attendance Locked</div><div class="value" style="font-size:16px">${session.lockedAt || 'Pending'}</div><div class="sub">${session.lockedBy || 'Lock before download'}</div></div>
        <div class="stat-card"><div class="label">Report Use</div><div class="value" style="font-size:16px">${currentMode === 'affiliated' ? 'University' : 'Official Record'}</div><div class="sub">Submission / archive</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-file-invoice"></i> D-Form / Attendance Summary</h3></div>
        <div class="card-body">
          <div class="stats-grid" style="margin-bottom:0">
            <div class="stat-card"><div class="label">Registered</div><div class="value" style="color:var(--primary)">${data.students.length}</div></div>
            <div class="stat-card"><div class="label">Present</div><div class="value" style="color:var(--success)">${counts.Present}</div></div>
            <div class="stat-card"><div class="label">Absent</div><div class="value" style="color:var(--danger)">${counts.Absent}</div></div>
            <div class="stat-card"><div class="label">Malpractice</div><div class="value" style="color:var(--warning)">${counts.Malpractice}</div></div>
          </div>
          <div class="table-wrap mt-2">
            <table>
              <tr><th>Student ID</th><th>Name</th><th>Attendance</th><th>Answer Sheet #</th><th>Suppl.</th><th>Remarks</th></tr>
              ${rows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 4.5 ANSWER SHEET COLLECTION & DISPATCH
// ============================================================
function getCollectionRows() {
  return [
    { room: 'Lab 101', subject: 'DS & Algorithms', invigilator: 'Dr. Meena Iyer', present: 30, collected: 30 },
    { room: 'Lab 102', subject: 'DS & Algorithms', invigilator: 'Prof. Amit Kumar', present: 28, collected: 28 },
    { room: 'Lecture Hall A', subject: 'DS & Algorithms', invigilator: 'Dr. Sunita Rao', present: 60, collected: 59 },
    { room: 'Lecture Hall B', subject: 'DS & Algorithms', invigilator: 'Prof. Rajesh Pillai', present: 60, collected: 60 },
    { room: 'Seminar Hall', subject: 'DS & Algorithms', invigilator: 'Exam Branch Desk', present: 70, collected: 70 },
  ];
}

function verifyAnswerSheetCollection() {
  const rows = getCollectionRows();
  const present = rows.reduce((sum, r) => sum + r.present, 0);
  const collected = rows.reduce((sum, r) => sum + r.collected, 0);
  const mismatches = rows.filter(r => r.present !== r.collected);
  if (mismatches.length > 0) {
    showActionModal('Collection Mismatch', `${collected} answer sheets collected against ${present} present students. Resolve ${mismatches.length} room mismatch before final dispatch or bundle creation.`, {
      icon: 'fa-exclamation-triangle', iconColor: 'var(--warning)', showCancel: false, confirmLabel: 'OK'
    });
    return;
  }
  if (currentMode === 'affiliated') {
    showActionModal('Collection Verified', 'Answer sheets match the attendance record. Generate the dispatch report for submission to the university or examination authority.', {
      icon: 'fa-truck', iconColor: 'var(--success)', confirmLabel: 'Generate Dispatch Report', confirmIcon: 'fa-file-export',
      onConfirm: generateDispatchReport
    });
    return;
  }
  showActionModal('Collection Verified', 'Answer sheets match the attendance record. Move the verified sheets to Bundle Creation for evaluation.', {
    icon: 'fa-check-circle', iconColor: 'var(--success)', confirmLabel: 'Move to Bundle Creation', confirmIcon: 'fa-arrow-right',
    onConfirm: () => showPage('bundle')
  });
}

function generateDispatchReport() {
  showActionModal('Generate Dispatch Report', 'The answer sheet dispatch report is ready for university / examination authority submission.', {
    icon: 'fa-truck', confirmLabel: 'Download', confirmIcon: 'fa-download',
    onConfirm: () => {
      const rows = getCollectionRows().map(r => [r.room, r.invigilator, r.subject, r.present, r.collected, r.present === r.collected ? 'Matched' : 'Mismatch'].join(',')).join('\r\n');
      downloadBlob('answer-sheet-dispatch-report.csv', 'Room,Invigilator,Subject,Present,Collected,Attendance Check\r\n' + rows, 'text/csv;charset=utf-8');
      showSuccessToast('Downloaded answer-sheet-dispatch-report.csv');
    }
  });
}

function renderCollection() {
  const isAffiliated = currentMode === 'affiliated';
  const rows = getCollectionRows();
  const presentTotal = rows.reduce((sum, r) => sum + r.present, 0);
  const collectedTotal = rows.reduce((sum, r) => sum + r.collected, 0);
  const mismatchCount = rows.filter(r => r.present !== r.collected).length;
  const modeAlert = isAffiliated
    ? 'Collect answer sheets from invigilators, verify counts against attendance, then generate the dispatch report for submission to the university or examination authority.'
    : 'Collect answer sheets from invigilators, verify counts against attendance, then move verified answer sheets to Bundle Creation for evaluation.';
  const nextStep = isAffiliated ? 'Generate Dispatch Report' : 'Move to Bundle Creation';
  const rowHtml = rows.map(r => {
    const matched = r.present === r.collected;
    return `<tr><td>${r.room}<div class="text-muted" style="font-size:11px">${r.invigilator}</div></td><td>${r.subject}</td><td>${r.present}</td><td>${r.collected}</td><td><span class="badge ${matched ? 'badge-success' : 'badge-danger'}">${matched ? 'Matched' : 'Mismatch'}</span></td><td><span class="badge ${matched ? 'badge-success' : 'badge-warning'}">${matched ? 'Verified' : 'Pending Resolution'}</span></td></tr>`;
  }).join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        <button class="btn btn-sm" onclick="showToast('Answer sheets collected from invigilators')"><i class="fas fa-box-open"></i> Collect Answer Sheets</button>
        <button class="btn btn-primary btn-sm" onclick="verifyAnswerSheetCollection()"><i class="fas fa-check"></i> Verify with Attendance</button>
        ${isAffiliated ? `<button class="btn btn-sm" style="margin-left:auto" onclick="generateDispatchReport()"><i class="fas fa-truck"></i> Generate Dispatch Report</button>` : `<button class="btn btn-sm" style="margin-left:auto" onclick="showPage('bundle')"><i class="fas fa-layer-group"></i> Bundle Creation</button>`}
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Present Students</div><div class="value">${presentTotal}</div><div class="sub">Attendance record</div></div>
        <div class="stat-card"><div class="label">Sheets Collected</div><div class="value" style="color:${mismatchCount ? 'var(--warning)' : 'var(--success)'}">${collectedTotal}</div><div class="sub">From invigilators</div></div>
        <div class="stat-card"><div class="label">Verification</div><div class="value" style="font-size:18px">${mismatchCount ? mismatchCount + ' Mismatch' : 'Matched'}</div><div class="sub">Present vs collected</div></div>
        <div class="stat-card"><div class="label">Next Step</div><div class="value" style="font-size:16px">${nextStep}</div><div class="sub">${isAffiliated ? 'University submission' : 'College evaluation'}</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-boxes"></i> Answer Sheet Collection Status</h3></div>
        <div class="card-body">
          <div class="alert ${mismatchCount ? 'alert-warning' : 'alert-success'}"><i class="fas ${mismatchCount ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${mismatchCount ? 'Resolve mismatched rooms before final dispatch or bundle creation.' : 'Collected answer sheets match the attendance record.'}</div>
          <div class="table-wrap">
            <table>
              <tr><th>Room / Invigilator</th><th>Subject</th><th>Present</th><th>Collected</th><th>Attendance Check</th><th>Status</th></tr>
              ${rowHtml}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
