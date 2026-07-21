import { NextRequest, NextResponse } from 'next/server'
import {
  departments, students, advisors, competitions, registrations,
  winners, auditLogs, notifications, verificationRequests,
  ensureLoaded, pushRegistration, pushNotification,
  pushVerificationRequest, pushWinner, pushStudent, pushAdvisor,
  syncRegistration,
} from '@/lib/firebase-data'
import { getAllRoleAccessData, setUserAccess, checkUserAccess } from '@/lib/firestore-service'
import type { UserRole } from '@/lib/auth'

const userProfile = {
  id: 'user-1',
  email: 'admin@citchennai.net',
  name: 'Admin User',
  avatarUrl: null as string | null,
  department: 'CSE',
  section: 'A',
  academicYear: '2024-2025',
  role: 'super_admin' as const,
  organizationId: 'org-cit',
  createdAt: '2023-06-01T09:00:00Z',
  updatedAt: '2025-07-01T09:00:00Z',
  notificationPreferences: { emailNotifications: true, pushNotifications: true, deadlineReminders: true, verificationUpdates: true, newCompetitions: false },
  language: 'en' as const,
}

type RouteHandler = (req: NextRequest, segments: string[]) => Promise<NextResponse>

function ok(data: unknown) {
  return NextResponse.json({ success: true, data })
}

function paginated<T>(items: T[], page: number, limit: number) {
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages,
  }
}

function filterRegs(list: typeof registrations, qs: URLSearchParams) {
  let result = [...list]
  const status = qs.get('status')
  if (status && status !== 'all') result = result.filter(r => r.status === status)
  return result
}

function filterStudents(list: typeof students, qs: URLSearchParams) {
  let result = [...list]
  const s = qs.get('search')?.toLowerCase()
  if (s) result = result.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s))
  const dept = qs.get('department')
  if (dept) result = result.filter(x => x.department === dept)
  return result
}

function filterAdvisors(list: typeof advisors, qs: URLSearchParams) {
  let result = [...list]
  const s = qs.get('search')?.toLowerCase()
  if (s) result = result.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s))
  return result
}

function filterComps(list: typeof competitions, qs: URLSearchParams) {
  let result = [...list]
  const cat = qs.get('category')
  if (cat) result = result.filter(c => c.category === cat)
  const s = qs.get('search')?.toLowerCase()
  if (s) result = result.filter(c => c.title.toLowerCase().includes(s) || c.organizer.toLowerCase().includes(s))
  return result
}

const routes: Record<string, RouteHandler> = {}

function register(method: string, pattern: string, handler: RouteHandler) {
  const key = `${method}:${pattern}`
  routes[key] = handler
}

async function handle(request: NextRequest, pathSegments: string[]) {
  await ensureLoaded()
  const method = request.method
  const qs = new URL(request.url).searchParams
  const path = '/' + pathSegments.join('/')

  const exactKey = `${method}:${path}`
  if (routes[exactKey]) return routes[exactKey](request, pathSegments)

  for (const [key, handler] of Object.entries(routes)) {
    const colonIdx = key.indexOf(':')
    const m = key.slice(0, colonIdx)
    const pattern = key.slice(colonIdx + 1)
    if (m !== method) continue
    const patternParts = pattern.split('/')
    if (patternParts.length !== pathSegments.length + 1) continue
    let match = true
    for (let i = 0; i < pathSegments.length; i++) {
      const pp = patternParts[i + 1]
      if (pp?.startsWith(':')) continue
      if (pp !== pathSegments[i]) { match = false; break }
    }
    if (match) return handler(request, pathSegments)
  }

  return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: `No handler for ${method} ${path}` } }, { status: 404 })
}

function getProfileByEmail(email: string) {
  const roleMap: Record<string, { id: string; email: string; name: string; role: UserRole; department: string }> = {
    'hod@cit.in': { id: 'user-hod', email: 'hod@cit.in', name: 'Dr. HOD Kumar', role: 'hod', department: 'CSE' },
    'advisor@cit.in': { id: 'user-adv', email: 'advisor@cit.in', name: 'Dr. Priya Sharma', role: 'advisor', department: 'CSE' },
    'student@cit.in': { id: 'user-stu', email: 'student@cit.in', name: 'Jeevan R', role: 'student', department: 'CSE' },
  }
  return roleMap[email] || { ...userProfile, email, id: 'user-' + email.split('@')[0] }
}

function getEmailFromToken(req: NextRequest): string {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const parts = token.split('-')
  return parts[2] || 'hod@cit.in'
}

