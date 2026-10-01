import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { EntityCrud } from '../components/EntityCrud'
import { db, audit, nowIso } from '../db/database'
import { daysBetween, fmtDate, todayKey } from '../lib/dates'
import { PageHeader, confirmDelete } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import type { LeaveRequest } from '../db/types'

export function TasksPage() {
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt && p.isActive).toArray()) ?? []
  return (
    <EntityCrud
      title="Görevler"
      description="Atama, öncelik, durum, ilerleme, hatırlatıcı ve tahmini saat."
      table={db.tasks}
      entityType="task"
      titleOf={(t) => t.title}
      subtitleOf={(t) => `${t.assignedToName || 'Atanmamış'} · ${t.status} · ${t.dueDate ? fmtDate(t.dueDate) : 'deadline yok'}`}
      filterChip={(t) => <span className={`chip ${t.priority === 'urgent' || t.priority === 'high' ? 'warn' : 'info'}`}>{t.priority}</span>}
      defaults={{ status: 'not_started', priority: 'normal', completionPercentage: 0 }}
      fields={[
        { key: 'title', label: 'Başlık', required: true },
        { key: 'description', label: 'Açıklama', type: 'textarea' },
        { key: 'assignedToName', label: 'Atanan kişi', type: 'select', options: personnel.map((p) => ({ value: `${p.firstName} ${p.lastName}`, label: `${p.firstName} ${p.lastName}` })) },
        { key: 'priority', label: 'Öncelik', type: 'select', options: [
          { value: 'urgent', label: 'Acil' }, { value: 'high', label: 'Yüksek' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Düşük' },
        ]},
        { key: 'status', label: 'Durum', type: 'select', options: [
          { value: 'not_started', label: 'Başlamadı' }, { value: 'in_progress', label: 'Devam' }, { value: 'waiting', label: 'Beklemede' }, { value: 'completed', label: 'Tamamlandı' }, { value: 'cancelled', label: 'İptal' },
        ]},
        { key: 'startDate', label: 'Başlangıç', type: 'date' },
        { key: 'dueDate', label: 'Deadline', type: 'date' },
        { key: 'completionPercentage', label: 'İlerleme %', type: 'number' },
        { key: 'estimatedHours', label: 'Tahmini saat', type: 'number' },
        { key: 'remindWeekBefore', label: '1 hafta önce hatırlat', type: 'checkbox' },
        { key: 'remindDayBefore', label: '1 gün önce hatırlat', type: 'checkbox' },
        { key: 'remindOnOverdue', label: 'Gecikmede bildir', type: 'checkbox' },
        { key: 'isRecurring', label: 'Yinelenen', type: 'checkbox' },
        { key: 'recurrencePattern', label: 'Tekrar sıklığı' },
      ]}
    />
  )
}

