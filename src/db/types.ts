export type Id = number

export interface SoftDeletable {
  deletedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface User extends SoftDeletable {
  id?: Id
  username: string
  passwordHash: string
  displayName?: string
  role: 'admin' | 'manager' | 'readonly'
  pinHash?: string
  biometricEnabled?: boolean
  failedAttempts?: number
  lockedUntil?: string | null
  lastLogin?: string | null
}

export interface Personnel extends SoftDeletable {
  id?: Id
  sicilNo?: string
  firstName: string
  lastName: string
  tcNo?: string
  birthDate?: string
  birthPlace?: string
  gender?: string
  maritalStatus?: string
  bloodType?: string
  organDonor?: boolean
  knownAllergies?: string
  nationality?: string
  disabilityRate?: number
  disabilityType?: string
  workRestrictions?: string
  photoDataUrl?: string
  militaryStatus?: string
  militaryEndDate?: string
  sgkNo?: string
  sgkStartDate?: string
  healthInsuranceNo?: string
  healthInsuranceEnd?: string
  passportNo?: string
  passportExpiry?: string
  visaInfo?: string
  travelRestricted?: boolean
  unit?: string
  positionTitle?: string
  rank?: string
  rankStartDate?: string
  superiorName?: string
  startDate: string
  workLocation?: string
  phoneWork?: string
  phonePersonal?: string
  emailWork?: string
  emailPersonal?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  notes?: string
  isActive: boolean
}

export interface Task extends SoftDeletable {
  id?: Id
  title: string
  description?: string
  assignedToId?: Id
  assignedToName?: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  status: 'not_started' | 'in_progress' | 'waiting' | 'completed' | 'cancelled'
  startDate?: string
  dueDate?: string
  completedAt?: string
  completionPercentage: number
  parentTaskId?: Id
  dependsOnTaskId?: Id
  estimatedHours?: number
  isRecurring?: boolean
  recurrencePattern?: string
  remindWeekBefore?: boolean
  remindDayBefore?: boolean
  remindOnOverdue?: boolean
}

export interface LeaveRequest extends SoftDeletable {
  id?: Id
  personnelId: Id
  personnelName?: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  halfDay?: boolean
  documentSubmitted?: boolean
}

export interface Attendance extends SoftDeletable {
  id?: Id
  personnelId: Id
  personnelName?: string
  date: string
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_duty'
  checkInTime?: string
  checkOutTime?: string
  lateMinutes?: number
  earlyLeaveMinutes?: number
  absenceReason?: string
  overtimeMinutes?: number
  overtimeApproved?: boolean
  note?: string
}

export interface Order extends SoftDeletable {
  id?: Id
  orderNo: string
  orderType: 'written' | 'verbal'
  title: string
  content: string
  issueDate: string
  priority: string
  targetNames?: string
  acknowledged?: boolean
  cancelled?: boolean
  cancelReason?: string
  cancelsOrderId?: Id
  linkTaskId?: Id
}

export interface DisciplineRecord extends SoftDeletable {
  id?: Id
  personnelId: Id
  personnelName?: string
  recordType: 'praise' | 'verbal_warning' | 'written_warning' | 'investigation' | 'complaint'
  title: string
  description?: string
  recordDate: string
  status?: string
  documentNote?: string
}

export interface Meeting extends SoftDeletable {
  id?: Id
  title: string
  meetingDate: string
  location?: string
  durationMinutes?: number
  agenda?: string
  participants?: string
  status: 'planned' | 'done' | 'cancelled'
  minutes?: string
  decisions?: string
}

export interface DutySchedule extends SoftDeletable {
  id?: Id
  personnelId: Id
  personnelName?: string
  dutyDate: string
  dutyType: 'day' | 'night' | 'weekend'
  location?: string
  hours?: number
}

export interface DutyHandover extends SoftDeletable {
  id?: Id
  outgoingId: Id
  outgoingName?: string
  incomingId: Id
  incomingName?: string
  handoverDatetime: string
  eventsNote?: string
  issuesNote?: string
  bothConfirmed?: boolean
}

export interface Announcement extends SoftDeletable {
  id?: Id
  title: string
  content: string
  importance: 'info' | 'important' | 'urgent'
  targetAudience?: string
  publishedAt: string
  readBy?: string[]
}

export interface Visitor extends SoftDeletable {
  id?: Id
  name: string
  organization?: string
  purpose?: string
  metWithName?: string
  checkIn: string
  checkOut?: string
  areasAccessed?: string
}

export interface Equipment extends SoftDeletable {
  id?: Id
  name: string
  serialNo?: string
  category?: string
  location?: string
  status: 'available' | 'assigned' | 'faulty' | 'scrapped'
  assignedToName?: string
  purchaseValue?: number
  warrantyEnd?: string
  insuranceEnd?: string
  notes?: string
}

export interface Assignment extends SoftDeletable {
  id?: Id
  equipmentId: Id
  equipmentName?: string
  personnelId: Id
  personnelName?: string
  assignedDate: string
  returnDate?: string
  condition?: string
  returned?: boolean
}

export interface FaultReport extends SoftDeletable {
  id?: Id
  equipmentId: Id
  equipmentName?: string
  description: string
  reportedBy?: string
  reportDate: string
  status: 'pending' | 'in_service' | 'fixed' | 'scrapped'
}

export interface StockItem extends SoftDeletable {
  id?: Id
  name: string
  currentQuantity: number
  unit: string
  criticalLevel: number
  expiryDate?: string
  location?: string
}

export interface Vehicle extends SoftDeletable {
  id?: Id
  plate: string
  brand?: string
  model?: string
  year?: number
  status: 'ok' | 'maintenance' | 'faulty'
  assignedDriver?: string
  insuranceEnd?: string
  inspectionEnd?: string
}

export interface HealthReport extends SoftDeletable {
  id?: Id
  personnelId: Id
  personnelName?: string
  startDate: string
  endDate: string
  exemptions?: string
  hospitalNote?: string
  documentSubmitted?: boolean
}

export interface Inspection extends SoftDeletable {
  id?: Id
  title: string
  inspectionDate: string
  location?: string
  inspector?: string
  notes?: string
  status: 'planned' | 'done' | 'follow_up'
  findings?: string
}

export interface DocumentRecord extends SoftDeletable {
  id?: Id
  title: string
  docType: string
  personnelName?: string
  confidentiality: 'public' | 'restricted' | 'secret'
  fileName?: string
  fileDataUrl?: string
  expiryDate?: string
  renewed?: boolean
}

export interface ModuleRecord extends SoftDeletable {
  id?: Id
  moduleId: string
  title: string
  data: Record<string, string>
}

export interface AuditLog {
  id?: Id
  action: string
  entityType: string
  entityId?: Id
  detail?: string
  userName?: string
  createdAt: string
}

export interface AppSettings {
  id: 'main'
  setupComplete: boolean
  lockOnIdleMinutes: number
  notifyLeave: boolean
  notifyTasks: boolean
  notifyCerts: boolean
  notifyAbsence: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  theme: 'dark' | 'light'
  organizationName?: string
}

export interface ImportantDate extends SoftDeletable {
  id?: Id
  title: string
  date: string
  personnelName?: string
  remindDaysBefore?: number
  yearly?: boolean
}

export interface Reminder extends SoftDeletable {
  id?: Id
  title: string
  remindAt: string
  priority: string
  repeat?: string
  sent?: boolean
}

export interface PublicHoliday extends SoftDeletable {
  id?: Id
  name: string
  date: string
  isCustom?: boolean
}