// --- AUTH ---
register('POST', '/auth/google', async (req) => {
  const body = await req.json()
  const email = body.email || 'hod@cit.in'
  const profile = getProfileByEmail(email)
  const token = 'mock-jwt-' + email + '-' + Date.now()
  return ok({ user: profile, token, refreshToken: 'mock-refresh-' + Date.now() })
})

register('GET', '/auth/check-access', async (req) => {
  const url = new URL(req.url)
  const email = url.searchParams.get('email') || getEmailFromToken(req)
  const result = await checkUserAccess(email)
  return ok(result)
})

register('GET', '/auth/me', async (req) => {
  const email = getEmailFromToken(req)
  return ok({ ...getProfileByEmail(email), ...userProfile, email, role: getProfileByEmail(email).role })
})

register('PUT', '/auth/profile', async (req) => {
  const body = await req.json()
  Object.assign(userProfile, body)
  return ok(userProfile)
})

register('PUT', '/auth/notification-preferences', async (req) => {
  const body = await req.json()
  if (userProfile.notificationPreferences) Object.assign(userProfile.notificationPreferences, body)
  return ok(userProfile.notificationPreferences)
})

register('PUT', '/auth/language', async (req) => {
  const body = await req.json()
  userProfile.language = body.language
  return ok({ language: body.language })
})

register('POST', '/auth/logout', async () => ok(null))

// --- COMPETITIONS ---
register('GET', '/competitions', async (req) => {
  const qs = new URL(req.url).searchParams
  const filtered = filterComps(competitions, qs)
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(filtered, page, limit))
})

register('GET', '/competitions/upcoming', async () => {
  const upcoming = competitions.filter(c => new Date(c.startDate) > new Date()).slice(0, 5)
  return ok(upcoming)
})

register('GET', '/competitions/trending', async () => {
  const trending = competitions.filter(c => c.scope === 'national' || c.scope === 'international').slice(0, 4)
  return ok(trending)
})

register('GET', '/competitions/search', async (req) => {
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase() || ''
  const results = competitions.filter(c => c.title.toLowerCase().includes(q))
  return ok(results)
})

register('GET', '/competitions/:id', async (req, seg) => {
  const id = seg[1]
  const comp = competitions.find(c => c.id === id)
  if (!comp) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })
  return ok({
    ...comp,
    instructions: 'Please read all rules carefully before registering.',
    contactEmail: 'events@citchennai.net',
    contactPhone: '+91-44-22345678',
    venue: comp.mode === 'offline' ? 'CIT Main Campus, Chennai' : undefined,
    isBookmarked: false,
    bookmarkCount: Math.floor(Math.random() * 50) + 5,
    registrationCount: registrations.filter(r => r.competitionId === id).length,
  })
})

register('POST', '/competitions', async (req) => {
  const body = await req.json()
  const newComp = {
    id: 'comp-' + (competitions.length + 1),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  competitions.push(newComp)
  return ok(newComp)
})

register('PUT', '/competitions/:id', async (req, seg) => {
  const id = seg[1]
  const body = await req.json()
  const idx = competitions.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })
  competitions[idx] = { ...competitions[idx], ...body, updatedAt: new Date().toISOString() }
  return ok(competitions[idx])
})

register('DELETE', '/competitions/:id', async (req, seg) => {
  const id = seg[1]
  const idx = competitions.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })
  competitions.splice(idx, 1)
  return ok(null)
})

// --- COMPETITION DASHBOARD (for Advisor/HOD/COE) ---
register('GET', '/competitions/:id/dashboard', async (req, seg) => {
  const id = seg[1]
  const comp = competitions.find(c => c.id === id)
  if (!comp) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })

  const registered = registrations.filter(r => r.competitionId === id)
  const registeredIds = new Set(registered.map(r => r.userId))
  const eligibleDepts = comp.eligibility.departments
  const unregistered = students
    .filter(s => eligibleDepts.includes(s.department) && !registeredIds.has(s.id))
    .map(s => ({ id: s.id, name: s.name, email: s.email, department: s.department, section: s.section }))

  const byDept: Record<string, number> = {}
  registered.forEach(r => {
    byDept[r.department] = (byDept[r.department] || 0) + 1
  })
  const registrationsByDepartment = Object.entries(byDept).map(([department, count]) => ({ department, count }))

  return ok({
    competition: comp,
    registeredStudents: registered,
    unregisteredStudents: unregistered,
    totalRegistered: registered.length,
    totalUnregistered: unregistered.length,
    registrationsByDepartment,
  })
})

// --- REGISTRATIONS ---
register('GET', '/registrations', async (req) => {
  const qs = new URL(req.url).searchParams
  const filtered = filterRegs(registrations, qs)
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(filtered, page, limit))
})

