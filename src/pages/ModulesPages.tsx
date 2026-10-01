import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState, type FormEvent } from 'react'
import { allModules, findModule, moduleCatalog, moduleCount } from '../data/moduleCatalog'
import { audit, db, nowIso } from '../db/database'
import { confirmDelete, Empty, Field, FormActions, Modal, PageHeader } from '../components/ui'
import { fmtDateTime } from '../lib/dates'
import { useAuthStore } from '../store/authStore'

export function ModulesCatalogPage() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const categories = useMemo(
    () =>
      moduleCatalog
        .map((c) => ({
          ...c,
          modules: c.modules.filter(
            (m) => !query || m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query),
          ),
        }))
        .filter((c) => c.modules.length > 0),
    [query],
  )

  return (
    <div>
      <PageHeader
        title={`Tüm Modüller (${moduleCount})`}
        desc="Flutter HTML listesindeki 20 kategori / 130+ modül — her biri için tam CRUD."
      />
      <div className="toolbar">
        <input className="input" style={{ maxWidth: 360 }} placeholder="Modül ara..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {categories.map((cat) => (
        <section key={cat.name} style={{ marginBottom: 20 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
            {cat.name}
          </h2>
          <div className="module-grid">
            {cat.modules.map((m) => (
              <Link key={m.id} to={`/modules/${m.id}`} className="module-tile" style={{ textAlign: 'left', alignItems: 'flex-start', padding: 12 }}>
                <strong style={{ fontSize: '0.85rem' }}>{m.name}</strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{m.description}</span>
                {m.badge ? <span className={`chip ${m.badge === 'crit' ? 'bad' : 'ok'}`}>{m.badge === 'crit' ? 'Öncelikli' : 'Yeni'}</span> : null}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ModuleRecordsPage() {
  const { id = '' } = useParams()
  const found = findModule(id)
  const userName = useAuthStore((s) => s.userName) ?? undefined
  const navigate = useNavigate()
  const records = useLiveQuery(
    () => db.moduleRecords.filter((r) => !r.deletedAt && r.moduleId === id).reverse().sortBy('id'),
    [id],
  ) ?? []

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [data, setData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  if (!found) {
    return (
      <div>
        <PageHeader title="Modül bulunamadı" />
        <button className="btn" onClick={() => navigate('/modules')}>Kataloğa dön</button>
      </div>
    )
  }

  const { module, category } = found

  function openCreate() {
    setEditingId(null)
    setTitle('')
    setData(Object.fromEntries(module.fields.map((f) => [f, ''])))
    setOpen(true)
  }

  function openEdit(rec: (typeof records)[0]) {
    setEditingId(rec.id!)
    setTitle(rec.title)
    setData({ ...Object.fromEntries(module.fields.map((f) => [f, ''])), ...rec.data })
    setOpen(true)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await db.moduleRecords.update(editingId, { title, data, updatedAt: nowIso() })
        await audit('update', `module:${id}`, editingId, title, userName)
      } else {
        const newId = await db.moduleRecords.add({
          moduleId: id,
          title,
          data,
          createdAt: nowIso(),
        })
        await audit('create', `module:${id}`, newId, title, userName)
      }
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(rec: (typeof records)[0]) {
    if (!rec.id || !confirmDelete(rec.title)) return
    await db.moduleRecords.update(rec.id, { deletedAt: nowIso() })
    await audit('delete', `module:${id}`, rec.id, rec.title, userName)
  }

  return (
    <div>
      <PageHeader
        title={module.name}
        desc={`${category.name} · ${module.description}`}
        actions={
          <div className="toolbar">
            <button className="btn secondary" onClick={() => navigate('/modules')}>Katalog</button>
            <button className="btn" onClick={openCreate}>Kayıt ekle</button>
          </div>
        }
      />
      {records.length === 0 ? (
        <Empty text="Bu modülde kayıt yok." action={<button className="btn" onClick={openCreate}>Ekle</button>} />
      ) : (
        <div className="card">
          {records.map((r) => (
            <details key={r.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span>
                  <strong>{r.title}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                    {fmtDateTime(r.updatedAt || r.createdAt)}
                  </span>
                </span>
                <span>
                  <button type="button" className="btn ghost" onClick={(e) => { e.preventDefault(); openEdit(r) }}>Düzenle</button>
                  <button type="button" className="btn ghost" onClick={(e) => { e.preventDefault(); remove(r) }}>Sil</button>
                </span>
              </summary>
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>
                {Object.entries(r.data).map(([k, v]) => (
                  <div key={k}><strong style={{ color: 'var(--text)' }}>{k}:</strong> {v || '—'}</div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

      <Modal open={open} title={editingId ? 'Kayıt düzenle' : 'Yeni kayıt'} onClose={() => setOpen(false)}>
        <form onSubmit={save}>
          <Field label="Kayıt başlığı *">
            <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          {module.fields.map((f) => (
            <Field key={f} label={f}>
              <input
                className="input"
                value={data[f] ?? ''}
                onChange={(e) => setData((d) => ({ ...d, [f]: e.target.value }))}
              />
            </Field>
          ))}
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  )
}

export function SearchPage() {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const personnel = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt).toArray()) ?? []
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray()) ?? []
  const equipment = useLiveQuery(() => db.equipment.filter((e) => !e.deletedAt).toArray()) ?? []
  const orders = useLiveQuery(() => db.orders.filter((o) => !o.deletedAt).toArray()) ?? []
  const modules = useMemo(
    () => (needle ? allModules().filter((m) => `${m.name} ${m.description} ${m.category}`.toLowerCase().includes(needle)) : []),
    [needle],
  )

  const pMatch = needle ? personnel.filter((p) => `${p.firstName} ${p.lastName} ${p.sicilNo}`.toLowerCase().includes(needle)) : []
  const tMatch = needle ? tasks.filter((t) => t.title.toLowerCase().includes(needle)) : []
  const eMatch = needle ? equipment.filter((e) => `${e.name} ${e.serialNo}`.toLowerCase().includes(needle)) : []
  const oMatch = needle ? orders.filter((o) => `${o.title} ${o.orderNo}`.toLowerCase().includes(needle)) : []

  return (
    <div>
      <PageHeader title="Arama" desc="Personel, görev, demirbaş, emir ve 130+ modül kataloğu." />
      <input className="input" autoFocus placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
      {!needle ? <p className="empty">Yazmaya başlayın</p> : null}
      {needle && !pMatch.length && !tMatch.length && !eMatch.length && !oMatch.length && !modules.length ? (
        <p className="empty">Sonuç yok</p>
      ) : null}
      {pMatch.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Personel</h3>
          {pMatch.map((p) => (
            <Link key={p.id} to="/personnel" className="nav-link">{p.firstName} {p.lastName}</Link>
          ))}
        </div>
      )}
      {tMatch.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Görev</h3>
          {tMatch.map((t) => (
            <Link key={t.id} to="/tasks" className="nav-link">{t.title}</Link>
          ))}
        </div>
      )}
      {eMatch.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Demirbaş</h3>
          {eMatch.map((e) => (
            <Link key={e.id} to="/inventory" className="nav-link">{e.name}</Link>
          ))}
        </div>
      )}
      {oMatch.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Emir</h3>
          {oMatch.map((o) => (
            <Link key={o.id} to="/orders" className="nav-link">{o.orderNo} · {o.title}</Link>
          ))}
        </div>
      )}
      {modules.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Modül</h3>
          {modules.map((m) => (
            <Link key={m.id} to={`/modules/${m.id}`} className="nav-link">{m.name} <span style={{ color: 'var(--muted)' }}>({m.category})</span></Link>
          ))}
        </div>
      )}
    </div>
  )
}
