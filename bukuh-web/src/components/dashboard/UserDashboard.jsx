import React, { useEffect, useMemo, useState } from 'react'
import { Icons } from '../Icon'
import {
  checkinAttendance,
  fetchMyBorrows,
  fetchReadHistory,
  returnBorrow,
  updateReadProgress,
} from '../../api'

export default function UserDashboard({ user, refreshToken, onNeedRefresh }) {
  const memberId = user?.member?.id ?? null
  const [borrows, setBorrows] = useState([])
  const [loadingBorrows, setLoadingBorrows] = useState(false)
  const [readHistory, setReadHistory] = useState({ digital: [], physical: [] })
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [attendanceBusy, setAttendanceBusy] = useState(false)
  const [lastAttendance, setLastAttendance] = useState(null)
  const [readingForm, setReadingForm] = useState({ bookId: '', currentPage: '', totalPages: '' })
  const [readingBusy, setReadingBusy] = useState(false)

  async function loadBorrows() {
    if (!memberId) return
    setLoadingBorrows(true)
    try {
      const { items } = await fetchMyBorrows()
      setBorrows(items)
    } catch (error) {
      console.error('Gagal memuat peminjaman', error)
      setBorrows([])
    } finally {
      setLoadingBorrows(false)
    }
  }

  async function loadHistory() {
    if (!memberId) return
    setLoadingHistory(true)
    try {
      const data = await fetchReadHistory()
      setReadHistory({
        digital: data?.digital ?? [],
        physical: data?.physical ?? [],
      })
    } catch (error) {
      console.error('Gagal memuat history baca', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadBorrows()
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, memberId])

  async function handleReturn(borrow) {
    try {
      await returnBorrow(borrow.id)
      alert('Buku berhasil dikembalikan. Terima kasih!')
      loadBorrows()
      onNeedRefresh?.()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal mengembalikan buku.'
      alert(message)
    }
  }

  async function handleAttendance() {
    setAttendanceBusy(true)
    try {
      const data = await checkinAttendance()
      setLastAttendance(data)
      alert('Absensi berhasil dicatat.')
      onNeedRefresh?.()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal mencatat absensi.'
      alert(message)
    } finally {
      setAttendanceBusy(false)
    }
  }

  async function handleProgressSubmit(e) {
    e.preventDefault()
    if (!readingForm.bookId) {
      alert('Masukkan ID buku digital yang valid.')
      return
    }
    setReadingBusy(true)
    try {
      await updateReadProgress({
        bookId: Number(readingForm.bookId),
        currentPage: Number(readingForm.currentPage || 0),
        totalPages: Number(readingForm.totalPages || 1),
      })
      alert('Progress baca tersimpan.')
      setReadingForm({ bookId: '', currentPage: '', totalPages: '' })
      loadHistory()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal menyimpan progress baca.'
      alert(message)
    } finally {
      setReadingBusy(false)
    }
  }

  const activeBorrows = useMemo(() => borrows.filter((item) => item.status === 'approved'), [borrows])

  return (
    <div className="space-y-10" id="user-dashboard">
      <section id="my-borrows" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.BookMarked size={18} />
          <h2 className="text-xl font-semibold">Peminjaman Saya</h2>
        </header>
        <div className="card space-y-3">
          {loadingBorrows ? (
            <div className="skeleton h-20 w-full" />
          ) : borrows.length === 0 ? (
            <EmptyState
              icon={<Icons.BookOpen size={20} />}
              title="Belum ada peminjaman"
              description="Ajukan peminjaman buku fisik dari katalog untuk memulai."
            />
          ) : (
            <div className="space-y-2 text-sm">
              {borrows.map((borrow) => (
                <BorrowItem key={borrow.id} borrow={borrow} onReturn={() => handleReturn(borrow)} />
              ))}
            </div>
          )}
          {activeBorrows.length > 0 && (
            <p className="text-xs opacity-70">
              Saat ini Anda memiliki {activeBorrows.length} peminjaman aktif.
            </p>
          )}
        </div>
      </section>

      <section id="attendance" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.QrCode size={18} />
          <h2 className="text-xl font-semibold">Absensi Kehadiran</h2>
        </header>
        <div className="card space-y-3">
          <p className="text-sm opacity-75">
            Tekan tombol berikut saat tiba di perpustakaan. Sistem akan mencatat waktu kedatangan Anda
            secara otomatis.
          </p>
          <button
            type="button"
            className="btn w-full sm:w-auto justify-center"
            onClick={handleAttendance}
            disabled={attendanceBusy}
          >
            {attendanceBusy ? (
              <span className="flex items-center gap-2">
                <Icons.Loader2 className="animate-spin" size={16} /> Mencatat...
              </span>
            ) : (
              <>
                <Icons.CalendarDays size={16} /> Saya hadir hari ini
              </>
            )}
          </button>
          {lastAttendance && (
            <div className="text-xs opacity-70">
              Terakhir tercatat: {new Date(lastAttendance.checked_in_at).toLocaleString()}
            </div>
          )}
        </div>
      </section>

      <section id="reading" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.History size={18} />
          <h2 className="text-xl font-semibold">Progress Baca Digital</h2>
        </header>
        <div className="card space-y-4">
          <form className="grid gap-3 md:grid-cols-4" onSubmit={handleProgressSubmit}>
            <div>
              <label className="text-xs uppercase opacity-70">ID Buku Digital</label>
              <input
                className="input mt-1"
                value={readingForm.bookId}
                onChange={(e) => setReadingForm((prev) => ({ ...prev, bookId: e.target.value }))}
                placeholder="Masukkan ID buku"
              />
            </div>
            <div>
              <label className="text-xs uppercase opacity-70">Halaman Saat Ini</label>
              <input
                className="input mt-1"
                type="number"
                min="0"
                value={readingForm.currentPage}
                onChange={(e) => setReadingForm((prev) => ({ ...prev, currentPage: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs uppercase opacity-70">Total Halaman</label>
              <input
                className="input mt-1"
                type="number"
                min="1"
                value={readingForm.totalPages}
                onChange={(e) => setReadingForm((prev) => ({ ...prev, totalPages: e.target.value }))}
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="btn" disabled={readingBusy}>
                {readingBusy ? (
                  <span className="flex items-center gap-2">
                    <Icons.Loader2 className="animate-spin" size={16} /> Menyimpan...
                  </span>
                ) : (
                  <>
                    <Icons.CheckCircle2 size={16} /> Simpan Progress
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            <HistoryList
              title="Bacaan Digital"
              icon={<Icons.BookMarked size={15} />}
              loading={loadingHistory}
              items={readHistory.digital}
              emptyText="Belum ada progress baca digital."
              renderItem={(item) => (
                <div>
                  <div className="font-medium">{item.book?.title ?? 'Buku #' + item.book_id}</div>
                  <div className="text-xs opacity-70">
                    Halaman {item.current_page} dari {item.total_pages} - diperbarui{' '}
                    {new Date(item.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            />
            <HistoryList
              title="Riwayat Peminjaman Fisik"
              icon={<Icons.Clock3 size={15} />}
              loading={loadingBorrows}
              items={readHistory.physical}
              emptyText="Belum ada riwayat peminjaman."
              renderItem={(item) => (
                <div>
                  <div className="font-medium">{item.book?.title ?? 'Buku #' + item.book_id}</div>
                  <div className="text-xs opacity-70">
                    Status {item.status} - Pinjam{' '}
                    {item.borrowed_at ? new Date(item.borrowed_at).toLocaleDateString() : '-'}
                    {item.due_at ? ` - Jatuh tempo ${new Date(item.due_at).toLocaleDateString()}` : ''}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function BorrowItem({ borrow, onReturn }) {
  const status = borrow.status ?? 'pending'
  const canReturn = status === 'approved' && !borrow.returned_at
  const dueText = borrow.due_at ? new Date(borrow.due_at).toLocaleDateString() : 'Menunggu persetujuan'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2 last:border-b-0">
      <div>
        <div className="font-medium">{borrow.book?.title ?? 'Buku #' + borrow.book_id}</div>
        <div className="text-xs opacity-70">
          Status <span className="uppercase">{status}</span> - Jatuh tempo {dueText}
        </div>
      </div>
      {canReturn && (
        <button type="button" className="btn !py-1.5" onClick={onReturn}>
          <Icons.BookOpen size={16} /> Kembalikan
        </button>
      )}
    </div>
  )
}

function HistoryList({ title, icon, items, renderItem, emptyText, loading }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 font-semibold">
        {icon} {title}
      </div>
      {loading ? (
        <div className="skeleton h-16 w-full" />
      ) : items.length === 0 ? (
        <p className="text-xs opacity-70">{emptyText}</p>
      ) : (
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id ?? `${item.book_id}-${item.updated_at}`}>{renderItem(item)}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-6">
      <div className="p-3 rounded-full bg-white/10">{icon}</div>
      <div className="font-medium">{title}</div>
      <div className="text-xs opacity-70 max-w-sm">{description}</div>
    </div>
  )
}
