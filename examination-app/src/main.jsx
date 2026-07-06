import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ExamProvider } from './context/ExamContext.jsx'
import './index.css'

// App entry point. ExamProvider holds the global Exam Control Mode
// (Autonomous / Affiliated / Hybrid), which many Pre-Exam pages read
// to decide which actions/columns to show.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ExamProvider>
        <App />
      </ExamProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
