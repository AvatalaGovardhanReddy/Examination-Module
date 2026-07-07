import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import {
  eligibilityRules,
  students,
  subjectWiseEligibility,
  isEligible,
} from '../data/mockData.js'

export default function Eligibility() {
  const { mode, activeExam } = useExam()
  const toast = useToast()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(() =>
    students.filter(isEligible).map((s) => s.id),
  )

  const eligibleCount = students.filter(isEligible).length
  const notEligibleCount = students.length - eligibleCount

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function reasonFor(student) {
    if (student.status === 'Detained') return 'Detained'
    if (student.attendance < 75) return 'Attendance shortage'
    if (student.fee === 'Pending') return 'Fee warning'
    return 'Rule checks clear'
  }

  return (
    <Layout title="Eligible Student Generation" breadcrumb="Pre-Exam / Eligibility">
      <Alert variant="info">
        Eligibility checks use course registration, attendance, detained status and
        optional fee holds from the ERP.
        {mode !== 'autonomous' &&
          ' University exam-form export is enabled for the approved list.'}
      </Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-user-check" />
          </div>
          <div className="label">Eligible</div>
          <div className="value">{activeExam.eligibleStudents}</div>
          <div className="sub">Students available for registration</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-user-clock" />
          </div>
          <div className="label">Pending Review</div>
          <div className="value">{activeExam.totalStudents - activeExam.eligibleStudents}</div>
          <div className="sub">Attendance, detained or fee warning cases</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-list-check" />
          </div>
          <div className="label">Selected Sample</div>
          <div className="value">{selected.length}/{students.length}</div>
          <div className="sub">Rows selected in the visible review list</div>
        </div>
      </div>

      <div className="split-grid">
        <Card title="Eligibility Rule Stack" icon="fa-shield-halved">
          <div className="task-list">
            {eligibilityRules.map((rule) => (
              <div className="task-row" key={rule.label}>
                <div className="task-row-left">
                  <div className="task-icon">
                    <i className={`fas ${rule.icon}`} />
                  </div>
                  <div className="task-copy">
                    <strong>{rule.label}</strong>
                    <span>{rule.value}</span>
                  </div>
                </div>
                <Badge variant={rule.state === 'Active' ? 'success' : 'warning'}>
                  {rule.state}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Subject-Wise Output" icon="fa-book-open">
          <div className="task-list">
            {subjectWiseEligibility.map((item) => (
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

      <div className="filter-bar mt-4">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>
        <span className="chip">
          <i className="fas fa-check-circle" style={{ color: 'var(--success)' }} />{' '}
          {eligibleCount} eligible in sample
        </span>
        <span className="chip">
          <i className="fas fa-times-circle" style={{ color: 'var(--danger)' }} />{' '}
          {notEligibleCount} needs review
        </span>
        <span className="chip">
          <i className="fas fa-clock" /> Attendance 75% minimum
        </span>
        {mode !== 'autonomous' && (
          <button
            className="btn btn-sm"
            onClick={() => toast('Eligible list exported for university exam form')}
          >
            <i className="fas fa-file-export" /> Export for University
          </button>
        )}
        <button
          className="btn btn-primary btn-sm ml-auto"
          onClick={() => toast('Eligible list re-generated')}
        >
          <i className="fas fa-sync" /> Regenerate
        </button>
      </div>

      <Card
        title="Eligible / Not Eligible Student List"
        icon="fa-users"
        actions={
          <div className="btn-group">
            <button className="btn btn-sm" onClick={() => toast('Eligible list exported')}>
              <i className="fas fa-download" /> Export
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                toast('Eligible list approved and locked')
                navigate('/registration')
              }}
            >
              <i className="fas fa-check" /> Approve &amp; Proceed
            </button>
          </div>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Attendance</th>
                <th>Subjects</th>
                <th>ERP Status</th>
                <th>Eligibility</th>
                <th>Reason</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const eligible = isEligible(s)
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="cell-title">{s.name}</div>
                      <div className="cell-sub">{s.id}</div>
                    </td>
                    <td>{s.program}</td>
                    <td>{s.attendance}%</td>
                    <td>{s.subjects}</td>
                    <td>
                      <Badge variant={s.status === 'Active' ? 'success' : 'danger'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={eligible ? 'success' : 'danger'}>
                        {eligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted">{reasonFor(s)}</span>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        disabled={!eligible}
                        onChange={() => toggle(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  )
}