register('GET', '/registrations/stats', async () => {
  const totalRegistered = registrations.length
  const totalVerified = registrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const totalCompleted = registrations.filter(r => r.status === 'completed').length
  const totalRejected = registrations.filter(r => r.status === 'rejected').length
  const totalPending = registrations.filter(r => r.status === 'pending_verification').length
  return ok({ totalRegistered, totalVerified, totalCompleted, totalRejected, totalPending, verificationRate: Math.round((totalVerified / totalRegistered) * 100) })
})

register('POST', '/registrations', async (req) => {
  const body = await req.json()
  const comp = competitions.find(c => c.id === body.competitionId)!
  const newReg: (typeof registrations)[0] = {
    id: 'reg-' + (registrations.length + 1),
    competitionId: body.competitionId,
    competition: comp as (typeof registrations)[0]['competition'],
    userId: 'user-1',
    userName: 'Current User',
    department: '',
    status: 'pending_verification' as const,
    registeredAt: new Date().toISOString(),
    verifiedAt: null,
    verificationMethod: body.verificationMethod || null,
    extractedConfirmationId: null,
    extractedEmail: null,
    rejectionReason: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await pushRegistration(newReg)
  return ok(newReg)
})

register('GET', '/registrations/lookup', async (req) => {
  const qs = new URL(req.url).searchParams
  const email = qs.get('email')?.toLowerCase().trim()
  if (!email) return ok({ found: false, registrations: [] })
  const student = students.find(s => s.email.toLowerCase() === email)
  if (!student) return ok({ found: false, registrations: [] })
  const regs = registrations.filter(r => r.userId === student.id)
  return ok({ found: true, student, registrations: regs })
})

register('GET', '/registrations/:id', async (req, seg) => {
  const id = seg[1]
  const reg = registrations.find(r => r.id === id)
  if (!reg) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Registration not found' } }, { status: 404 })
  return ok(reg)
})

register('PATCH', '/registrations/:id/verify', async (req, seg) => {
  const id = seg[1]
  const body = await req.json()
  const reg = registrations.find(r => r.id === id)
  if (!reg) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Registration not found' } }, { status: 404 })
  reg.status = body.action === 'approve' ? 'verified' : 'rejected'
  if (body.action === 'approve') reg.verifiedAt = new Date().toISOString()
  reg.rejectionReason = body.reason || null
  return ok(reg)
})

// --- EMAIL VERIFICATION (keyword search + request) ---
register('GET', '/registrations/search', async (req) => {
  const qs = new URL(req.url).searchParams
  const keyword = qs.get('keyword')?.toLowerCase().trim()
  const email = qs.get('email')?.toLowerCase().trim()
  if (!keyword || !email) return ok({ matches: [] })
  const student = students.find(s => s.email.toLowerCase() === email)
  if (!student) return ok({ matches: [] })
  const matchingComps = competitions.filter(c =>
    c.title.toLowerCase().includes(keyword) ||
    c.shortDescription.toLowerCase().includes(keyword) ||
    c.tags.some((t: string) => t.toLowerCase().includes(keyword))
  )
  const matches = matchingComps.map(comp => {
    const reg = registrations.find(r => r.competitionId === comp.id && r.userId === student.id)
    return { competition: comp, registration: reg || null, isRegistered: !!reg }
  })
  return ok({ student, matches })
})

register('POST', '/verification-requests', async (req) => {
  const body = await req.json()
  const { registrationId, studentEmail } = body
  if (!registrationId || !studentEmail) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'registrationId and studentEmail required' } }, { status: 400 })
  const student = students.find(s => s.email.toLowerCase() === studentEmail.toLowerCase())
  if (!student) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  const reg = registrations.find(r => r.id === registrationId)
  if (!reg) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Registration not found' } }, { status: 404 })
  const existingVr = verificationRequests.find(v => v.registrationId === registrationId && v.studentId === student.id)
  if (existingVr) return ok({ ...existingVr, alreadyRequested: true })
  const newVr = {
    id: 'vr-' + (verificationRequests.length + 1),
    registrationId,
    studentId: student.id,
    studentName: student.name,
    department: student.department,
    competitionTitle: reg.competition?.title || 'Unknown',
    advisorNotified: false,
    emailProof: null,
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
  }
  await pushVerificationRequest(newVr as any)
  await pushNotification({
    id: 'notif-' + (notifications.length + 1),
    userId: 'adv-1',
    type: 'verification_update' as const,
    title: 'Verification Requested',
    message: `${student.name} has requested verification for ${reg.competition?.title || 'a competition'}.`,
    data: null,
    isRead: false,
    createdAt: new Date().toISOString(),
  })
  return ok({ ...newVr, alreadyRequested: false })
})

