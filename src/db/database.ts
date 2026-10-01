import Dexie, { type Table } from 'dexie'
import type {
  Announcement,
  AppSettings,
  Assignment,
  Attendance,
  AuditLog,
  DisciplineRecord,
  DocumentRecord,
  DutyHandover,
  DutySchedule,
  Equipment,
  FaultReport,
  HealthReport,
  ImportantDate,
  Inspection,
  LeaveRequest,
  Meeting,
  ModuleRecord,
  Order,
  Personnel,
  PublicHoliday,
  Reminder,
  StockItem,
  Task,
  User,
  Vehicle,
  Visitor,
} from './types'

export class MudirDB extends Dexie {
  users!: Table<User, number>
  personnel!: Table<Personnel, number>
  tasks!: Table<Task, number>
  leaveRequests!: Table<LeaveRequest, number>
  attendances!: Table<Attendance, number>
  orders!: Table<Order, number>
  discipline!: Table<DisciplineRecord, number>
  meetings!: Table<Meeting, number>
  dutySchedules!: Table<DutySchedule, number>
  dutyHandovers!: Table<DutyHandover, number>
  announcements!: Table<Announcement, number>
  visitors!: Table<Visitor, number>
  equipment!: Table<Equipment, number>
  assignments!: Table<Assignment, number>
  faults!: Table<FaultReport, number>
  stock!: Table<StockItem, number>
  vehicles!: Table<Vehicle, number>
  healthReports!: Table<HealthReport, number>
  inspections!: Table<Inspection, number>
  documents!: Table<DocumentRecord, number>
  moduleRecords!: Table<ModuleRecord, number>
  auditLogs!: Table<AuditLog, number>
  settings!: Table<AppSettings, string>
  importantDates!: Table<ImportantDate, number>
  reminders!: Table<Reminder, number>
  publicHolidays!: Table<PublicHoliday, number>

  constructor() {
    super('mudirasistani_pwa')
    this.version(1).stores({
      users: '++id, username, role, deletedAt',
      personnel: '++id, lastName, firstName, sicilNo, isActive, deletedAt',
      tasks: '++id, status, priority, dueDate, assignedToId, deletedAt',
      leaveRequests: '++id, personnelId, status, startDate, deletedAt',
      attendances: '++id, personnelId, date, status, [personnelId+date], deletedAt',
      orders: '++id, orderNo, issueDate, cancelled, deletedAt',
      discipline: '++id, personnelId, recordType, recordDate, deletedAt',
      meetings: '++id, meetingDate, status, deletedAt',
      dutySchedules: '++id, personnelId, dutyDate, deletedAt',
      dutyHandovers: '++id, handoverDatetime, deletedAt',
      announcements: '++id, publishedAt, importance, deletedAt',
      visitors: '++id, checkIn, checkOut, deletedAt',
      equipment: '++id, name, serialNo, status, deletedAt',
      assignments: '++id, equipmentId, personnelId, returned, deletedAt',
      faults: '++id, equipmentId, status, reportDate, deletedAt',
      stock: '++id, name, deletedAt',
      vehicles: '++id, plate, status, deletedAt',
      healthReports: '++id, personnelId, startDate, deletedAt',
      inspections: '++id, inspectionDate, status, deletedAt',
      documents: '++id, docType, expiryDate, deletedAt',
      moduleRecords: '++id, moduleId, title, deletedAt',
      auditLogs: '++id, createdAt, entityType, action',
      settings: 'id',
      importantDates: '++id, date, deletedAt',
      reminders: '++id, remindAt, deletedAt',
      publicHolidays: '++id, date, deletedAt',
    })
  }
}

export const db = new MudirDB()

export function nowIso() {
  return new Date().toISOString()
}

export async function audit(
  action: string,
  entityType: string,
  entityId?: number,
  detail?: string,
  userName?: string,
) {
  await db.auditLogs.add({
    action,
    entityType,
    entityId,
    detail,
    userName,
    createdAt: nowIso(),
  })
}

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('main')
  if (existing) return existing
  const defaults: AppSettings = {
    id: 'main',
    setupComplete: false,
    lockOnIdleMinutes: 15,
    notifyLeave: true,
    notifyTasks: true,
    notifyCerts: true,
    notifyAbsence: true,
    theme: 'dark',
    organizationName: 'Kurum',
  }
  await db.settings.put(defaults)
  return defaults
}

export async function exportAllData() {
  const payload: Record<string, unknown> = {
    exportedAt: nowIso(),
    app: 'mudirasistani-pwa',
    version: 1,
  }
  for (const table of db.tables) {
    payload[table.name] = await table.toArray()
  }
  return payload
}

export async function importAllData(payload: Record<string, unknown>) {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      const rows = payload[table.name]
      if (!Array.isArray(rows)) continue
      await table.clear()
      if (rows.length) await table.bulkAdd(rows as never[])
    }
  })
}
