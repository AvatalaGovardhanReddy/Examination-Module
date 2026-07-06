import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { activeExam, registrationRows } from '../data/mockData.js'

export default function Registration() {
  const { mode } = useExam()
  const toast = useToast()
  const navigate = useNavigate()
  const isAffiliated = mode === 'affiliated'

  const modeAlert =
    mode === 'autonomous'
      ? 'Autonomous mode keeps the final exam-form approval inside the ERP.'
      : isAffiliated
        ? 'Affiliated mode enables university exam-form export and approved-list import.'
        : 'Hybrid mode keeps internal/practical papers in ERP and exports external papers to the university.'

  return (
    <Layout title="Exam Registration" breadcrumb="Pre-Exam / Registration">
      <Alert variant="info">{modeAlert}</Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-file-signature" />
          </div>
          <div className="label">Registered</div>
          <div className="value">{activeExam.registeredStudents}</div>
          <div className="sub">Students with confirmed subject selection</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-receipt" />
          </div>
          <div className="label">Fee Pending</div>
          <div className="value">{activeExam.feePending}</div>
          <div className="sub">Holds before hall ticket release</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-book" />
          </div>
          <div className="label">Subject Entries</div>
          <div className="value">1,392</div>
          <div className="sub">Student-subject rows prepared for exam form</div>
        </div>
      </div>

      {mode !== 'autonomous' && (
        <Card title="University Data Exchange" icon="fa-exchange-alt">
          <div className="mini-grid">
            <div className="info-tile">
              <i className="fas fa-file-export" />
              <strong>Exam Form Export</strong>
              <span>Student, subject and fee status file prepared for upload.</span>
            </div>
            <div className="info-tile">
              <i className="fas fa-file-import" />
              <strong>Approved List Import</strong>
              <span>University-approved registrations can be mapped back to ERP IDs.</span>
            </div>
            <div className="info-tile">
              <i className="fas fa-link" />
              <strong>Mapping Check</strong>
              <span>Hall ticket number and university form number matching enabled.</span>
            </div>
          </div>
        </Card>
      )}

      <div className="filter-bar">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>
        <span className="chip">
          <i className="fas fa-users" /> {activeExam.registeredStudents} Registered
        </span>
        <span className="chip">
          <i className="fas fa-check-circle" style={{ color: 'var(--success)' }} /> 220 Approved
        </span>
        <span className="chip">
          <i className="fas fa-triangle-exclamation" style={{ color: 'var(--warning)' }} />{' '}
          {activeExam.feePending} Fee Holds
        </span>
        {mode !== 'autonomous' && (
          <div className="btn-group ml-auto">
            <button
              className="btn btn-sm"
              onClick={() => toast('Exam-form data exported to university')}
            >
              <i className="fas fa-file-export" /> Export to University
            </button>
            <button
              className="btn btn-sm"
              onClick={() => toast('University-approved list imported')}
            >
              <i className="fas fa-file-import" /> Import University List
            </button>
          </div>
        )}
      </div>

      <Card
        title="Exam Registration / Exam Form"
        icon="fa-file-signature"
        actions={
          isAffiliated ? (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                toast('University-approved list imported')
                navigate('/timetable')
              }}
            >
              <i className="fas fa-file-import" /> Import &amp; Proceed
            </button>
          ) : (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                toast('Final registrations approved')
                navigate('/timetable')
              }}
            >
              <i className="fas fa-check" /> Final Approve
            </button>
          )
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subjects Registered</th>
                <th>Fee Status</th>
                <th>Source</th>
                <th>Approval</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrationRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-title">{r.student}</div>
                    <div className="cell-sub">{r.id}</div>
                  </td>
                  <td>
                    <div className="subject-list">
                      {r.subjects.map((subject) => (
                        <span className="subject-pill" key={subject}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Badge variant={r.fee === 'Paid' ? 'success' : 'warning'}>{r.fee}</Badge>
                  </td>
                  <td>
                    <Badge
                      variant={
                        r.source === 'Backlog'
                          ? 'violet'
                          : r.source === 'Fee Hold'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {r.source}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={r.approval === 'Approved' ? 'success' : 'warning'}>
                      {r.approval}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => toast(`Opened registration for ${r.student}`)}
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
    </Layout>
  )
}
