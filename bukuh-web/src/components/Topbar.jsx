import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from './Icon'

export default function Topbar({ user, onLogout }) {
  const isAdmin = user?.role === 'admin'

  const quickLinks = useMemo(() => {
    if (!user) return []
    return isAdmin
      ? [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'pending-borrows', label: 'Approval' },
          { id: 'books-management', label: 'Kelola Buku' },
          { id: 'members-management', label: 'Kelola Anggota' },
        ]
      : [
          { id: 'catalog', label: 'Katalog' },
          { id: 'my-borrows', label: 'Peminjaman Saya' },
          { id: 'attendance', label: 'Absensi' },
          { id: 'reading', label: 'Progress Baca' },
        ]
  }, [user, isAdmin])

  function handleScroll(id) {
    if (!id) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 dark:border-white/10 backdrop-blur-md bg-white/85 dark:bg-[#0b1220]/70">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl2 bg-brand-600 text-white">
            <Icons.Library size={18} />
          </div>
          <div className="leading-tight">
            <span className="font-semibold tracking-wide block">Bukuh Library</span>
            <span className="text-xs opacity-70 hidden sm:block">
              {isAdmin ? 'Panel Admin' : 'Portal Anggota'}
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-3 text-sm">
          {quickLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              className="opacity-75 hover:opacity-100 transition"
              onClick={() => handleScroll(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end text-xs leading-tight">
                <span className="font-semibold flex items-center gap-1">
                  <Icons.User2 size={14} /> {user.name}
                </span>
                <span className="opacity-70 capitalize">
                  {user.role} {user?.member?.member_code ? `• ${user.member.member_code}` : ''}
                </span>
              </div>
              <button className="btn !py-1.5 hidden sm:inline-flex" onClick={onLogout}>
                <Icons.LogOut size={16} /> Keluar
              </button>
              <button
                className="sm:hidden p-2 rounded-xl2 border border-white/40 hover:bg-white/20"
                onClick={onLogout}
              >
                <Icons.LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn !py-1.5">
              <Icons.LogIn size={16} /> Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
