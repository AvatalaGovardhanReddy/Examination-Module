import React, { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { faculty, initialTimetable, invigilatorDuty, seatingRooms } from '../data/mockData.js'

function initials(name) {
  return name
    .replace('Dr. ', '')
    .replace('Prof. ', '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dutyRowsForSlot(slot) {
  return seatingRooms.map((room, index) => {
    const seeded = invigilatorDuty.find((item) => item.room === room.room)
    return {
      room: room.room,
      block: room.block,
      capacity: room.capacity,
      subject: slot.subject,
      code: slot.code,
      facultyId: seeded?.facultyId || (index < faculty.length - 1 ? faculty[index].id : null),
    }
  })
}

export default function Invigilator() {
  const toast = useToast()
  const { activeExam } = useExam()
  const [slotId, setSlotId] = useState(String(initialTimetable[0].id))
  const selectedSlot = initialTimetable.find((slot) => String(slot.id) === slotId) || initialTimetable[0]
  const [duty, setDuty] = useState(() => dutyRowsForSlot(selectedSlot))
  const [roomsFetched, setRoomsFetched] = useState(false)
  const [facultyFetched, setFacultyFetched] = useState(false)
  const [published, setPublished] = useState(false)
  const [assignRoom, setAssignRoom] = useState(null)
  const [pick, setPick] = useState('')
  const [showDutyChart, setShowDutyChart] = useState(false)

  const facultyName = (id) => faculty.find((member) => member.id === id)?.name || '-'
  const usedIds = duty.map((item) => item.facultyId).filter(Boolean)
  const duplicateFacultyIds = usedIds.filter((id, index) => usedIds.indexOf(id) !== index)
  const conflictCount = new Set(duplicateFacultyIds).size
  const assignedCount = usedIds.length
  const openRooms = duty.length - assignedCount
  const currentAssignment = duty.find((item) => item.room === assignRoom)
  const freeFaculty = faculty.filter(
    (member) => !usedIds.includes(member.id) || member.id === currentAssignment?.facultyId,
  )

  const workflowSteps = [
    {
      label: 'Select Exam Date and Session',
      detail: `${fmtDate(selectedSlot.date)} / ${selectedSlot.session}`,
      icon: 'fa-calendar-day',
      state: 'Selected',
      variant: 'success',
    },
    {
      label: 'Fetch Rooms',
      detail: `${duty.length} examination rooms`,
      icon: 'fa-door-open',
      state: roomsFetched ? 'Fetched' : 'Ready',
      variant: roomsFetched ? 'success' : 'info',
    },
    {
      label: 'Fetch Faculty',
      detail: `${faculty.length} faculty members available`,
      icon: 'fa-id-card',
      state: facultyFetched ? 'Fetched' : 'Ready',
      variant: facultyFetched ? 'success' : 'info',
    },
    {
      label: 'Assign Invigilators',
      detail: `${assignedCount}/${duty.length} rooms assigned`,
      icon: 'fa-user-check',
      state: openRooms ? 'In Progress' : 'Assigned',
      variant: openRooms ? 'warning' : 'success',
    },
    {
      label: 'Publish Duty Chart',
      detail: 'Faculty notification and branch download',
      icon: 'fa-file-pdf',
      state: published ? 'Published' : 'Pending',
      variant: published ? 'success' : 'warning',
    },
  ]

  function resetForSlot(nextSlotId) {
    const slot = initialTimetable.find((item) => String(item.id) === nextSlotId) || initialTimetable[0]
    setSlotId(nextSlotId)
    setDuty(dutyRowsForSlot(slot))
    setRoomsFetched(false)
    setFacultyFetched(false)
    setPublished(false)
    setAssignRoom(null)
  }

  function fetchRooms() {
    setRoomsFetched(true)
    toast(`${duty.length} rooms fetched for ${selectedSlot.code}`)
  }

  function fetchFaculty() {
    setFacultyFetched(true)
    toast(`${faculty.length} faculty records fetched from ERP`)
  }

  function validateConflicts() {
    if (conflictCount) {
      toast(`${conflictCount} faculty conflict found`)
      return
    }
    toast('No invigilator conflicts found for the selected session')
  }

  function autoAssign() {
    setDuty((current) =>
      current.map((row, index) => ({
        ...row,
        facultyId: faculty[index % faculty.length].id,
      })),
    )
    setRoomsFetched(true)
    setFacultyFetched(true)
    setPublished(false)
    toast('Invigilators assigned by room sequence')
  }

  function publishDutyChart() {
    if (openRooms) {
      toast('Assign all rooms before publishing')
      return
    }
    if (conflictCount) {
      toast('Resolve duplicate faculty conflicts before publishing')
      return
    }
    setPublished(true)
    setShowDutyChart(true)
    toast('Duty chart published to faculty members')
  }

  function openAssign(room) {
    const row = duty.find((item) => item.room === room)
    const firstFree = faculty.find((member) => !usedIds.includes(member.id))
    setPick(row?.facultyId || firstFree?.id || '')
    setAssignRoom(room)
  }

  function confirmAssign() {
    const duplicateRoom = duty.find(
      (item) => item.facultyId === pick && item.room !== assignRoom,
    )

    if (duplicateRoom) {
      toast(`${facultyName(pick)} is already assigned to ${duplicateRoom.room}`)
      return
    }

    setDuty((current) =>
      current.map((item) => (item.room === assignRoom ? { ...item, facultyId: pick } : item)),
    )
    setRoomsFetched(true)
    setFacultyFetched(true)
    setPublished(false)
    toast(`${facultyName(pick)} assigned to ${assignRoom}`)
    setAssignRoom(null)
  }

  function unassign(room) {
    setDuty((current) =>
      current.map((item) => (item.room === room ? { ...item, facultyId: null } : item)),
    )
    setPublished(false)
    toast(`Invigilator removed from ${room}`)
  }

  return (
    <Layout title="Invigilator Duty Management" breadcrumb="Pre-Exam / Invigilator Duty">
      <Alert variant="info">
        Assign faculty members to examination rooms by date and session, prevent duplicate
        faculty allocation, then publish the final duty chart.
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
            <i className="fas fa-door-open" />
          </div>
          <div className="label">Open Rooms</div>
          <div className="value">{openRooms}</div>
          <div className="sub">Must be assigned before publishing the chart</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div className="label">Conflicts</div>
          <div className="value">{conflictCount}</div>
          <div className="sub">Duplicate faculty assignments in this session</div>
        </div>
      </div>

      <Card title="Invigilator Duty Workflow" icon="fa-route">
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
        <select
          className="form-control"
          value={slotId}
          onChange={(event) => resetForSlot(event.target.value)}
          aria-label="Exam date and session"
        >
          {initialTimetable.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {fmtDate(slot.date)} - {slot.session} - {slot.code}
            </option>
          ))}
        </select>
        <span className="chip">
          <i className="fas fa-calendar-day" /> {activeExam.shortName}
        </span>
        <button className="btn btn-sm" onClick={fetchRooms}>
          <i className="fas fa-door-open" /> Fetch Rooms
        </button>
        <button className="btn btn-sm" onClick={fetchFaculty}>
          <i className="fas fa-id-card" /> Fetch Faculty
        </button>
        <button className="btn btn-primary btn-sm" onClick={autoAssign}>
          <i className="fas fa-wand-magic-sparkles" /> Auto Assign
        </button>
        <button className="btn btn-sm" onClick={validateConflicts}>
          <i className="fas fa-shield-halved" /> Check Conflicts
        </button>
        <button className="btn btn-success btn-sm ml-auto" onClick={publishDutyChart}>
          <i className="fas fa-cloud-arrow-up" /> Publish Duty Chart
        </button>
      </div>

      <div className="equal-grid">
        <Card title="Session Details" icon="fa-calendar-check">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Exam</span>
              <strong>{activeExam.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Subject</span>
              <strong>{selectedSlot.code}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Date</span>
              <strong>{fmtDate(selectedSlot.date)}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Session</span>
              <strong>{selectedSlot.session}</strong>
            </div>
          </div>
        </Card>

        <Card title="Publish Readiness" icon="fa-list-check">
          <div className="task-list">
            <div className="task-row">
              <div className="task-copy">
                <strong>Rooms fetched</strong>
                <span>{duty.length} room(s) available for this session</span>
              </div>
              <Badge variant={roomsFetched ? 'success' : 'warning'}>
                {roomsFetched ? 'Ready' : 'Pending'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Faculty fetched</strong>
                <span>{faculty.length} faculty record(s) from ERP</span>
              </div>
              <Badge variant={facultyFetched ? 'success' : 'warning'}>
                {facultyFetched ? 'Ready' : 'Pending'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Conflict check</strong>
                <span>Same faculty cannot be assigned twice in the session.</span>
              </div>
              <Badge variant={conflictCount ? 'danger' : 'success'}>
                {conflictCount ? 'Conflict' : 'Clear'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Duty chart publishing</strong>
                <span>{published ? 'Published to faculty members' : 'Awaiting publish action'}</span>
              </div>
              <Badge variant={published ? 'success' : 'warning'}>
                {published ? 'Published' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
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

      <Card
        title="Invigilator Duty Chart"
        icon="fa-chalkboard-teacher"
        actions={
          <div className="btn-group">
            <button className="btn btn-sm" onClick={() => setShowDutyChart(true)}>
              <i className="fas fa-eye" /> Preview
            </button>
            <button
              className="btn btn-sm"
              disabled={!published}
              onClick={() => toast('Duty chart downloaded')}
            >
              <i className="fas fa-download" /> Download
            </button>
          </div>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Block</th>
                <th>Subject</th>
                <th>Capacity</th>
                <th>Invigilator</th>
                <th>Conflict</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {duty.map((row) => {
                const hasConflict = row.facultyId && duplicateFacultyIds.includes(row.facultyId)
                return (
                  <tr key={row.room}>
                    <td>{row.room}</td>
                    <td>{row.block}</td>
                    <td>
                      <div className="cell-title">{row.code}</div>
                      <div className="cell-sub">{row.subject}</div>
                    </td>
                    <td>{row.capacity}</td>
                    <td>{facultyName(row.facultyId)}</td>
                    <td>
                      <Badge variant={hasConflict ? 'danger' : 'success'}>
                        {hasConflict ? 'Conflict' : 'Clear'}
                      </Badge>
                    </td>
                    <td>
                      {row.facultyId ? (
                        <Badge variant="success">Assigned</Badge>
                      ) : (
                        <Badge variant="danger">Not Assigned</Badge>
                      )}
                    </td>
                    <td>
                      {row.facultyId ? (
                        <div className="btn-group">
                          <button className="btn btn-sm" onClick={() => openAssign(row.room)}>
                            <i className="fas fa-pen" /> Change
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => unassign(row.room)}>
                            <i className="fas fa-xmark" /> Unassign
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-sm btn-primary" onClick={() => openAssign(row.room)}>
                          <i className="fas fa-user-plus" /> Assign
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
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
                <i className="fas fa-user-check" /> Assign
              </button>
            </>
          }
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Date</span>
              <strong>{fmtDate(selectedSlot.date)}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Session</span>
              <strong>{selectedSlot.session}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Room</span>
              <strong>{assignRoom}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Subject</span>
              <strong>{selectedSlot.code}</strong>
            </div>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="facultyPick">Select Faculty</label>
            <select
              id="facultyPick"
              className="form-control"
              value={pick}
              onChange={(event) => setPick(event.target.value)}
            >
              {freeFaculty.length === 0 && <option value="">No free faculty</option>}
              {freeFaculty.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.id})
                </option>
              ))}
            </select>
            <div className="field-note">
              Faculty already assigned to another room in this session are hidden to avoid conflicts.
            </div>
          </div>
        </Modal>
      )}

      {showDutyChart && (
        <Modal
          title="Duty Chart Preview"
          onClose={() => setShowDutyChart(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowDutyChart(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={!published}
                onClick={() => toast('Duty chart downloaded')}
              >
                <i className="fas fa-download" /> Download Chart
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
              <span className="label">Session</span>
              <strong>{fmtDate(selectedSlot.date)} / {selectedSlot.session}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Rooms</span>
              <strong>{duty.length}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Published</span>
              <strong>{published ? 'Yes' : 'No'}</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            {duty.map((row) => (
              <div className="task-row" key={row.room}>
                <div className="task-copy">
                  <strong>{row.room} - {facultyName(row.facultyId)}</strong>
                  <span>{row.code} / {row.block} / {selectedSlot.session}</span>
                </div>
                <Badge variant={row.facultyId ? 'success' : 'danger'}>
                  {row.facultyId ? 'Assigned' : 'Open'}
                </Badge>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </Layout>
  )
}
