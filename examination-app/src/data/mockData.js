// ============================================================
// MOCK DATA
// Stands in for ERP masters and examination transaction data.
// The real module would read these from the College ERP.
// ============================================================
export const activeExam = {
  name: 'Sem IV Regular Nov 2026',
  shortName: 'Sem IV Regular',
  code: 'EXM-CS-IV-NOV26',
  academicYear: '2026-27',
  program: 'B.E. Computer Engineering',
  branch: 'Computer Engineering',
  semester: 'Semester IV',
  regulation: 'R-2024',
  type: 'Regular',
  status: 'Active',
  phase: 'Pre-Exam',
  createdOn: '06 Jul 2026',
  activatedOn: '06 Jul 2026',
  registrationClose: '15 Oct 2026',
  firstPaper: '09 Nov 2026',
  totalStudents: 248,
  eligibleStudents: 236,
  registeredStudents: 232,
  feePending: 12,
  subjects: 6,
  rooms: 5,
  completion: 68,
}

export const preExamWorkflow = [
  {
    key: 'exam-creation',
    to: '/exam-creation',
    icon: 'fa-plus-circle',
    label: 'Exam Creation',
    desc: 'Create, configure and activate the exam instance.',
    detail: 'Academic setup locked',
    status: 'Completed',
    statusVariant: 'success',
    progress: 100,
  },
  {
    key: 'eligibility',
    to: '/eligibility',
    icon: 'fa-users',
    label: 'Eligibility',
    desc: 'Generate eligible, not eligible and subject-wise lists.',
    detail: '236 eligible',
    status: 'Completed',
    statusVariant: 'success',
    progress: 100,
  },
  {
    key: 'registration',
    to: '/registration',
    icon: 'fa-file-signature',
    label: 'Registration',
    desc: 'Confirm student subjects, fees and final exam form.',
    detail: '12 fee holds',
    status: 'In Progress',
    statusVariant: 'warning',
    progress: 78,
  },
  {
    key: 'timetable',
    to: '/timetable',
    icon: 'fa-calendar-alt',
    label: 'Timetable',
    desc: 'Schedule papers, validate conflicts and publish.',
    detail: '5 of 6 published',
    status: 'In Progress',
    statusVariant: 'info',
    progress: 84,
  },
  {
    key: 'hall-ticket',
    to: '/hall-ticket',
    icon: 'fa-ticket-alt',
    label: 'Hall Tickets',
    desc: 'Generate or import hall ticket numbers and PDFs.',
    detail: '228 generated',
    status: 'Draft',
    statusVariant: 'violet',
    progress: 62,
  },
  {
    key: 'seating',
    to: '/seating',
    icon: 'fa-chair',
    label: 'Seating Plan',
    desc: 'Allocate rooms, seats and attendance sheets.',
    detail: '248 seats planned',
    status: 'Draft',
    statusVariant: 'warning',
    progress: 54,
  },
  {
    key: 'invigilator',
    to: '/invigilator',
    icon: 'fa-chalkboard-teacher',
    label: 'Invigilator Duty',
    desc: 'Assign faculty to rooms and publish duty chart.',
    detail: '1 room open',
    status: 'Pending',
    statusVariant: 'neutral',
    progress: 42,
  },
]

export const students = [
  { id: 'S001', name: 'Aarav Sharma', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 88, fee: 'Paid', subjects: 6 },
  { id: 'S002', name: 'Priya Patel', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 92, fee: 'Paid', subjects: 6 },
  { id: 'S003', name: 'Rahul Verma', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 79, fee: 'Pending', subjects: 6 },
  { id: 'S004', name: 'Sneha Reddy', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 95, fee: 'Paid', subjects: 6 },
  { id: 'S005', name: 'Vikram Singh', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 84, fee: 'Paid', subjects: 4 },
  { id: 'S006', name: 'Ananya Gupta', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 90, fee: 'Paid', subjects: 6 },
  { id: 'S007', name: 'Rohit Joshi', program: 'B.E. Computer', sem: 'IV', status: 'Detained', attendance: 61, fee: 'Paid', subjects: 0 },
  { id: 'S008', name: 'Kavita Nair', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 87, fee: 'Paid', subjects: 6 },
  { id: 'S009', name: 'Arjun Desai', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 91, fee: 'Paid', subjects: 6 },
  { id: 'S010', name: 'Divya Kulkarni', program: 'B.E. Computer', sem: 'IV', status: 'Active', attendance: 73, fee: 'Pending', subjects: 5 },
]

