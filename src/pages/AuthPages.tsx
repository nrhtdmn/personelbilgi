import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export function SetupPage() {
  const setup = useAuthStore((s) => s.setup)
  const [username, setUsername] = useState('mudur')
  const [password, setPassword] = useState('')
  const [org, setOrg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 4) {
      setError('Şifre en az 4 karakter olsun.')
      return
    }
    setBusy(true)
    try {
      await setup(username.trim(), password, org.trim())
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>MüdürAsistanı</h1>
        <p style={{ color: 'var(--muted)' }}>İlk kurulum — veriler tarayıcınızda (IndexedDB) offline saklanır.</p>
        <div className="field">
          <label>Kurum adı</label>
          <input className="input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Örn. İlçe Müdürlüğü" />
        </div>
        <div className="field">
          <label>Kullanıcı adı</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <label>Şifre</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        <button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? '...' : 'Kurulumu tamamla'}</button>
      </form>
    </div>
  )
}

export function LockPage() {
  const unlockWithPassword = useAuthStore((s) => s.unlockWithPassword)
  const unlockWithPin = useAuthStore((s) => s.unlockWithPin)
  const userName = useAuthStore((s) => s.userName)
  const [mode, setMode] = useState<'pin' | 'pass'>('pin')
  const [pin, setPin] = useState('')
  const [username, setUsername] = useState(userName ?? 'mudur')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function tryPin(next: string) {
    setPin(next)
    setError('')
    if (next.length >= 4) {
      const ok = await unlockWithPin(next)
      if (!ok) {
        setError('PIN hatalı')
        setPin('')
      }
    }
  }

  async function onPass(e: React.FormEvent) {
    e.preventDefault()
    const ok = await unlockWithPassword(username.trim(), password)
    if (!ok) setError('Kullanıcı veya şifre hatalı')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Kilitli</h1>
        <p style={{ color: 'var(--muted)' }}>Devam etmek için PIN veya şifre girin.</p>
        <div className="tabs">
          <button type="button" className={`tab${mode === 'pin' ? ' active' : ''}`} onClick={() => setMode('pin')}>PIN</button>
          <button type="button" className={`tab${mode === 'pass' ? ' active' : ''}`} onClick={() => setMode('pass')}>Şifre</button>
        </div>
        {mode === 'pin' ? (
          <>
            <div style={{ letterSpacing: 8, fontSize: 1.4, textAlign: 'center', minHeight: 32 }}>{'•'.repeat(pin.length) || '····'}</div>
            <div className="pin-pad">
              {['1','2','3','4','5','6','7','8','9','⌫','0','C'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('')
                    else if (k === '⌫') setPin((p) => p.slice(0, -1))
                    else tryPin(pin + k)
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={onPass}>
            <div className="field">
              <label>Kullanıcı</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn" style={{ width: '100%' }}>Giriş</button>
          </form>
        )}
        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
      </div>
    </div>
  )
}
