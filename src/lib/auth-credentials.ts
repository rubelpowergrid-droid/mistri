import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'

const DATA_DIR = path.join(process.cwd(), 'data')
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json')
const USER_CREDENTIALS_FILE = path.join(DATA_DIR, 'user-credentials.json')

// In-memory caching for speed and resilience
declare global {
  var __ADMIN_PASSWORD_CACHE__: string | undefined
  var __USER_CREDENTIALS_CACHE__: Record<string, UserCredentialRecord> | undefined
}

export interface UserCredentialRecord {
  phone: string
  password: string
  role: 'mistri' | 'customer' | 'admin'
  name?: string
  userId?: string
  updatedAt: string
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (err) {
    console.warn('Failed to create data directory:', err)
  }
}

/**
 * Normalizes phone numbers to standard 11 digits (e.g., 01712345678)
 */
export function normalizePhone(raw: string): string {
  if (!raw) return ''
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.startsWith('8801') && digits.length === 13) {
    return digits.slice(2)
  }
  if (digits.startsWith('01') && digits.length === 11) {
    return digits
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    return '0' + digits
  }
  return digits
}

/**
 * ─────────────────────────────────────────────────────────────
 * ADMIN PASSWORD MANAGEMENT
 * ─────────────────────────────────────────────────────────────
 */
const DEFAULT_ADMIN_PASSWORDS = ['admin1234', 'Mistri@2026', '123456', 'admin']

export function getAdminPassword(): string {
  if (global.__ADMIN_PASSWORD_CACHE__) {
    return global.__ADMIN_PASSWORD_CACHE__
  }

  try {
    ensureDataDir()
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'))
      if (data && typeof data.adminPassword === 'string' && data.adminPassword.length > 0) {
        global.__ADMIN_PASSWORD_CACHE__ = data.adminPassword
        return data.adminPassword
      }
    }
  } catch (err) {
    console.warn('Error reading admin config file:', err)
  }

  // Fallback to default admin password
  return 'admin1234'
}

export async function setAdminPassword(newPassword: string): Promise<boolean> {
  if (!newPassword || newPassword.trim().length < 4) {
    return false
  }

  const cleanPassword = newPassword.trim()
  global.__ADMIN_PASSWORD_CACHE__ = cleanPassword

  // 1. Save to local persistent storage
  try {
    ensureDataDir()
    const configData = {
      adminPassword: cleanPassword,
      updatedAt: new Date().toISOString(),
    }
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write admin config:', err)
  }

  // 2. Attempt to sync with Supabase users table and auth.users for admin accounts
  try {
    const supabase = createAdminClient() as any
    const adminPhones = ['01744602996', '01722092804', '01700000000']
    
    for (const phone of adminPhones) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('phone', phone)
        .maybeSingle()

      if (dbUser?.id) {
        try {
          const authUserRes = await supabase.auth.admin.getUserById(dbUser.id)
          const oldMeta = authUserRes.data?.user?.user_metadata || {}
          await supabase.auth.admin.updateUserById(dbUser.id, {
            password: cleanPassword,
            user_metadata: {
              ...oldMeta,
              plain_pass: cleanPassword,
              role: 'admin',
            },
          })
        } catch (e) {
          console.warn('Supabase auth admin password update notice:', e)
        }
      }
    }
  } catch (supErr) {
    console.warn('Supabase admin password sync notice:', supErr)
  }

  return true
}

export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword) return false
  const currentAdminPass = getAdminPassword()

  // Match current changed password
  if (inputPassword === currentAdminPass) return true

  // If password was never changed from default, accept any default admin passwords
  if (currentAdminPass === 'admin1234') {
    if (DEFAULT_ADMIN_PASSWORDS.includes(inputPassword)) return true
  }

  return false
}

/**
 * ─────────────────────────────────────────────────────────────
 * USER & MISTRI CREDENTIALS PERSISTENCE
 * ─────────────────────────────────────────────────────────────
 */
