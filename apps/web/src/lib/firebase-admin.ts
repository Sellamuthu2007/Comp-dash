import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'fs'
import { join } from 'path'

function getServiceAccount() {
  const prodJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (prodJson) return JSON.parse(prodJson)

  const devPath = join(process.cwd(), 'service-account.json')
  try {
    return JSON.parse(readFileSync(devPath, 'utf-8'))
  } catch {
    throw new Error(
      'Firebase service account not found. Create apps/web/service-account.json or set FIREBASE_SERVICE_ACCOUNT env var.'
    )
  }
}

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(getServiceAccount()), storageBucket: 'comp-dash-48f94.firebasestorage.app' })
    : getApps()[0]

export const firestore = getFirestore(app)
export const storage = getStorage(app)
export { Timestamp, FieldValue } from 'firebase-admin/firestore'
