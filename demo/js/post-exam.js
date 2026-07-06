// ============================================================
// BUNDLE
// ============================================================
// Tracks which subject's bundles are currently shown — set by the subject
// dropdown ("Select Exam and Subject" step), read by openCreateBundleModal.
let bundleSelectedSubjectCode = data.subjects[0].code;

function changeBundleSubject(code) {
  bundleSelectedSubjectCode = code;
  showPage('bundle');
}

function renderBundle() {
  if (currentMode === 'affiliated') {
    return renderAffiliatedNotApplicable('fa-layer-group', 'Bundle Creation Not Required', 'Under Affiliated mode, answer sheets are dispatched directly to the university for evaluation — no college-side bundling is needed.');
  }
  const modeAlert = currentMode === 'hybrid'
    ? 'Hybrid mode: Create bundles for college-evaluated internal/practical answer sheets. External subjects go to the university.'
    : 'Create subject-wise answer sheet bundles for evaluation. (Autonomous mode)';
  const subject = data.subjects.find(s => s.code === bundleSelectedSubjectCode) || data.subjects[0];
  const subjectBundles = data.bundles.filter(b => b.subjectCode === subject.code);
  const bundledSheets = subjectBundles.reduce((sum, b) => sum + (b.sheets || 0), 0);
  const remainingSheets = Math.max(0, subject.verifiedSheets - bundledSheets);
  const rows = subjectBundles.map(b => {
    const action = b.status === 'Unassigned'
      ? `<button class="btn btn-sm btn-primary" onclick="openAssignEvaluatorModal('${b.id}')">Assign</button>`
      : `<button class="btn btn-sm" onclick="showActionModal('Bundle ${b.id}','${b.range} sheets — evaluator: ${b.evaluator}. Status: ${b.status}${b.scrutiny ? '. Scrutiny: ' + b.scrutiny : ''}.', {icon:'fa-layer-group', iconColor:'${b.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}'})">View</button>`;
    return `<tr><td>${b.id}</td><td>${b.subject}</td><td>${b.range}</td><td>${b.evaluator}</td><td><span class="badge ${b.statusClass}">${b.status}</span></td><td>${action}</td></tr>`;
  }).join('');
  const subjectOptions = data.subjects.map(s => `<option value="${s.code}" ${s.code === subject.code ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control" onchange="changeBundleSubject(this.value)">${subjectOptions}</select>
        <span class="chip"><i class="fas fa-check-circle" style="color:#059669"></i> ${subject.verifiedSheets} Verified Sheets</span>
        <span class="chip"><i class="fas fa-layer-group"></i> ${bundledSheets} Bundled</span>
        <span class="chip"><i class="fas fa-hourglass-half"></i> ${remainingSheets} Remaining</span>
        <button class="btn btn-primary btn-sm" onclick="openCreateBundleModal('${subject.code}')" ${remainingSheets === 0 ? 'disabled title="All verified sheets for this subject are already bundled"' : ''}><i class="fas fa-plus"></i> Create Bundle</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-layer-group"></i> Answer Sheet Bundles — ${subject.name}</h3><span class="text-muted">${subjectBundles.length} bundle(s) · ${bundledSheets} sheets</span></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Bundle #</th><th>Subject</th><th>Answer Sheets</th><th>Evaluator</th><th>Status</th><th></th></tr>
              ${rows || '<tr><td colspan="6" class="text-center text-muted" style="padding:20px">No bundles created yet for this subject.</td></tr>'}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// EVALUATOR
// ============================================================
let evaluatorSelectedSubjectCode = 'all';

function changeEvaluatorSubject(code) {
  evaluatorSelectedSubjectCode = code;
  showPage('evaluator');
}

function renderEvaluator() {
  if (currentMode === 'affiliated') {
    return renderAffiliatedNotApplicable('fa-chalkboard-teacher', 'Evaluator Assignment Not Required', 'External evaluation is carried out by the university under Affiliated mode.');
  }
  const modeAlert = currentMode === 'hybrid'
    ? 'Hybrid mode: Assign college evaluators for internal/practical bundles only.'
    : 'Assign answer sheet bundles to evaluators. Track assignment status.';
  const bundlesInScope = evaluatorSelectedSubjectCode === 'all'
    ? data.bundles
    : data.bundles.filter(b => b.subjectCode === evaluatorSelectedSubjectCode);
  const unassignedCount = bundlesInScope.filter(b => b.status === 'Unassigned').length;
  const assignedBundles = bundlesInScope.filter(b => b.evaluator !== '—');
  const rows = assignedBundles.map(b => {
    const barClass = b.status === 'Completed' ? 'progress-bar success' : 'progress-bar';
    const action = b.status === 'Completed'
      ? `<button class="btn btn-sm" onclick="showActionModal('Bundle ${b.id}','All ${b.sheets} answer sheets evaluated by ${b.evaluator}. Marks submitted for scrutiny${b.scrutiny ? ' — ' + b.scrutiny : ''}.', {icon:'fa-check-circle', iconColor:'var(--success)'})">View</button>`
      : `<button class="btn btn-sm" onclick="showActionModal('Bundle ${b.id} Progress','${b.evaluator} has evaluated ${Math.round(b.sheets * b.progress / 100)} of ${b.sheets} answer sheets so far (${b.progress}% complete).', {icon:'fa-chart-line'})">Track</button>`;
    return `<tr><td>${b.evaluator}</td><td>${b.id}</td><td>${b.subject}</td><td>${b.sheets}</td><td><span class="badge ${b.statusClass}">${b.status}</span></td><td><div class="progress" style="width:120px"><div class="${barClass}" style="width:${b.progress}%"></div></div></td><td>${action}</td></tr>`;
  }).join('');
  const subjectOptions = ['<option value="all">All Subjects</option>']
    .concat(data.subjects.map(s => `<option value="${s.code}" ${s.code === evaluatorSelectedSubjectCode ? 'selected' : ''}>${s.name} (${s.code})</option>`))
    .join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}${unassignedCount ? ` ${unassignedCount} bundle(s) still unassigned.` : ''}</div>
      <div class="filter-bar">
        <select class="form-control" onchange="changeEvaluatorSubject(this.value)">${subjectOptions}</select>
        <button class="btn btn-primary btn-sm" onclick="openAssignEvaluatorModal()" ${unassignedCount ? '' : 'disabled title="No unassigned bundles"'}><i class="fas fa-user-plus"></i> Assign Evaluator</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-chalkboard-teacher"></i> Evaluator Assignment</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Evaluator</th><th>Bundle</th><th>Subject</th><th>Sheets</th><th>Status</th><th>Progress</th><th></th></tr>
              ${rows || '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">No bundles assigned yet.</td></tr>'}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// MARKS ENTRY
// ============================================================
function renderMarksEntry() {
  if (currentMode === 'affiliated') {
    return renderAffiliatedNotApplicable('fa-pencil-alt', 'Marks Entry Not Required', 'External marks are received from the university via result import under Affiliated mode.');
  }
  const modeAlert = currentMode === 'hybrid'
    ? 'Hybrid mode: Evaluator enters marks for internal/practical bundles only.'
    : 'Evaluator: Enter marks for assigned bundles. Validate before submission.';
  const bundle = data.bundles.find(b => b.status === 'Assigned');
  if (!bundle) {
    return `
      <div class="page-content">
        <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
        <div class="card"><div class="card-body">
          <div class="text-center empty-state"><i class="fas fa-check-circle" style="color:var(--success)"></i><p>No bundle is currently assigned and awaiting marks entry. All assigned bundles have been submitted.</p></div>
        </div></div>
      </div>
    `;
  }
  const studentRows = Array.from({ length: 5 }, (_, idx) => idx + 1)
    .map(i => `<tr><td>${i}</td><td>S0${60 + i} - Student ${i}</td><td>AS-00${100 + i}</td><td><input class="form-control mark-input" style="width:80px;padding:4px 8px" value="${60 + i * 5}"></td><td><input class="form-control" style="padding:4px 8px" placeholder="Optional"></td></tr>`)
    .join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>${bundle.id} — ${bundle.subject}</option></select>
        <span class="chip"><i class="fas fa-check"></i> Max Marks: 100</span>
        <span class="chip"><i class="fas fa-hourglass-half"></i> ${bundle.progress}% Complete</span>
        <button class="btn btn-success btn-sm" style="margin-left:auto" onclick="submitFinalMarks('${bundle.id}')"><i class="fas fa-check"></i> Submit Final Marks</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-pencil-alt"></i> Marks Entry — Bundle ${bundle.id}</h3><div class="flex gap-2"><button class="btn btn-sm" onclick="showActionModal('Draft Saved','Your marks entry progress for Bundle ${bundle.id} has been saved as a draft.', {icon:'fa-save', iconColor:'var(--success)', showCancel:false, confirmLabel:'OK'})"><i class="fas fa-save"></i> Save Draft</button></div></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>#</th><th>Student</th><th>Answer Sheet #</th><th>Marks (Max 100)</th><th>Remarks</th></tr>
              ${studentRows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function submitFinalMarks(bundleId) {
  const inputs = document.querySelectorAll('.mark-input');
  for (const input of inputs) {
    const val = Number(input.value);
    if (input.value.trim() === '' || isNaN(val) || val < 0 || val > 100) {
      input.style.borderColor = 'var(--danger)';
      input.focus();
      showToast('Marks must be between 0 and 100 for every student');
      return;
    }
    input.style.borderColor = '';
  }
  const bundle = data.bundles.find(b => b.id === bundleId);
  if (!bundle) return;
  showActionModal('Submit Final Marks', `Submit final marks for Bundle ${bundleId}? Once submitted, this bundle moves to scrutiny and cannot be edited by the evaluator.`, {
    icon: 'fa-check-circle', confirmLabel: 'Submit', confirmIcon: 'fa-check',
    onConfirm: function () {
      bundle.status = 'Completed';
      bundle.statusClass = 'badge-success';
      bundle.progress = 100;
      bundle.submitted = 'Today';
      bundle.scrutiny = 'Pending Review';
      bundle.scrutinyClass = 'badge-warning';
      bundle.errors = 0;
      showPage('scrutiny');
      showToast('Bundle ' + bundleId + ' submitted for scrutiny');
    }
  });
}

// ============================================================
// SCRUTINY
// ============================================================
function renderScrutiny() {
  if (currentMode === 'affiliated') {
    return renderAffiliatedNotApplicable('fa-search', 'Scrutiny Not Required', 'University-evaluated marks are verified during result import mapping, not through college scrutiny.');
  }
  const modeAlert = currentMode === 'hybrid'
    ? 'Hybrid mode: Verify marks submitted by evaluators for internal/practical bundles.'
    : 'Verify marks submitted by evaluators. Return for correction if needed.';
  const submittedBundles = data.bundles.filter(b => b.status === 'Completed');
  const rows = submittedBundles.map(b => {
    const action = b.scrutiny === 'Approved'
      ? `<button class="btn btn-sm" onclick="showActionModal('Bundle ${b.id}','${b.sheets} sheets, ${b.errors} errors found. Approved on ${b.submitted} and locked for result processing.', {icon:'fa-check-circle', iconColor:'var(--success)'})">View</button>`
      : `<button class="btn btn-sm btn-primary" onclick="openScrutinyReviewModal('${b.id}')">Review</button>`;
    return `<tr><td>${b.id}</td><td>${b.evaluator}</td><td>${b.sheets}</td><td>${b.submitted}</td><td>${b.errors}</td><td><span class="badge ${b.scrutinyClass}">${b.scrutiny}</span></td><td>${action}</td></tr>`;
  }).join('');
  const pendingCount = submittedBundles.filter(b => b.scrutiny === 'Pending Review').length;
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>DS & Algorithms (CS401)</option></select>
        <button class="btn btn-sm" style="margin-left:auto" onclick="scrutinyApproveAll()" ${pendingCount ? '' : 'disabled title="Nothing pending review"'}><i class="fas fa-check"></i> Approve All</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-search"></i> Scrutiny Dashboard</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Bundle</th><th>Evaluator</th><th>Sheets</th><th>Submitted</th><th>Errors Found</th><th>Status</th><th></th></tr>
              ${rows || '<tr><td colspan="7" class="text-center text-muted" style="padding:20px">No bundles submitted for scrutiny yet.</td></tr>'}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openScrutinyReviewModal(bundleId) {
  const bundle = data.bundles.find(b => b.id === bundleId);
  if (!bundle) return;
  const message = bundle.errors > 0
    ? `Bundle ${bundleId} has ${bundle.errors} potential issue(s): missing marks or totaling mismatches were found. Approve if the marks are actually valid, or return the bundle to the evaluator for correction.`
    : `Bundle ${bundleId} has no errors found. Ready to approve and lock for result processing.`;
  document.getElementById('modalTitle').textContent = 'Scrutiny Review — Bundle ' + bundleId;
  const body = document.getElementById('modalBody');
  body.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = message;
  body.appendChild(p);

  const footer = document.getElementById('modalFooter');
  footer.innerHTML = '';
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = closeModal;
  footer.appendChild(cancelBtn);

  if (bundle.errors > 0) {
    const returnBtn = document.createElement('button');
    returnBtn.className = 'btn btn-warning';
    returnBtn.textContent = 'Return for Correction';
    returnBtn.onclick = function () {
      bundle.status = 'Assigned';
      bundle.statusClass = 'badge-info';
      bundle.progress = 50;
      bundle.submitted = null;
      bundle.scrutiny = null;
      bundle.scrutinyClass = '';
      bundle.errors = 0;
      closeModal();
      showPage('scrutiny');
      showToast('Bundle ' + bundleId + ' returned to ' + bundle.evaluator + ' for correction');
    };
    footer.appendChild(returnBtn);
  }

  const approveBtn = document.createElement('button');
  approveBtn.className = 'btn btn-success';
  approveBtn.textContent = 'Approve';
  approveBtn.onclick = function () {
    bundle.scrutiny = 'Approved';
    bundle.scrutinyClass = 'badge-success';
    closeModal();
    showPage('scrutiny');
    showToast('Bundle ' + bundleId + ' approved');
  };
  footer.appendChild(approveBtn);

  document.getElementById('modalOverlay').classList.add('show');
}

function scrutinyApproveAll() {
  const pending = data.bundles.filter(b => b.status === 'Completed' && b.scrutiny === 'Pending Review' && b.errors === 0);
  const withErrors = data.bundles.filter(b => b.status === 'Completed' && b.scrutiny === 'Pending Review' && b.errors > 0);
  showActionModal('Approve All', `Approve all bundles with zero errors found (${pending.length ? pending.map(b => b.id).join(', ') : 'none'})? ${withErrors.length ? withErrors.length + ' bundle(s) with pending issues still need individual review.' : ''}`, {
    icon: 'fa-check', confirmLabel: 'Approve All', confirmIcon: 'fa-check',
    onConfirm: function () {
      pending.forEach(b => { b.scrutiny = 'Approved'; b.scrutinyClass = 'badge-success'; });
      showPage('scrutiny');
      showToast(pending.length + ' bundle(s) approved');
    }
  });
}

// ============================================================
// CONSOLIDATION
// ============================================================
function renderConsolidation() {
  const isAutonomous = currentMode === 'autonomous';
  const modeAlert = isAutonomous
    ? 'Collect all marks components: internal, practical, project, external theory (from evaluator entry).'
    : 'Collect all marks components: internal, practical, project (college) and external theory (imported from university result).';
  const importBtn = !isAutonomous
    ? `<button class="btn btn-sm" onclick="showActionModal('Import University Marks','Select the university external theory marks file to import and map to subjects.', {icon:'fa-file-import', confirmLabel:'Choose File', confirmIcon:'fa-upload'})"><i class="fas fa-file-import"></i> Import University Marks</button>`
    : '';
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        ${importBtn}
        <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="openModal('All Marks Validated','<div class=\\'text-center\\' style=\\'padding:20px\\'><i class=\\'fas fa-check-circle\\' style=\\'font-size:48px;color:#059669\\'></i><h3 style=\\'margin-top:12px'>All Marks Validated & Locked</h3><p class=\\'text-muted\\'>All components verified. Ready for result processing.</p></div>','<button class=\\'btn btn-primary\\' onclick=\\'closeModal();showPage(\\'result-processing\\')\\'><i class=\\'fas fa-arrow-right\\'></i> Proceed to Result Processing</button>')"><i class="fas fa-lock"></i> Validate & Lock All</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-layer-group"></i> Marks Consolidation Status</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Subject</th><th>Internal (40)</th><th>External (60)</th><th>Practical (50)</th><th>Total (100)</th><th>Status</th></tr>
              <tr><td>DS & Algorithms</td><td><span class="badge badge-success">35.2</span></td><td><span class="badge badge-success">42.5</span></td><td><span class="badge badge-success">40.0</span></td><td><strong>88.0</strong></td><td><span class="badge badge-success">Locked</span></td></tr>
              <tr><td>Database Management Systems</td><td><span class="badge badge-success">36.0</span></td><td><span class="badge badge-success">38.0</span></td><td><span class="badge badge-success">42.0</span></td><td><strong>88.0</strong></td><td><span class="badge badge-success">Locked</span></td></tr>
              <tr><td>Operating Systems</td><td><span class="badge badge-success">34.5</span></td><td><span class="badge badge-success">40.0</span></td><td>—</td><td><strong>82.5</strong></td><td><span class="badge badge-warning">Pending External</span></td></tr>
              <tr><td>Computer Networks</td><td><span class="badge badge-success">35.0</span></td><td><span class="badge badge-warning">Not Available</span></td><td><span class="badge badge-success">38.0</span></td><td>—</td><td><span class="badge badge-danger">Incomplete</span></td></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// RESULT PROCESSING
// ============================================================
function renderResultProcessing() {
  const m = modeInfo[currentMode];
  let actionBlock;
  if (currentMode === 'autonomous') {
    actionBlock = `<button class="btn btn-primary" onclick="openModal('Process Results','<p>Process results for all 248 students? This will calculate pass/fail, SGPA/CGPA based on locked marks and grading rules.</p>','<button class=\\'btn\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-primary\\' onclick=\\'closeModal();showPage(\\'result-freeze\\')\\'><i class=\\'fas fa-calculator\\'></i> Process Results</button>')"><i class="fas fa-cogs"></i> Calculate Results</button>`;
  } else if (currentMode === 'affiliated') {
    actionBlock = `<button class="btn btn-primary" onclick="openModal('Import University Result','<div class=\\'form-group\\'><label>University Result File</label><input type=\\'file\\' class=\\'form-control\\'></div><p>Import and map the university result file to students and subjects.</p>','<button class=\\'btn\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-primary\\' onclick=\\'closeModal();showPage(\\'result-freeze\\')\\'><i class=\\'fas fa-file-import\\'></i> Import Result</button>')"><i class="fas fa-file-import"></i> Import University Result</button>`;
  } else {
    actionBlock = `<button class="btn btn-primary" onclick="openModal('Process Results','<p>Calculate internal/practical results in ERP and combine with the imported university external result.</p>','<button class=\\'btn\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-primary\\' onclick=\\'closeModal();showPage(\\'result-freeze\\')\\'><i class=\\'fas fa-calculator\\'></i> Calculate & Combine</button>')"><i class="fas fa-cogs"></i> Calculate Results</button><button class="btn btn-sm" onclick="showActionModal('Import University External Result','Select the university external result file to import and combine with college-calculated internal/practical marks.', {icon:'fa-file-import', confirmLabel:'Choose File', confirmIcon:'fa-upload'})"><i class="fas fa-file-import"></i> Import University External Result</button>`;
  }
  const modeAlert = currentMode === 'autonomous'
    ? '<strong>Autonomous Mode:</strong> Calculating results in ERP based on locked marks.'
    : currentMode === 'affiliated'
      ? '<strong>Affiliated Mode:</strong> Import the university result file and map it to students.'
      : '<strong>Hybrid Mode:</strong> Combine college-calculated internal/practical marks with the imported university external result.';
  return `
    <div class="page-content">
      <div class="alert alert-success"><i class="fas fa-university"></i> ${modeAlert}</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Mode</div><div class="value" style="font-size:20px">${m.label}</div><div class="sub">${m.desc}</div></div>
        <div class="stat-card"><div class="label">Students</div><div class="value">248</div><div class="sub">Result pending</div></div>
        <div class="stat-card"><div class="label">Pass</div><div class="value" style="color:var(--success)">—</div><div class="sub">Not yet processed</div></div>
        <div class="stat-card"><div class="label">Fail / Backlog</div><div class="value" style="color:var(--danger)">—</div><div class="sub">Not yet processed</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-calculator"></i> Result Calculation</h3><div class="flex gap-2">${actionBlock}</div></div>
        <div class="card-body">
          <div class="text-center empty-state"><i class="fas fa-hourglass-half"></i><p>Results have not been processed yet.</p></div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// RESULT FREEZE
// ============================================================
function renderResultFreeze() {
  const modeAlert = currentMode === 'affiliated'
    ? 'University result imported. Review and lock the student/subject mapping before declaration.'
    : 'Results calculated. Review and freeze before declaration.';
  return `
    <div class="page-content">
      <div class="alert alert-success"><i class="fas fa-check-circle"></i> ${modeAlert}</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="label">Total Students</div><div class="value">248</div></div>
        <div class="stat-card"><div class="label">Pass</div><div class="value" style="color:var(--success)">226</div><div class="sub">91.1%</div></div>
        <div class="stat-card"><div class="label">Fail / Backlog</div><div class="value" style="color:var(--danger)">22</div><div class="sub">8.9%</div></div>
        <div class="stat-card"><div class="label">Withheld</div><div class="value" style="color:var(--warning)">2</div><div class="sub">Under review</div></div>
      </div>
      <div class="card mt-2">
        <div class="card-header"><h3><i class="fas fa-clipboard-check"></i> Result Review</h3><div class="flex gap-2"><button class="btn btn-sm" onclick="showActionModal('Apply Moderation','Apply grace marks or moderation rules across subjects before freezing the result? This adjusts borderline pass/fail cases per institution policy.', {icon:'fa-gavel', confirmLabel:'Apply Moderation', confirmIcon:'fa-gavel', onConfirm:()=>showPage('result-freeze')})"><i class="fas fa-gavel"></i> Apply Moderation</button><button class="btn btn-success" onclick="openModal('Freeze Result','<div class=\\'text-center\\'><i class=\\'fas fa-exclamation-triangle\\' style=\\'font-size:48px;color:#d97706\\'></i><h3 style=\\'margin-top:12px'>Confirm Result Freeze</h3><p>Once frozen, results cannot be modified without proper authorization. Are you sure?</p></div>','<button class=\\'btn\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-success\\' onclick=\\'closeModal();showPage(\\'result-declaration\\')\\'><i class=\\'fas fa-lock\\'></i> Freeze Result</button>')"><i class="fas fa-lock"></i> Freeze Result</button></div></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Subject</th><th>Total</th><th>Pass</th><th>Fail</th><th>Pass %</th><th>Topper</th><th>Marks</th></tr>
              <tr><td>DS & Algorithms</td><td>42</td><td>39</td><td>3</td><td>92.9%</td><td>Aarav Sharma</td><td>92</td></tr>
              <tr><td>DBMS</td><td>42</td><td>40</td><td>2</td><td>95.2%</td><td>Priya Patel</td><td>94</td></tr>
              <tr><td>Operating Systems</td><td>42</td><td>38</td><td>4</td><td>90.5%</td><td>Vikram Singh</td><td>88</td></tr>
              <tr><td>Computer Networks</td><td>42</td><td>41</td><td>1</td><td>97.6%</td><td>Sneha Reddy</td><td>96</td></tr>
              <tr><td>Software Engineering</td><td>42</td><td>36</td><td>6</td><td>85.7%</td><td>Divya Kulkarni</td><td>90</td></tr>
              <tr><td>Mathematics IV</td><td>38</td><td>32</td><td>6</td><td>84.2%</td><td>Aarav Sharma</td><td>85</td></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// RESULT DECLARATION
// ============================================================
function renderResultDeclaration() {
  const isAffiliated = currentMode === 'affiliated';
  const modeAlert = isAffiliated
    ? 'Imported university result is locked and ready for publication.'
    : 'Result frozen and ready for declaration.';
  const publishHint = isAffiliated
    ? 'Result has been locked. Click "Publish Result" to make the university result available to students via the student portal.'
    : 'Result has been frozen. Click "Publish Result" to make it available to students via the student portal. Notifications will be sent after declaration.';
  return `
    <div class="page-content">
      <div class="alert alert-success"><i class="fas fa-check-circle"></i> ${modeAlert}</div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-bullhorn"></i> Result Declaration</h3><div class="flex gap-2"><button class="btn btn-success btn-lg" onclick="openModal('Result Declared','<div class=\\'text-center\\' style=\\'padding:20px\\'><i class=\\'fas fa-check-circle\\' style=\\'font-size:48px;color:#059669\\'></i><h3 style=\\'margin-top:12px'>Result Published Successfully</h3><p class=\\'text-muted\\'>Results are now live on the student portal. Notifications sent.</p></div>','<button class=\\'btn btn-primary\\' onclick=\\'closeModal();showPage(\\'marks-memo\\')\\'><i class=\\'fas fa-arrow-right\\'></i> Generate Marks Memo</button>')"><i class="fas fa-globe"></i> Publish Result</button></div></div>
        <div class="card-body">
          <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${publishHint}</div>
          <div class="stats-grid" style="margin-bottom:0">
            <div class="stat-card"><div class="label">Published</div><div class="value" style="color:var(--success)">Yes</div></div>
            <div class="stat-card"><div class="label">Students Notified</div><div class="value">248</div></div>
            <div class="stat-card"><div class="label">Portal Access</div><div class="value">Live</div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// MARKS MEMO
// ============================================================
function renderMarksMemo() {
  const isAutonomous = currentMode === 'autonomous';
  const isAffiliated = currentMode === 'affiliated';
  const modeAlert = isAutonomous
    ? 'Generate official marks memos / grade cards with memo number, QR code, digital signature.'
    : isAffiliated
      ? 'Upload the university-issued marks memo and map it to students.'
      : 'Generate memos in ERP for internal/practical exams; upload the university memo for external subjects.';
  const generateBtn = !isAffiliated
    ? `<button class="btn btn-primary btn-sm" onclick="openModal('Generate All Memos','<p>Generate official marks memos for all 248 students? This will create PDFs with memo numbers, QR codes, and digital signatures.</p>','<button class=\\'btn\\' onclick=\\'closeModal()\\'>Cancel</button><button class=\\'btn btn-primary\\' onclick=\\'closeModal()\\'>Generate All</button>')"><i class="fas fa-magic"></i> Generate All Memos</button>`
    : '';
  const uploadBtn = !isAutonomous
    ? `<button class="btn ${isAffiliated?'btn-primary':''} btn-sm" onclick="showActionModal('Upload University Memo','Select the university-issued marks memo file to upload and map to students.', {icon:'fa-upload', confirmLabel:'Choose File', confirmIcon:'fa-upload'})"><i class="fas fa-upload"></i> Upload University Memo</button>`
    : '';
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        ${generateBtn}
        ${uploadBtn}
        <button class="btn btn-sm" style="margin-left:auto" onclick="showActionModal('Publish to Portal','Generated marks memos are now published and downloadable from the student portal.', {icon:'fa-check-circle', iconColor:'var(--success)', showCancel:false, confirmLabel:'OK'})"><i class="fas fa-check"></i> Publish to Portal</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-id-card"></i> Marks Memo / Grade Card</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Student</th><th>Memo No.</th><th>SGPA</th><th>CGPA</th><th>Status</th><th></th></tr>
              <tr><td>Aarav Sharma (S001)</td><td>MM-2026-001</td><td>9.2</td><td>8.9</td><td><span class="badge badge-success">Generated</span></td><td><button class="btn btn-sm" onclick="showActionModal('Marks Memo MM-2026-001','Downloading the marks memo / grade card PDF for Aarav Sharma (SGPA 9.2, CGPA 8.9).', {icon:'fa-download', confirmLabel:'Download PDF', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> PDF</button></td></tr>
              <tr><td>Priya Patel (S002)</td><td>MM-2026-002</td><td>9.4</td><td>9.1</td><td><span class="badge badge-success">Generated</span></td><td><button class="btn btn-sm" onclick="showActionModal('Marks Memo MM-2026-002','Downloading the marks memo / grade card PDF for Priya Patel (SGPA 9.4, CGPA 9.1).', {icon:'fa-download', confirmLabel:'Download PDF', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> PDF</button></td></tr>
              <tr><td>Rahul Verma (S003)</td><td>MM-2026-003</td><td>7.8</td><td>7.5</td><td><span class="badge badge-warning">Pending</span></td><td><button class="btn btn-sm" onclick="showActionModal('Generate Marks Memo','Generate the official marks memo for Rahul Verma (S003) with memo number, QR code, and digital signature?', {icon:'fa-id-card', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('marks-memo')})">Generate</button></td></tr>
              <tr><td>Sneha Reddy (S004)</td><td>MM-2026-004</td><td>8.6</td><td>8.2</td><td><span class="badge badge-success">Generated</span></td><td><button class="btn btn-sm" onclick="showActionModal('Marks Memo MM-2026-004','Downloading the marks memo / grade card PDF for Sneha Reddy (SGPA 8.6, CGPA 8.2).', {icon:'fa-download', confirmLabel:'Download PDF', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> PDF</button></td></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// REVALUATION
// ============================================================
function renderRevaluation() {
  if (currentMode === 'affiliated') {
    const list = data.universityRevaluationTracking;
    const awaiting = list.filter(r => r.uniStatus === 'Awaiting University' || r.uniStatus === 'Submitted to University').length;
    const received = list.filter(r => r.uniStatus === 'Revised Result Received').length;
    const rows = list.map((r, i) => {
      const action = r.uniStatus === 'Revised Result Received'
        ? `<button class="btn btn-sm" onclick="showActionModal('Revaluation Result — ${r.student}','Subject: ${r.subject}. Original marks: ${r.marks}. Revised marks: ${r.revised}. University has released the revised result.', {icon:'fa-check-circle', iconColor:'var(--success)'})">View</button>`
        : r.uniStatus === 'Fee Pending'
          ? `<button class="btn btn-sm" onclick="showActionModal('Send Fee Reminder','Send a fee payment reminder to ${r.student} for the ${r.subject} revaluation application?', {icon:'fa-bell', confirmLabel:'Send Reminder', confirmIcon:'fa-paper-plane', onConfirm:()=>showPage('revaluation')})">Remind</button>`
          : `<button class="btn btn-sm" onclick="showActionModal('Update Status — ${r.student}','Update the university revaluation status for ${r.subject} once the university responds.', {icon:'fa-redo-alt'})">Update</button>`;
      return `<tr><td>${r.student}</td><td>${r.subject}</td><td>${r.marks}</td><td><span class="badge ${r.feePaid ? 'badge-success' : 'badge-danger'}">${r.feePaid ? 'Paid' : 'Pending'}</span></td><td><span class="badge ${r.uniStatusClass}">${r.uniStatus}</span></td><td>${r.revised}</td><td>${action}</td></tr>`;
    }).join('');
    return `
      <div class="page-content">
        <div class="alert alert-info"><i class="fas fa-info-circle"></i> Affiliated mode: Track the student's revaluation application submitted to the university. Update the record once the university releases the revised result.</div>
        <div class="filter-bar">
          <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
          <span class="chip">${list.length} Applications</span>
          <span class="chip">${awaiting} Awaiting University</span>
          <span class="chip">${received} Revised Result Received</span>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="openTrackRevaluationModal()"><i class="fas fa-plus"></i> Track New Application</button>
        </div>
        <div class="card">
          <div class="card-header"><h3><i class="fas fa-redo-alt"></i> University Revaluation Tracking</h3></div>
          <div class="card-body">
            <div class="table-wrap">
              <table>
                <tr><th>Student</th><th>Subject</th><th>Original Marks</th><th>Fee Status</th><th>University Status</th><th>Revised Result</th><th></th></tr>
                ${rows}
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  const modeAlert = currentMode === 'hybrid'
    ? 'Hybrid mode: Full revaluation cycle in ERP for internal/practical subjects; track university revaluation for external subjects.'
    : 'Students can apply for revaluation. Full cycle management in autonomous mode.';
  const list = data.revaluationApplications;
  const inProgress = list.filter(r => r.status === 'In Progress').length;
  const completed = list.filter(r => r.status.startsWith('Revised')).length;
  const rows = list.map(r => {
    const action = r.status === 'Pending'
      ? `<button class="btn btn-sm btn-primary" onclick="openAssignRevaluationModal('${r.student}')">Assign</button>`
      : r.status === 'Fee Pending'
        ? `<button class="btn btn-sm" onclick="showActionModal('Send Fee Reminder','Send a fee payment reminder to ${r.student} for the ${r.subject} revaluation application?', {icon:'fa-bell', confirmLabel:'Send Reminder', confirmIcon:'fa-paper-plane', onConfirm:()=>showPage('revaluation')})">Remind</button>`
        : r.status.startsWith('Revised')
          ? `<button class="btn btn-sm" onclick="showActionModal('Revaluation Result — ${r.student}','Subject: ${r.subject}. Original marks: ${r.marks}. ${r.status} by ${r.evaluator}.', {icon:'fa-check-circle', iconColor:'var(--success)'})">View</button>`
          : `<button class="btn btn-sm" onclick="showActionModal('Revaluation Progress — ${r.student}','Subject: ${r.subject}. Original marks: ${r.marks}. ${r.evaluator} is currently re-evaluating this answer sheet.', {icon:'fa-chart-line'})">Track</button>`;
    return `<tr><td>${r.student}</td><td>${r.subject}</td><td>${r.marks}</td><td><span class="badge ${r.feePaid ? 'badge-success' : 'badge-danger'}">${r.feePaid ? 'Paid' : 'Pending'}</span></td><td>${r.evaluator}</td><td><span class="badge ${r.statusClass}">${r.status}</span></td><td>${action}</td></tr>`;
  }).join('');
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> ${modeAlert}</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        <span class="chip">${list.length} Applications</span>
        <span class="chip">${inProgress} In Progress</span>
        <span class="chip">${completed} Completed</span>
        <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="openNewRevaluationModal()"><i class="fas fa-plus"></i> New Application</button>
      </div>
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-redo-alt"></i> Revaluation Applications</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Student</th><th>Subject</th><th>Original Marks</th><th>Fee Status</th><th>Evaluator</th><th>Status</th><th></th></tr>
              ${rows}
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// REPORTS
// ============================================================
function renderReports() {
  return `
    <div class="page-content">
      <div class="alert alert-info"><i class="fas fa-info-circle"></i> Generate and export examination reports across all phases.</div>
      <div class="filter-bar">
        <select class="form-control"><option>Sem IV Regular Apr 2026</option></select>
        <select class="form-control"><option>All Phases</option><option>Pre-Exam</option><option>In-Exam</option><option>Post-Exam</option></select>
        <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="showActionModal('Export PDF','All available reports for the selected exam and phase have been exported as a single PDF.', {icon:'fa-file-pdf', confirmLabel:'Download PDF', confirmIcon:'fa-download'})"><i class="fas fa-file-pdf"></i> Export PDF</button>
        <button class="btn btn-sm" onclick="showActionModal('Export Excel','All available reports for the selected exam and phase have been exported to Excel.', {icon:'fa-file-excel', confirmLabel:'Download Excel', confirmIcon:'fa-download'})"><i class="fas fa-file-excel"></i> Export Excel</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="label">Pre-Exam Reports</div><div class="value" style="font-size:16px">6</div><div class="sub">Eligibility, Registration, Timetable, Hall Ticket, Seating, Invigilator</div></div>
        <div class="stat-card"><div class="label">In-Exam Reports</div><div class="value" style="font-size:16px">5</div><div class="sub">Attendance, Answer Sheet, Malpractice, D-Form, Collection</div></div>
        <div class="stat-card"><div class="label">Post-Exam Reports</div><div class="value" style="font-size:16px">8</div><div class="sub">Bundle, Evaluator, Marks, Scrutiny, Result, Memo, Revaluation</div></div>
        <div class="stat-card"><div class="label">Analytics</div><div class="value" style="font-size:16px">5</div><div class="sub">Pass/Fail, Backlog, Subject-wise, Toppers, Trend</div></div>
      </div>

      <div class="card">
        <div class="card-header"><h3><i class="fas fa-file-alt"></i> Available Reports</h3></div>
        <div class="card-body">
          <div class="table-wrap">
            <table>
              <tr><th>Report Name</th><th>Category</th><th>Last Generated</th><th></th></tr>
              <tr><td>Eligible Student List</td><td><span class="badge badge-info">Pre-Exam</span></td><td>05 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Eligible Student List','Downloading the eligible student list report (last generated 05 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Registered Student List</td><td><span class="badge badge-info">Pre-Exam</span></td><td>06 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Registered Student List','Downloading the registered student list report (last generated 06 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Exam Timetable</td><td><span class="badge badge-info">Pre-Exam</span></td><td>07 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Exam Timetable','Downloading the exam timetable report (last generated 07 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Hall Ticket List</td><td><span class="badge badge-info">Pre-Exam</span></td><td>08 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Hall Ticket List','Downloading the hall ticket list report (last generated 08 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Seating Plan</td><td><span class="badge badge-info">Pre-Exam</span></td><td>08 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Seating Plan','Downloading the room-wise seating plan report (last generated 08 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Attendance Report (D-Form)</td><td><span class="badge badge-warning">In-Exam</span></td><td>10 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Attendance Report (D-Form)','Downloading the D-Form / attendance summary report (last generated 10 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Answer Sheet Report</td><td><span class="badge badge-warning">In-Exam</span></td><td>10 Apr 2026</td><td><button class="btn btn-sm" onclick="showActionModal('Answer Sheet Report','Downloading the answer sheet / booklet number report (last generated 10 Apr 2026).', {icon:'fa-download', confirmLabel:'Download', confirmIcon:'fa-download'})"><i class="fas fa-download"></i> Download</button></td></tr>
              <tr><td>Bundle Summary</td><td><span class="badge badge-success">Post-Exam</span></td><td>—</td><td><button class="btn btn-sm btn-primary" onclick="showActionModal('Generate Bundle Summary','Generate a summary report of all answer sheet bundles and their evaluation status?', {icon:'fa-layer-group', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('reports')})">Generate</button></td></tr>
              <tr><td>Marks Entry Status</td><td><span class="badge badge-success">Post-Exam</span></td><td>—</td><td><button class="btn btn-sm btn-primary" onclick="showActionModal('Generate Marks Entry Status','Generate a report showing marks entry completion status across all evaluators?', {icon:'fa-pencil-alt', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('reports')})">Generate</button></td></tr>
              <tr><td>Result Summary</td><td><span class="badge badge-success">Post-Exam</span></td><td>—</td><td><button class="btn btn-sm btn-primary" onclick="showActionModal('Generate Result Summary','Generate a subject-wise and overall result summary report?', {icon:'fa-chart-bar', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('reports')})">Generate</button></td></tr>
              <tr><td>Pass / Fail Analysis</td><td><span class="badge badge-neutral">Analytics</span></td><td>—</td><td><button class="btn btn-sm btn-primary" onclick="showActionModal('Generate Pass / Fail Analysis','Generate a pass/fail analysis report across all subjects?', {icon:'fa-chart-pie', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('reports')})">Generate</button></td></tr>
              <tr><td>Backlog Report</td><td><span class="badge badge-neutral">Analytics</span></td><td>—</td><td><button class="btn btn-sm btn-primary" onclick="showActionModal('Generate Backlog Report','Generate a report listing all students with backlog/ATKT subjects?', {icon:'fa-list', confirmLabel:'Generate', confirmIcon:'fa-magic', onConfirm:()=>showPage('reports')})">Generate</button></td></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
