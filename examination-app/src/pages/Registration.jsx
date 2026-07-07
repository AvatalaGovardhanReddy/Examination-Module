import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { registrationRows } from '../data/mockData.js'

const SOURCE_VARIANT = {
  ERP: 'info',
  'Fee Hold': 'warning',
  Backlog: 'violet',
}

export default function Registration() {
  const { mode, activeExam } = useExam()
  const toast = useToast()
  const navigate = useNavigate()
  const [viewRow, setViewRow] = useState(null)
  const isAutonomous = mode === 'autonomous'
  const isAffiliated = mode === 'affiliated'
  const isRegular = activeExam.type === 'Regular'
  const approvedRows = registrationRows.filter((row) => row.approval === 'Approved').length
  const feeHoldRows = registrationRows.filter((row) => row.fee !== 'Paid').length
  const subjectEntries = activeExam.registeredStudents * activeExam.subjects

  const workflowSteps = [
    {
      label: 'Generate Eligible List',
      detail: `${activeExam.eligibleStudents} eligible students loaded`,
      icon: 'fa-user-check',
      state: 'Completed',
      variant: 'success',
    },
    {
      label: 'Confirm Student Subjects',
      detail: isRegular ? 'Bulk registration enabled' : 'Failed subjects selected only',
      icon: 'fa-book-open',
      state: 'Active',
      variant: 'info',
    },
    {
      label: 'Check Fee Status',
      detail: `${activeExam.feePending} fee hold cases in full cycle`,
      icon: 'fa-receipt',
      state: feeHoldRows ? 'Review' : 'Clear',
      variant: feeHoldRows ? 'warning' : 'success',
    },
    {
      label: isAutonomous ? 'Approve in ERP' : 'Export / Import University Data',
      detail: isAutonomous
        ? 'Exam branch approval stays inside ERP'
        : 'University approved list can be mapped back',
      icon: isAutonomous ? 'fa-check-double' : 'fa-file-export',
      state: isAutonomous ? 'ERP' : 'University',
      variant: isAutonomous ? 'success' : 'violet',
    },
    {
      label: 'Final Registered List',
      detail: `${activeExam.registeredStudents} final registrations`,
      icon: 'fa-list-check',
      state: 'Ready',
      variant: 'success',
    },
  ]

  const modeAlert = isAutonomous
    ? 'Autonomous mode keeps final registration approval inside ERP after eligible students, subjects and fee status are verified.'
    : isAffiliated
      ? 'Affiliated mode exports exam-form data to the university and imports the university-approved student list.'
      : 'Hybrid mode approves college-controlled papers in ERP and exchanges university-controlled paper data.'

  function proceed() {
    toast(isAutonomous ? 'Final registrations approved in ERP' : 'University-approved list synced')
    navigate('/timetable')
  }

  return (
    <Layout title="Exam Registration" breadcrumb="Pre-Exam / Registration">
      <Alert variant="info">{modeAlert}</Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-user-check" />
          </div>
          <div className="label">Eligible Generated</div>
          <div className="value">{activeExam.eligibleStudents}</div>
          <div className="sub">Eligible list received from previous step</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-file-signature" />
          </div>
          <div className="label">Final Registered</div>
          <div className="value">{activeExam.registeredStudents}</div>
          <div className="sub">Students with confirmed exam forms</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-receipt" />
          </div>
          <div className="label">Fee Review</div>
          <div className="value">{activeExam.feePending}</div>
          <div className="sub">Fee holds before hall ticket release</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className="fas fa-book" />
          </div>
          <div className="label">Subject Entries</div>
          <div className="value">{subjectEntries}</div>
          <div className="sub">Student-subject rows for exam forms</div>
        </div>
      </div>

      <Card title="Registration Workflow" icon="fa-route">
        <div className="workflow-track">
          {workflowSteps.map((step, index) => (
            <div className="workflow-step-card" key={step.label}>
              <div className="step-topline">
                <div className="step-index">{index + 1}</div>
                <div className="step-copy">
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </div>
              </div>
              <p className="step-description">
                <i className={`fas ${step.icon}`} /> {step.state}
              </p>
              <Badge variant={step.variant}>{step.state}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="equal-grid mt-4">
        <Card title="Subject Confirmation" icon="fa-book-open">
          <div className="mini-grid">
            <div className="info-tile">
              <i className={isRegular ? 'fas fa-users' : 'fas fa-user-pen'} />
              <strong>{isRegular ? 'Regular Bulk Register' : 'Failed Subject Selection'}</strong>
              <span>
                {isRegular
                  ? 'All eligible regular students can be confirmed in one controlled batch.'
                  : 'Only applicable backlog or supplementary subjects are kept on the form.'}
              </span>
            </div>
            <div className="info-tile">
              <i className="fas fa-list-check" />
              <strong>{approvedRows}/{registrationRows.length} Approved Samples</strong>
              <span>Visible rows show confirmed subject lists and pending review cases.</span>
            </div>
          </div>
        </Card>

        <Card title={isAutonomous ? 'ERP Approval' : 'University Data Exchange'} icon={isAutonomous ? 'fa-check-double' : 'fa-exchange-alt'}>
          <div className="task-list">
            <div className="task-row">
              <div className="task-row-left">
                <div className="task-icon">
                  <i className="fas fa-file-lines" />
                </div>
                <div className="task-copy">
                  <strong>Exam form data prepared</strong>
                  <span>Student, subject and fee status rows are ready.</span>
                </div>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-row-left">
                <div className="task-icon">
                  <i className={isAutonomous ? 'fas fa-building-columns' : 'fas fa-file-export'} />
                </div>
                <div className="task-copy">
                  <strong>{isAutonomous ? 'Approve inside ERP' : 'Export / import university list'}</strong>
                  <span>
                    {isAutonomous
                      ? 'Exam branch locks the final registered list here.'
                      : 'University-approved students are mapped back to ERP IDs.'}
                  </span>
                </div>
              </div>
              <Badge variant={isAutonomous ? 'success' : 'violet'}>
                {isAutonomous ? 'ERP' : 'University'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="filter-bar mt-4">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>
        <span className="chip">
          <i className="fas fa-user-check" style={{ color: 'var(--success)' }} /> Generate Eligible List
        </span>
        <button className="btn btn-sm" onClick={() => toast('Student subjects confirmed')}>
          <i className="fas fa-book-open" /> Confirm Subjects
        </button>
        <button className="btn btn-sm" onClick={() => toast('Fee status checked from ERP')}>
          <i className="fas fa-receipt" /> Check Fee Status
        </button>
        {!isAutonomous && (
          <div className="btn-group ml-auto">
            <button
              className="btn btn-sm"
              onClick={() => toast('Exam-form data exported to university')}
            >
              <i className="fas fa-file-export" /> Export
            </button>
            <button
              className="btn btn-sm"
              onClick={() => toast('University-approved list imported')}
            >
              <i className="fas fa-file-import" /> Import
            </button>
          </div>
        )}
      </div>

      <Card
        title="Final Registered List"
        icon="fa-file-signature"
        actions={
          <button className="btn btn-success btn-sm" onClick={proceed}>
            <i className={`fas ${isAutonomous ? 'fa-check' : 'fa-file-import'}`} />{' '}
            {isAutonomous ? 'Final Approve' : 'Sync & Proceed'}
          </button>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subjects Registered</th>
                <th>Fee Status</th>
                <th>Registration Source</th>
                <th>Approval</th>
                <th>Mode Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrationRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="cell-title">{row.student}</div>
                    <div className="cell-sub">{row.id}</div>
                  </td>
                  <td>
                    <div className="subject-list">
                      {row.subjects.map((subject) => (
                        <span className="subject-pill" key={subject}>
                          {subject}
                        </span>
                      ))}
                    </div>
                    <div className="cell-sub">
                      {row.source === 'Backlog'
                        ? 'Applicable failed subjects only'
                        : isRegular
                          ? 'Bulk regular registration'
                          : 'Selected exam-form subjects'}
                    </div>
                  </td>
                  <td>
                    <Badge variant={row.fee === 'Paid' ? 'success' : 'warning'}>{row.fee}</Badge>
                  </td>
                  <td>
                    <Badge variant={SOURCE_VARIANT[row.source] || 'info'}>{row.source}</Badge>
                  </td>
                  <td>
                    <Badge variant={row.approval === 'Approved' ? 'success' : 'warning'}>
                      {row.approval}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-muted">
                      {row.approval === 'Approved'
                        ? isAutonomous
                          ? 'ERP approved'
                          : 'Ready for university sync'
                        : 'Hold until fee clear'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => setViewRow(row)}
                    >
                      <i className="fas fa-eye" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {viewRow && (
        <Modal
          title="Exam Registration Details"
          onClose={() => setViewRow(null)}
          footer={
            <>
              <button className="btn" onClick={() => setViewRow(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toast(`Registration checked for ${viewRow.student}`)
                  setViewRow(null)
                }}
              >
                <i className="fas fa-check" /> Mark Reviewed
              </button>
            </>
          }
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Student</span>
              <strong>{viewRow.student}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Student ID</span>
              <strong>{viewRow.id}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Exam</span>
              <strong>{activeExam.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Exam Type</span>
              <strong>{activeExam.type}</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            <div className="task-row">
              <div className="task-copy">
                <strong>Subjects Registered</strong>
                <span>
                  {viewRow.source === 'Backlog'
                    ? 'Only applicable failed subjects are included.'
                    : 'Confirmed from eligible regular registration.'}
                </span>
              </div>
              <Badge variant="info">{viewRow.subjects.length} Subjects</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Fee Status</strong>
                <span>
                  {viewRow.fee === 'Paid'
                    ? 'No fee hold for this registration.'
                    : 'Registration is waiting for fee clearance.'}
                </span>
              </div>
              <Badge variant={viewRow.fee === 'Paid' ? 'success' : 'warning'}>
                {viewRow.fee}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>{isAutonomous ? 'ERP Approval' : 'University Sync'}</strong>
                <span>
                  {viewRow.approval === 'Approved'
                    ? isAutonomous
                      ? 'Approved inside ERP for final registered list.'
                      : 'Ready for university-approved list mapping.'
                    : 'Pending rows are held before final approval.'}
                </span>
              </div>
              <Badge variant={viewRow.approval === 'Approved' ? 'success' : 'warning'}>
                {viewRow.approval}
              </Badge>
            </div>
          </div>

          <div className="subject-list mt-4">
            {viewRow.subjects.map((subject) => (
              <span className="subject-pill" key={subject}>
                {subject}
              </span>
            ))}
          </div>
        </Modal>
      )}
    </Layout>
  )
}
