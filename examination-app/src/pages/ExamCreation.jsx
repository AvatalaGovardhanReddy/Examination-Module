import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam, MODES } from '../context/ExamContext.jsx'
import {
  basicExamDefaults,
  basicExamOptions,
  createExamRecord,
  suggestExamCode,
  suggestExamName,
} from '../data/examStore.js'

const STATUS_VARIANT = { Active: 'success', 'Pre-Exam': 'warning', Closed: 'danger' }

const activationChecklist = [
  { label: 'Basic exam details ready', detail: 'Name, code, program and schedule', done: true },
  { label: 'Academic structure mapped', detail: 'Program, semester, branch and regulation', done: true },
  { label: 'Control mode selected', detail: 'Controls import/export and local actions', done: true },
  { label: 'Registration window reviewed', detail: 'Deadline and fee hold policy', done: false },
]

export default function ExamCreation() {
  const { mode, setMode, modeInfo, activeExam, recentExams, createExam } = useExam()
  const [form, setForm] = useState(() => ({ ...basicExamDefaults }))
  const [detailsOpen, setDetailsOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const previewExam = createExamRecord(form, modeInfo, activeExam)

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function useSuggestedDetails() {
    setForm((prev) => ({
      ...prev,
      examName: suggestExamName(prev),
      examCode: suggestExamCode(prev),
    }))
  }

  function handleCreateExam(event) {
    event.preventDefault()
    const savedExam = createExam(form)
    toast(`${savedExam.name} created. Opening eligibility.`)
    navigate('/eligibility')
  }

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
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => toast('Draft saved')}
            >
              <i className="fas fa-save" /> Save Draft
            </button>
            <button type="button" className="btn btn-sm" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Overview
            </button>
          </div>
        }
      >
        {!detailsOpen ? (
          <>
            <div className="split-grid">
              <div>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Exam Name</span>
                    <strong>{previewExam.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="label">Exam Code</span>
                    <strong>{previewExam.code}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="label">Academic Year</span>
                    <strong>{previewExam.academicYear}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="label">Program</span>
                    <strong>{previewExam.program}</strong>
                  </div>
                </div>

                <div className="form-group mt-4">
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
                <div className="task-list">
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
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setDetailsOpen(true)}
              >
                <i className="fas fa-check" /> Create &amp; Activate Exam
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateExam}>
            <div className="split-grid">
              <div>
                <div className="flex-between mb-4">
                  <h4 className="section-title" style={{ marginBottom: 0 }}>
                    <i className="fas fa-clipboard-list" /> Basic Exam Details
                  </h4>
                  <div className="btn-group">
                    <button type="button" className="btn btn-sm" onClick={useSuggestedDetails}>
                      <i className="fas fa-wand-magic-sparkles" /> Suggested
                    </button>
                    <button type="button" className="btn btn-sm" onClick={() => setDetailsOpen(false)}>
                      <i className="fas fa-arrow-left" /> Back
                    </button>
                  </div>
                </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="examName">Exam Name</label>
                  <input
                    id="examName"
                    name="examName"
                    className="form-control"
                    value={form.examName}
                    onChange={updateField}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="examCode">Exam Code</label>
                  <input
                    id="examCode"
                    name="examCode"
                    className="form-control"
                    value={form.examCode}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year</label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    className="form-control"
                    value={form.academicYear}
                    onChange={updateField}
                  >
                    {basicExamOptions.academicYears.map((year) => (
                      <option key={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="program">Program</label>
                  <select
                    id="program"
                    name="program"
                    className="form-control"
                    value={form.program}
                    onChange={updateField}
                  >
                    {basicExamOptions.programs.map((program) => (
                      <option key={program}>{program}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="semester">Semester / Year</label>
                  <select
                    id="semester"
                    name="semester"
                    className="form-control"
                    value={form.semester}
                    onChange={updateField}
                  >
                    {basicExamOptions.semesters.map((semester) => (
                      <option key={semester}>{semester}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <select
                    id="branch"
                    name="branch"
                    className="form-control"
                    value={form.branch}
                    onChange={updateField}
                  >
                    {basicExamOptions.branches.map((branch) => (
                      <option key={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="regulation">Regulation</label>
                  <select
                    id="regulation"
                    name="regulation"
                    className="form-control"
                    value={form.regulation}
                    onChange={updateField}
                  >
                    {basicExamOptions.regulations.map((regulation) => (
                      <option key={regulation}>{regulation}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="examType">Exam Type</label>
                  <select
                    id="examType"
                    name="examType"
                    className="form-control"
                    value={form.examType}
                    onChange={updateField}
                  >
                    {basicExamOptions.examTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="registrationCloseDate">Registration Close</label>
                  <input
                    id="registrationCloseDate"
                    name="registrationCloseDate"
                    type="date"
                    className="form-control"
                    value={form.registrationCloseDate}
                    onChange={updateField}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="firstPaperDate">First Paper</label>
                  <input
                    id="firstPaperDate"
                    name="firstPaperDate"
                    type="date"
                    className="form-control"
                    value={form.firstPaperDate}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subjects">Subjects</label>
                  <input
                    id="subjects"
                    name="subjects"
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.subjects}
                    onChange={updateField}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalStudents">Course Registrations</label>
                  <input
                    id="totalStudents"
                    name="totalStudents"
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.totalStudents}
                    onChange={updateField}
                    required
                  />
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
                  <strong>{previewExam.name}</strong>
                </div>
                <div className="summary-item">
                  <span className="label">Exam Code</span>
                  <strong>{previewExam.code}</strong>
                </div>
                <div className="summary-item">
                  <span className="label">First Paper</span>
                  <strong>{previewExam.firstPaper}</strong>
                </div>
                <div className="summary-item">
                  <span className="label">Registration Close</span>
                  <strong>{previewExam.registrationClose}</strong>
                </div>
                <div className="summary-item">
                  <span className="label">Subjects</span>
                  <strong>{previewExam.subjects} papers</strong>
                </div>
                <div className="summary-item">
                  <span className="label">Eligible Estimate</span>
                  <strong>{previewExam.eligibleStudents} students</strong>
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
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="fas fa-check" /> Create &amp; Activate Exam
              </button>
            </div>
          </form>
        )}
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
              {recentExams.map((exam) => (
                <tr key={exam.name}>
                  <td>
                    <div className="cell-title">{exam.name}</div>
                    <div className="cell-sub">{exam.program}</div>
                  </td>
                  <td>{exam.program}</td>
                  <td>{exam.sem}</td>
                  <td>{exam.type}</td>
                  <td>
                    <Badge variant="info">{exam.mode}</Badge>
                  </td>
                  <td>
                    <Badge variant={STATUS_VARIANT[exam.status]}>{exam.status}</Badge>
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
