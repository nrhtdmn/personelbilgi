import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LockPage, SetupPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { PersonnelPage } from './pages/PersonnelPage'
import {
  AnnouncementsPage,
  AttendancePage,
  DisciplinePage,
  DocumentsPage,
  DutyPage,
  HealthPage,
  InspectionsPage,
  InventoryPage,
  LeavePage,
  MeetingsPage,
  OrdersPage,
  TasksPage,
  VehiclesPage,
  VisitorsPage,
} from './pages/EntityPages'
import { ModuleRecordsPage, ModulesCatalogPage, SearchPage } from './pages/ModulesPages'
import { CalendarPage, ReportsPage, SettingsPage } from './pages/MiscPages'
import { useAuthStore } from './store/authStore'
import { ensureSettings } from './db/database'

function Gate({ children }: { children: React.ReactNode }) {
  const unlocked = useAuthStore((s) => s.unlocked)
  const hydrate = useAuthStore((s) => s.hydrate)
  const [ready, setReady] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    ;(async () => {
      await ensureSettings()
      const h = await hydrate()
      setSetupComplete(h.setupComplete)
      setReady(true)
    })()
  }, [hydrate])

  if (!ready) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">Yükleniyor…</div>
      </div>
    )
  }
  if (!setupComplete) return <SetupPage />
  if (!unlocked) return <LockPage />
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <Gate>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="personnel" element={<PersonnelPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="discipline" element={<DisciplinePage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="duty" element={<DutyPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="visitors" element={<VisitorsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="modules" element={<ModulesCatalogPage />} />
            <Route path="modules/:id" element={<ModuleRecordsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Gate>
    </HashRouter>
  )
}
