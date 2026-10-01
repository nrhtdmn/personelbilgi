import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { isSameDay, parseISO } from 'date-fns'
import { jsPDF } from 'jspdf'
import { EntityCrud } from '../components/EntityCrud'
import { Field, PageHeader } from '../components/ui'
import { db, ensureSettings, exportAllData, importAllData, nowIso } from '../db/database'
import { fmtDate, todayKey } from '../lib/dates'
import { useAuthStore } from '../store/authStore'

export function CalendarPage() {
  const [selected, setSelected] = useState(todayKey())
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt && !!t.dueDate).toArray()) ?? []
  const leave = useLiveQuery(() => db.leaveRequests.filter((l) => !l.deletedAt).toArray()) ?? []
  const meetings = useLiveQuery(() => db.meetings.filter((m) => !m.deletedAt).toArray()) ?? []
  const inspections = useLiveQuery(() => db.inspections.filter((i) => !i.deletedAt).toArray()) ?? []
  const important = useLiveQuery(() => db.importantDates.filter((d) => !d.deletedAt).toArray()) ?? []

  const events = useMemo(() => {
    const day = parseISO(selected)
    const list: { type: string; title: string }[] = []
    for (const t of tasks) if (t.dueDate && isSameDay(parseISO(t.dueDate), day)) list.push({ type: 'Görev', title: t.title })
    for (const l of leave) {
      const start = parseISO(l.startDate)
      const end = parseISO(l.endDate)
      if (isSameDay(start, day) || (start <= day && end >= day)) {
        list.push({ type: 'İzin', title: `${l.personnelName} · ${l.leaveType}` })
      }
    }
    for (const m of meetings) if (isSameDay(parseISO(m.meetingDate), day)) list.push({ type: 'Toplantı', title: m.title })
    for (const i of inspections) if (isSameDay(parseISO(i.inspectionDate), day)) list.push({ type: 'Denetim', title: i.title })
    for (const d of important) if (isSameDay(parseISO(d.date), day)) list.push({ type: 'Önemli', title: d.title })
    return list
  }, [selected, tasks, leave, meetings, inspections, important])

  return (
    <div>
      <PageHeader title="Takvim" desc="Görev, izin, toplantı, denetim ve önemli tarihler." />
      <div className="toolbar">
        <input className="input" type="date" style={{ maxWidth: 220 }} value={selected} onChange={(e) => setSelected(e.target.value)} />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{fmtDate(selected)}</h3>
        {events.length === 0 ? <p style={{ color: 'var(--muted)' }}>Bu gün için kayıt yok</p> : null}
        {events.map((e, i) => (
          <div key={i} className="toolbar" style={{ justifyContent: 'flex-start', gap: 10 }}>
            <span className="chip info">{e.type}</span>
            <span>{e.title}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <EntityCrud
          title="Önemli tarihler"
          description="Doğum günü, yıl dönümü vb."
          table={db.importantDates}
          entityType="important_date"
          titleOf={(d) => d.title}
          subtitleOf={(d) => fmtDate(d.date)}
          defaults={{ date: todayKey(), yearly: true, remindDaysBefore: 3 }}
          fields={[
            { key: 'title', label: 'Başlık', required: true },
            { key: 'date', label: 'Tarih', type: 'date', required: true },
            { key: 'personnelName', label: 'Kişi' },
            { key: 'remindDaysBefore', label: 'Kaç gün önce', type: 'number' },
            { key: 'yearly', label: 'Her yıl', type: 'checkbox' },
          ]}
        />
      </div>
      <EntityCrud
        title="Hatırlatıcılar"
        description="Alarm / hatırlatma kayıtları."
        table={db.reminders}
        entityType="reminder"
        titleOf={(r) => r.title}
        subtitleOf={(r) => r.remindAt}
        defaults={{ remindAt: new Date().toISOString().slice(0, 16), priority: 'normal' }}
        fields={[
          { key: 'title', label: 'Başlık', required: true },
          { key: 'remindAt', label: 'Tarih saat' },
          { key: 'priority', label: 'Öncelik' },
          { key: 'repeat', label: 'Tekrar' },
        ]}
      />
    </div>
  )
}

export function ReportsPage() {
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt).toArray()) ?? []
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray()) ?? []
  const leave = useLiveQuery(() => db.leaveRequests.filter((l) => !l.deletedAt).toArray()) ?? []
  const attendance = useLiveQuery(() => db.attendances.filter((a) => !a.deletedAt).toArray()) ?? []

  function exportPdf() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('MudirAsistani - Aylik Ozet', 14, 20)
    doc.setFontSize(11)
    doc.text(`Tarih: ${new Date().toLocaleString('tr-TR')}`, 14, 30)
    doc.text(`Aktif personel: ${personnel.filter((p) => p.isActive).length}`, 14, 40)
    doc.text(`Toplam gorev: ${tasks.length} / acik: ${tasks.filter((t) => !['completed', 'cancelled'].includes(t.status)).length}`, 14, 48)
    doc.text(`Izin talepleri: ${leave.length} (bekleyen: ${leave.filter((l) => l.status === 'pending').length})`, 14, 56)
    doc.text(`Yoklama kayitlari: ${attendance.length}`, 14, 64)
    doc.text(`Devamsiz: ${attendance.filter((a) => a.status === 'absent').length}`, 14, 72)
    doc.save(`mudirasistani-rapor-${todayKey()}.pdf`)
  }

  return (
    <div>
      <PageHeader
        title="Raporlar"
        desc="Anlık özet ve PDF dışa aktarma (istemci tarafı)."
        actions={<button className="btn" onClick={exportPdf}>PDF indir</button>}
      />
      <div className="grid-stats">
        <div className="stat"><div className="label">Personel</div><div className="value">{personnel.length}</div></div>
        <div className="stat"><div className="label">Görev</div><div className="value">{tasks.length}</div></div>
        <div className="stat"><div className="label">İzin</div><div className="value">{leave.length}</div></div>
        <div className="stat"><div className="label">Yoklama</div><div className="value">{attendance.length}</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Anlık durum</h3>
        <ul>
          <li>Bekleyen izin: {leave.filter((l) => l.status === 'pending').length}</li>
          <li>Açık görev: {tasks.filter((t) => !['completed', 'cancelled'].includes(t.status)).length}</li>
          <li>Bugün yoklama: {attendance.filter((a) => a.date === todayKey()).length}</li>
        </ul>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const settings = useLiveQuery(() => ensureSettings())
  const logs = useLiveQuery(() => db.auditLogs.orderBy('createdAt').reverse().limit(100).toArray()) ?? []
  const users = useLiveQuery(() => db.users.filter((u) => !u.deletedAt).toArray()) ?? []
  const changePassword = useAuthStore((s) => s.changePassword)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')

  async function saveSettings(patch: Record<string, unknown>) {
    if (!settings) return
    await db.settings.put({ ...settings, ...patch })
  }

  async function doExport() {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mudirasistani-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function doImport(file: File) {
    const text = await file.text()
    const payload = JSON.parse(text) as Record<string, unknown>
    await importAllData(payload)
    setMsg('Yedek içe aktarıldı. Sayfayı yenileyin.')
  }

  return (
    <div>
      <PageHeader title="Ayarlar" desc="Bildirimler, yedekleme, kullanıcılar, şifre ve denetim izi." />
      {settings ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Kurum & bildirimler</h3>
          <Field label="Kurum adı">
            <input className="input" value={settings.organizationName ?? ''} onChange={(e) => saveSettings({ organizationName: e.target.value })} />
          </Field>
          {([
            ['notifyLeave', 'İzin hatırlatıcıları'],
            ['notifyTasks', 'Görev deadline'],
            ['notifyCerts', 'Sertifika son kullanma'],
            ['notifyAbsence', 'Devamsızlık eşiği'],
          ] as const).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={Boolean(settings[key])}
                onChange={(e) => saveSettings({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
          <Field label="Sessiz saat başlangıç">
            <input className="input" type="time" value={settings.quietHoursStart ?? ''} onChange={(e) => saveSettings({ quietHoursStart: e.target.value })} />
          </Field>
          <Field label="Sessiz saat bitiş">
            <input className="input" type="time" value={settings.quietHoursEnd ?? ''} onChange={(e) => saveSettings({ quietHoursEnd: e.target.value })} />
          </Field>
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Şifre değiştir</h3>
        <Field label="Eski şifre"><input className="input" type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} /></Field>
        <Field label="Yeni şifre"><input className="input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></Field>
        <button
          className="btn"
          onClick={async () => {
            const ok = await changePassword(oldPass, newPass)
            setMsg(ok ? 'Şifre güncellendi' : 'Eski şifre hatalı')
          }}
        >
          Güncelle
        </button>
        {msg ? <p style={{ color: 'var(--primary)' }}>{msg}</p> : null}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Yedekleme</h3>
        <p style={{ color: 'var(--muted)' }}>Tüm IndexedDB verisini JSON olarak indir / yükle. GitHub Pages üzerinde sunucu yok — yedek sizin cihazınızda.</p>
        <div className="toolbar">
          <button className="btn" onClick={doExport}>Yedek indir</button>
          <label className="btn secondary">
            Yedek yükle
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) doImport(f)
              }}
            />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Kullanıcılar ({users.length})</h3>
        {users.map((u) => (
          <div key={u.id} className="toolbar" style={{ justifyContent: 'space-between' }}>
            <span>{u.username} · {u.role}</span>
            <span className="chip">{u.lastLogin ? fmtDate(u.lastLogin) : 'hiç giriş yok'}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Denetim izi</h3>
        {logs.length === 0 ? <p style={{ color: 'var(--muted)' }}>Log yok</p> : null}
        {logs.map((l) => (
          <div key={l.id} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0', fontSize: '0.9rem' }}>
            <strong>{l.action}</strong> · {l.entityType} {l.entityId ?? ''} — {l.detail}
            <div style={{ color: 'var(--muted)' }}>{l.userName} · {new Date(l.createdAt).toLocaleString('tr-TR')}</div>
          </div>
        ))}
      </div>

      <EntityCrud
        title="Resmi tatiller"
        description="İzin hesabı için tatil günleri."
        table={db.publicHolidays}
        entityType="holiday"
        titleOf={(h) => h.name}
        subtitleOf={(h) => h.date}
        defaults={{ date: todayKey(), isCustom: true, createdAt: nowIso() }}
        fields={[
          { key: 'name', label: 'Ad', required: true },
          { key: 'date', label: 'Tarih', type: 'date', required: true },
          { key: 'isCustom', label: 'Özel gün', type: 'checkbox' },
        ]}
      />
    </div>
  )
}
