import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './app.css'
import './index.css'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import Login from './pages/Login'
import { Icons } from './components/Icon'
import { me, logout as apiLogout, setToken } from './api'

export default function App() {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')
    if (!token) {
      setInitializing(false)
      return () => {
        cancelled = true
      }
    }

    setToken(token)
    me()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
        setToken(null)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      navigate('/login')
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [navigate])

  async function handleLogout() {
    await apiLogout()
    setUser(null)
    navigate('/login')
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-sm opacity-70">
        <Icons.Loader2 className="animate-spin" size={24} />
        Memuat sesi pengguna...
      </div>
    )
  }

  return (
    <div className="min-h-full pb-16">
      <Topbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home user={user} onUserChange={setUser} />} />
          <Route path="/login" element={<Login onLoggedIn={setUser} />} />
        </Routes>
      </main>
    </div>
  )
}