// --- NOTIFICATIONS ---
register('GET', '/notifications', async (req) => {
  const qs = new URL(req.url).searchParams
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok({
    data: notifications.slice((page - 1) * limit, page * limit),
    total: notifications.length,
    unreadCount: notifications.filter(n => !n.isRead).length,
    page,
    limit,
  })
})

register('PATCH', '/notifications/:id/read', async (req, seg) => {
  const n = notifications.find(x => x.id === seg[1])
  if (n) n.isRead = true
  return ok(null)
})

register('PATCH', '/notifications/read-all', async () => {
  notifications.forEach(n => { n.isRead = true })
  return ok(null)
})

register('GET', '/notifications/unread-count', async () => ok({ count: notifications.filter(n => !n.isRead).length }))

// --- STUDENT DASHBOARD ---
register('GET', '/student/dashboard/stats', async (req) => {
  const email = getEmailFromToken(req)
  const profile = getProfileByEmail(email)
  const myRegistrations = registrations.filter(r => r.userId === profile.id || r.userName === profile.name)
  const pending = myRegistrations.filter(r => r.status === 'pending_verification').length
  const verified = myRegistrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const winCount = winners.filter(w => w.email === email).length
  const upcoming = competitions.filter(c => new Date(c.startDate) > new Date()).slice(0, 5)
  const recentVerified = myRegistrations.filter(r => r.verifiedAt).sort((a, b) => new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime()).slice(0, 5)

  return ok({
    totalRegistered: myRegistrations.length,
    totalVerified: verified,
    totalPending: pending,
    totalWins: winCount,
    registrations: myRegistrations,
    upcomingCompetitions: upcoming,
    recentVerifiedRegs: recentVerified,
  })
})

// --- STUDENT HISTORY ---
register('GET', '/student/history', async (req) => {
  const email = getEmailFromToken(req)
  const profile = getProfileByEmail(email)
  const myRegs = registrations.filter(r => r.userId === profile.id || r.userName === profile.name)
  const history = myRegs.map(r => {
    const win = winners.find(w => w.competitionId === r.competitionId && (w.email === email))
    return {
      registration: r,
      competition: r.competition,
      status: r.status,
      verifiedAt: r.verifiedAt,
      position: win?.position || null,
      prize: win?.prize || null,
    }
  })
  return ok(history)
})

// --- LEADERBOARD ---
register('GET', '/leaderboard/overall', async () => {
  const ranked = [...students]
    .sort((a, b) => b.registeredCompetitions - a.registeredCompetitions)
    .map((s, i) => ({
      rank: i + 1,
      studentName: s.name,
      email: s.email,
      department: s.department,
      points: s.registeredCompetitions * 10,
      competitionsCount: s.registeredCompetitions,
      wins: winners.filter(w => w.email === s.email).length,
    }))
  return ok(ranked)
})

register('GET', '/leaderboard/department', async (req) => {
  const qs = new URL(req.url).searchParams
  const dept = qs.get('department')
  let filtered = [...students]
  if (dept) filtered = filtered.filter(s => s.department === dept)
  const ranked = filtered
    .sort((a, b) => b.registeredCompetitions - a.registeredCompetitions)
    .map((s, i) => ({
      rank: i + 1,
      studentName: s.name,
      email: s.email,
      department: s.department,
      points: s.registeredCompetitions * 10,
      competitionsCount: s.registeredCompetitions,
      wins: winners.filter(w => w.email === s.email).length,
    }))
  return ok(ranked)
})

register('GET', '/leaderboard/departments', async () => {
  const deptStats = departments.map(d => {
    const deptStudents = students.filter(s => s.department === d.name)
    const totalPoints = deptStudents.reduce((sum, s) => sum + (s as any).points || s.registeredCompetitions * 10, 0)
    const totalWins = winners.filter(w => w.department === d.name).length
    return {
      department: d.name,
      fullName: d.fullName,
      totalPoints,
      totalCompetitions: d.competitionCount,
      totalWins,
      studentCount: d.studentCount,
    }
  }).sort((a, b) => b.totalPoints - a.totalPoints)
  return ok(deptStats)
})

register('GET', '/leaderboard/competition/:id', async (req, seg) => {
  const id = seg[2]
  const comp = competitions.find(c => c.id === id)
  if (!comp) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })
  const compWinners = winners.filter(w => w.competitionId === id)
  const ranked = compWinners.map((w, i) => ({
    rank: i + 1,
    studentName: w.studentName,
    email: w.email,
    department: w.department,
    score: 100 - i * 10,
    position: w.position,
  }))
  return ok(ranked)
})

