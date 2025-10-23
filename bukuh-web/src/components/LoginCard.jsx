import React, { useState } from 'react'
import { Icons } from './Icon'

export default function LoginCard({ onSubmit, busy }) {
  const [identifier, setIdentifier] = useState('user@lib.test')
  const [password, setPassword] = useState('password')
  const [showHint, setShowHint] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (typeof onSubmit === 'function') onSubmit(identifier.trim(), password)
  }

  return (
    <div className="card max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <Icons.LogIn size={18} /> Masuk ke Bukuh
      </h2>
      <p className="text-sm opacity-80 mb-4">
        Masukkan NIM/member code, username, atau email beserta password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm opacity-80 flex items-center gap-2">
            Identitas
            <button
              type="button"
              className="text-xs underline opacity-70"
              onClick={() => setShowHint((v) => !v)}
            >
              contoh
            </button>
          </label>
          {showHint && (
            <div className="text-xs opacity-70 mb-1">
              Contoh: <code>admin</code>, <code>user@lib.test</code>, atau <code>MBR0001</code>
            </div>
          )}
          <input
            className="input mt-1"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="NIM / Username / Email"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="text-sm opacity-80">Password</label>
          <input
            type="password"
            className="input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password akun"
            required
          />
        </div>
        <button type="submit" className="btn w-full justify-center" disabled={busy}>
          {busy ? (
            <span className="flex items-center gap-2">
              <Icons.Loader2 className="animate-spin" size={16} /> Memeriksa...
            </span>
          ) : (
            'Masuk'
          )}
        </button>
      </form>
    </div>
  )
}
