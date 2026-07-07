import React from 'react'
import { NavLink } from 'react-router-dom'
import { useExam } from '../context/ExamContext.jsx'
import { preExamWorkflow } from '../data/mockData.js'

// Pre-Exam navigation. Each route maps to one feature from section 3
// of the requirement doc. Dashboard/Overview sits above the group.
const PRE_EXAM_LINKS = [
  { to: '/exam-creation', icon: 'fa-plus-circle', label: 'Exam Creation' },
  { to: '/eligibility', icon: 'fa-users', label: 'Eligibility' },
  { to: '/registration', icon: 'fa-file-signature', label: 'Registration' },
  { to: '/timetable', icon: 'fa-calendar-alt', label: 'Timetable' },
  { to: '/hall-ticket', icon: 'fa-ticket-alt', label: 'Hall Ticket' },
  { to: '/seating', icon: 'fa-chair', label: 'Seating Plan' },
  { to: '/invigilator', icon: 'fa-chalkboard-teacher', label: 'Invigilator Duty' },
]

const statusClass = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  violet: 'info',
  neutral: 'neutral',
}

export default function Sidebar() {
  const { activeExam } = useExam()
  const completed = preExamWorkflow.filter((step) => step.progress === 100).length

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-box">
          <i className="fas fa-graduation-cap" />
        </div>
        <div>
          <h2>Examination</h2>
          <span>College ERP System</span>
        </div>
      </div>

      <div className="sidebar-context">
        <span className="eyebrow">Active Exam</span>
        <strong className="context-title">{activeExam.name}</strong>
        <div className="context-meta">
          <i className="fas fa-circle" style={{ color: 'var(--success)', fontSize: 8 }} />
          {activeExam.phase} - {activeExam.academicYear}
        </div>
        <div className="progress mt-2" aria-label={`${activeExam.completion}% pre-exam complete`}>
          <div className="progress-bar" style={{ width: `${activeExam.completion}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Examination Module</div>

        <NavLink to="/" end className="nav-link">
          <i className="fas fa-th-large" />
          <span>Overview</span>
        </NavLink>

        <div className="nav-group-label">Pre-Exam</div>
        {PRE_EXAM_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className="nav-link">
            <i className={`fas ${l.icon}`} />
            <span>{l.label}</span>
            <small
              className={`nav-status ${
                statusClass[preExamWorkflow.find((step) => step.to === l.to)?.statusVariant] ||
                'neutral'
              }`}
              aria-hidden="true"
            />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-progress">
          <div className="sidebar-progress-row">
            <span>Workflow</span>
            <strong>
              {completed}/{preExamWorkflow.length}
            </strong>
          </div>
          <div className="progress">
            <div
              className="progress-bar success"
              style={{ width: `${(completed / preExamWorkflow.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
