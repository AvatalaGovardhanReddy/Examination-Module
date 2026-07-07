import React, { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import {
  hallTickets as seededHallTickets,
  initialTimetable,
  registrationRows,
} from '../data/mockData.js'

const STATUS_VARIANT = {
  Generated: 'success',
  Imported: 'info',
  Uploaded: 'violet',
  Published: 'success',
  'Fee Hold': 'warning',
}

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function nextTicketNo(index) {
  return `HT26CS401${String(index + 1).padStart(3, '0')}`
}

export default function HallTicket() {
  const { mode, activeExam } = useExam()
  const toast = useToast()
  const [tickets, setTickets] = useState(seededHallTickets)
  const [showCreate, setShowCreate] = useState(false)
  const [viewTicket, setViewTicket] = useState(null)
  const [published, setPublished] = useState(false)
  const isAffiliated = mode === 'affiliated'
  const usesUniversityData = mode !== 'autonomous'

  const generatedCount = tickets.filter((ticket) =>
    ['Generated', 'Imported', 'Uploaded', 'Published'].includes(ticket.status),
  ).length
  const blockedCount = tickets.filter((ticket) => ticket.status === 'Fee Hold').length
  const previewTicket =
    viewTicket ||
    tickets.find((ticket) => ticket.status !== 'Fee Hold') ||
    tickets[0]

  const workflowSteps = [
    {
      label: 'Select Exam',
      detail: activeExam.name,
      icon: 'fa-list',
      state: 'Selected',
      variant: 'success',
    },
    {
      label: 'Fetch Registered Students',
      detail: `${activeExam.registeredStudents} registered students`,
      icon: 'fa-users',
      state: 'Ready',
      variant: 'success',
    },
    {
      label: usesUniversityData ? 'Import Hall Ticket Data' : 'Generate Hall Ticket Data',
      detail: usesUniversityData
        ? 'University numbers or PDFs mapped to ERP IDs'
        : 'ERP number and QR generation enabled',
      icon: usesUniversityData ? 'fa-file-import' : 'fa-wand-magic-sparkles',
      state: usesUniversityData ? 'Import' : 'Generate',
      variant: usesUniversityData ? 'violet' : 'info',
    },
    {
      label: usesUniversityData ? 'Upload Hall Ticket' : 'Create Hall Ticket',
      detail: 'Student details, exam dates, sessions and instructions',
      icon: usesUniversityData ? 'fa-upload' : 'fa-id-card',
      state: 'Prepared',
      variant: 'info',
    },
    {
      label: 'Publish to Student Portal',
      detail: published ? 'Portal publishing completed' : 'Waiting for final publish',
      icon: 'fa-cloud-arrow-up',
      state: published ? 'Published' : 'Pending',
      variant: published ? 'success' : 'warning',
    },
  ]

  const modeAlert = isAffiliated
    ? 'Affiliated mode imports university hall ticket numbers or university-provided PDFs and maps them to students.'
    : mode === 'hybrid'
      ? 'Hybrid mode generates college-controlled hall tickets and imports university data for external papers.'
      : 'Autonomous mode generates hall ticket numbers, PDFs and verification codes directly in ERP.'

  function fetchRegisteredStudents() {
    toast(`${registrationRows.length} sample registered students fetched`)
  }

  function generateHallTickets() {
    setTickets((current) =>
      current.map((ticket, index) =>
        ticket.status === 'Fee Hold'
          ? ticket
          : {
              ...ticket,
              hallTicket: ticket.hallTicket === 'On Hold' ? nextTicketNo(index) : ticket.hallTicket,
              status: 'Generated',
              delivery: 'Portal Ready',
            },
      ),
    )
    setPublished(false)
    toast('Hall ticket numbers, PDFs and QR codes generated')
  }

  function importUniversityData() {
    setTickets((current) =>
      current.map((ticket, index) =>
        ticket.status === 'Fee Hold'
          ? ticket
          : {
              ...ticket,
              hallTicket: `UNI26-${String(index + 1).padStart(5, '0')}`,
              status: 'Imported',
              delivery: 'Mapped',
            },
      ),
    )
    setPublished(false)
    toast('University hall ticket data imported and mapped')
  }

  function createOrUploadTickets() {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.status === 'Fee Hold'
          ? ticket
          : {
              ...ticket,
              status: usesUniversityData ? 'Uploaded' : 'Generated',
              delivery: usesUniversityData ? 'PDF Uploaded' : 'Portal Ready',
            },
      ),
    )
    setShowCreate(false)
    setPublished(false)
    toast(usesUniversityData ? 'University hall ticket PDFs uploaded' : 'Hall ticket PDFs created')
  }

  function publishToPortal() {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.status === 'Fee Hold'
          ? ticket
          : {
              ...ticket,
              status: 'Published',
              delivery: 'Student Portal',
            },
      ),
    )
    setPublished(true)
    toast('Hall tickets published to student portal')
  }

  return (
    <Layout title="Hall Ticket Management" breadcrumb="Pre-Exam / Hall Ticket">
      <Alert variant="info">{modeAlert}</Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-ticket" />
          </div>
          <div className="label">Created</div>
          <div className="value">{generatedCount}</div>
          <div className="sub">Hall ticket records ready or published</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-lock" />
          </div>
          <div className="label">Blocked</div>
          <div className="value">{blockedCount}</div>
          <div className="sub">Fee holds awaiting clearance</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-qrcode" />
          </div>
          <div className="label">Verification</div>
          <div className="value">QR</div>
          <div className="sub">Hall tickets include QR-ready validation data</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className={usesUniversityData ? 'fas fa-file-import' : 'fas fa-file-pdf'} />
          </div>
          <div className="label">{usesUniversityData ? 'University Data' : 'ERP PDF'}</div>
          <div className="value">{usesUniversityData ? 'Map' : 'Create'}</div>
          <div className="sub">
            {usesUniversityData ? 'Import numbers or PDFs' : 'Generate PDFs in ERP'}
          </div>
        </div>
      </div>

      <Card title="Hall Ticket Creation Workflow" icon="fa-route">
        <div className="workflow-track">
          {workflowSteps.map((step, index) => (
            <div className="workflow-step-card" key={step.label}>
              <div className="step-topline">
                <div className="step-index">{index + 1}</div>
                <div className="step-copy">
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </div>
              </div>
              <p className="step-description">
                <i className={`fas ${step.icon}`} /> {step.state}
              </p>
              <Badge variant={step.variant}>{step.state}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="filter-bar mt-4">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>
        <button className="btn btn-sm" onClick={fetchRegisteredStudents}>
          <i className="fas fa-users" /> Fetch Registered Students
        </button>
        {!usesUniversityData && (
          <button className="btn btn-primary btn-sm" onClick={generateHallTickets}>
            <i className="fas fa-wand-magic-sparkles" /> Generate Data
          </button>
        )}
        {usesUniversityData && (
          <button
            className={`btn btn-sm ${isAffiliated ? 'btn-primary' : ''}`}
            onClick={importUniversityData}
          >
            <i className="fas fa-file-import" /> Import University Data
          </button>
        )}
        <button className="btn btn-sm" onClick={() => setShowCreate(true)}>
          <i className={usesUniversityData ? 'fas fa-upload' : 'fas fa-id-card'} />{' '}
          {usesUniversityData ? 'Upload Hall Ticket' : 'Create Hall Ticket'}
        </button>
        <button className="btn btn-success btn-sm ml-auto" onClick={publishToPortal}>
          <i className="fas fa-cloud-arrow-up" /> Publish to Portal
        </button>
      </div>

      <div className="split-grid">
        <Card title="Hall Ticket Preview" icon="fa-id-card">
          <div className="ticket-preview">
            <div className="ticket-preview-header">
              <div>
                <h4>{activeExam.name}</h4>
                <div style={{ fontSize: 12, opacity: 0.78 }}>{activeExam.program}</div>
              </div>
              <Badge variant={STATUS_VARIANT[previewTicket.status] || 'info'}>
                {previewTicket.status}
              </Badge>
            </div>
            <div className="ticket-preview-body">
              <div className="ticket-lines">
                <div className="ticket-line">
                  <span>Student</span>
                  <strong>{previewTicket.name}</strong>
                </div>
                <div className="ticket-line">
                  <span>Student ID</span>
                  <strong>{previewTicket.id}</strong>
                </div>
                <div className="ticket-line">
                  <span>Hall Ticket No.</span>
                  <strong>{previewTicket.hallTicket}</strong>
                </div>
                <div className="ticket-line">
                  <span>First Paper</span>
                  <strong>
                    {initialTimetable[0].code} - {fmtDate(initialTimetable[0].date)}
                  </strong>
                </div>
                <div className="ticket-line">
                  <span>Session</span>
                  <strong>{initialTimetable[0].time}</strong>
                </div>
                <div className="ticket-line">
                  <span>Instructions</span>
                  <strong>Carry ID card and report 30 min early</strong>
                </div>
                <div className="subject-list">
                  {initialTimetable.slice(0, 4).map((paper) => (
                    <span className="subject-pill" key={paper.code}>
                      {paper.code}
                    </span>
                  ))}
                </div>
              </div>
              <div className="qr-grid" aria-label="QR code preview">
                {Array.from({ length: 36 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Publish Readiness" icon="fa-list-check">
          <div className="task-list">
            <div className="task-row">
              <div className="task-copy">
                <strong>Registered students fetched</strong>
                <span>{activeExam.registeredStudents} final registrations available</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Hall ticket data prepared</strong>
                <span>
                  {usesUniversityData
                    ? 'University hall ticket data can be imported'
                    : 'ERP generation is available for this exam'}
                </span>
              </div>
              <Badge variant={generatedCount ? 'success' : 'warning'}>
                {generatedCount ? 'Ready' : 'Pending'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Fee holds cleared</strong>
                <span>{blockedCount} visible sample student(s) still blocked</span>
              </div>
              <Badge variant={blockedCount ? 'warning' : 'success'}>
                {blockedCount ? 'Pending' : 'Ready'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Portal publishing</strong>
                <span>{published ? 'Published for student download' : 'Awaiting publish action'}</span>
              </div>
              <Badge variant={published ? 'success' : 'warning'}>
                {published ? 'Published' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Hall Tickets"
        icon="fa-ticket-alt"
        actions={<span className="text-muted">Total: {activeExam.registeredStudents}</span>}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Hall Ticket No.</th>
                <th>Program</th>
                <th>Status</th>
                <th>Delivery</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div className="cell-title">{ticket.name}</div>
                    <div className="cell-sub">{ticket.id}</div>
                  </td>
                  <td>{ticket.hallTicket}</td>
                  <td>{activeExam.program}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[ticket.status] || 'info'}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-muted">{ticket.delivery}</span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm" onClick={() => setViewTicket(ticket)}>
                        <i className="fas fa-eye" /> View
                      </button>
                      <button
                        className="btn btn-sm"
                        disabled={ticket.status === 'Fee Hold'}
                        onClick={() => toast(`Downloading ${ticket.hallTicket}`)}
                      >
                        <i className="fas fa-download" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreate && (
        <Modal
          title={usesUniversityData ? 'Upload Hall Ticket Data' : 'Create Hall Tickets'}
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createOrUploadTickets}>
                <i className={usesUniversityData ? 'fas fa-upload' : 'fas fa-id-card'} />{' '}
                {usesUniversityData ? 'Upload & Map' : 'Create PDFs'}
              </button>
            </>
          }
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Exam</span>
              <strong>{activeExam.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Students</span>
              <strong>{activeExam.registeredStudents}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Source</span>
              <strong>{usesUniversityData ? 'University Import' : 'ERP Generator'}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Verification</span>
              <strong>QR Code</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            <div className="task-row">
              <div className="task-copy">
                <strong>Student details</strong>
                <span>Name, ID, program, branch and semester are included.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Exam schedule</strong>
                <span>Subject list, exam dates, sessions and timings are attached.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Instructions and verification</strong>
                <span>Portal PDF will include instructions and QR validation data.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
          </div>
        </Modal>
      )}

      {viewTicket && (
        <Modal
          title="Hall Ticket Details"
          onClose={() => setViewTicket(null)}
          footer={
            <>
              <button className="btn" onClick={() => setViewTicket(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={viewTicket.status === 'Fee Hold'}
                onClick={() => toast(`Downloading ${viewTicket.hallTicket}`)}
              >
                <i className="fas fa-download" /> Download PDF
              </button>
            </>
          }
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Student</span>
              <strong>{viewTicket.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Hall Ticket No.</span>
              <strong>{viewTicket.hallTicket}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Exam</span>
              <strong>{activeExam.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Delivery</span>
              <strong>{viewTicket.delivery}</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            {initialTimetable.slice(0, activeExam.subjects).map((paper) => (
              <div className="task-row" key={paper.code}>
                <div className="task-copy">
                  <strong>
                    {paper.code} - {paper.subject}
                  </strong>
                  <span>
                    {fmtDate(paper.date)} / {paper.session} / {paper.time}
                  </span>
                </div>
                <Badge variant={paper.published ? 'success' : 'warning'}>
                  {paper.published ? 'Published' : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </Layout>
  )
}
