import React from 'react'
import { useExam } from '../context/ExamContext.jsx'

// Top bar shows the current page title, a breadcrumb, and the active
// Exam Control Mode badge (kept in sync via ExamContext).
export default function Topbar({ title, breadcrumb }) {
  const { modeInfo, recentExams } = useExam()
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        <div className="breadcrumb">
          Examination / <span>{breadcrumb || title}</span>
        </div>
      </div>
      <div className="topbar-right">
        <select className="topbar-select" aria-label="Active examination">
          {recentExams.map((exam) => (
            <option key={exam.name}>{exam.name}</option>
          ))}
        </select>
        <button className="topbar-icon-btn" type="button" aria-label="Sync ERP data">
          <i className="fas fa-rotate" />
        </button>
        <button className="topbar-icon-btn" type="button" aria-label="Notifications">
          <i className="fas fa-bell" />
        </button>
        <span className="mode-badge">
          <i className={`fas ${modeInfo.icon}`} /> {modeInfo.label} Mode
        </span>
      </div>
    </header>
  )
}
