import { storage } from './firebase-admin'
import { v4 as uuidv4 } from 'uuid'

const BUCKET = storage.bucket()

export interface UploadResult {
  url: string
  path: string
  filename: string
  contentType: string
  size: number
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const ext = filename.split('.').pop() || ''
  const uniqueName = `${folder}/${uuidv4()}.${ext}`
  const file = BUCKET.file(uniqueName)

  await file.save(buffer, {
    metadata: { contentType },
    public: true,
    resumable: false,
  })

  await file.makePublic()

  return {
    url: `https://storage.googleapis.com/${BUCKET.name}/${uniqueName}`,
    path: uniqueName,
    filename,
    contentType,
    size: buffer.length,
  }
}

export async function deleteFile(path: string): Promise<boolean> {
  try {
    await BUCKET.file(path).delete({ ignoreNotFound: true })
    return true
  } catch {
    return false
  }
}

export async function getSignedUrl(path: string, expiryMinutes: number = 15): Promise<string> {
  const [url] = await BUCKET.file(path).getSignedUrl({
    action: 'read',
    expires: Date.now() + expiryMinutes * 60 * 1000,
  })
  return url
}