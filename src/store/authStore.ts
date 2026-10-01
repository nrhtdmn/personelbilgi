import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audit, db, ensureSettings, nowIso } from '../db/database'
import { hashSecret, verifySecret } from '../lib/crypto'
import type { User } from '../db/types'

interface AuthState {
  unlocked: boolean
  userName: string | null
  role: User['role'] | null
  hydrate: () => Promise<{ setupComplete: boolean }>
  setup: (username: string, password: string, orgName: string) => Promise<void>
  unlockWithPassword: (username: string, password: string) => Promise<boolean>
  unlockWithPin: (pin: string) => Promise<boolean>
  lock: () => void
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      unlocked: false,
      userName: null,
      role: null,

      hydrate: async () => {
        const settings = await ensureSettings()
        return { setupComplete: settings.setupComplete }
      },

      setup: async (username, password, orgName) => {
        const passwordHash = await hashSecret(password)
        const pinHash = await hashSecret(password.slice(0, 4).padEnd(4, '0'))
        await db.users.clear()
        await db.users.add({
          username,
          passwordHash,
          pinHash,
          displayName: username,
          role: 'admin',
          createdAt: nowIso(),
        })
        await db.settings.put({
          id: 'main',
          setupComplete: true,
          lockOnIdleMinutes: 15,
          notifyLeave: true,
          notifyTasks: true,
          notifyCerts: true,
          notifyAbsence: true,
          theme: 'dark',
          organizationName: orgName || 'Kurum',
        })
        await audit('setup', 'system', undefined, 'İlk kurulum tamamlandı', username)
        set({ unlocked: true, userName: username, role: 'admin' })
      },

      unlockWithPassword: async (username, password) => {
        const user = await db.users.where('username').equals(username).first()
        if (!user || user.deletedAt) return false
        const ok = await verifySecret(password, user.passwordHash)
        if (!ok) {
          await db.users.update(user.id!, { failedAttempts: (user.failedAttempts ?? 0) + 1 })
          return false
        }
        await db.users.update(user.id!, { failedAttempts: 0, lastLogin: nowIso() })
        await audit('login', 'user', user.id, 'Şifre ile giriş', username)
        set({ unlocked: true, userName: user.username, role: user.role })
        return true
      },

      unlockWithPin: async (pin) => {
        const users = await db.users.filter((u) => !u.deletedAt).toArray()
        for (const user of users) {
          if (!user.pinHash) continue
          if (await verifySecret(pin, user.pinHash)) {
            await db.users.update(user.id!, { lastLogin: nowIso() })
            set({ unlocked: true, userName: user.username, role: user.role })
            await audit('login', 'user', user.id, 'PIN ile giriş', user.username)
            return true
          }
        }
        return false
      },

      lock: () => set({ unlocked: false }),

      changePassword: async (oldPass, newPass) => {
        const name = get().userName
        if (!name) return false
        const user = await db.users.where('username').equals(name).first()
        if (!user) return false
        if (!(await verifySecret(oldPass, user.passwordHash))) return false
        await db.users.update(user.id!, {
          passwordHash: await hashSecret(newPass),
          pinHash: await hashSecret(newPass.slice(0, 4).padEnd(4, '0')),
          updatedAt: nowIso(),
        })
        await audit('update', 'user', user.id, 'Şifre değiştirildi', name)
        return true
      },
    }),
    { name: 'mudir-auth-session', partialize: (s) => ({ userName: s.userName, role: s.role }) },
  ),
)
