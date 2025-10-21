import React, { useEffect, useMemo, useState } from 'react'
import './app.css'
import './index.css'
import Topbar from './components/Topbar'
import LoginCard from './components/LoginCard'
import BookCard from './components/BookCard'
import Filters from './components/Filters'
import { login, me, getBooks, borrowBook, setToken, getSummary } from './api'
import { Icons } from './components/Icon'

export default function App() {
  const [user, setUser] = useState(null)
  const [busy, setBusy] = useState(false)
  const [books, setBooks] = useState(null)
  const [meta, setMeta] = useState({})
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('title')
  const [summary, setSummary] = useState(null)
  const [memberId, setMemberId] = useState(1)

  const params = useMemo(() => {
    const p = { sort }
    if (q) p['filter[title]'] = q
    if (year) p['filter[year]'] = year
    return p
  }, [q, year, sort])

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) {
      setToken(t)
      me().then(setUser).catch(() => setUser(null))
    }
    refresh()
  }, [])

  async function refresh() {
    setBusy(true)
    try {
      const data = await getBooks(params)
      setBooks(Array.isArray(data) ? data : data.data)
      setMeta(!Array.isArray(data) ? { page: data.current_page, total: data.total } : {})

      if (user?.role === 'admin') {
        const s = await getSummary().catch(() => null)
        setSummary(s)
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { refresh() }, [sort])

  async function handleLogin(email, password) {
    setBusy(true)
    try {
      await login(email, password)
      const u = await me()
      setUser(u)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
  }

  async function handleBorrow(book) {
    if (!user) {
      alert('Login dulu supaya bisa meminjam')
      return
    }
    setBusy(true)
    try {
      await borrowBook({ member_id: memberId, book_id: book.id, days: 7 })
      await refresh()
      alert(`Berhasil meminjam: ${book.title}`)
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal meminjam')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full">
      <Topbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Admin Summary */}
        {user?.role === 'admin' && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="text-sm opacity-70">Total Buku</div>
              <div className="text-2xl font-semibold">{summary?.total_books ?? '—'}</div>
            </div>
            <div className="card">
              <div className="text-sm opacity-70">Total Anggota</div>
              <div className="text-2xl font-semibold">{summary?.total_members ?? '—'}</div>
            </div>
            <div className="card">
              <div className="text-sm opacity-70">Peminjaman Hari Ini</div>
              <div className="text-2xl font-semibold">{summary?.borrowed_today ?? '—'}</div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6">
          <Filters q={q} setQ={setQ} year={year} setYear={setYear} sort={sort} setSort={setSort} onApply={refresh} />
        </section>

        {/* Books Grid */}
        <section className="mb-10">
          {busy && !books ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton h-6 w-2/3" />
                  <div className="skeleton h-4 w-1/2 mt-3" />
                  <div className="flex justify-between mt-6">
                    <div className="skeleton h-8 w-20" />
                    <div className="skeleton h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books?.map(b => (
                <BookCard key={b.id} book={b} onBorrow={handleBorrow} disabled={busy} />
              ))}
            </div>
          )}
          {meta?.total && (
            <p className="text-xs opacity-70 mt-3">
              Menampilkan {books?.length} dari total {meta.total} buku.
            </p>
          )}
        </section>

        {/* Login Panel */}
        {!user && <LoginCard onSubmit={handleLogin} busy={busy} />}

        {/* Member Selector */}
        {user && (
          <div className="card max-w-md">
            <label className="text-sm opacity-80">Pinjam sebagai Member ID</label>
            <input
              className="input mt-1"
              type="number"
              value={memberId}
              min={1}
              onChange={e => setMemberId(Number(e.target.value || 1))}
            />
            <p className="text-xs opacity-70 mt-2">
              Gunakan ID yang ada di tabel <code>members</code> (Seeder membuat 20 anggota).
            </p>
          </div>
        )}

        <footer className="mt-10 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Bukuh — dibuat dengan Laravel 11 & React
        </footer>
      </main>
    </div>
  )
}