// --- ADVISOR REMINDER ---
register('POST', '/advisor/remind/:id', async (req, seg) => {
  const id = seg[2]
  const comp = competitions.find(c => c.id === id)
  if (!comp) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Competition not found' } }, { status: 404 })
  const registeredIds = new Set(registrations.filter(r => r.competitionId === id).map(r => r.userId))
  const unregistered = students.filter(s => comp.eligibility.departments.includes(s.department) && !registeredIds.has(s.id))
  await pushNotification({
    id: 'notif-' + (notifications.length + 1),
    userId: 'adv-1',
    type: 'deadline_reminder' as const,
    title: 'Reminder Sent',
    message: `Reminder sent to ${unregistered.length} students for ${comp.title}.`,
    data: null,
    isRead: false,
    createdAt: new Date().toISOString(),
  })
  return ok({ reminded: unregistered.length, students: unregistered.map(s => s.name) })
})

// --- ADVISOR DASHBOARD ---
register('GET', '/advisor/dashboard/stats', async (req) => {
  const totalRegistrations = registrations.length
  const verifiedRegistrations = registrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const verificationRate = totalRegistrations > 0 ? Math.round((verifiedRegistrations / totalRegistrations) * 100) : 0
  const registrationsOverTime = [
    { date: '2025-04-01', count: 2 }, { date: '2025-04-08', count: 3 }, { date: '2025-04-15', count: 1 },
    { date: '2025-04-22', count: 4 }, { date: '2025-05-01', count: 5 }, { date: '2025-05-08', count: 3 },
    { date: '2025-05-15', count: 7 }, { date: '2025-05-22', count: 4 }, { date: '2025-06-01', count: 6 },
    { date: '2025-06-08', count: 8 }, { date: '2025-06-15', count: 5 }, { date: '2025-06-22', count: 3 },
  ]
  const topDepartments = departments.map(d => ({ name: d.name, count: students.filter(s => s.department === d.name).length * 3 })).sort((a, b) => b.count - a.count).slice(0, 5)
  const recentVerified = registrations.filter(r => r.verifiedAt).sort((a, b) => new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime()).slice(0, 5)
  const pendingVerifications = registrations.filter(r => r.status === 'pending_verification').slice(0, 5)
  const selfVerificationRequests = verificationRequests.filter(v => v.status === 'pending').slice(0, 5)

  return ok({ totalCompetitions: competitions.length, totalRegistrations, verifiedRegistrations, verificationRate, registrationsOverTime, topDepartments, recentVerified, pendingVerifications, selfVerificationRequests })
})

// --- HOD DASHBOARD ---
register('GET', '/hod/dashboard/stats', async (req) => {
  const email = getEmailFromToken(req)
  const profile = getProfileByEmail(email)
  const dept = profile.department || 'CSE'
  const deptStudents = students.filter(s => s.department === dept)
  const deptRegistrations = registrations.filter(r => deptStudents.some(ds => ds.id === r.userId))
  const deptCompetitions = competitions.filter(c => c.eligibility.departments.includes(dept))
  const registered = deptRegistrations.length
  const unregistered = deptStudents.length - new Set(deptRegistrations.map(r => r.userId)).size

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
  const yearWise = years.map(year => {
    const yrStudents = deptStudents.filter(s => s.year === year)
    const yrRegistrations = deptRegistrations.filter(r => yrStudents.some(s => s.id === r.userId))
    return {
      year,
      studentCount: yrStudents.length,
      registrationCount: yrRegistrations.length,
      verifiedCount: yrRegistrations.filter(r => r.status === 'verified' || r.status === 'completed').length,
      pendingCount: yrRegistrations.filter(r => r.status === 'pending_verification').length,
    }
  })

  return ok({
    department: dept,
    totalStudents: deptStudents.length,
    totalCompetitions: deptCompetitions.length,
    registeredCount: registered,
    unregisteredCount: Math.max(0, unregistered),
    registrations: deptRegistrations.slice(0, 10),
    yearWise,
    selfVerificationRequests: verificationRequests.filter(v => v.status === 'pending' && v.department === dept).slice(0, 5),
  })
})

// --- COE DASHBOARD ---
register('GET', '/coe/dashboard/stats', async () => {
  return ok({
    totalCompetitions: competitions.length,
    totalStudents: students.length,
    totalRegistrations: registrations.length,
    totalAdvisors: advisors.length,
    totalDepartments: departments.length,
    totalWinners: winners.length,
    registrations: registrations.slice(0, 10),
    selfVerificationRequests: verificationRequests.filter(v => v.status === 'pending').slice(0, 5),
    registrationsByDepartment: departments.map(d => ({
      department: d.name,
      count: registrations.filter(r => {
        const s = students.find(st => st.id === r.userId)
        return s && s.department === d.name
      }).length,
    })),
    recentCompetitions: competitions.slice(-3),
  })
})

