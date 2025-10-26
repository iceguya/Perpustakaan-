import React, { useEffect, useMemo, useState } from 'react'
import Filters from '../components/Filters'
import BookCard from '../components/BookCard'
import { Icons } from '../components/Icon'
import { fetchBooks, requestBorrow } from '../api'
import UserDashboard from '../components/dashboard/UserDashboard'
import AdminDashboard from '../components/dashboard/AdminDashboard'

export default function Home({ user }) {
  const isAdmin = user?.role === 'admin'

  const [filters, setFilters] = useState({ q: '', year: '', sort: 'title', digitalOnly: false })
  const [books, setBooks] = useState([])
  const [page, setPage] = useState(1)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogMeta, setCatalogMeta] = useState(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const params = useMemo(() => {
    const base = { sort: filters.sort }
    if (filters.q) base['filter[q]'] = filters.q
    if (filters.year) base['filter[year]'] = filters.year
    return base
  }, [filters])

  const currentPage = catalogMeta?.page ?? page
  const totalPages = useMemo(() => {
    if (!catalogMeta?.perPage || catalogMeta.total == null) return null
    const perPage = catalogMeta.perPage || 1
    const pages = Math.ceil(catalogMeta.total / perPage)
    return pages > 0 ? pages : 1
  }, [catalogMeta])

  const canGoPrev = !catalogLoading && currentPage > 1
  const canGoNext = !catalogLoading && totalPages ? currentPage < totalPages : false
  const showPagination = Boolean(catalogMeta && totalPages)

  async function loadBooks(targetPageArg = page) {
    const targetPage = typeof targetPageArg === 'number' ? targetPageArg : page
    setCatalogLoading(true)
    try {
      const { items, meta } = await fetchBooks({ ...params, page: targetPage })
      const visible = filters.digitalOnly ? items.filter((item) => item.is_digital) : items
      setBooks(visible)
      setCatalogMeta(
        meta
          ? {
              total: meta.total ?? visible.length,
              page: meta.page ?? targetPage,
              perPage: meta.perPage ?? (visible.length || 1),
              displayTotal: filters.digitalOnly ? visible.length : (meta.total ?? visible.length),
            }
          : filters.digitalOnly
          ? {
              total: visible.length,
              page: targetPage,
              perPage: visible.length || 1,
              displayTotal: visible.length,
            }
          : null
      )
      if (meta?.page != null) {
        setPage(meta.page)
      } else {
        setPage(targetPage)
      }
    } catch (error) {
      console.error('Gagal memuat katalog', error)
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleApplyFilters() {
    loadBooks(1)
  }

  function handleNextPage() {
    if (!canGoNext) return
    loadBooks(currentPage + 1)
  }

  function handlePreviousPage() {
    if (!canGoPrev) return
    loadBooks(currentPage - 1)
  }

  async function handleBorrow(book) {
    if (!user) {
      alert('Silakan masuk untuk mengajukan peminjaman.')
      return
    }
    try {
      const res = await requestBorrow({ bookId: book.id })
      alert(res?.message ?? 'Permintaan peminjaman dikirim ke admin.')
      setRefreshToken((value) => value + 1)
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal membuat permintaan peminjaman.'
      alert(message)
    }
  }

  function handleReadDigital(book) {
    if (!user) {
      alert('Silakan masuk untuk membaca koleksi digital.')
      return
    }
    const url = (book?.file_url || '').trim()
    if (!url) {
      alert('File digital belum tersedia untuk buku ini.')
      return
    }
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-12">
      <section id="catalog" className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Icons.BookOpen size={22} /> Katalog Buku
            </h1>
            <p className="text-sm opacity-75">
              Jelajahi koleksi fisik maupun digital. Masuk untuk meminjam dan menyimpan progress baca.
            </p>
          </div>
          <button
            type="button"
            className="text-xs flex items-center gap-2 opacity-70 hover:opacity-100"
            onClick={loadBooks}
          >
            <Icons.RefreshCcw size={14} /> Muat ulang katalog
          </button>
        </header>

        <Filters
          q={filters.q}
          setQ={(q) => setFilters((prev) => ({ ...prev, q }))}
          year={filters.year}
          setYear={(year) => setFilters((prev) => ({ ...prev, year }))}
          sort={filters.sort}
          setSort={(sort) => setFilters((prev) => ({ ...prev, sort }))}
          onApply={handleApplyFilters}
          isDigitalOnly={filters.digitalOnly}
          setDigitalOnly={(digitalOnly) => setFilters((prev) => ({ ...prev, digitalOnly }))}
        />

        {catalogLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="card h-32">
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-1/2 mb-2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={handleBorrow}
                onRead={handleReadDigital}
                disabled={catalogLoading}
              />
            ))}
          </div>
        )}

        {!catalogLoading && books.length === 0 && (
          <p className="text-sm opacity-70">Tidak ada buku yang cocok dengan filter saat ini.</p>
        )}

        {showPagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <p className="opacity-70">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn !py-1.5 gap-1"
                onClick={handlePreviousPage}
                disabled={!canGoPrev}
              >
                <Icons.ChevronLeft size={16} />
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn !py-1.5 gap-1"
                onClick={handleNextPage}
                disabled={!canGoNext}
              >
                Berikutnya
                <Icons.ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {catalogMeta?.total && (
          <p className="text-xs opacity-60">
            Total koleksi saat ini: {catalogMeta.displayTotal ?? catalogMeta.total} buku.
          </p>
        )}
      </section>

      {user ? (
        isAdmin ? (
          <AdminDashboard
            user={user}
            refreshToken={refreshToken}
            onNeedRefresh={() => setRefreshToken((value) => value + 1)}
          />
        ) : (
          <UserDashboard
            user={user}
            refreshToken={refreshToken}
            onNeedRefresh={() => setRefreshToken((value) => value + 1)}
          />
        )
      ) : (
        <section className="card space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Icons.LogIn size={18} /> Masuk untuk akses penuh
          </h2>
          <p className="text-sm opacity-75">
            Login memungkinkan Anda mengajukan peminjaman, mencatat absensi, melanjutkan bacaan digital,
            serta mengelola data bila Anda admin.
          </p>
        </section>
      )}
    </div>
  )
}
