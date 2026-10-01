import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  CalendarOff,
  ClipboardList,
  Package,
  Users,
  Layers,
  CalendarDays,
  Gavel,
  Car,
  HeartPulse,
  FileText,
} from 'lucide-react'
import { db } from '../db/database'
import { moduleCount } from '../data/moduleCatalog'
import { todayKey } from '../lib/dates'
import { PageHeader } from '../components/ui'

export function DashboardPage() {
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt && p.isActive).toArray()) ?? []
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray()) ?? []
  const leave = useLiveQuery(() => db.leaveRequests.filter((l) => !l.deletedAt && l.status === 'pending').toArray()) ?? []
  const attendance = useLiveQuery(() => db.attendances.filter((a) => !a.deletedAt && a.date === todayKey() && a.status === 'absent').toArray()) ?? []

  const openTasks = tasks.filter((t) => !['completed', 'cancelled'].includes(t.status)).length

  const tiles = [
    { to: '/personnel', label: 'Personel', icon: Users },
    { to: '/tasks', label: 'Görevler', icon: ClipboardList },
    { to: '/leave', label: 'İzin', icon: CalendarOff },
    { to: '/attendance', label: 'Yoklama', icon: CalendarDays },
    { to: '/orders', label: 'Emir', icon: FileText },
    { to: '/discipline', label: 'Disiplin', icon: Gavel },
    { to: '/inventory', label: 'Envanter', icon: Package },
    { to: '/vehicles', label: 'Araç', icon: Car },
    { to: '/health', label: 'Sağlık', icon: HeartPulse },
    { to: '/modules', label: `${moduleCount} Modül`, icon: Layers },
    { to: '/calendar', label: 'Takvim', icon: CalendarDays },
    { to: '/reports', label: 'Raporlar', icon: FileText },
  ]

  return (
    <div>
      <PageHeader title="Panel" desc="Özet istatistikler ve tüm modüllere hızlı erişim. Veriler cihazınızda offline tutulur." />
      <div className="grid-stats">
        <div className="stat"><div className="label">Aktif personel</div><div className="value">{personnel.length}</div></div>
        <div className="stat"><div className="label">Açık görev</div><div className="value">{openTasks}</div></div>
        <div className="stat"><div className="label">Bekleyen izin</div><div className="value">{leave.length}</div></div>
        <div className="stat"><div className="label">Bugün devamsız</div><div className="value">{attendance.length}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <Link to="/modules" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>HTML listesindeki tüm modüller</strong>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              20 kategori · {moduleCount} modül · ekle / düzenle / sil
            </div>
          </div>
          <Layers />
        </Link>
      </div>

      <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.2rem' }}>Modüller</h2>
      <div className="module-grid" style={{ marginTop: 12 }}>
        {tiles.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="module-tile">
            <Icon size={22} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