// --- ROLE ACCESS ---
register('GET', '/coe/role-access', async () => {
  const users = await getAllRoleAccessData()
  return ok({
    students: users.filter(u => u.role === 'student'),
    advisors: users.filter(u => u.role === 'advisor'),
    hods: users.filter(u => u.role === 'hod'),
  })
})

register('PATCH', '/coe/role-access/:id', async (req, seg) => {
  const body = await req.json()
  const id = seg[2]
  await setUserAccess(id, body.active !== false)
  return ok({ updated: true, id, active: body.active !== false })
})

// --- FILE UPLOAD (Firebase Storage) ---
register('POST', '/upload', async (req) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file provided' } }, { status: 400 })
    }

    const { uploadFile } = await import('@/lib/storage-service')
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type || 'application/octet-stream', folder)

    return ok(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'UPLOAD_FAILED', message: err.message } }, { status: 500 })
  }
})

register('DELETE', '/upload/:path(*)', async (req, seg) => {
  try {
    const path = seg[2]
    const { deleteFile } = await import('@/lib/storage-service')
    await deleteFile(decodeURIComponent(path))
    return ok({ deleted: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { code: 'DELETE_FAILED', message: err.message } }, { status: 500 })
  }
})

// --- ADMIN ROUTES (legacy - mapped to COE) ---
register('GET', '/admin/dashboard/stats', async () => {
  const totalCompetitions = competitions.length
  const totalRegistrations = registrations.length
  const verifiedRegistrations = registrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const verificationRate = totalRegistrations > 0 ? Math.round((verifiedRegistrations / totalRegistrations) * 100) : 0
  const registrationsOverTime = [
    { date: '2025-04-01', count: 2 }, { date: '2025-04-08', count: 3 }, { date: '2025-04-15', count: 1 },
    { date: '2025-04-22', count: 4 }, { date: '2025-05-01', count: 5 }, { date: '2025-05-08', count: 3 },
    { date: '2025-05-15', count: 7 }, { date: '2025-05-22', count: 4 }, { date: '2025-06-01', count: 6 },
    { date: '2025-06-08', count: 8 }, { date: '2025-06-15', count: 5 }, { date: '2025-06-22', count: 3 },
  ]
  const topDepartments = departments.map(d => ({ name: d.name, count: students.filter(s => s.department === d.name).length * 3 })).sort((a, b) => b.count - a.count).slice(0, 5)
  const recentVerified = registrations.filter(r => r.verifiedAt).sort((a, b) => new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime()).slice(0, 5)
  const pendingVerifications = registrations.filter(r => r.status === 'pending_verification').slice(0, 5)
  const selfVerificationRequests = verificationRequests.filter(v => v.status === 'pending').slice(0, 5)

  return ok({ totalCompetitions, totalRegistrations, verifiedRegistrations, verificationRate, registrationsOverTime, topDepartments, recentVerified, pendingVerifications, selfVerificationRequests })
})

register('GET', '/admin/registrations/stats', async () => {
  const totalRegistered = registrations.length
  const totalVerified = registrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const totalPending = registrations.filter(r => r.status === 'pending_verification').length
  const totalRejected = registrations.filter(r => r.status === 'rejected').length
  const totalCompleted = registrations.filter(r => r.status === 'completed').length
  return ok({
    totalRegistered, totalVerified, totalCompleted, totalRejected, totalPending,
    verificationRate: totalRegistered > 0 ? Math.round((totalVerified / totalRegistered) * 100) : 0,
    totalCompetitions: competitions.length,
    totalRegistrations: registrations.length,
    registrationGrowth: 15,
    verifiedGrowth: 10,
    verificationRateChange: 5,
  })
})

register('GET', '/admin/students', async (req) => {
  const qs = new URL(req.url).searchParams
  const filtered = filterStudents(students, qs)
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(filtered, page, limit))
})

register('POST', '/admin/students', async (req) => {
  const body = await req.json()
  const { name, email, year, section } = body
  if (!name || !email) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'name and email required' } }, { status: 400 })
  }
  const newStudent = {
    id: 'stu-' + (students.length + 1),
    name,
    email,
    department: 'CSE',
    year: year || '1st Year',
    section: section || 'A',
    registeredCompetitions: 0,
    verifiedCompetitions: 0,
    createdAt: new Date().toISOString(),
  }
  await pushStudent(newStudent)
  return ok(newStudent)
})

register('GET', '/admin/advisors', async (req) => {
  const qs = new URL(req.url).searchParams
  const filtered = filterAdvisors(advisors, qs)
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(filtered, page, limit))
})

