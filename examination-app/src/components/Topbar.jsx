import { useExam } from '../context/ExamContext.jsx'
import { activeExam } from '../data/mockData.js'

// Top bar shows the current page title, a breadcrumb, and the active
// Exam Control Mode badge (kept in sync via ExamContext).
export default function Topbar({ title, breadcrumb }) {
  const { modeInfo } = useExam()
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
          <option>{activeExam.name}</option>
          <option>Sem VI Regular Nov 2026</option>
          <option>Sem II Supplementary Jun 2026</option>
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
