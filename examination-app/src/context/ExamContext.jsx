import React, { createContext, useContext, useState } from 'react'
import { staticExamStore } from '../data/examStore.js'

// ============================================================
// EXAM CONTROL MODE - global state
// The spec's "Examination Control Mode" (Autonomous / Affiliated /
// Hybrid) is chosen at exam creation and changes what several
// Pre-Exam pages show (e.g. "Create Timetable" vs "Import University
// Timetable"). Keeping it in context lets every page read the same
// value and lets the top bar reflect the active mode.
// ============================================================
export const MODES = {
  autonomous: {
    key: 'autonomous',
    label: 'Autonomous',
    icon: 'fa-university',
    desc: 'Full exam cycle managed by the college',
  },
  affiliated: {
    key: 'affiliated',
    label: 'Affiliated',
    icon: 'fa-building',
    desc: 'University-controlled exam process',
  },
  hybrid: {
    key: 'hybrid',
    label: 'Hybrid',
    icon: 'fa-handshake',
    desc: 'College + University combined',
  },
}

const ExamContext = createContext(null)

export function ExamProvider({ children }) {
  const [mode, setMode] = useState('autonomous')
  const [activeExam, setActiveExam] = useState(staticExamStore.activeExam)
  const [recentExams, setRecentExams] = useState(staticExamStore.recentExams)

  function createExam(details) {
    const modeInfo = MODES[mode]
    const saved = staticExamStore.saveExam(details, modeInfo)
    setActiveExam(saved.activeExam)
    setRecentExams(saved.recentExams)
    return saved.activeExam
  }

  const value = {
    mode,
    setMode,
    modeInfo: MODES[mode],
    activeExam,
    recentExams,
    createExam,
  }
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>
}

export function useExam() {
  return useContext(ExamContext)
}
