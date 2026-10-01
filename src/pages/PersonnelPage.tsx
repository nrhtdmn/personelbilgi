import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type FormEvent } from 'react'
import { db, audit, nowIso } from '../db/database'
import type { Personnel } from '../db/types'
import { seniorityLabel, fmtDate } from '../lib/dates'
import { confirmDelete, Empty, Field, FormActions, Modal, PageHeader } from '../components/ui'
import { useAuthStore } from '../store/authStore'

const emptyForm = (): Partial<Personnel> => ({
  firstName: '',
  lastName: '',
  sicilNo: '',
  positionTitle: '',
  rank: '',
  unit: '',
  phonePersonal: '',
  emailWork: '',
  gender: 'Erkek',
  maritalStatus: '',
  bloodType: '',
  nationality: 'TC',
  startDate: new Date().toISOString().slice(0, 10),
  birthDate: '',
  birthPlace: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  militaryStatus: '',
  disabilityType: '',
  workRestrictions: '',
  passportNo: '',
  sgkNo: '',
  isActive: true,
  travelRestricted: false,
})

export function PersonnelPage() {
  const userName = useAuthStore((s) => s.userName) ?? undefined
  const list = useLiveQuery(() => db.personnel.filter((p) => !p.deletedAt).toArray()) ?? []
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('kimlik')
  const [editing, setEditing] = useState<Personnel | null>(null)
  const [form, setForm] = useState<Partial<Personnel>>(emptyForm())
  const [saving, setSaving] = useState(false)

  const filtered = list.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.sicilNo ?? ''} ${p.positionTitle ?? ''}`.toLowerCase().includes(q.toLowerCase()),
  )

  function startCreate() {
    setEditing(null)
    setForm(emptyForm())
    setTab('kimlik')
    setOpen(true)
  }

  function startEdit(p: Personnel) {
    setEditing(p)
    setForm({ ...p })
    setTab('kimlik')
    setOpen(true)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.startDate) return
    setSaving(true)
    try {
      if (editing?.id) {
        await db.personnel.update(editing.id, { ...form, updatedAt: nowIso() })
        await audit('update', 'personnel', editing.id, `${form.firstName} ${form.lastName}`, userName)
      } else {
        const id = await db.personnel.add({
          ...(form as Personnel),
          firstName: form.firstName!.trim(),
          lastName: form.lastName!.trim(),
          startDate: form.startDate!,
          isActive: form.isActive ?? true,
          createdAt: nowIso(),
        })
        await audit('create', 'personnel', id, `${form.firstName} ${form.lastName}`, userName)
      }
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(p: Personnel) {
    if (!p.id || !confirmDelete(`${p.firstName} ${p.lastName}`)) return
    await db.personnel.update(p.id, { deletedAt: nowIso(), isActive: false })
    await audit('delete', 'personnel', p.id, `${p.firstName} ${p.lastName}`, userName)
  }

  const set = (key: keyof Personnel, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div>
      <PageHeader
        title="Personel"
        desc="Kimlik, iletişim, sağlık, askerlik, pasaport ve SGK alanları — tam CRUD."
        actions={<button className="btn" onClick={startCreate}>Personel ekle</button>}
      />
      <div className="toolbar">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="chip info">{filtered.length} kişi</span>
      </div>
      {filtered.length === 0 ? (
        <Empty text="Personel yok." action={<button className="btn" onClick={startCreate}>Ekle</button>} />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Ad</th><th>Unvan</th><th>Kıdem</th><th>Durum</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.firstName} {p.lastName}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{p.sicilNo || '—'}</div>
                  </td>
                  <td>{p.positionTitle || p.rank || '—'}</td>
                  <td>{seniorityLabel(p.startDate)}</td>
                  <td><span className={`chip ${p.isActive ? 'ok' : 'bad'}`}>{p.isActive ? 'Aktif' : 'Pasif'}</span></td>
                  <td>
                    <button className="btn ghost" onClick={() => startEdit(p)}>Düzenle</button>
                    <button className="btn ghost" onClick={() => remove(p)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? 'Personel düzenle' : 'Personel ekle'} onClose={() => setOpen(false)}>
        <div className="tabs">
          {['kimlik', 'iletisim', 'gorev', 'saglik', 'askerlik', 'pasaport', 'sgk'].map((t) => (
            <button key={t} type="button" className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <form onSubmit={save}>
          {tab === 'kimlik' && (
            <>
              <Field label="Ad *"><input className="input" required value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} /></Field>
              <Field label="Soyad *"><input className="input" required value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} /></Field>
              <Field label="Sicil No"><input className="input" value={form.sicilNo ?? ''} onChange={(e) => set('sicilNo', e.target.value)} /></Field>
              <Field label="TC (yerelde saklanır)"><input className="input" value={form.tcNo ?? ''} onChange={(e) => set('tcNo', e.target.value)} /></Field>
              <Field label="Doğum tarihi"><input className="input" type="date" value={form.birthDate ?? ''} onChange={(e) => set('birthDate', e.target.value)} /></Field>
              <Field label="Doğum yeri"><input className="input" value={form.birthPlace ?? ''} onChange={(e) => set('birthPlace', e.target.value)} /></Field>
              <Field label="Cinsiyet">
                <select className="select" value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value)}>
                  <option>Erkek</option><option>Kadın</option><option>Belirtilmemiş</option>
                </select>
              </Field>
              <Field label="Medeni durum">
                <select className="select" value={form.maritalStatus ?? ''} onChange={(e) => set('maritalStatus', e.target.value)}>
                  <option value="">—</option>
                  <option>Bekar</option><option>Evli</option><option>Boşanmış</option><option>Dul</option>
                </select>
              </Field>
              <Field label="Uyruk"><input className="input" value={form.nationality ?? 'TC'} onChange={(e) => set('nationality', e.target.value)} /></Field>
              <Field label="Aktif">
                <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />
              </Field>
            </>
          )}
          {tab === 'iletisim' && (
            <>
              <Field label="İş telefonu"><input className="input" value={form.phoneWork ?? ''} onChange={(e) => set('phoneWork', e.target.value)} /></Field>
              <Field label="Kişisel telefon"><input className="input" value={form.phonePersonal ?? ''} onChange={(e) => set('phonePersonal', e.target.value)} /></Field>
              <Field label="Kurumsal e-posta"><input className="input" value={form.emailWork ?? ''} onChange={(e) => set('emailWork', e.target.value)} /></Field>
              <Field label="Kişisel e-posta"><input className="input" value={form.emailPersonal ?? ''} onChange={(e) => set('emailPersonal', e.target.value)} /></Field>
              <Field label="Adres"><textarea className="textarea" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Acil kişi"><input className="input" value={form.emergencyContactName ?? ''} onChange={(e) => set('emergencyContactName', e.target.value)} /></Field>
              <Field label="Acil telefon"><input className="input" value={form.emergencyContactPhone ?? ''} onChange={(e) => set('emergencyContactPhone', e.target.value)} /></Field>
              <Field label="Yakınlık"><input className="input" value={form.emergencyContactRelation ?? ''} onChange={(e) => set('emergencyContactRelation', e.target.value)} /></Field>
            </>
          )}
          {tab === 'gorev' && (
            <>
              <Field label="Unvan / rütbe"><input className="input" value={form.rank ?? ''} onChange={(e) => set('rank', e.target.value)} /></Field>
              <Field label="Pozisyon"><input className="input" value={form.positionTitle ?? ''} onChange={(e) => set('positionTitle', e.target.value)} /></Field>
              <Field label="Birim"><input className="input" value={form.unit ?? ''} onChange={(e) => set('unit', e.target.value)} /></Field>
              <Field label="Çalışma yeri"><input className="input" value={form.workLocation ?? ''} onChange={(e) => set('workLocation', e.target.value)} /></Field>
              <Field label="İşe başlama *"><input className="input" type="date" required value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} /></Field>
              {form.startDate ? <p style={{ color: 'var(--muted)' }}>Kıdem: {seniorityLabel(form.startDate)} (başlama {fmtDate(form.startDate)})</p> : null}
            </>
          )}
          {tab === 'saglik' && (
            <>
              <Field label="Kan grubu">
                <select className="select" value={form.bloodType ?? ''} onChange={(e) => set('bloodType', e.target.value)}>
                  <option value="">—</option>
                  {['A+','A-','B+','B-','0+','0-','AB+','AB-'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Organ bağışçısı">
                <input type="checkbox" checked={!!form.organDonor} onChange={(e) => set('organDonor', e.target.checked)} />
              </Field>
              <Field label="Alerjiler"><textarea className="textarea" value={form.knownAllergies ?? ''} onChange={(e) => set('knownAllergies', e.target.value)} /></Field>
              <Field label="Engel oranı"><input className="input" type="number" value={form.disabilityRate ?? ''} onChange={(e) => set('disabilityRate', Number(e.target.value))} /></Field>
              <Field label="Engel türü"><input className="input" value={form.disabilityType ?? ''} onChange={(e) => set('disabilityType', e.target.value)} /></Field>
              <Field label="İş kısıtları"><textarea className="textarea" value={form.workRestrictions ?? ''} onChange={(e) => set('workRestrictions', e.target.value)} /></Field>
            </>
          )}
          {tab === 'askerlik' && (
            <>
              <Field label="Askerlik durumu"><input className="input" value={form.militaryStatus ?? ''} onChange={(e) => set('militaryStatus', e.target.value)} /></Field>
              <Field label="Terhis / tecil bitiş"><input className="input" type="date" value={form.militaryEndDate ?? ''} onChange={(e) => set('militaryEndDate', e.target.value)} /></Field>
            </>
          )}
          {tab === 'pasaport' && (
            <>
              <Field label="Pasaport no"><input className="input" value={form.passportNo ?? ''} onChange={(e) => set('passportNo', e.target.value)} /></Field>
              <Field label="Son kullanma"><input className="input" type="date" value={form.passportExpiry ?? ''} onChange={(e) => set('passportExpiry', e.target.value)} /></Field>
              <Field label="Vize bilgisi"><textarea className="textarea" value={form.visaInfo ?? ''} onChange={(e) => set('visaInfo', e.target.value)} /></Field>
              <Field label="Seyahat kısıtı">
                <input type="checkbox" checked={!!form.travelRestricted} onChange={(e) => set('travelRestricted', e.target.checked)} />
              </Field>
            </>
          )}
          {tab === 'sgk' && (
            <>
              <Field label="SGK sicil"><input className="input" value={form.sgkNo ?? ''} onChange={(e) => set('sgkNo', e.target.value)} /></Field>
              <Field label="Sigorta başlangıç"><input className="input" type="date" value={form.sgkStartDate ?? ''} onChange={(e) => set('sgkStartDate', e.target.value)} /></Field>
              <Field label="Sağlık poliçe no"><input className="input" value={form.healthInsuranceNo ?? ''} onChange={(e) => set('healthInsuranceNo', e.target.value)} /></Field>
              <Field label="Poliçe bitiş"><input className="input" type="date" value={form.healthInsuranceEnd ?? ''} onChange={(e) => set('healthInsuranceEnd', e.target.value)} /></Field>
              <Field label="Notlar"><textarea className="textarea" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></Field>
            </>
          )}
          <FormActions onCancel={() => setOpen(false)} saving={saving} />
        </form>
      </Modal>
    </div>
  )
}
