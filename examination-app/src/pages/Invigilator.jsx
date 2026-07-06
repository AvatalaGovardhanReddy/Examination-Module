import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { activeExam, faculty, invigilatorDuty } from '../data/mockData.js'

const SESSION = '09 Nov 2026 - Morning'

function initials(name) {
  return name
    .replace('Dr. ', '')
    .replace('Prof. ', '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export default function Invigilator() {
  const toast = useToast()
  const [duty, setDuty] = useState(invigilatorDuty)
  const [assignRoom, setAssignRoom] = useState(null)
  const [pick, setPick] = useState('')

  const facultyName = (id) => faculty.find((f) => f.id === id)?.name || '-'
  const usedIds = duty.map((d) => d.facultyId).filter(Boolean)
  const assignedCount = usedIds.length
  const freeFaculty = faculty.filter((f) => !usedIds.includes(f.id) || f.id === pick)

  function openAssign(room) {
    const used = duty.map((d) => d.facultyId).filter(Boolean)
    const firstFree = faculty.find((f) => !used.includes(f.id))
    setPick(firstFree ? firstFree.id : '')
    setAssignRoom(room)
  }

  function confirmAssign() {
    setDuty((prev) =>
      prev.map((d) => (d.room === assignRoom ? { ...d, facultyId: pick } : d)),
    )
    toast(`${facultyName(pick)} assigned to ${assignRoom}`)
    setAssignRoom(null)
  }

  function unassign(room) {
    setDuty((prev) => prev.map((d) => (d.room === room ? { ...d, facultyId: null } : d)))
    toast(`Invigilator removed from ${room}`)
  }

  return (
    <Layout title="Invigilator Duty Management" breadcrumb="Pre-Exam / Invigilator Duty">
      <Alert variant="info">
        Assign faculty members to examination rooms and prevent the same faculty
        from being scheduled twice in the same session.
      </Alert>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-user-check" />
          </div>
          <div className="label">Assigned</div>
          <div className="value">{assignedCount}/{duty.length}</div>
          <div className="sub">Rooms with confirmed invigilator duty</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-users" />
          </div>
          <div className="label">Faculty Pool</div>
          <div className="value">{faculty.length}</div>
          <div className="sub">ERP faculty available for the selected session</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div className="label">Open Rooms</div>
          <div className="value">{duty.length - assignedCount}</div>
          <div className="sub">Must be assigned before publishing the chart</div>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" defaultValue={SESSION}>
          <option>{SESSION}</option>
        </select>
        <span className="chip">
          <i className="fas fa-calendar-day" /> {activeExam.shortName}
        </span>
        <button className="btn btn-sm" onClick={() => toast('No invigilator conflicts found')}>
          <i className="fas fa-check" /> Validate Conflicts
        </button>
        <button className="btn btn-sm ml-auto" onClick={() => toast('Duty chart published to faculty')}>
          <i className="fas fa-file-pdf" /> Publish Duty Chart
        </button>
      </div>

      <Card title="Faculty Availability" icon="fa-id-card">
        <div className="faculty-grid">
          {faculty.map((member) => {
            const assigned = duty.find((item) => item.facultyId === member.id)
            return (
              <div className="faculty-card" key={member.id}>
                <div className="avatar">{initials(member.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="cell-title">{member.name}</div>
                  <div className="cell-sub">
                    <span
                      className={`availability-dot ${assigned ? 'busy' : ''}`}
                      aria-hidden="true"
                    />{' '}
                    {assigned ? `Assigned to ${assigned.room}` : 'Available'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="Invigilator Duty Chart" icon="fa-chalkboard-teacher">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Subject</th>
                <th>Invigilator</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {duty.map((d) => (
                <tr key={d.room}>
                  <td>{d.room}</td>
                  <td>{d.subject}</td>
                  <td>{facultyName(d.facultyId)}</td>
                  <td>
                    {d.facultyId ? (
                      <Badge variant="success">Assigned</Badge>
                    ) : (
                      <Badge variant="danger">Not Assigned</Badge>
                    )}
                  </td>
                  <td>
                    {d.facultyId ? (
                      <button className="btn btn-sm btn-danger" onClick={() => unassign(d.room)}>
                        <i className="fas fa-xmark" /> Unassign
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={() => openAssign(d.room)}>
                        <i className="fas fa-user-plus" /> Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {assignRoom && (
        <Modal
          title={`Assign Invigilator - ${assignRoom}`}
          onClose={() => setAssignRoom(null)}
          footer={
            <>
              <button className="btn" onClick={() => setAssignRoom(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmAssign} disabled={!pick}>
                Assign
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Select Faculty</label>
            <select className="form-control" value={pick} onChange={(e) => setPick(e.target.value)}>
              {freeFaculty.length === 0 && <option value="">No free faculty</option>}
              {freeFaculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id})
                </option>
              ))}
            </select>
            <div className="field-note">
              Only faculty without another room assignment in this session are listed.
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
