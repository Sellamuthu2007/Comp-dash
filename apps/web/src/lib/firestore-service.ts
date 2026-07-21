import { firestore, Timestamp } from './firebase-admin'
import * as seedData from './mock-data'

type CollectionName =
  | 'departments' | 'students' | 'advisors' | 'competitions'
  | 'registrations' | 'winners' | 'auditLogs' | 'notifications'
  | 'verificationRequests' | 'roleAccessStatus'

function col(name: CollectionName) {
  return firestore.collection(name)
}

function doc(name: CollectionName, id: string) {
  return col(name).doc(id)
}

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Timestamp) return obj.toDate().toISOString()
  if (Array.isArray(obj)) return obj.map(serialize)
  if (typeof obj === 'object') {
    const result: any = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = serialize(v)
    }
    return result
  }
  return obj
}

function deserialize(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj)) return obj
  if (Array.isArray(obj)) return obj.map(deserialize)
  if (typeof obj === 'object') {
    if (obj._seconds !== undefined) {
      return new Date(obj._seconds * 1000).toISOString()
    }
    const result: any = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = deserialize(v)
    }
    return result
  }
  return obj
}

function withId(doc: FirebaseFirestore.DocumentSnapshot): any {
  if (!doc.exists) return null
  return { id: doc.id, ...deserialize(doc.data()) }
}

// ─── Seeding ──────────────────────────────────────────────────────
let seeded = false

async function ensureSeeded(): Promise<void> {
  if (seeded) return
  const snap = await col('departments').limit(1).get()
  if (!snap.empty) { seeded = true; return }

  const batch = firestore.batch()

  for (const d of seedData.departments) batch.set(doc('departments', d.id), serialize(d))
  for (const s of seedData.students) batch.set(doc('students', s.id), serialize(s))
  for (const a of seedData.advisors) batch.set(doc('advisors', a.id), serialize(a))
  for (const c of seedData.competitions) batch.set(doc('competitions', c.id), serialize(c))
  for (const r of seedData.registrations) batch.set(doc('registrations', r.id), serialize(r))
  for (const w of seedData.winners) batch.set(doc('winners', w.id), serialize(w))
  for (const l of seedData.auditLogs) batch.set(doc('auditLogs', l.id), serialize(l))
  for (const n of seedData.notifications) batch.set(doc('notifications', n.id), serialize(n))

  await batch.commit()
  seeded = true
}

// ─── Generic Helpers ──────────────────────────────────────────────
async function getAll<T>(name: CollectionName): Promise<T[]> {
  await ensureSeeded()
  const snap = await col(name).get()
  return snap.docs.map(d => withId(d) as T)
}

async function getById<T>(name: CollectionName, id: string): Promise<T | null> {
  await ensureSeeded()
  const snap = await doc(name, id).get()
  return withId(snap) as T | null
}

async function queryWhere<T>(name: CollectionName, field: string, op: FirebaseFirestore.WhereFilterOp, value: any): Promise<T[]> {
  await ensureSeeded()
  const snap = await col(name).where(field, op, value).get()
  return snap.docs.map(d => withId(d) as T)
}

async function createDoc<T>(name: CollectionName, id: string, data: any): Promise<T> {
  await ensureSeeded()
  await doc(name, id).set(serialize(data))
  return { id, ...deserialize(data) } as T
}

async function updateDoc(name: CollectionName, id: string, data: any): Promise<boolean> {
  await ensureSeeded()
  await doc(name, id).update(serialize(data))
  return true
}

async function deleteDoc(name: CollectionName, id: string): Promise<boolean> {
  await ensureSeeded()
  await doc(name, id).delete()
  return true
}

// ─── Role Access ──────────────────────────────────────────────────
export async function getAllRoleAccessData() {
  const students = await getAll<any>('students')
  const advisors = await getAll<any>('advisors')
  const all = [
    ...students.map(s => ({ id: s.id, name: s.name, email: s.email, department: s.department, role: 'student' as const })),
    ...advisors.map(a => ({ id: a.id, name: a.name, email: a.email, department: a.department, role: 'advisor' as const })),
    { id: 'hod-1', name: 'Dr. HOD Kumar', email: 'hod@cit.in', department: 'CSE', role: 'hod' as const },
  ]

  const statusSnap = await col('roleAccessStatus').doc('status').get()
  const statusData = statusSnap.exists ? (statusSnap.data() || {}) : {}

  return all.map(u => ({ ...u, active: statusData[u.id] !== false }))
}

