import { NavLink, Outlet } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Lock,
  Package,
  Search,
  Settings,
  Users,
  Layers,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/', label: 'Panel', icon: LayoutDashboard },
  { to: '/personnel', label: 'Personel', icon: Users },
  { to: '/tasks', label: 'Görevler', icon: ClipboardList },
  { to: '/leave', label: 'İzinler', icon: FileText },
  { to: '/attendance', label: 'Yoklama', icon: CalendarDays },
  { to: '/inventory', label: 'Envanter', icon: Package },
  { to: '/modules', label: '130+ Modül', icon: Layers },
  { to: '/search', label: 'Arama', icon: Search },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
]

const more = [
  { to: '/orders', label: 'Emirler' },
  { to: '/discipline', label: 'Disiplin' },
  { to: '/meetings', label: 'Toplantılar' },
  { to: '/duty', label: 'Nöbet' },
  { to: '/announcements', label: 'Duyurular' },
  { to: '/visitors', label: 'Ziyaretçi' },
  { to: '/vehicles', label: 'Araçlar' },
  { to: '/health', label: 'Sağlık' },
  { to: '/inspections', label: 'Denetim' },
  { to: '/documents', label: 'Belgeler' },
  { to: '/reports', label: 'Raporlar' },
]

export function Layout() {
  const lock = useAuthStore((s) => s.lock)
  const userName = useAuthStore((s) => s.userName)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">MüdürAsistanı</h1>
        <p className="brand-sub">Offline PWA · {userName}</p>
        <div className="nav-group">
          <div className="nav-label">Ana</div>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </div>
        <div className="nav-group">
          <div className="nav-label">Operasyon</div>
          {more.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <button className="btn secondary" style={{ width: '100%', marginTop: 12 }} onClick={lock}>
          <Lock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Kilitle
        </button>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {[links[0], links[1], links[2], links[6], links[9]].map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
