import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { activeExam, initialTimetable, subjects, timetableChecks } from '../data/mockData.js'

function fmtDate(iso) {
  if (!iso) return 'TBD'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dateParts(iso) {
  const d = new Date(iso + 'T00:00:00')
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

export default function Timetable() {
  const { mode } = useExam()
  const toast = useToast()
  const isAffiliated = mode === 'affiliated'

  const [slots, setSlots] = useState(initialTimetable)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    date: '2026-11-22',
    session: 'Morning',
    code: subjects[0].code,
    time: '10:00 - 12:00',
    duration: '2 hrs',
  })

  const published = slots.filter((slot) => slot.published).length

  const modeAlert = isAffiliated
    ? 'Affiliated mode accepts the university-released timetable through import or manual entry.'
    : mode === 'hybrid'
      ? 'Hybrid mode supports ERP-created internal slots and imported university external slots.'
      : 'Autonomous mode creates, validates and publishes the timetable directly in ERP.'

  function addSlot() {
    const subject = subjects.find((s) => s.code === form.code)
    setSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: form.date,
        session: form.session,
        code: form.code,
        subject: subject ? subject.name : form.code,
        time: form.time || 'TBD',
        duration: form.duration || 'TBD',
        published: false,
      },
    ])
    setShowAdd(false)
    toast(`Slot added for ${subject ? subject.name : form.code}`)
  }

  function publishAll() {
    setSlots((prev) => prev.map((s) => ({ ...s, published: true })))
    toast('Timetable published')
  }

  return (
    <Layout title="Exam Scheduling / Timetable" breadcrumb="Pre-Exam / Timetable">
      <Alert variant="info">{modeAlert}</Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-calendar-check" />
          </div>
          <div className="label">Published Slots</div>
          <div className="value">{published}/{slots.length}</div>
          <div className="sub">Published slots drive hall ticket and seating outputs</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-clock" />
          </div>
          <div className="label">Exam Window</div>
          <div className="value" style={{ fontSize: 23 }}>
            09-20 Nov
          </div>
          <div className="sub">Morning sessions for {activeExam.subjects} theory papers</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div className="label">Review Flags</div>
          <div className="value">1</div>
          <div className="sub">Room reservation review before final publish</div>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" defaultValue={activeExam.name}>
          <option>{activeExam.name}</option>
        </select>

        {!isAffiliated && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <i className="fas fa-plus" /> Add Slot
            </button>
            <button
              className="btn btn-sm"
              onClick={() => toast('No student or subject conflicts found')}
            >
              <i className="fas fa-check" /> Validate Conflicts
            </button>
          </>
        )}
        {mode !== 'autonomous' && (
          <button
            className={`btn btn-sm ${isAffiliated ? 'btn-primary' : ''}`}
            onClick={() => toast('University timetable imported')}
          >
            <i className="fas fa-file-import" /> Import University Timetable
          </button>
        )}

        <button className="btn btn-success btn-sm ml-auto" onClick={publishAll}>
          <i className="fas fa-check" /> Publish Timetable
        </button>
      </div>

      <div className="schedule-grid">
        {slots.slice(0, 6).map((slot) => {
          const date = dateParts(slot.date)
          return (
            <div className="schedule-card" key={slot.id}>
              <div className="schedule-date">
                <div className="date-block">
                  <span>{date.month}</span>
                  <strong>{date.day}</strong>
                </div>
                <Badge variant={slot.published ? 'success' : 'warning'}>
                  {slot.published ? 'Published' : 'Scheduled'}
                </Badge>
              </div>
              <div>
                <h4>{slot.subject}</h4>
                <div className="cell-sub">{slot.code}</div>
              </div>
              <div className="schedule-meta">
                <span className="chip">
                  <i className="fas fa-sun" /> {slot.session}
                </span>
                <span className="chip">
                  <i className="fas fa-clock" /> {slot.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="equal-grid">
        <Card title="Validation Checks" icon="fa-shield-halved">
          <div className="task-list">
            {timetableChecks.map((check) => (
              <div className="task-row" key={check.label}>
                <div className="task-copy">
                  <strong>{check.label}</strong>
                  <span>{check.detail}</span>
                </div>
                <Badge variant={check.state === 'Clear' ? 'success' : 'warning'}>
                  {check.state}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Exam Timetable"
          icon="fa-calendar-alt"
          actions={<span className="text-muted">{slots.length} subject(s) scheduled</span>}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s.id}>
                    <td>{fmtDate(s.date)}</td>
                    <td>{s.session}</td>
                    <td>{s.subject}</td>
                    <td>{s.code}</td>
                    <td>{s.time}</td>
                    <td>{s.duration}</td>
                    <td>
                      <Badge variant={s.published ? 'success' : 'warning'}>
                        {s.published ? 'Published' : 'Scheduled'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showAdd && (
        <Modal
          title="Add Timetable Slot"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={addSlot}>
                Add Slot
              </button>
            </>
          }
        >
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Session</label>
              <select
                className="form-control"
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
              >
                <option>Morning</option>
                <option>Afternoon</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select
              className="form-control"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Time</label>
              <input
                className="form-control"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                className="form-control"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