export const subjects = [
  { code: 'CS401', name: 'Data Structures & Algorithms', credits: 4 },
  { code: 'CS402', name: 'Database Management Systems', credits: 4 },
  { code: 'CS403', name: 'Operating Systems', credits: 3 },
  { code: 'CS404', name: 'Computer Networks', credits: 3 },
  { code: 'CS405', name: 'Software Engineering', credits: 3 },
  { code: 'CS406', name: 'Mathematics IV', credits: 3 },
]

export const rooms = [
  { name: 'Lab 101', capacity: 30 },
  { name: 'Lab 102', capacity: 30 },
  { name: 'Lecture Hall A', capacity: 60 },
  { name: 'Lecture Hall B', capacity: 60 },
  { name: 'Seminar Hall', capacity: 80 },
]

export const faculty = [
  { id: 'F01', name: 'Dr. Meena Iyer', dept: 'Computer' },
  { id: 'F02', name: 'Prof. Amit Kumar', dept: 'Computer' },
  { id: 'F03', name: 'Dr. Sunita Rao', dept: 'Computer' },
  { id: 'F04', name: 'Prof. Rajesh Pillai', dept: 'Computer' },
  { id: 'F05', name: 'Dr. Neha Shah', dept: 'Computer' },
]

export const eligibilityRules = [
  { label: 'Attendance check', value: '75% minimum', state: 'Active', icon: 'fa-clock' },
  { label: 'Detained status', value: 'Excluded from list', state: 'Active', icon: 'fa-user-lock' },
  { label: 'Fee hold', value: 'Warn only', state: 'Review', icon: 'fa-receipt' },
  { label: 'Inactive students', value: 'Blocked', state: 'Active', icon: 'fa-user-slash' },
]

export const subjectWiseEligibility = [
  { code: 'CS401', subject: 'Data Structures & Algorithms', eligible: 236, backlog: 8 },
  { code: 'CS402', subject: 'Database Management Systems', eligible: 234, backlog: 6 },
  { code: 'CS403', subject: 'Operating Systems', eligible: 236, backlog: 5 },
  { code: 'CS404', subject: 'Computer Networks', eligible: 235, backlog: 7 },
  { code: 'CS405', subject: 'Software Engineering', eligible: 236, backlog: 4 },
  { code: 'CS406', subject: 'Mathematics IV', eligible: 232, backlog: 11 },
]

export const registrationRows = [
  {
    id: 'S001',
    student: 'Aarav Sharma',
    subjects: ['CS401', 'CS402', 'CS403', 'CS404', 'CS405', 'CS406'],
    fee: 'Paid',
    approval: 'Approved',
    source: 'ERP',
  },
  {
    id: 'S002',
    student: 'Priya Patel',
    subjects: ['CS401', 'CS402', 'CS403', 'CS404', 'CS405', 'CS406'],
    fee: 'Paid',
    approval: 'Approved',
    source: 'ERP',
  },
  {
    id: 'S003',
    student: 'Rahul Verma',
    subjects: ['CS401', 'CS402', 'CS403', 'CS404', 'CS405', 'CS406'],
    fee: 'Pending',
    approval: 'Pending',
    source: 'Fee Hold',
  },
  {
    id: 'S004',
    student: 'Sneha Reddy',
    subjects: ['CS401', 'CS402', 'CS403', 'CS404', 'CS405', 'CS406'],
    fee: 'Paid',
    approval: 'Approved',
    source: 'ERP',
  },
  {
    id: 'S005',
    student: 'Vikram Singh',
    subjects: ['CS401', 'CS402', 'CS404', 'CS405'],
    fee: 'Paid',
    approval: 'Approved',
    source: 'Backlog',
  },
]