export function LeavePage() {
  const userName = useAuthStore((s) => s.userName) ?? 'müdür'
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt && p.isActive).toArray()) ?? []
  const rows = useLiveQuery(() => db.leaveRequests.filter((l) => !l.deletedAt).reverse().sortBy('id')) ?? []
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const list = useMemo(() => rows.filter((r) => filter === 'all' || r.status === filter), [rows, filter])

  async function setStatus(row: LeaveRequest, status: 'approved' | 'rejected') {
    if (!row.id) return
    const rejectionReason = status === 'rejected' ? prompt('Red gerekçesi') || '' : undefined
    await db.leaveRequests.update(row.id, {
      status,
      approvedBy: userName,
      approvedAt: nowIso(),
      rejectionReason,
      updatedAt: nowIso(),
    })
    await audit('update', 'leave', row.id, status, userName)
  }

  return (
    <div>
      <EntityCrud
        title="İzinler"
        description="Talep → onay/red. Gün sayısı otomatik hesaplanır (başlangıç-bitiş)."
        table={db.leaveRequests}
        entityType="leave"
        titleOf={(l) => `${l.personnelName || 'Personel'} · ${l.leaveType}`}
        subtitleOf={(l) => `${fmtDate(l.startDate)} – ${fmtDate(l.endDate)} (${l.totalDays || daysBetween(l.startDate, l.endDate)} gün)`}
        filterChip={(l) => (
          <span className={`chip ${l.status === 'approved' ? 'ok' : l.status === 'rejected' ? 'bad' : 'warn'}`}>{l.status}</span>
        )}
        defaults={{ status: 'pending', totalDays: 1, startDate: todayKey(), endDate: todayKey() }}
        fields={[
          { key: 'personnelName', label: 'Personel', type: 'select', required: true, options: personnel.map((p) => ({ value: `${p.firstName} ${p.lastName}`, label: `${p.firstName} ${p.lastName}` })) },
          { key: 'leaveType', label: 'İzin türü', type: 'select', required: true, options: [
            { value: 'Yıllık', label: 'Yıllık' }, { value: 'Mazeret', label: 'Mazeret' }, { value: 'Ücretsiz', label: 'Ücretsiz' },
            { value: 'Doğum', label: 'Doğum' }, { value: 'Babalık', label: 'Babalık' }, { value: 'Hastalık', label: 'Hastalık' },
          ]},
          { key: 'startDate', label: 'Başlangıç', type: 'date', required: true },
          { key: 'endDate', label: 'Bitiş', type: 'date', required: true },
          { key: 'totalDays', label: 'Toplam gün', type: 'number', required: true },
          { key: 'reason', label: 'Gerekçe', type: 'textarea' },
          { key: 'halfDay', label: 'Yarım gün', type: 'checkbox' },
          { key: 'documentSubmitted', label: 'Belge teslim', type: 'checkbox' },
          { key: 'status', label: 'Durum', type: 'select', options: [
            { value: 'pending', label: 'Bekliyor' }, { value: 'approved', label: 'Onaylı' }, { value: 'rejected', label: 'Red' },
          ]},
        ]}
        extraToolbar={
          <div className="tabs" style={{ margin: 0 }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button key={f} type="button" className={`tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        }
      />
      {list.some((l) => l.status === 'pending') && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Bekleyen onaylar</h3>
          {list.filter((l) => l.status === 'pending').map((l) => (
            <div key={l.id} className="toolbar" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <div>
                <strong>{l.personnelName}</strong> · {l.leaveType}
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{fmtDate(l.startDate)} – {fmtDate(l.endDate)}</div>
              </div>
              <div>
                <button className="btn" onClick={() => setStatus(l, 'approved')}>Onayla</button>{' '}
                <button className="btn danger" onClick={() => setStatus(l, 'rejected')}>Reddet</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AttendancePage() {
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt && p.isActive).toArray()) ?? []
  const [date, setDate] = useState(todayKey())
  const rows = useLiveQuery(() => db.attendances.filter((a) => !a.deletedAt && a.date === date).toArray(), [date]) ?? []

  async function upsert(personnelId: number, personnelName: string, status: string) {
    const existing = rows.find((r) => r.personnelId === personnelId)
    if (existing?.id) {
      await db.attendances.update(existing.id, { status: status as never, updatedAt: nowIso() })
    } else {
      await db.attendances.add({
        personnelId,
        personnelName,
        date,
        status: status as never,
        createdAt: nowIso(),
      })
    }
  }

  async function markAllPresent() {
    for (const p of personnel) {
      if (!p.id) continue
      await upsert(p.id, `${p.firstName} ${p.lastName}`, 'present')
    }
  }

  return (
    <div>
      <PageHeader
        title="Yoklama"
        desc="Günlük durum, giriş/çıkış ve geç dakika. Toplu 'hepsi var' ile hızlı giriş."
        actions={<button className="btn" onClick={markAllPresent}>Tümü Var</button>}
      />
      <div className="toolbar">
        <input className="input" type="date" style={{ maxWidth: 200 }} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <EntityCrud
        title="Yoklama kayıtları"
        description={`${date} için kayıtlar`}
        table={db.attendances}
        entityType="attendance"
        titleOf={(a) => a.personnelName || `Personel #${a.personnelId}`}
        subtitleOf={(a) => `${a.date} · ${a.status}${a.lateMinutes ? ` · ${a.lateMinutes} dk geç` : ''}`}
        defaults={{ date, status: 'present' }}
        fields={[
          { key: 'personnelName', label: 'Personel', type: 'select', required: true, options: personnel.map((p) => ({ value: `${p.firstName} ${p.lastName}`, label: `${p.firstName} ${p.lastName}` })) },
          { key: 'date', label: 'Tarih', type: 'date', required: true },
          { key: 'status', label: 'Durum', type: 'select', options: [
            { value: 'present', label: 'Var' }, { value: 'absent', label: 'Yok' }, { value: 'late', label: 'Geç' },
            { value: 'early_leave', label: 'Erken çıktı' }, { value: 'on_duty', label: 'Görevde' },
          ]},
          { key: 'checkInTime', label: 'Giriş saati' },
          { key: 'checkOutTime', label: 'Çıkış saati' },
          { key: 'lateMinutes', label: 'Geç dk', type: 'number' },
          { key: 'overtimeMinutes', label: 'Mesai dk', type: 'number' },
          { key: 'absenceReason', label: 'Devamsızlık sebebi' },
          { key: 'note', label: 'Not', type: 'textarea' },
        ]}
      />
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Hızlı işaretleme — {date}</h3>
        {personnel.map((p) => {
          const cur = rows.find((r) => r.personnelId === p.id)?.status
          return (
            <div key={p.id} className="toolbar" style={{ justifyContent: 'space-between' }}>
              <span>{p.firstName} {p.lastName}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(['present', 'absent', 'late', 'early_leave', 'on_duty'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`tab${cur === s ? ' active' : ''}`}
                    onClick={() => p.id && upsert(p.id, `${p.firstName} ${p.lastName}`, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function usePersonnelOptions() {
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt && p.isActive).toArray()) ?? []
  return personnel.map((p) => ({ value: `${p.firstName} ${p.lastName}`, label: `${p.firstName} ${p.lastName}` }))
}

export function OrdersPage() {
  return (
    <EntityCrud
      title="Emirler"
      description="Yazılı/sözlü emir, tebliğ ve iptal."
      table={db.orders}
      entityType="order"
      titleOf={(o) => `${o.orderNo} · ${o.title}`}
      subtitleOf={(o) => `${o.orderType} · ${fmtDate(o.issueDate)}${o.cancelled ? ' · İPTAL' : ''}`}
      defaults={{ orderType: 'written', priority: 'normal', issueDate: todayKey(), orderNo: `E-${Date.now().toString().slice(-6)}`, cancelled: false }}
      fields={[
        { key: 'orderNo', label: 'Emir no', required: true },
        { key: 'orderType', label: 'Tür', type: 'select', options: [{ value: 'written', label: 'Yazılı' }, { value: 'verbal', label: 'Sözlü' }] },
        { key: 'title', label: 'Başlık', required: true },
        { key: 'content', label: 'İçerik', type: 'textarea', required: true },
        { key: 'issueDate', label: 'Tarih', type: 'date' },
        { key: 'priority', label: 'Öncelik' },
        { key: 'targetNames', label: 'Muhataplar' },
        { key: 'acknowledged', label: 'Tebellüğ edildi', type: 'checkbox' },
        { key: 'cancelled', label: 'İptal', type: 'checkbox' },
        { key: 'cancelReason', label: 'İptal gerekçesi', type: 'textarea' },
      ]}
    />
  )
}

export function DisciplinePage() {
  const opts = usePersonnelOptions()
  return (
    <EntityCrud
      title="Takdir & Disiplin"
      description="Takdir, sözlü/yazılı uyarı, soruşturma ve şikayet."
      table={db.discipline}
      entityType="discipline"
      titleOf={(d) => d.title}
      subtitleOf={(d) => `${d.personnelName || ''} · ${d.recordType} · ${fmtDate(d.recordDate)}`}
      defaults={{ recordDate: todayKey(), recordType: 'praise', personnelId: 0 }}
      fields={[
        { key: 'personnelName', label: 'Personel', type: 'select', required: true, options: opts },
        { key: 'recordType', label: 'Tür', type: 'select', options: [
          { value: 'praise', label: 'Takdir' }, { value: 'verbal_warning', label: 'Sözlü uyarı' },
          { value: 'written_warning', label: 'Yazılı ihtar' }, { value: 'investigation', label: 'Soruşturma' }, { value: 'complaint', label: 'Şikayet' },
        ]},
        { key: 'title', label: 'Başlık', required: true },
        { key: 'description', label: 'Açıklama', type: 'textarea' },
        { key: 'recordDate', label: 'Tarih', type: 'date' },
        { key: 'status', label: 'Durum' },
        { key: 'documentNote', label: 'Belge notu' },
      ]}
    />
  )
}

export function MeetingsPage() {
  return (
    <EntityCrud
      title="Toplantılar"
      description="Planlama, gündem, katılımcılar, tutanak ve kararlar."
      table={db.meetings}
      entityType="meeting"
      titleOf={(m) => m.title}
      subtitleOf={(m) => `${fmtDate(m.meetingDate)} · ${m.location || 'yer yok'} · ${m.status}`}
      defaults={{ status: 'planned', meetingDate: new Date().toISOString().slice(0, 16) }}
      fields={[
        { key: 'title', label: 'Başlık', required: true },
        { key: 'meetingDate', label: 'Tarih/saat' },
        { key: 'location', label: 'Yer / platform' },
        { key: 'durationMinutes', label: 'Süre (dk)', type: 'number' },
        { key: 'participants', label: 'Katılımcılar', type: 'textarea' },
        { key: 'agenda', label: 'Gündem', type: 'textarea' },
        { key: 'minutes', label: 'Tutanak', type: 'textarea' },
        { key: 'decisions', label: 'Kararlar', type: 'textarea' },
        { key: 'status', label: 'Durum', type: 'select', options: [
          { value: 'planned', label: 'Planlandı' }, { value: 'done', label: 'Yapıldı' }, { value: 'cancelled', label: 'İptal' },
        ]},
      ]}
    />
  )
}

export function DutyPage() {
  const opts = usePersonnelOptions()
  const userName = useAuthStore((s) => s.userName)
  const schedules = useLiveQuery(() => db.dutySchedules.filter((d) => !d.deletedAt).toArray()) ?? []

  return (
    <div>
      <EntityCrud
        title="Nöbet çizelgesi"
        description="Aylık nöbet, vardiya ve silme (soft delete)."
        table={db.dutySchedules}
        entityType="duty"
        titleOf={(d) => `${d.personnelName || ''} · ${fmtDate(d.dutyDate)}`}
        subtitleOf={(d) => `${d.dutyType} · ${d.location || ''}`}
        defaults={{ dutyDate: todayKey(), dutyType: 'day', personnelId: 0 }}
        fields={[
          { key: 'personnelName', label: 'Nöbetçi', type: 'select', required: true, options: opts },
          { key: 'dutyDate', label: 'Tarih', type: 'date', required: true },
          { key: 'dutyType', label: 'Vardiya', type: 'select', options: [
            { value: 'day', label: 'Gündüz' }, { value: 'night', label: 'Gece' }, { value: 'weekend', label: 'Hafta sonu' },
          ]},
          { key: 'location', label: 'Yer' },
          { key: 'hours', label: 'Saat', type: 'number' },
        ]}
      />
      <EntityCrud
        title="Nöbet devir teslim"
        description="Teslim eden / alan, olay ve sorun notları."
        table={db.dutyHandovers}
        entityType="duty_handover"
        titleOf={(h) => `${h.outgoingName || '?'} → ${h.incomingName || '?'}`}
        subtitleOf={(h) => h.handoverDatetime}
        defaults={{ handoverDatetime: new Date().toISOString().slice(0, 16), bothConfirmed: false, outgoingId: 0, incomingId: 0 }}
        fields={[
          { key: 'outgoingName', label: 'Teslim eden', type: 'select', options: opts },
          { key: 'incomingName', label: 'Teslim alan', type: 'select', options: opts },
          { key: 'handoverDatetime', label: 'Tarih saat' },
          { key: 'eventsNote', label: 'Olaylar', type: 'textarea' },
          { key: 'issuesNote', label: 'Sorunlar', type: 'textarea' },
          { key: 'bothConfirmed', label: 'Çift onay', type: 'checkbox' },
        ]}
      />
      <div className="card" style={{ marginTop: 12 }}>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          {schedules.length} nöbet kaydı · kullanıcı: {userName}
          {schedules[0] ? (
            <button
              className="btn ghost"
              style={{ marginLeft: 8 }}
              onClick={async () => {
                const first = schedules[0]
                if (first?.id && confirmDelete(`${first.personnelName} ${first.dutyDate}`)) {
                  await db.dutySchedules.update(first.id, { deletedAt: nowIso() })
                }
              }}
            >
              İlk kaydı sil (örnek)
            </button>
          ) : null}
        </p>
      </div>
    </div>
  )
}

export function AnnouncementsPage() {
  return (
    <EntityCrud
      title="Duyurular"
      description="Önem seviyesi ve hedef kitle."
      table={db.announcements}
      entityType="announcement"
      titleOf={(a) => a.title}
      subtitleOf={(a) => a.content.slice(0, 80)}
      defaults={{ importance: 'info', publishedAt: nowIso() }}
      fields={[
        { key: 'title', label: 'Başlık', required: true },
        { key: 'content', label: 'İçerik', type: 'textarea', required: true },
        { key: 'importance', label: 'Önem', type: 'select', options: [
          { value: 'info', label: 'Bilgi' }, { value: 'important', label: 'Önemli' }, { value: 'urgent', label: 'Acil' },
        ]},
        { key: 'targetAudience', label: 'Hedef kitle' },
        { key: 'publishedAt', label: 'Yayın' },
      ]}
    />
  )
}

export function VisitorsPage() {
  return (
    <EntityCrud
      title="Ziyaretçiler"
      description="Giriş/çıkış ve görüşülen personel."
      table={db.visitors}
      entityType="visitor"
      titleOf={(v) => v.name}
      subtitleOf={(v) => `${v.organization || ''} · ${v.purpose || ''}`}
      defaults={{ checkIn: new Date().toISOString().slice(0, 16) }}
      fields={[
        { key: 'name', label: 'Ad', required: true },
        { key: 'organization', label: 'Kurum' },
        { key: 'purpose', label: 'Amaç' },
        { key: 'metWithName', label: 'Görüştüğü kişi' },
        { key: 'checkIn', label: 'Giriş' },
        { key: 'checkOut', label: 'Çıkış' },
        { key: 'areasAccessed', label: 'Erişim alanları' },
      ]}
    />
  )
}

export function InventoryPage() {
  return (
    <div>
      <EntityCrud
        title="Envanter / Demirbaş"
        description="Demirbaş, durum, garanti ve zimmet bilgisi."
        table={db.equipment}
        entityType="equipment"
        titleOf={(e) => e.name}
        subtitleOf={(e) => `${e.serialNo || 'seri yok'} · ${e.status}`}
        defaults={{ status: 'available' }}
        fields={[
          { key: 'name', label: 'Ad', required: true },
          { key: 'serialNo', label: 'Seri / barkod' },
          { key: 'category', label: 'Kategori' },
          { key: 'location', label: 'Konum' },
          { key: 'status', label: 'Durum', type: 'select', options: [
            { value: 'available', label: 'Müsait' }, { value: 'assigned', label: 'Zimmetli' },
            { value: 'faulty', label: 'Arızalı' }, { value: 'scrapped', label: 'Hurda' },
          ]},
          { key: 'assignedToName', label: 'Zimmetli kişi' },
          { key: 'purchaseValue', label: 'Değer', type: 'number' },
          { key: 'warrantyEnd', label: 'Garanti bitiş', type: 'date' },
          { key: 'insuranceEnd', label: 'Sigorta bitiş', type: 'date' },
          { key: 'notes', label: 'Not', type: 'textarea' },
        ]}
      />
      <EntityCrud
        title="Zimmetler"
        description="Demirbaş zimmet ve iade."
        table={db.assignments}
        entityType="assignment"
        titleOf={(a) => `${a.equipmentName || 'Ekipman'} → ${a.personnelName || ''}`}
        subtitleOf={(a) => `${fmtDate(a.assignedDate)}${a.returned ? ' · iade' : ''}`}
        defaults={{ assignedDate: todayKey(), returned: false, equipmentId: 0, personnelId: 0 }}
        fields={[
          { key: 'equipmentName', label: 'Demirbaş', required: true },
          { key: 'personnelName', label: 'Personel', required: true },
          { key: 'assignedDate', label: 'Zimmet tarihi', type: 'date' },
          { key: 'returnDate', label: 'İade tarihi', type: 'date' },
          { key: 'condition', label: 'Durum' },
          { key: 'returned', label: 'İade edildi', type: 'checkbox' },
        ]}
      />
      <EntityCrud
        title="Arızalar"
        description="Arıza bildirim ve servis durumu."
        table={db.faults}
        entityType="fault"
        titleOf={(f) => f.equipmentName || 'Ürün'}
        subtitleOf={(f) => f.description}
        defaults={{ reportDate: todayKey(), status: 'pending', equipmentId: 0 }}
        fields={[
          { key: 'equipmentName', label: 'Ürün', required: true },
          { key: 'description', label: 'Açıklama', type: 'textarea', required: true },
          { key: 'reportedBy', label: 'Bildiren' },
          { key: 'reportDate', label: 'Tarih', type: 'date' },
          { key: 'status', label: 'Durum', type: 'select', options: [
            { value: 'pending', label: 'Beklemede' }, { value: 'in_service', label: 'Serviste' },
            { value: 'fixed', label: 'Tamir' }, { value: 'scrapped', label: 'Iskarta' },
          ]},
        ]}
      />
      <EntityCrud
        title="Stok"
        description="Sarf malzeme, kritik seviye."
        table={db.stock}
        entityType="stock"
        titleOf={(s) => s.name}
        subtitleOf={(s) => `${s.currentQuantity} ${s.unit} (kritik: ${s.criticalLevel})`}
        defaults={{ currentQuantity: 0, unit: 'adet', criticalLevel: 5 }}
        fields={[
          { key: 'name', label: 'Malzeme', required: true },
          { key: 'currentQuantity', label: 'Miktar', type: 'number' },
          { key: 'unit', label: 'Birim' },
          { key: 'criticalLevel', label: 'Kritik seviye', type: 'number' },
          { key: 'expiryDate', label: 'SKT', type: 'date' },
          { key: 'location', label: 'Konum' },
        ]}
      />
    </div>
  )
}

export function VehiclesPage() {
  return (
    <EntityCrud
      title="Araçlar"
      description="Plaka, sürücü, sigorta ve muayene."
      table={db.vehicles}
      entityType="vehicle"
      titleOf={(v) => v.plate}
      subtitleOf={(v) => `${v.brand || ''} ${v.model || ''} · ${v.status}`}
      defaults={{ status: 'ok' }}
      fields={[
        { key: 'plate', label: 'Plaka', required: true },
        { key: 'brand', label: 'Marka' },
        { key: 'model', label: 'Model' },
        { key: 'year', label: 'Yıl', type: 'number' },
        { key: 'status', label: 'Durum', type: 'select', options: [
          { value: 'ok', label: 'İyi' }, { value: 'maintenance', label: 'Bakımda' }, { value: 'faulty', label: 'Arızalı' },
        ]},
        { key: 'assignedDriver', label: 'Sürücü' },
        { key: 'insuranceEnd', label: 'Sigorta bitiş', type: 'date' },
        { key: 'inspectionEnd', label: 'Muayene bitiş', type: 'date' },
      ]}
    />
  )
}

export function HealthPage() {
  const opts = usePersonnelOptions()
  return (
    <EntityCrud
      title="Sağlık raporları"
      description="Rapor süresi, muafiyet ve belge."
      table={db.healthReports}
      entityType="health"
      titleOf={(h) => h.personnelName || `Personel #${h.personnelId}`}
      subtitleOf={(h) => `${fmtDate(h.startDate)} – ${fmtDate(h.endDate)}`}
      defaults={{ startDate: todayKey(), endDate: todayKey(), personnelId: 0 }}
      fields={[
        { key: 'personnelName', label: 'Personel', type: 'select', required: true, options: opts },
        { key: 'startDate', label: 'Başlangıç', type: 'date' },
        { key: 'endDate', label: 'Bitiş', type: 'date' },
        { key: 'exemptions', label: 'Muafiyetler' },
        { key: 'hospitalNote', label: 'Hastane notu' },
        { key: 'documentSubmitted', label: 'Belge teslim', type: 'checkbox' },
      ]}
    />
  )
}

export function InspectionsPage() {
  return (
    <EntityCrud
      title="Denetimler"
      description="Plan, bulgu ve takip."
      table={db.inspections}
      entityType="inspection"
      titleOf={(i) => i.title}
      subtitleOf={(i) => `${fmtDate(i.inspectionDate)} · ${i.inspector || ''} · ${i.status}`}
      defaults={{ inspectionDate: todayKey(), status: 'planned' }}
      fields={[
        { key: 'title', label: 'Başlık', required: true },
        { key: 'inspectionDate', label: 'Tarih', type: 'date' },
        { key: 'location', label: 'Yer / birim' },
        { key: 'inspector', label: 'Denetçi' },
        { key: 'notes', label: 'Hazırlık / not', type: 'textarea' },
        { key: 'findings', label: 'Bulgular', type: 'textarea' },
        { key: 'status', label: 'Durum', type: 'select', options: [
          { value: 'planned', label: 'Planlandı' }, { value: 'done', label: 'Tamam' }, { value: 'follow_up', label: 'Takip' },
        ]},
      ]}
    />
  )
}

export function DocumentsPage() {
  return (
    <EntityCrud
      title="Belgeler"
      description="Dijital arşiv, gizlilik ve son kullanma."
      table={db.documents}
      entityType="document"
      titleOf={(d) => d.title}
      subtitleOf={(d) => `${d.docType} · ${d.confidentiality}${d.expiryDate ? ` · SKT ${fmtDate(d.expiryDate)}` : ''}`}
      defaults={{ confidentiality: 'public', docType: 'tutanak' }}
      fields={[
        { key: 'title', label: 'Başlık', required: true },
        { key: 'docType', label: 'Tür' },
        { key: 'personnelName', label: 'İlgili kişi' },
        { key: 'confidentiality', label: 'Gizlilik', type: 'select', options: [
          { value: 'public', label: 'Genel' }, { value: 'restricted', label: 'Kısıtlı' }, { value: 'secret', label: 'Gizli' },
        ]},
        { key: 'fileName', label: 'Dosya adı' },
        { key: 'expiryDate', label: 'Son kullanma', type: 'date' },
        { key: 'renewed', label: 'Yenilendi', type: 'checkbox' },
      ]}
    />
  )
}
