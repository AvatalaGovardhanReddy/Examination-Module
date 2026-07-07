import { activeExam as seededActiveExam, recentExams as seededRecentExams } from './mockData.js'

export const basicExamOptions = {
  academicYears: ['2026-27', '2025-26'],
  programs: [
    'B.E. Computer Engineering',
    'B.E. Mechanical Engineering',
    'B.E. Electronics Engineering',
    'B.E. Information Technology',
  ],
  semesters: ['Semester II', 'Semester IV', 'Semester VI', 'Semester VIII'],
  branches: [
    'Computer Engineering',
    'Mechanical Engineering',
    'Electronics Engineering',
    'Information Technology',
  ],
  regulations: ['R-2024', 'R-2022', 'R-2019'],
  examTypes: ['Regular', 'Supplementary', 'Backlog'],
}

export const basicExamDefaults = {
  examName: seededActiveExam.name,
  examCode: seededActiveExam.code,
  academicYear: seededActiveExam.academicYear,
  program: seededActiveExam.program,
  semester: seededActiveExam.semester,
  branch: seededActiveExam.branch,
  regulation: seededActiveExam.regulation,
  examType: seededActiveExam.type,
  registrationCloseDate: '2026-10-15',
  firstPaperDate: '2026-11-09',
  subjects: seededActiveExam.subjects,
  totalStudents: seededActiveExam.totalStudents,
}

const branchCodes = {
  'Computer Engineering': 'CS',
  'Mechanical Engineering': 'ME',
  'Electronics Engineering': 'EC',
  'Information Technology': 'IT',
}

function semesterToken(semester) {
  return (semester || '').replace('Semester ', '').trim() || 'IV'
}

function monthYearToken(dateValue) {
  if (!dateValue) return 'NOV26'
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'NOV26'
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const year = String(date.getFullYear()).slice(-2)
  return `${month}${year}`
}

export function toDisplayDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function suggestExamName(details) {
  const sem = (details.semester || 'Semester IV').replace('Semester ', 'Sem ')
  const type = details.examType || 'Regular'
  const date = new Date(`${details.firstPaperDate || '2026-11-09'}T00:00:00`)
  const month = Number.isNaN(date.getTime())
    ? 'Nov'
    : date.toLocaleDateString('en-US', { month: 'short' })
  const year = Number.isNaN(date.getTime()) ? '2026' : date.getFullYear()
  return `${sem} ${type} ${month} ${year}`
}

export function suggestExamCode(details) {
  const branchCode = branchCodes[details.branch] || 'EX'
  return `EXM-${branchCode}-${semesterToken(details.semester)}-${monthYearToken(details.firstPaperDate)}`
}

export function createExamRecord(details, modeInfo, previous = seededActiveExam) {
  const totalStudents = Number(details.totalStudents) || previous.totalStudents
  const subjects = Number(details.subjects) || previous.subjects
  const eligibleStudents = Math.min(totalStudents, Math.round(totalStudents * 0.95))
  const feePending = Math.max(0, totalStudents - eligibleStudents)
  const name = (details.examName || '').trim() || suggestExamName(details)

  return {
    ...previous,
    name,
    shortName: name.replace(/\s+\w+\s+20\d{2}$/, ''),
    code: (details.examCode || '').trim() || suggestExamCode(details),
    academicYear: details.academicYear,
    program: details.program,
    branch: details.branch,
    semester: details.semester,
    regulation: details.regulation,
    type: details.examType,
    status: 'Active',
    phase: 'Pre-Exam',
    createdOn: '07 Jul 2026',
    activatedOn: '07 Jul 2026',
    registrationClose: toDisplayDate(details.registrationCloseDate) || previous.registrationClose,
    firstPaper: toDisplayDate(details.firstPaperDate) || previous.firstPaper,
    totalStudents,
    eligibleStudents,
    registeredStudents: Math.max(0, eligibleStudents - Math.ceil(feePending / 2)),
    feePending,
    subjects,
    rooms: Math.max(1, Math.ceil(totalStudents / 50)),
    completion: 28,
    mode: modeInfo.label,
  }
}

function toRecentExam(exam, modeInfo) {
  return {
    name: exam.name,
    program: exam.program.replace('B.E. ', 'B.E. '),
    sem: semesterToken(exam.semester),
    type: exam.type,
    mode: modeInfo.label,
    status: exam.status,
  }
}

export const staticExamStore = {
  activeExam: seededActiveExam,
  recentExams: [...seededRecentExams],

  saveExam(details, modeInfo) {
    const exam = createExamRecord(details, modeInfo, this.activeExam)
    this.activeExam = exam
    this.recentExams = [
      toRecentExam(exam, modeInfo),
      ...this.recentExams.filter((item) => item.name !== exam.name),
    ].slice(0, 5)

    return {
      activeExam: this.activeExam,
      recentExams: this.recentExams,
    }
  },
}
