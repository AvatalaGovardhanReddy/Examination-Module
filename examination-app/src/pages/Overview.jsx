import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useExam, MODES } from '../context/ExamContext.jsx'
import { preExamWorkflow, subjectWiseEligibility } from '../data/mockData.js'

const sourceReadiness = [
  { label: 'Student master', detail: 'ERP course registration synced', icon: 'fa-user-graduate', state: 'Ready' },
  { label: 'Academic structure', detail: 'R-2024 semester IV mapped', icon: 'fa-layer-group', state: 'Ready' },
  { label: 'Room master', detail: '5 available venues loaded', icon: 'fa-door-open', state: 'Ready' },
  { label: 'Faculty master', detail: '5 faculty available for duty', icon: 'fa-id-card', state: 'Review' },
]

const modeNotes = {
  autonomous: 'College branch owns timetable, hall ticket, seating, duty chart and publishing.',
  affiliated: 'University data import/export is active for timetable, hall ticket and approval files.',
  hybrid: 'Internal papers stay college-controlled while external papers track university files.',
}

export default function Overview() {
  const { mode, setMode, modeInfo, activeExam } = useExam()

  return (
    <Layout title="Pre-Exam Command Center" breadcrumb="Overview">
      <div className="phase-bar">
        <div className="phase active">
          <span>
            <i className="fas fa-calendar-check" /> Pre-Exam
          </span>
        </div>
        <div className="phase">
          <span>
            <i className="fas fa-pen-alt" /> In-Exam
          </span>
        </div>
        <div className="phase">
          <span>
            <i className="fas fa-check-double" /> Post-Exam
          </span>
        </div>
      </div>

      <section className="workspace-banner">
        <div>
          <div className="workspace-title">
            <div className="workspace-icon">
              <i className="fas fa-clipboard-check" />
            </div>
            <div>
              <h2>{activeExam.name}</h2>
              <p>
                {activeExam.program} - {activeExam.semester} - {activeExam.regulation}
              </p>
            </div>
          </div>
          <p className="workspace-copy">
            Active planning cycle for exam creation, eligibility, registration,
            timetable, hall ticket, seating and invigilator duty.
          </p>
          <div className="workspace-actions">
            <Link className="btn btn-primary" to="/registration">
              <i className="fas fa-file-signature" /> Continue Registration
            </Link>
            <Link className="btn" to="/timetable">
              <i className="fas fa-calendar-alt" /> Review Timetable
            </Link>
          </div>
        </div>

        <div className="workspace-status-panel">
          <div className="flex-between">
            <Badge variant="success">{activeExam.status}</Badge>
            <span className="status-line">
              <span className="status-dot success" /> {activeExam.phase}
            </span>
          </div>
          <div>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <strong>{activeExam.completion}% ready</strong>
              <span className="text-muted" style={{ fontSize: 12 }}>
                First paper: {activeExam.firstPaper}
              </span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${activeExam.completion}%` }} />
            </div>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Academic Year</span>
              <strong>{activeExam.academicYear}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Registration Close</span>
              <strong>{activeExam.registrationClose}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-users" />
          </div>
          <div className="label">Eligible Students</div>
          <div className="metric-row">
            <div className="value">{activeExam.eligibleStudents}</div>
            <span className="metric-trend">95.1%</span>
          </div>
          <div className="sub">Out of {activeExam.totalStudents} course-registered students</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-receipt" />
          </div>
          <div className="label">Fee Holds</div>
          <div className="value">{activeExam.feePending}</div>
          <div className="sub">Needs clearance before final hall ticket publish</div>
        </div>
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-calendar-day" />
          </div>
          <div className="label">Published Papers</div>
          <div className="value">5/6</div>
          <div className="sub">One mathematics slot remains in scheduled state</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className="fas fa-chair" />
          </div>
          <div className="label">Seating Capacity</div>
          <div className="value">260</div>
          <div className="sub">{activeExam.totalStudents} seats allocated across {activeExam.rooms} rooms</div>
        </div>
      </div>

      <Card title="Examination Control Mode" icon="fa-sliders-h">
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
        <Alert variant="info">
          <strong>{modeInfo.label} mode:</strong> {modeNotes[mode]}
        </Alert>
      </Card>

      <Card title="Pre-Exam Workflow" icon="fa-route">
        <div className="workflow-track">
          {preExamWorkflow.map((step, index) => (
            <Link key={step.key} to={step.to} className="workflow-step-card">
              <div className="step-topline">
                <div className="step-index">{index + 1}</div>
                <div className="step-copy">
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </div>
              </div>
              <p className="step-description">{step.desc}</p>
              <div className="flex-between">
                <Badge variant={step.statusVariant}>{step.status}</Badge>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {step.progress}%
                </span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${step.statusVariant}`}
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="equal-grid mt-4">
        <Card title="ERP Source Readiness" icon="fa-database">
          <div className="task-list">
            {sourceReadiness.map((item) => (
              <div className="task-row" key={item.label}>
                <div className="task-row-left">
                  <div className="task-icon">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div className="task-copy">
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
                <Badge variant={item.state === 'Ready' ? 'success' : 'warning'}>{item.state}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Subject-Wise Eligibility Snapshot" icon="fa-book-open">
          <div className="task-list">
            {subjectWiseEligibility.slice(0, 4).map((item) => (
              <div className="task-row" key={item.code}>
                <div className="task-copy">
                  <strong>{item.code}</strong>
                  <span>{item.subject}</span>
                </div>
                <div className="text-center">
                  <strong>{item.eligible}</strong>
                  <div className="cell-sub">{item.backlog} backlog</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
