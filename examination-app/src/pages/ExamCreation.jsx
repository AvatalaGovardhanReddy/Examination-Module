import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam, MODES } from '../context/ExamContext.jsx'
import { activeExam, recentExams } from '../data/mockData.js'

const STATUS_VARIANT = { Active: 'success', 'Pre-Exam': 'warning', Closed: 'danger' }

const activationChecklist = [
  { label: 'Academic structure mapped', detail: 'Program, semester, branch and regulation', done: true },
  { label: 'Control mode selected', detail: 'Controls import/export and local actions', done: true },
  { label: 'ERP masters linked', detail: 'Students, subjects, rooms and faculty', done: true },
  { label: 'Registration window reviewed', detail: 'Deadline and fee hold policy', done: false },
]

export default function ExamCreation() {
  const { mode, setMode, modeInfo } = useExam()
  const [created, setCreated] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  return (
    <Layout title="Exam Creation" breadcrumb="Pre-Exam / Exam Creation">
      <Alert variant="info">
        Create and activate the examination instance that every later Pre-Exam
        activity will reference.
      </Alert>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon">
            <i className="fas fa-hashtag" />
          </div>
          <div className="label">Exam Code</div>
          <div className="value" style={{ fontSize: 22 }}>
            {activeExam.code}
          </div>
          <div className="sub">Unique transaction record for the exam cycle</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-user-graduate" />
          </div>
          <div className="label">Course Registrations</div>
          <div className="value">{activeExam.totalStudents}</div>
          <div className="sub">Students available for eligibility generation</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className={`fas ${modeInfo.icon}`} />
          </div>
          <div className="label">Control Mode</div>
          <div className="value" style={{ fontSize: 24 }}>
            {modeInfo.label}
          </div>
          <div className="sub">{modeInfo.desc}</div>
        </div>
      </div>

      <Card
        title="Create New Exam"
        icon="fa-plus-circle"
        actions={
          <div className="btn-group">
            <button className="btn btn-sm" onClick={() => toast('Draft saved')}>
              <i className="fas fa-save" /> Save Draft
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Overview
            </button>
          </div>
        }
      >
        <div className="split-grid">
          <div>
            <div className="form-row">
              <div className="form-group">
                <label>Academic Year</label>
                <select className="form-control" defaultValue="2026-27">
                  <option>2026-27</option>
                  <option>2025-26</option>
                </select>
              </div>
              <div className="form-group">
                <label>Program</label>
                <select className="form-control" defaultValue="B.E. Computer Engineering">
                  <option>B.E. Computer Engineering</option>
                  <option>B.E. Mechanical Engineering</option>
                  <option>B.E. Electronics Engineering</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Semester / Year</label>
                <select className="form-control" defaultValue="Semester IV">
                  <option>Semester IV</option>
                  <option>Semester VI</option>
                </select>
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select className="form-control" defaultValue="Computer Engineering">
                  <option>Computer Engineering</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Regulation</label>
                <select className="form-control" defaultValue="R-2024">
                  <option>R-2024</option>
                  <option>R-2022</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exam Type</label>
                <select className="form-control" defaultValue="Regular">
                  <option>Regular</option>
                  <option>Supplementary</option>
                  <option>Backlog</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Exam Control Mode</label>
            </div>
            <div className="mode-selector">
              {Object.values(MODES).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`mode-card ${mode === m.key ? 'selected' : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  <i className={`fas ${m.icon}`} />
                  <h4>{m.label}</h4>
                  <p>{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <aside>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Exam Name</span>
                <strong>{activeExam.name}</strong>
              </div>
              <div className="summary-item">
                <span className="label">First Paper</span>
                <strong>{activeExam.firstPaper}</strong>
              </div>
              <div className="summary-item">
                <span className="label">Registration Close</span>
                <strong>{activeExam.registrationClose}</strong>
              </div>
              <div className="summary-item">
                <span className="label">Subjects</span>
                <strong>{activeExam.subjects} papers</strong>
              </div>
            </div>

            <div className="task-list mt-4">
              {activationChecklist.map((item) => (
                <div className="task-row" key={item.label}>
                  <div className="task-row-left">
                    <div className="task-icon">
                      <i className={`fas ${item.done ? 'fa-check' : 'fa-clock'}`} />
                    </div>
                    <div className="task-copy">
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </div>
                  </div>
                  <Badge variant={item.done ? 'success' : 'warning'}>
                    {item.done ? 'Ready' : 'Review'}
                  </Badge>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="flex-between mt-4">
          <span className="text-muted" style={{ fontSize: 13 }}>
            Selected mode: <strong>{modeInfo.label}</strong> - {modeInfo.desc}
          </span>
          <button className="btn btn-primary btn-lg" onClick={() => setCreated(true)}>
            <i className="fas fa-check" /> Create &amp; Activate Exam
          </button>
        </div>
      </Card>

      <Card title="Recent Exams" icon="fa-history">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Program</th>
                <th>Sem</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExams.map((e) => (
                <tr key={e.name}>
                  <td>
                    <div className="cell-title">{e.name}</div>
                    <div className="cell-sub">{e.program}</div>
                  </td>
                  <td>{e.program}</td>
                  <td>{e.sem}</td>
                  <td>{e.type}</td>
                  <td>
                    <Badge variant="info">{e.mode}</Badge>
                  </td>
                  <td>
                    <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {created && (
        <Modal
          title="Exam Created Successfully"
          onClose={() => setCreated(false)}
          footer={
            <>
              <button className="btn" onClick={() => setCreated(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setCreated(false)
                  navigate('/eligibility')
                }}
              >
                <i className="fas fa-arrow-right" /> Proceed to Eligibility
              </button>
            </>
          }
        >
          <div className="text-center" style={{ padding: '8px 0' }}>
            <i className="fas fa-check-circle" style={{ fontSize: 44, color: 'var(--success)' }} />
            <p className="text-muted" style={{ marginTop: 12, lineHeight: 1.5 }}>
              {activeExam.name} has been created in <strong>{modeInfo.label}</strong> mode
              and is active for eligible-student generation.
            </p>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