register('POST', '/admin/advisors', async (req) => {
  const body = await req.json()
  const { name, email, assignedSections } = body
  if (!name || !email) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'name and email required' } }, { status: 400 })
  }
  const newAdvisor = {
    id: 'adv-' + (advisors.length + 1),
    name,
    email,
    department: 'CSE',
    assignedSections: assignedSections || [],
    pendingVerifications: 0,
    createdAt: new Date().toISOString(),
  }
  await pushAdvisor(newAdvisor)
  return ok(newAdvisor)
})

register('GET', '/admin/departments', async () => ok(departments))

register('GET', '/admin/winners', async (req) => {
  const qs = new URL(req.url).searchParams
  let filtered = [...winners]
  const s = qs.get('search')?.toLowerCase()
  if (s) filtered = filtered.filter(w => w.studentName.toLowerCase().includes(s) || w.competition.toLowerCase().includes(s))
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(filtered, page, limit))
})

register('POST', '/admin/winners', async (req) => {
  const body = await req.json()
  const { studentName, email, competition, competitionId, department, position, prize } = body
  if (!studentName || !email || !competition) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'studentName, email, and competition are required' } }, { status: 400 })
  }
  const newWinner = {
    id: 'win-' + (winners.length + 1),
    studentName,
    email,
    competition,
    competitionId: competitionId || null,
    department: department || 'CSE',
    position: position || '',
    prize: prize || '',
    date: new Date().toISOString().split('T')[0],
  }
  await pushWinner(newWinner)

  const allUserIds = ['user-1', 'user-coe', 'user-hod', 'user-adv', 'user-stu']
  for (const uid of allUserIds) {
    await pushNotification({
      id: 'notif-' + (notifications.length + 1),
      userId: uid,
      type: 'winner_announced' as const,
      title: 'Winner Announced',
      message: `${studentName} from ${department} has won ${position} in ${competition}!`,
      data: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    })
  }

  return ok(newWinner)
})

register('GET', '/admin/analytics/stats', async () => {
  const totalCompetitions = competitions.length
  const totalParticipants = registrations.length
  const winRate = registrations.length > 0 ? Math.round((winners.length / registrations.length) * 100) : 0
  const verifiedCount = registrations.filter(r => r.status === 'verified' || r.status === 'completed').length
  const verificationRate = registrations.length > 0 ? Math.round((verifiedCount / registrations.length) * 100) : 0
  const competitionTrends = [
    { date: 'Jan', count: 2 }, { date: 'Feb', count: 3 }, { date: 'Mar', count: 1 },
    { date: 'Apr', count: 5 }, { date: 'May', count: 4 }, { date: 'Jun', count: 6 },
  ]
  const departmentPerformance = departments.slice(0, 6).map(d => ({
    name: d.name,
    count: registrations.filter(r => r.competition.eligibility.departments.includes(d.name)).length * 2 || Math.floor(Math.random() * 20) + 5,
  }))
  const verificationRateOverTime = [
    { date: 'Jan', rate: 75 }, { date: 'Feb', rate: 78 }, { date: 'Mar', rate: 72 },
    { date: 'Apr', rate: 80 }, { date: 'May', rate: 85 }, { date: 'Jun', rate: 82 },
  ]
  return ok({ totalCompetitions, totalParticipants, winRate, verificationRate, competitionTrends, departmentPerformance, verificationRateOverTime })
})

register('GET', '/admin/audit-logs', async (req) => {
  const qs = new URL(req.url).searchParams
  const page = parseInt(qs.get('page') || '1')
  const limit = parseInt(qs.get('limit') || '10')
  return ok(paginated(auditLogs, page, limit))
})

// --- GMAIL OAUTH ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback'
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly openid email'

register('GET', '/auth/gmail', async (req) => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPES)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  return NextResponse.redirect(url.toString())
})

register('GET', '/auth/gmail/callback', async (req) => {
  const qs = new URL(req.url).searchParams
  const code = qs.get('code')
  if (!code) return NextResponse.redirect(new URL('/email-verification?error=no_code', req.url))

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()
  if (!tokens.access_token) return NextResponse.redirect(new URL('/email-verification?error=token_failed', req.url))

  const res = NextResponse.redirect(new URL('/email-verification?auth=success', req.url))
  res.cookies.set('gmail_token', tokens.access_token, { httpOnly: true, secure: false, path: '/', maxAge: 3600 })
  if (tokens.refresh_token) res.cookies.set('gmail_refresh_token', tokens.refresh_token, { httpOnly: true, secure: false, path: '/', maxAge: 86400 })
  return res
})