export async function setUserAccess(id: string, active: boolean) {
  await col('roleAccessStatus').doc('status').set({ [id]: active }, { merge: true })
}

export async function checkUserAccess(email: string): Promise<{ active: boolean; id: string }> {
  const all = await getAllRoleAccessData()
  const match = all.find(u => u.email === email)
  return { active: match ? match.active !== false : true, id: match?.id || email }
}

// ─── Specific Collections ─────────────────────────────────────────
export async function getDepartments() { return getAll<any>('departments') }
export async function getStudents() { return getAll<any>('students') }
export async function getStudent(id: string) { return getById<any>('students', id) }
export async function getAdvisors() { return getAll<any>('advisors') }
export async function getAdvisor(id: string) { return getById<any>('advisors', id) }
export async function getCompetitions() { return getAll<any>('competitions') }
export async function getCompetition(id: string) { return getById<any>('competitions', id) }
export async function getRegistrations() { return getAll<any>('registrations') }
export async function getRegistrationsByUserId(userId: string) {
  return queryWhere<any>('registrations', 'userId', '==', userId)
}
export async function getWinners() { return getAll<any>('winners') }
export async function getNotifications() { return getAll<any>('notifications') }
export async function getAuditLogs() { return getAll<any>('auditLogs') }
export async function getVerificationRequests() { return getAll<any>('verificationRequests') }

export async function createRegistration(id: string, data: any) {
  return createDoc('registrations', id, data)
}
export async function updateRegistration(id: string, data: any) {
  return updateDoc('registrations', id, data)
}

export async function createNotification(id: string, data: any) {
  return createDoc('notifications', id, data)
}

export async function createWinner(id: string, data: any) {
  return createDoc('winners', id, data)
}

export async function createVerificationRequest(id: string, data: any) {
  return createDoc('verificationRequests', id, data)
}
export async function updateVerificationRequest(id: string, data: any) {
  return updateDoc('verificationRequests', id, data)
}

export async function createStudent(id: string, data: any) {
  return createDoc('students', id, data)
}

export async function createAdvisor(id: string, data: any) {
  return createDoc('advisors', id, data)
}

// ─── Stats ─────────────────────────────────────────────────────────
export async function getAdvisorDashboardStats(email: string) {
  const profile = await getProfileByEmail(email)
  const dept = profile?.department || 'CSE'
  const allStudents = await getStudents()
  const allRegs = await getRegistrations()
  const deptStudents = allStudents.filter((s: any) => s.department === dept)
  const deptRegs = allRegs.filter((r: any) => deptStudents.some((ds: any) => ds.id === r.userId))
  const pendingRegs = deptRegs.filter((r: any) => r.status === 'pending_verification' || r.status === 'pending')
  const verifiedRegs = deptRegs.filter((r: any) => r.status === 'verified' || r.status === 'completed')

  const allVrs = await getVerificationRequests()
  const selfVerificationRequests = allVrs.filter((v: any) => v.status === 'pending' && v.department === dept).slice(0, 5)

  return {
    pendingVerifications: pendingRegs.slice(0, 5),
    recentVerified: verifiedRegs.slice(0, 5),
    selfVerificationRequests,
    registrations: allRegs.filter((r: any) => deptStudents.some((ds: any) => ds.id === r.userId)).slice(0, 10),
  }
}

