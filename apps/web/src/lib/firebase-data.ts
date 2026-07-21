import { firestore } from './firebase-admin'
import * as mock from './mock-data'

// ─── In-memory caches (mirrors mock-data structure) ───────────────
export let departments: any[] = []
export let students: any[] = []
export let advisors: any[] = []
export let competitions: any[] = []
export let registrations: any[] = []
export let winners: any[] = []
export let auditLogs: any[] = []
export let notifications: any[] = []
export let verificationRequests: any[] = []

let loaded = false

async function loadFromFirestore() {
  const snapshots = await Promise.all([
    firestore.collection('departments').get(),
    firestore.collection('students').get(),
    firestore.collection('advisors').get(),
    firestore.collection('competitions').get(),
    firestore.collection('registrations').get(),
    firestore.collection('winners').get(),
    firestore.collection('auditLogs').get(),
    firestore.collection('notifications').get(),
    firestore.collection('verificationRequests').get(),
  ])

  const [deptSnap, stuSnap, advSnap, compSnap, regSnap, winSnap, logSnap, notifSnap, vrSnap] = snapshots

  const allEmpty = deptSnap.empty && stuSnap.empty && compSnap.empty && regSnap.empty

  if (allEmpty) {
    await seedFirestore()
    return
  }

  departments = deptSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  students = stuSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  advisors = advSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  competitions = compSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  registrations = regSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  winners = winSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  auditLogs = logSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  notifications = notifSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  verificationRequests = vrSnap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function seedFirestore() {
  const seedMap: [string, any[]][] = [
    ['departments', mock.departments],
    ['students', mock.students],
    ['advisors', mock.advisors],
    ['competitions', mock.competitions],
    ['registrations', mock.registrations],
    ['winners', mock.winners],
    ['auditLogs', mock.auditLogs],
    ['notifications', mock.notifications],
  ]

  for (const [colName, items] of seedMap) {
    const col = firestore.collection(colName)
    const batch = firestore.batch()
    for (const item of items) {
      const { id, ...data } = item
      batch.set(col.doc(id), JSON.parse(JSON.stringify(data)))
    }
    await batch.commit()
  }

  departments = [...mock.departments]
  students = [...mock.students]
  advisors = [...mock.advisors]
  competitions = [...mock.competitions]
  registrations = [...mock.registrations]
  winners = [...mock.winners]
  auditLogs = [...mock.auditLogs]
  notifications = [...mock.notifications]
  verificationRequests = [...mock.verificationRequests]
}

export async function ensureLoaded() {
  if (!loaded) {
    await loadFromFirestore()
    loaded = true
  }
}

// ─── Sync functions (call after mutating in-memory arrays) ────────
export async function syncRegistration(id: string) {
  const item = registrations.find(r => r.id === id)
  if (item) await firestore.collection('registrations').doc(id).set(JSON.parse(JSON.stringify(item)))
}

export async function syncRegistrations() {
  for (const r of registrations) {
    await firestore.collection('registrations').doc(r.id).set(JSON.parse(JSON.stringify(r)))
  }
}

export async function syncNotifications() {
  for (const n of notifications) {
    await firestore.collection('notifications').doc(n.id).set(JSON.parse(JSON.stringify(n)))
  }
}

export async function syncVerificationRequests() {
  for (const v of verificationRequests) {
    await firestore.collection('verificationRequests').doc(v.id).set(JSON.parse(JSON.stringify(v)))
  }
}

export async function syncWinners() {
  for (const w of winners) {
    await firestore.collection('winners').doc(w.id).set(JSON.parse(JSON.stringify(w)))
  }
}

export async function syncStudents() {
  for (const s of students) {
    await firestore.collection('students').doc(s.id).set(JSON.parse(JSON.stringify(s)))
  }
}

export async function syncAdvisors() {
  for (const a of advisors) {
    await firestore.collection('advisors').doc(a.id).set(JSON.parse(JSON.stringify(a)))
  }
}

export async function pushRegistration(item: any) {
  registrations.push(item)
  await firestore.collection('registrations').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}

export async function pushNotification(item: any) {
  notifications.push(item)
  await firestore.collection('notifications').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}

export async function pushVerificationRequest(item: any) {
  verificationRequests.push(item)
  await firestore.collection('verificationRequests').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}

export async function pushWinner(item: any) {
  winners.push(item)
  await firestore.collection('winners').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}

export async function pushStudent(item: any) {
  students.push(item)
  await firestore.collection('students').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}

export async function pushAdvisor(item: any) {
  advisors.push(item)
  await firestore.collection('advisors').doc(item.id).set(JSON.parse(JSON.stringify(item)))
}