function loadUserCredentialsMap(): Record<string, UserCredentialRecord> {
  if (global.__USER_CREDENTIALS_CACHE__) {
    return global.__USER_CREDENTIALS_CACHE__
  }

  const map: Record<string, UserCredentialRecord> = {}
  try {
    ensureDataDir()
    if (fs.existsSync(USER_CREDENTIALS_FILE)) {
      const content = fs.readFileSync(USER_CREDENTIALS_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed && typeof parsed === 'object') {
        Object.assign(map, parsed)
      }
    }
  } catch (err) {
    console.warn('Error reading user credentials file:', err)
  }

  global.__USER_CREDENTIALS_CACHE__ = map
  return map
}

function flushUserCredentialsMap(map: Record<string, UserCredentialRecord>) {
  try {
    ensureDataDir()
    fs.writeFileSync(USER_CREDENTIALS_FILE, JSON.stringify(map, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to flush user credentials:', err)
  }
}

export function saveUserCredential(
  rawPhone: string,
  password: string,
  role: 'mistri' | 'customer' | 'admin' = 'mistri',
  name?: string,
  userId?: string
): void {
  const phone = normalizePhone(rawPhone)
  if (!phone || !password) return

  const map = loadUserCredentialsMap()
  map[phone] = {
    phone,
    password: password.trim(),
    role,
    name: name || map[phone]?.name || '',
    userId: userId || map[phone]?.userId,
    updatedAt: new Date().toISOString(),
  }

  global.__USER_CREDENTIALS_CACHE__ = map
  flushUserCredentialsMap(map)
}

export function getUserCredential(rawPhone: string): UserCredentialRecord | null {
  const phone = normalizePhone(rawPhone)
  if (!phone) return null

  const map = loadUserCredentialsMap()
  return map[phone] || null
}

export async function updateUserPassword(
  rawPhoneOrUserId: string,
  newPassword: string,
  role: 'mistri' | 'customer' | 'admin' = 'mistri'
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' }
  }

  const phone = normalizePhone(rawPhoneOrUserId)
  const map = loadUserCredentialsMap()
  const cleanPassword = newPassword.trim()

  // 1. Update persistent local cache
  if (phone) {
    map[phone] = {
      ...(map[phone] || { phone, role, updatedAt: new Date().toISOString() }),
      password: cleanPassword,
      updatedAt: new Date().toISOString(),
    }
    global.__USER_CREDENTIALS_CACHE__ = map
    flushUserCredentialsMap(map)
  }

  // 2. Update Supabase Auth & Users table
  try {
    const supabase = createAdminClient() as any
    let targetUserId: string | null = null

    // Search by phone if valid
    if (phone) {
      const { data: uByPhone } = await supabase
        .from('users')
        .select('id, email, phone')
        .eq('phone', phone)
        .maybeSingle()
      if (uByPhone?.id) targetUserId = uByPhone.id
    }

    // If not found by phone, check if rawPhoneOrUserId is UUID
    if (!targetUserId && rawPhoneOrUserId.includes('-')) {
      const { data: uById } = await supabase
        .from('users')
        .select('id, email, phone')
        .eq('id', rawPhoneOrUserId)
        .maybeSingle()
      if (uById?.id) targetUserId = uById.id
    }

    if (targetUserId) {
      try {
        const authUserRes = await supabase.auth.admin.getUserById(targetUserId)
        const oldMeta = authUserRes.data?.user?.user_metadata || {}
        await supabase.auth.admin.updateUserById(targetUserId, {
          password: cleanPassword,
          user_metadata: {
            ...oldMeta,
            plain_pass: cleanPassword,
          },
        })
      } catch (authErr) {
        console.warn('Supabase auth update password error:', authErr)
      }
    }
  } catch (err: any) {
    console.warn('updateUserPassword database sync warning:', err.message)
  }

  return { success: true }
}