export async function getHodDashboardStats(email: string) {
  const profile = await getProfileByEmail(email)
  const dept = profile?.department || 'CSE'
  const allStudents = await getStudents()
  const allRegs = await getRegistrations()
  const allComps = await getCompetitions()
  const allVrs = await getVerificationRequests()

  const deptStudents = allStudents.filter((s: any) => s.department === dept)
  const deptRegs = allRegs.filter((r: any) => deptStudents.some((ds: any) => ds.id === r.userId))
  const deptComps = allComps.filter((c: any) => c.eligibility?.departments?.includes(dept))

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
  const yearWise = years.map(year => {
    const yrStudents = deptStudents.filter((s: any) => s.year === year)
    const yrRegs = deptRegs.filter((r: any) => yrStudents.some((s: any) => s.id === r.userId))
    return {
      year,
      studentCount: yrStudents.length,
      registrationCount: yrRegs.length,
      verifiedCount: yrRegs.filter((r: any) => r.status === 'verified' || r.status === 'completed').length,
      pendingCount: yrRegs.filter((r: any) => r.status === 'pending_verification').length,
    }
  })

  return {
    department: dept,
    totalStudents: deptStudents.length,
    totalCompetitions: deptComps.length,
    registeredCount: deptRegs.length,
    unregisteredCount: Math.max(0, deptStudents.length - new Set(deptRegs.map((r: any) => r.userId)).size),
    registrations: deptRegs.slice(0, 10),
    yearWise,
    selfVerificationRequests: allVrs.filter((v: any) => v.status === 'pending' && v.department === dept).slice(0, 5),
  }
}

export async function getSuperAdminDashboardStats() {
  const allComps = await getCompetitions()
  const allRegs = await getRegistrations()
  const allStudents = await getStudents()
  const allAdvisors = await getAdvisors()
  const allDepts = await getDepartments()
  const allWinners = await getWinners()
  const allVrs = await getVerificationRequests()

  return {
    totalCompetitions: allComps.length,
    totalStudents: allStudents.length,
    totalRegistrations: allRegs.length,
    totalAdvisors: allAdvisors.length,
    totalDepartments: allDepts.length,
    totalWinners: allWinners.length,
    registrations: allRegs.slice(0, 10),
    selfVerificationRequests: allVrs.filter((v: any) => v.status === 'pending').slice(0, 5),
    registrationsByDepartment: allDepts.map((d: any) => ({
      department: d.name,
      count: allRegs.filter((r: any) => {
        const s = allStudents.find((st: any) => st.id === r.userId)
        return s && s.department === d.name
      }).length,
    })),
    recentCompetitions: allComps.slice(-3),
  }
}

export async function getStudentDashboardStats(email: string) {
  const profile = await getProfileByEmail(email)
  const allComps = await getCompetitions()
  const allRegs = await getRegistrations()
  const allVrs = await getVerificationRequests()

  const myRegs = allRegs.filter((r: any) => r.userId === profile?.id || r.userName === profile?.name)
  const myVrs = allVrs.filter((v: any) => v.studentId === profile?.id)

  return {
    totalRegistered: myRegs.length,
    totalVerified: myRegs.filter((r: any) => r.status === 'verified' || r.status === 'completed').length,
    totalPending: myRegs.filter((r: any) => r.status === 'pending_verification').length,
    totalWins: 0,
    registrations: myRegs,
    upcomingCompetitions: allComps.slice(0, 5),
    recentVerifiedRegs: myRegs.filter((r: any) => r.status === 'verified' || r.status === 'completed').slice(0, 5),
    selfVerificationRequests: myVrs.filter((v: any) => v.status === 'pending').slice(0, 5),
  }
}

// ─── Profile ──────────────────────────────────────────────────────
export async function getProfileByEmail(email: string) {
  const students = await getStudents()
  const advisors = await getAdvisors()

  const student = students.find((s: any) => s.email === email)
  if (student) return { id: student.id, email, name: student.name, role: 'student' as const, department: student.department }

  const advisor = advisors.find((a: any) => a.email === email)
  if (advisor) return { id: advisor.id, email, name: advisor.name, role: 'advisor' as const, department: advisor.department }

  const roleMap: Record<string, { id: string; name: string; role: 'hod' | 'super_admin'; department: string }> = {
    'hod@cit.in': { id: 'user-hod', name: 'Dr. HOD Kumar', role: 'hod', department: 'CSE' },
    'admin@cit.in': { id: 'user-admin', name: 'Super Admin', role: 'super_admin', department: 'Administration' },
  }
  return roleMap[email] || { id: 'user-' + email.split('@')[0], email, name: email.split('@')[0], role: 'student' as const, department: 'CSE' }
}
