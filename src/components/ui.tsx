import { useEffect, type FormEvent, type ReactNode } from 'react'

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="toolbar" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {desc ? <p className="page-desc">{desc}</p> : null}
      </div>
      {actions}
    </div>
  )
}

export function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="card empty">
      <p>{text}</p>
      {action}
    </div>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--display)' }}>{title}</h2>
          <button className="btn ghost" onClick={onClose}>Kapat</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function FormActions({
  onCancel,
  saving,
  submitLabel = 'Kaydet',
}: {
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
}) {
  return (
    <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
      <button type="button" className="btn secondary" onClick={onCancel}>İptal</button>
      <button type="submit" className="btn" disabled={saving}>{saving ? '...' : submitLabel}</button>
    </div>
  )
}

export function confirmDelete(label: string) {
  return window.confirm(`“${label}” silinsin mi?`)
}

export type FormSubmit = (e: FormEvent) => void | Promise<void>