register('GET', '/gmail/search', async (req) => {
  const qs = new URL(req.url).searchParams
  const keyword = qs.get('keyword')?.trim()
  if (!keyword) return ok({ emails: [] })

  const token = req.cookies.get('gmail_token')?.value
  if (!token) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated with Gmail' } }, { status: 401 })

  const query = keyword ? `subject:(${keyword}) OR ${keyword}` : ''
  const searchRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!searchRes.ok) return ok({ emails: [] })

  const searchData = await searchRes.json()
  const messages = searchData.messages || []
  const emails = await Promise.all(
    messages.map(async (msg: any) => {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!detailRes.ok) return null
      const detail = await detailRes.json()
      const headers = detail.payload?.headers || []
      const from = headers.find((h: any) => h.name === 'From')?.value || ''
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
      const date = headers.find((h: any) => h.name === 'Date')?.value || ''
      const snippet = detail.snippet || ''
      return { id: msg.id, from, subject, snippet, date, matchKeyword: keyword }
    })
  )

  return ok({ emails: emails.filter(Boolean) })
})

register('GET', '/gmail/email-detail', async (req) => {
  const qs = new URL(req.url).searchParams
  const id = qs.get('id')
  if (!id) return ok({ email: null })

  const token = req.cookies.get('gmail_token')?.value
  if (!token) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!detailRes.ok) return ok({ email: null })

  const detail = await detailRes.json()
  const headers = detail.payload?.headers || []
  const from = headers.find((h: any) => h.name === 'From')?.value || ''
  const to = headers.find((h: any) => h.name === 'To')?.value || ''
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
  const date = headers.find((h: any) => h.name === 'Date')?.value || ''
  const snippet = detail.snippet || ''

  return ok({ email: { id, from, to, subject, snippet, date } })
})

register('POST', '/verification-requests/with-proof', async (req) => {
  const body = await req.json()
  const { registrationId, studentEmail, emailProof } = body
  if (!studentEmail) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'studentEmail is required' } }, { status: 400 })
  }
  const student = students.find(s => s.email.toLowerCase() === studentEmail.toLowerCase())
  if (!student) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 })

  let competitionTitle = 'Unknown'
  let reg: any = null

  if (registrationId) {
    reg = registrations.find(r => r.id === registrationId)
    if (!reg) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Registration not found' } }, { status: 404 })
    competitionTitle = reg.competition?.title || 'Unknown'
    const existingVr = verificationRequests.find(v => v.registrationId === registrationId && v.studentId === student.id)
    if (existingVr) return ok({ ...existingVr, alreadyRequested: true })
  } else if (emailProof?.subject) {
    competitionTitle = emailProof.subject
  }

  const newVr = {
    id: 'vr-' + (verificationRequests.length + 1),
    registrationId: registrationId || null,
    studentId: student.id,
    studentName: student.name,
    department: student.department,
    competitionTitle,
    advisorNotified: false,
    emailProof: emailProof || null,
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
  }
  await pushVerificationRequest(newVr as any)
  await pushNotification({
    id: 'notif-' + (notifications.length + 1),
    userId: 'adv-1',
    type: 'verification_update' as const,
    title: 'Email Proof Submitted',
    message: `${student.name} has submitted email proof${competitionTitle && competitionTitle !== 'Unknown' ? ` for "${competitionTitle}"` : ''}.`,
    data: null,
    isRead: false,
    createdAt: new Date().toISOString(),
  })
  return ok({ ...newVr, alreadyRequested: false })
})

register('PATCH', '/verification-requests/:id/verify', async (req, seg) => {
  const vrId = seg[1]
  const vr = verificationRequests.find(v => v.id === vrId)
  if (!vr) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Verification request not found' } }, { status: 404 })

  ;(vr as any).status = 'verified'
  vr.advisorNotified = true

  if (vr.registrationId) {
    const reg = registrations.find(r => r.id === vr.registrationId)
    if (reg) {
      reg.status = 'verified'
      reg.verifiedAt = new Date().toISOString()
      await syncRegistration(reg.id)
    }
  }

  await pushNotification({
    id: 'notif-' + (notifications.length + 1),
    userId: vr.studentId,
    type: 'verification_update' as const,
    title: 'Email Verified',
    message: `Your email proof has been verified by your class advisor.`,
    data: null,
    isRead: false,
    createdAt: new Date().toISOString(),
  })

  return ok({ verified: true, vr })
})

// --- GET all verification requests (for advisor page) ---
register('GET', '/verification-requests', async (req) => {
  const qs = new URL(req.url).searchParams
  const dept = qs.get('department')
  let result = [...verificationRequests]
  if (dept) result = result.filter(v => v.department === dept)
  result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
  return ok(result)
})

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(request, params.path)
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(request, params.path)
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(request, params.path)
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(request, params.path)
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(request, params.path)
}
