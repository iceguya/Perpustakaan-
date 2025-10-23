import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../app.css'
import '../index.css'
import LoginCard from '../components/LoginCard'
import { login, me, setToken } from '../api'

export default function Login({ onLoggedIn }) {
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(identifier, password) {
    setBusy(true)
    try {
      await login(identifier, password)
      const u = await me()
      onLoggedIn?.(u)
      navigate('/')
    } catch (error) {
      setToken(null)
      const message = error?.response?.data?.message || 'Login gagal, periksa kembali kredensial.'
      alert(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <LoginCard onSubmit={handleLogin} busy={busy} />
    </div>
  )
}
