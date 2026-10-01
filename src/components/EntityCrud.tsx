import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { Table } from 'dexie'
import { audit, nowIso } from '../db/database'
import { confirmDelete, Empty, Field, FormActions, Modal, PageHeader } from './ui'
import { useAuthStore } from '../store/authStore'

type Soft = { id?: number; deletedAt?: string | null; createdAt?: string; updatedAt?: string | null }

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox'
  required?: boolean
  options?: { value: string; label: string }[]
}

interface Props<T extends Soft> {
  title: string
  description: string
  table: Table<T, number>
  entityType: string
  fields: FieldDef[]
  titleOf: (row: T) => string
  subtitleOf?: (row: T) => string
  defaults?: Partial<T>
  filterChip?: (row: T) => ReactNode
  extraToolbar?: ReactNode
}

export function EntityCrud<T extends Soft>({
  title,
  description,
  table,
  entityType,
  fields,
  titleOf,
  subtitleOf,
  defaults,
  filterChip,
  extraToolbar,
}: Props<T>) {
  const userName = useAuthStore((s) => s.userName) ?? undefined
  const rows = useLiveQuery(
    () => table.filter((r) => !r.deletedAt).reverse().sortBy('id'),
    [table],
  ) ?? []
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(needle))
  }, [rows, q])

  function openCreate() {
    setEditing(null)
    const init: Record<string, string | boolean> = {}
    for (const f of fields) {
      const d = defaults?.[f.key as keyof T]
      if (f.type === 'checkbox') init[f.key] = Boolean(d)
      else init[f.key] = d != null ? String(d) : f.type === 'date' ? new Date().toISOString().slice(0, 10) : ''
    }
    setForm(init)
    setOpen(true)
  }

  function openEdit(row: T) {
    setEditing(row)
    const init: Record<string, string | boolean> = {}
    for (const f of fields) {
      const v = row[f.key as keyof T]
      if (f.type === 'checkbox') init[f.key] = Boolean(v)
      else init[f.key] = v != null ? String(v) : ''
    }
    setForm(init)
    setOpen(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...defaults }
      for (const f of fields) {
        const raw = form[f.key]
        if (f.type === 'number') payload[f.key] = raw === '' ? undefined : Number(raw)
        else if (f.type === 'checkbox') payload[f.key] = Boolean(raw)
        else payload[f.key] = raw === '' ? undefined : raw
      }
      if (editing?.id != null) {
        await table.update(editing.id, { ...payload, updatedAt: nowIso() } as never)
        await audit('update', entityType, editing.id, titleOf(editing), userName)
      } else {
        const id = await table.add({
          ...(payload as T),
          createdAt: nowIso(),
        } as T)
        await audit('create', entityType, id as number, String(payload.title ?? payload.name ?? ''), userName)
      }
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: T) {
    if (!row.id || !confirmDelete(titleOf(row))) return
    await table.update(row.id, { deletedAt: nowIso() } as never)
    await audit('delete', entityType, row.id, titleOf(row), userName)
  }

  return (
    <div>
      <PageHeader
        title={title}
        desc={description}
        actions={<button className="btn" onClick={openCreate}>Ekle</button>}
      />
      <div className="toolbar">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        {extraToolbar}
        <span className="chip info">{filtered.length} kayıt</span>
      </div>
      {filtered.length === 0 ? (
        <Empty text="Kayıt yok. İlk kaydı ekleyin." action={<button className="btn" onClick={openCreate}>Ekle</button>} />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kayıt</th>
                <th>Detay</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{titleOf(row)}</strong>
                    <div>{filterChip?.(row)}</div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{subtitleOf?.(row)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn ghost" onClick={() => openEdit(row)}>Düzenle</button>
                    <button className="btn ghost" onClick={() => remove(row)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? 'Düzenle' : 'Yeni kayıt'} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          {fields.map((f) => (
            <Field key={f.key} label={f.label + (f.required ? ' *' : '')}>
              {f.type === 'textarea' ? (
                <textarea
                  className="textarea"
                  required={f.required}
                  value={String(form[f.key] ?? '')}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              ) : f.type === 'select' ? (
                <select
                  className="select"
                  required={f.required}
                  value={String(form[f.key] ?? '')}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                >
                  <option value="">Seçiniz</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === 'checkbox' ? (
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.key])}
                    onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                  />
                  Aktif
                </label>
              ) : (
                <input
                  className="input"
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  required={f.required}
                  value={String(form[f.key] ?? '')}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </Field>
          ))}
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  )
}
