import React, { useState } from 'react'
import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useExam } from '../context/ExamContext.jsx'
import { initialTimetable, registrationRows, seatingRooms } from '../data/mockData.js'

function fmtDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function seatRange(start, count) {
  if (!count) return '-'
  const first = `S${String(start).padStart(3, '0')}`
  const last = `S${String(start + count - 1).padStart(3, '0')}`
  return `${first} - ${last}`
}

export default function Seating() {
  const toast = useToast()
  const { activeExam } = useExam()
  const [slotId, setSlotId] = useState(String(initialTimetable[0].id))
  const [rooms, setRooms] = useState(seatingRooms)
  const [studentsFetched, setStudentsFetched] = useState(false)
  const [roomsFetched, setRoomsFetched] = useState(false)
  const [allocated, setAllocated] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [viewRoom, setViewRoom] = useState(null)
  const [showOutputs, setShowOutputs] = useState(false)
  const [dragAssignments, setDragAssignments] = useState({})
  const [dragOverRoom, setDragOverRoom] = useState(null)

  const selectedSlot = initialTimetable.find((slot) => String(slot.id) === slotId) || initialTimetable[0]
  const appearingStudents = activeExam.registeredStudents || activeExam.totalStudents
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalAllocated = rooms.reduce((sum, room) => sum + room.allocated, 0)
  const availableSeats = Math.max(0, totalCapacity - totalAllocated)
  const dragStudents = registrationRows.map((row) => ({
    id: row.id,
    name: row.student,
    subjects: row.subjects.length,
    fee: row.fee,
  }))
  const unassignedDragStudents = dragStudents.filter((student) => !dragAssignments[student.id])
  const manualAssignedCount = dragStudents.length - unassignedDragStudents.length

  function statusFor(room) {
    const free = room.capacity - room.allocated
    if (free === 0) return { label: 'Full', variant: 'success' }
    if (room.allocated === 0) return { label: 'Open', variant: 'info' }
    if (free <= 10) return { label: 'Near Full', variant: 'warning' }
    return { label: 'Partial', variant: 'info' }
  }

  function fetchStudents() {
    setStudentsFetched(true)
    toast(`${appearingStudents} appearing students fetched for ${selectedSlot.code}`)
  }

  function fetchRooms() {
    setRoomsFetched(true)
    toast(`${rooms.length} ERP rooms fetched for the selected session`)
  }

  function buildAllocatedRooms() {
    let remaining = appearingStudents
    let cursor = 1
    return seatingRooms.map((room) => {
      const allocatedCount = Math.min(room.capacity, remaining)
      const seats = seatRange(cursor, allocatedCount)
      remaining -= allocatedCount
      cursor += allocatedCount
      return {
        ...room,
        allocated: allocatedCount,
        seats,
      }
    })
  }

  function allocateSeats() {
    setRooms(buildAllocatedRooms())
    setStudentsFetched(true)
    setRoomsFetched(true)
    setAllocated(true)
    setGenerated(false)
    toast('Seats allocated by room capacity and session')
  }

  function generatePlan() {
    setStudentsFetched(true)
    setRoomsFetched(true)
    if (!allocated) {
      setRooms(buildAllocatedRooms())
      setAllocated(true)
    }
    setGenerated(true)
    setShowOutputs(true)
    toast('Room-wise seating plan generated')
  }

  function createSeatingPlan() {
    setRooms(buildAllocatedRooms())
    setStudentsFetched(true)
    setRoomsFetched(true)
    setAllocated(true)
    setGenerated(true)
    setShowCreatePlan(false)
    setShowOutputs(true)
    toast('Seating plan created with room chart and printable outputs')
  }

  function studentsForRoom(roomName) {
    return dragStudents.filter((student) => dragAssignments[student.id] === roomName)
  }

  function dragStudent(event, studentId) {
    event.dataTransfer.setData('studentId', studentId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function dropStudent(event, roomName) {
    event.preventDefault()
    const studentId = event.dataTransfer.getData('studentId')
    if (!studentId) return

    const assignedToRoom = studentsForRoom(roomName).length
    const room = rooms.find((item) => item.room === roomName)
    if (room && assignedToRoom >= room.capacity) {
      toast(`${roomName} is at full capacity`)
      setDragOverRoom(null)
      return
    }

    const student = dragStudents.find((item) => item.id === studentId)
    setDragAssignments((current) => ({
      ...current,
      [studentId]: roomName,
    }))
    setStudentsFetched(true)
    setRoomsFetched(true)
    setAllocated(true)
    setGenerated(false)
    setDragOverRoom(null)
    toast(`${student ? student.name : studentId} assigned to ${roomName}`)
  }

  function dropToUnassigned(event) {
    event.preventDefault()
    const studentId = event.dataTransfer.getData('studentId')
    if (!studentId) return
    const student = dragStudents.find((item) => item.id === studentId)
    setDragAssignments((current) => {
      const next = { ...current }
      delete next[studentId]
      return next
    })
    setGenerated(false)
    setDragOverRoom(null)
    toast(`${student ? student.name : studentId} moved to unassigned`)
  }

  function autoFillDragBoard() {
    const nextAssignments = {}
    let roomIndex = 0
    dragStudents.forEach((student) => {
      nextAssignments[student.id] = rooms[roomIndex].room
      roomIndex = (roomIndex + 1) % rooms.length
    })
    setDragAssignments(nextAssignments)
    setStudentsFetched(true)
    setRoomsFetched(true)
    setAllocated(true)
    setGenerated(false)
    toast('Sample students distributed across room drop zones')
  }

  function clearDragBoard() {
    setDragAssignments({})
    setGenerated(false)
    toast('Manual drag assignments cleared')
  }

  function applyDragPlan() {
    setStudentsFetched(true)
    setRoomsFetched(true)
    setAllocated(true)
    setGenerated(true)
    setShowOutputs(true)
    toast('Drag and drop seating plan applied')
  }

  const workflowSteps = [
    {
      label: 'Select Exam Date and Session',
      detail: `${fmtDate(selectedSlot.date)} / ${selectedSlot.session}`,
      icon: 'fa-calendar-day',
      state: 'Selected',
      variant: 'success',
    },
    {
      label: 'Fetch Appearing Students',
      detail: `${appearingStudents} students for ${selectedSlot.code}`,
      icon: 'fa-users',
      state: studentsFetched ? 'Fetched' : 'Ready',
      variant: studentsFetched ? 'success' : 'info',
    },
    {
      label: 'Fetch Available Rooms',
      detail: `${rooms.length} rooms / ${totalCapacity} seats`,
      icon: 'fa-door-open',
      state: roomsFetched ? 'Fetched' : 'Ready',
      variant: roomsFetched ? 'success' : 'info',
    },
    {
      label: 'Allocate Seats',
      detail: `${totalAllocated} allocated / ${availableSeats} available`,
      icon: 'fa-chair',
      state: allocated ? 'Allocated' : 'Pending',
      variant: allocated ? 'success' : 'warning',
    },
    {
      label: 'Generate Seating Plan',
      detail: 'Room chart, seat list and attendance sheets',
      icon: 'fa-file-pdf',
      state: generated ? 'Generated' : 'Pending',
      variant: generated ? 'success' : 'warning',
    },
  ]

  const outputItems = [
    { label: 'Room-wise seating chart', icon: 'fa-door-open', state: generated ? 'Ready' : 'Pending' },
    { label: 'Student-wise seat numbers', icon: 'fa-users', state: generated ? 'Ready' : 'Pending' },
    { label: 'Invigilator copy', icon: 'fa-user-tie', state: generated ? 'Ready' : 'Pending' },
    { label: 'Attendance sheet', icon: 'fa-clipboard-check', state: generated ? 'Ready' : 'Pending' },
  ]

  return (
    <Layout title="Room & Seating Plan" breadcrumb="Pre-Exam / Seating Plan">
      <Alert variant="info">
        Allocate rooms and seat numbers for each exam date and session using ERP
        room capacity and examination rules.
      </Alert>

      <div className="stats-grid">
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-users" />
          </div>
          <div className="label">Appearing Students</div>
          <div className="value">{appearingStudents}</div>
          <div className="sub">Fetched for the selected paper session</div>
        </div>
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-door-open" />
          </div>
          <div className="label">Room Capacity</div>
          <div className="value">{totalCapacity}</div>
          <div className="sub">Available across {rooms.length} ERP rooms</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-chair" />
          </div>
          <div className="label">Allocated Seats</div>
          <div className="value">{totalAllocated}</div>
          <div className="sub">Students placed for the selected session</div>
        </div>
        <div className="stat-card accent-violet">
          <div className="icon">
            <i className="fas fa-clipboard-list" />
          </div>
          <div className="label">Printable Outputs</div>
          <div className="value">4</div>
          <div className="sub">Room chart, seat list, duty copy and attendance sheet</div>
        </div>
      </div>

      <Card title="Seating Plan Workflow" icon="fa-route">
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
          onChange={(event) => {
            setSlotId(event.target.value)
            setGenerated(false)
          }}
          aria-label="Exam date and session"
        >
          {initialTimetable.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {fmtDate(slot.date)} - {slot.session} - {slot.code}
            </option>
          ))}
        </select>
        <span className="chip">
          <i className="fas fa-book-open" /> {selectedSlot.subject}
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreatePlan(true)}>
          <i className="fas fa-plus-circle" /> Create Seating Plan
        </button>
        <button className="btn btn-sm" onClick={fetchStudents}>
          <i className="fas fa-users" /> Fetch Students
        </button>
        <button className="btn btn-sm" onClick={fetchRooms}>
          <i className="fas fa-door-open" /> Fetch Rooms
        </button>
        <button className="btn btn-sm" onClick={allocateSeats}>
          <i className="fas fa-wand-magic-sparkles" /> Allocate Seats
        </button>
        <button className="btn btn-success btn-sm ml-auto" onClick={generatePlan}>
          <i className="fas fa-file-pdf" /> Generate Seating Plan
        </button>
      </div>

      <div className="equal-grid">
        <Card title="Session Inputs" icon="fa-calendar-check">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Exam</span>
              <strong>{activeExam.name}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Paper</span>
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

        <Card title="Generated Outputs" icon="fa-print">
          <div className="task-list">
            {outputItems.map((item) => (
              <div className="task-row" key={item.label}>
                <div className="task-row-left">
                  <div className="task-icon">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div className="task-copy">
                    <strong>{item.label}</strong>
                    <span>{selectedSlot.code} / {selectedSlot.session}</span>
                  </div>
                </div>
                <Badge variant={item.state === 'Ready' ? 'success' : 'warning'}>
                  {item.state}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Drag & Drop Seat Allocation"
        icon="fa-grip"
        actions={
          <div className="btn-group">
            <button className="btn btn-sm" onClick={autoFillDragBoard}>
              <i className="fas fa-wand-magic-sparkles" /> Auto Fill
            </button>
            <button className="btn btn-sm" onClick={clearDragBoard}>
              <i className="fas fa-rotate-left" /> Clear
            </button>
            <button className="btn btn-primary btn-sm" onClick={applyDragPlan}>
              <i className="fas fa-check" /> Apply Drag Plan
            </button>
          </div>
        }
      >
        <div className="drag-seat-board">
          <div
            className={`drag-student-pool ${dragOverRoom === 'unassigned' ? 'drag-over' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOverRoom('unassigned')
            }}
            onDragLeave={() => setDragOverRoom(null)}
            onDrop={dropToUnassigned}
          >
            <div className="drag-panel-head">
              <div>
                <strong>Unassigned Students</strong>
                <span>Drag students into a room</span>
              </div>
              <Badge variant={unassignedDragStudents.length ? 'warning' : 'success'}>
                {unassignedDragStudents.length}
              </Badge>
            </div>
            <div className="drag-student-list">
              {unassignedDragStudents.length === 0 ? (
                <div className="drag-empty">All visible students assigned</div>
              ) : (
                unassignedDragStudents.map((student) => (
                  <div
                    className="drag-student-chip"
                    draggable
                    key={student.id}
                    onDragStart={(event) => dragStudent(event, student.id)}
                  >
                    <i className="fas fa-grip-vertical" />
                    <div>
                      <strong>{student.name}</strong>
                      <span>
                        {student.id} / {student.subjects} subjects / {student.fee}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="drag-room-board">
            {rooms.map((room) => {
              const assignedStudents = studentsForRoom(room.room)
              return (
                <div
                  className={`drag-room-zone ${dragOverRoom === room.room ? 'drag-over' : ''}`}
                  key={room.room}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOverRoom(room.room)
                  }}
                  onDragLeave={() => setDragOverRoom(null)}
                  onDrop={(event) => dropStudent(event, room.room)}
                >
                  <div className="drag-panel-head">
                    <div>
                      <strong>{room.room}</strong>
                      <span>{room.block}</span>
                    </div>
                    <Badge variant={assignedStudents.length ? 'success' : 'info'}>
                      {assignedStudents.length}/{room.capacity}
                    </Badge>
                  </div>
                  <div className="drag-room-list">
                    {assignedStudents.length === 0 ? (
                      <div className="drag-empty">Drop students here</div>
                    ) : (
                      assignedStudents.map((student, index) => (
                        <div
                          className="drag-student-chip assigned"
                          draggable
                          key={student.id}
                          onDragStart={(event) => dragStudent(event, student.id)}
                        >
                          <i className="fas fa-chair" />
                          <div>
                            <strong>{student.name}</strong>
                            <span>
                              Seat {String(index + 1).padStart(2, '0')} / {student.id}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex-between mt-4">
          <span className="text-muted" style={{ fontSize: 13 }}>
            Manual sample allocation: <strong>{manualAssignedCount}/{dragStudents.length}</strong>{' '}
            visible students assigned.
          </span>
          <span className="chip">
            <i className="fas fa-circle-info" /> Drop on Unassigned Students to remove a room
            assignment
          </span>
        </div>
      </Card>

      <div className="room-grid mt-4">
        {rooms.map((room) => {
          const status = statusFor(room)
          const percent = room.capacity ? Math.round((room.allocated / room.capacity) * 100) : 0
          const filledSeats = Math.round((room.allocated / room.capacity) * 20)
          return (
            <div className="room-card" key={room.room}>
              <div className="room-card-top">
                <div>
                  <div className="cell-title">{room.room}</div>
                  <div className="cell-sub">{room.block}</div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {room.allocated}/{room.capacity} seats
                  </span>
                  <strong style={{ fontSize: 12 }}>{percent}%</strong>
                </div>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="seat-map" aria-label={`${room.room} seat occupancy`}>
                {Array.from({ length: 20 }).map((_, index) => (
                  <span
                    key={index}
                    className={`seat ${index < filledSeats ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <div className="flex-between">
                <div className="cell-sub">{room.seats}</div>
                <button className="btn btn-sm" onClick={() => setViewRoom(room)}>
                  <i className="fas fa-eye" /> View
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Card
        title="Room Allocation"
        icon="fa-chair"
        actions={
          <button className="btn btn-sm" onClick={() => setShowOutputs(true)} disabled={!generated}>
            <i className="fas fa-print" /> Outputs
          </button>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Block</th>
                <th>Capacity</th>
                <th>Allocated</th>
                <th>Available</th>
                <th>Students</th>
                <th>Status</th>
                <th>Outputs</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const status = statusFor(room)
                return (
                  <tr key={room.room}>
                    <td>{room.room}</td>
                    <td>{room.block}</td>
                    <td>{room.capacity}</td>
                    <td>{room.allocated}</td>
                    <td>{room.capacity - room.allocated}</td>
                    <td>{room.seats}</td>
                    <td>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm" onClick={() => setViewRoom(room)}>
                          <i className="fas fa-eye" /> View
                        </button>
                        <button
                          className="btn btn-sm"
                          disabled={!generated}
                          onClick={() => toast(`Exported seating chart for ${room.room}`)}
                        >
                          <i className="fas fa-file-pdf" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreatePlan && (
        <Modal
          title="Create Seating Plan"
          onClose={() => setShowCreatePlan(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowCreatePlan(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createSeatingPlan}>
                <i className="fas fa-plus-circle" /> Create Seating Plan
              </button>
            </>
          }
        >
          <div className="form-group">
            <label htmlFor="createSeatingSlot">Exam Date and Session</label>
            <select
              id="createSeatingSlot"
              className="form-control"
              value={slotId}
              onChange={(event) => {
                setSlotId(event.target.value)
                setGenerated(false)
              }}
            >
              {initialTimetable.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {fmtDate(slot.date)} - {slot.session} - {slot.code}
                </option>
              ))}
            </select>
          </div>

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
              <span className="label">Appearing Students</span>
              <strong>{appearingStudents}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Available Capacity</span>
              <strong>{totalCapacity} seats</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            <div className="task-row">
              <div className="task-copy">
                <strong>Fetch appearing students</strong>
                <span>Students are loaded from final registration for this paper.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Fetch available rooms</strong>
                <span>Room and capacity data comes from ERP infrastructure.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Allocate seats</strong>
                <span>Students will be distributed by room capacity and seat range.</span>
              </div>
              <Badge variant={totalCapacity >= appearingStudents ? 'success' : 'warning'}>
                {totalCapacity >= appearingStudents ? 'Ready' : 'Capacity Review'}
              </Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Generate outputs</strong>
                <span>Room chart, student seat list, invigilator copy and attendance sheet.</span>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
          </div>
        </Modal>
      )}

      {viewRoom && (
        <Modal
          title={`Seating Details - ${viewRoom.room}`}
          onClose={() => setViewRoom(null)}
          footer={
            <>
              <button className="btn" onClick={() => setViewRoom(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={!generated}
                onClick={() => toast(`Downloaded seating outputs for ${viewRoom.room}`)}
              >
                <i className="fas fa-download" /> Download Outputs
              </button>
            </>
          }
        >
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Room</span>
              <strong>{viewRoom.room}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Block</span>
              <strong>{viewRoom.block}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Allocated</span>
              <strong>{viewRoom.allocated}/{viewRoom.capacity}</strong>
            </div>
            <div className="summary-item">
              <span className="label">Seat Range</span>
              <strong>{viewRoom.seats}</strong>
            </div>
          </div>

          <div className="task-list mt-4">
            <div className="task-row">
              <div className="task-copy">
                <strong>Room-wise seating chart</strong>
                <span>Seat range and room block details for display outside the room.</span>
              </div>
              <Badge variant={generated ? 'success' : 'warning'}>{generated ? 'Ready' : 'Pending'}</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Invigilator copy</strong>
                <span>Room assignment with student count and subject/session details.</span>
              </div>
              <Badge variant={generated ? 'success' : 'warning'}>{generated ? 'Ready' : 'Pending'}</Badge>
            </div>
            <div className="task-row">
              <div className="task-copy">
                <strong>Attendance sheet</strong>
                <span>Printable student list with signature columns.</span>
              </div>
              <Badge variant={generated ? 'success' : 'warning'}>{generated ? 'Ready' : 'Pending'}</Badge>
            </div>
          </div>
        </Modal>
      )}

      {showOutputs && (
        <Modal
          title="Generated Seating Plan Outputs"
          onClose={() => setShowOutputs(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowOutputs(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                disabled={!generated}
                onClick={() => toast('Downloaded seating plan output bundle')}
              >
                <i className="fas fa-download" /> Download Bundle
              </button>
            </>
          }
        >
          <div className="task-list">
            {outputItems.map((item) => (
              <div className="task-row" key={item.label}>
                <div className="task-row-left">
                  <div className="task-icon">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div className="task-copy">
                    <strong>{item.label}</strong>
                    <span>
                      {activeExam.name} / {fmtDate(selectedSlot.date)} / {selectedSlot.session}
                    </span>
                  </div>
                </div>
                <Badge variant={generated ? 'success' : 'warning'}>
                  {generated ? 'Ready' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </Layout>
  )
}
