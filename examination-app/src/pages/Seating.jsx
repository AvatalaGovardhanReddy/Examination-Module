import Layout from '../components/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { activeExam, seatingRooms } from '../data/mockData.js'

export default function Seating() {
  const toast = useToast()

  function statusFor(room) {
    const free = room.capacity - room.allocated
    if (free === 0) return { label: 'Full', variant: 'success' }
    if (free <= 10) return { label: 'Near Full', variant: 'warning' }
    return { label: 'Partial', variant: 'info' }
  }

  const totalCapacity = seatingRooms.reduce((sum, room) => sum + room.capacity, 0)
  const totalAllocated = seatingRooms.reduce((sum, room) => sum + room.allocated, 0)

  return (
    <Layout title="Room & Seating Plan" breadcrumb="Pre-Exam / Seating Plan">
      <Alert variant="info">
        Allocate students to rooms by exam date, session, subject and room capacity
        from ERP infrastructure data.
      </Alert>

      <div className="stats-grid">
        <div className="stat-card accent-teal">
          <div className="icon">
            <i className="fas fa-chair" />
          </div>
          <div className="label">Allocated Seats</div>
          <div className="value">{totalAllocated}</div>
          <div className="sub">Students placed for the selected session</div>
        </div>
        <div className="stat-card accent-green">
          <div className="icon">
            <i className="fas fa-door-open" />
          </div>
          <div className="label">Room Capacity</div>
          <div className="value">{totalCapacity}</div>
          <div className="sub">Available across {seatingRooms.length} exam rooms</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="icon">
            <i className="fas fa-clipboard-list" />
          </div>
          <div className="label">Printable Outputs</div>
          <div className="value">4</div>
          <div className="sub">Room chart, student seats, invigilator copy, attendance sheet</div>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" defaultValue="09 Nov 2026 - Morning">
          <option>09 Nov 2026 - Morning</option>
          <option>11 Nov 2026 - Morning</option>
        </select>
        <select className="form-control" defaultValue="DS & Algorithms (CS401)">
          <option>DS &amp; Algorithms (CS401)</option>
          <option>Database Management Systems (CS402)</option>
        </select>
        <span className="chip">
          <i className="fas fa-users" /> {activeExam.totalStudents} appearing
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => toast('Seats auto-allocated by room capacity')}
        >
          <i className="fas fa-magic" /> Auto Allocate
        </button>
        <button className="btn btn-sm ml-auto" onClick={() => toast('Seating chart exported')}>
          <i className="fas fa-file-pdf" /> Export Seating Chart
        </button>
      </div>

      <div className="room-grid">
        {seatingRooms.map((room) => {
          const status = statusFor(room)
          const percent = Math.round((room.allocated / room.capacity) * 100)
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
              <div className="cell-sub">{room.seats}</div>
            </div>
          )
        })}
      </div>

      <Card title="Room Allocation" icon="fa-chair">
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
              </tr>
            </thead>
            <tbody>
              {seatingRooms.map((room) => {
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  )
}