// Seed exam timetable slots.
export const initialTimetable = [
  { id: 1, date: '2026-11-09', session: 'Morning', code: 'CS401', subject: 'Data Structures & Algorithms', time: '10:00 - 13:00', duration: '3 hrs', published: true },
  { id: 2, date: '2026-11-11', session: 'Morning', code: 'CS402', subject: 'Database Management Systems', time: '10:00 - 13:00', duration: '3 hrs', published: true },
  { id: 3, date: '2026-11-13', session: 'Morning', code: 'CS403', subject: 'Operating Systems', time: '10:00 - 12:00', duration: '2 hrs', published: true },
  { id: 4, date: '2026-11-16', session: 'Morning', code: 'CS404', subject: 'Computer Networks', time: '10:00 - 12:00', duration: '2 hrs', published: true },
  { id: 5, date: '2026-11-18', session: 'Morning', code: 'CS405', subject: 'Software Engineering', time: '10:00 - 12:00', duration: '2 hrs', published: true },
  { id: 6, date: '2026-11-20', session: 'Morning', code: 'CS406', subject: 'Mathematics IV', time: '10:00 - 13:00', duration: '3 hrs', published: false },
]

export const timetableChecks = [
  { label: 'Subject overlap', detail: 'No student has two papers in the same session', state: 'Clear' },
  { label: 'Room availability', detail: 'Rooms reserved for first three sessions', state: 'Review' },
  { label: 'Duration rules', detail: 'Credit-based duration matches regulation R-2024', state: 'Clear' },
]

// Recent exams shown on the Exam Creation page.
export const recentExams = [
  { name: 'Sem IV Regular Nov 2026', program: 'B.E. Computer', sem: 'IV', type: 'Regular', mode: 'Autonomous', status: 'Active' },
  { name: 'Sem VI Regular Nov 2026', program: 'B.E. Computer', sem: 'VI', type: 'Regular', mode: 'Hybrid', status: 'Pre-Exam' },
  { name: 'Sem II Supplementary Jun 2026', program: 'B.E. Computer', sem: 'II', type: 'Supplementary', mode: 'Affiliated', status: 'Closed' },
]

export const hallTickets = [
  { id: 'S001', name: 'Aarav Sharma', hallTicket: 'HT26CS401001', status: 'Generated', delivery: 'Portal Ready' },
  { id: 'S002', name: 'Priya Patel', hallTicket: 'HT26CS401002', status: 'Generated', delivery: 'Portal Ready' },
  { id: 'S003', name: 'Rahul Verma', hallTicket: 'On Hold', status: 'Fee Hold', delivery: 'Blocked' },
  { id: 'S004', name: 'Sneha Reddy', hallTicket: 'HT26CS401004', status: 'Generated', delivery: 'Portal Ready' },
  { id: 'S005', name: 'Vikram Singh', hallTicket: 'HT26CS401005', status: 'Generated', delivery: 'Verification' },
  { id: 'S006', name: 'Ananya Gupta', hallTicket: 'HT26CS401006', status: 'Generated', delivery: 'Portal Ready' },
]

// Static seating allocation summary.
export const seatingRooms = [
  { room: 'Lab 101', capacity: 30, allocated: 30, seats: 'S001 - S030', block: 'North Block' },
  { room: 'Lab 102', capacity: 30, allocated: 28, seats: 'S031 - S058', block: 'North Block' },
  { room: 'Lecture Hall A', capacity: 60, allocated: 60, seats: 'S059 - S118', block: 'Main Block' },
  { room: 'Lecture Hall B', capacity: 60, allocated: 60, seats: 'S119 - S178', block: 'Main Block' },
  { room: 'Seminar Hall', capacity: 80, allocated: 70, seats: 'S179 - S248', block: 'Admin Block' },
]

export const invigilatorDuty = [
  { room: 'Lab 101', subject: 'DS & Algorithms', facultyId: 'F01' },
  { room: 'Lab 102', subject: 'DS & Algorithms', facultyId: 'F02' },
  { room: 'Lecture Hall A', subject: 'DS & Algorithms', facultyId: 'F03' },
  { room: 'Lecture Hall B', subject: 'DS & Algorithms', facultyId: 'F04' },
  { room: 'Seminar Hall', subject: 'DS & Algorithms', facultyId: null },
]

// Helper used by the eligibility rules.
export function isEligible(student) {
  return student.status !== 'Detained' && student.attendance >= 75
}
