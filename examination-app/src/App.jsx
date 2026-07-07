import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast.jsx'

import Overview from './pages/Overview.jsx'
import ExamCreation from './pages/ExamCreation.jsx'
import Eligibility from './pages/Eligibility.jsx'
import Registration from './pages/Registration.jsx'
import Timetable from './pages/Timetable.jsx'
import HallTicket from './pages/HallTicket.jsx'
import Seating from './pages/Seating.jsx'
import Invigilator from './pages/Invigilator.jsx'

// Route table - one route per Pre-Exam feature (doc section 3.1-3.7),
// plus the Overview landing page (intro + control modes).
export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/exam-creation" element={<ExamCreation />} />
        <Route path="/eligibility" element={<Eligibility />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/hall-ticket" element={<HallTicket />} />
        <Route path="/seating" element={<Seating />} />
        <Route path="/invigilator" element={<Invigilator />} />
      </Routes>
    </ToastProvider>
  )
}
