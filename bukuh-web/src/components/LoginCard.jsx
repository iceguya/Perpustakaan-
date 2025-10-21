import React, { useState } from 'react'
import { Icons } from './Icon'

export default function LoginCard({ onSubmit, busy }) {
  const [email, setEmail] = useState('user@lib.test')
  const [password, setPassword] = useState('password')

  return (
    <div className="card max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <Icons.LogIn size={18} /> Masuk
      </h2>
      <p className="text-sm opacity-80 mb-4">
        Gunakan akun seeder: user@lib.test / password, atau admin@lib.test untuk akses admin.
      </p>
      <form onSubmit={(e)=>{e.preventDefault(); onSubmit(email,password)}} className="space-y-3">
        <div>
          <label className="text-sm opacity-80">Email</label>
          <input className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-sm opacity-80">Password</label>
          <input type="password" className="input mt-1" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn w-full justify-center" disabled={busy}>
          Masuk
        </button>
      </form>
    </div>
  )
}
