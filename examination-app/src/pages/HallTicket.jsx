import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { activeExam, hallTickets, initialTimetable } from '../data/mockData.js'

const STATUS_VARIANT = {
  Generated: 'success',
  'Fee Hold': 'warning',
}

export default function HallTicket() {
  const { mode } = useExam()
  const toast = useToast()
  const isAffiliated = mode === 'affiliated'

  const modeAlert = isAffiliated
    ? 'Affiliated mode imports university hall ticket numbers or PDFs and maps them to ERP students.'
    : mode === 'hybrid'
      ? 'Hybrid mode generates internal hall tickets in ERP and imports university data for external papers.'
      : 'Autonomous mode generates hall ticket numbers, PDFs and verification codes directly in ERP.'

  return (
    <Layout title="Hall Ticket Management" breadcrumb="Pre-Exam / Hall Ticket">
      <Alert variant="info">{modeAlert}</Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-ticket" />
          </div>
          <div className="label">Generated</div>
          <div className="value">228</div>
          <div className="sub">PDFs ready for student portal publishing</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-lock" />
          </div>
          <div className="label">Blocked</div>
          <div className="value">{activeExam.feePending}</div>
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
      </div>

      <div className="filter-bar">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>
        {!isAffiliated && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => toast('Hall tickets generated for eligible students')}
          >
            <i className="fas fa-magic" /> Generate All
          </button>
        )}
        {mode !== 'autonomous' && (
          <button
            className={`btn btn-sm ${isAffiliated ? 'btn-primary' : ''}`}
            onClick={() => toast('University hall tickets imported')}
          >
            <i className="fas fa-upload" /> Import University Hall Tickets
          </button>
        )}
        <button
          className="btn btn-sm ml-auto"
          onClick={() => toast('Hall tickets published to student portal')}
        >
          <i className="fas fa-check" /> Publish to Portal
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
              <Badge variant="success">Generated</Badge>
            </div>
            <div className="ticket-preview-body">
              <div className="ticket-lines">
                <div className="ticket-line">
                  <span>Student</span>
                  <strong>Aarav Sharma</strong>
                </div>
                <div className="ticket-line">
                  <span>Hall Ticket No.</span>
                  <strong>HT26CS401001</strong>
                </div>
                <div className="ticket-line">
                  <span>First Paper</span>
                  <strong>{initialTimetable[0].code} - {initialTimetable[0].date}</strong>
                </div>
                <div className="ticket-line">
                  <span>Session</span>
                  <strong>{initialTimetable[0].time}</strong>
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
                <strong>Timetable published</strong>
                <span>5 of 6 subjects are published</span>
              </div>
              <Badge variant="warning">Review</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Eligible list approved</strong>
                <span>Eligible students locked for registration</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Fee holds cleared</strong>
                <span>{activeExam.feePending} students still blocked</span>
              </div>
              <Badge variant="warning">Pending</Badge>
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
              {hallTickets.map((ticket) => (
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
                    <button
                      className="btn btn-sm"
                      disabled={ticket.status !== 'Generated'}
                      onClick={() => toast(`Downloading ${ticket.hallTicket}`)}
                    >
                      <i className="fas fa-download" /> PDF
                    </button>
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
