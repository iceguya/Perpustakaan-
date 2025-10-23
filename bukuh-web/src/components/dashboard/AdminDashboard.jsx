import React, { useEffect, useState } from 'react'
import { Icons } from '../Icon'
import {
  approveBorrow,
  createBook,
  createMember,
  deleteBook,
  deleteMember,
  fetchAdminBorrows,
  fetchAdminSummary,
  listAdminBooks,
  listMembers,
  rejectBorrow,
  updateBook,
  updateMember,
} from '../../api'

const emptyBook = {
  id: null,
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  year: '',
  stock: 1,
  is_digital: false,
  file_url: '',
}

const emptyMember = {
  id: null,
  member_code: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
}

export default function AdminDashboard({ user, refreshToken, onNeedRefresh }) {
  const isAdmin = user?.role === 'admin'
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [pending, setPending] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)

  const [books, setBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [bookForm, setBookForm] = useState(emptyBook)
  const [bookBusy, setBookBusy] = useState(false)

  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberForm, setMemberForm] = useState(emptyMember)
  const [memberBusy, setMemberBusy] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    loadSummary()
    loadPending()
    loadBooks()
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, refreshToken])

  async function loadSummary() {
    setLoadingSummary(true)
    try {
      const data = await fetchAdminSummary()
      setSummary(data)
    } catch (error) {
      console.error('Gagal memuat ringkasan', error)
    } finally {
      setLoadingSummary(false)
    }
  }

  async function loadPending() {
    setLoadingPending(true)
    try {
      const { items } = await fetchAdminBorrows({ status: 'pending' })
      setPending(items)
    } catch (error) {
      console.error('Gagal memuat permintaan pending', error)
      setPending([])
    } finally {
      setLoadingPending(false)
    }
  }

  async function loadBooks() {
    setLoadingBooks(true)
    try {
      const { items } = await listAdminBooks()
      setBooks(items)
    } catch (error) {
      console.error('Gagal memuat buku', error)
      setBooks([])
    } finally {
      setLoadingBooks(false)
    }
  }

  async function loadMembers() {
    setLoadingMembers(true)
    try {
      const { items } = await listMembers()
      setMembers(items)
    } catch (error) {
      console.error('Gagal memuat anggota', error)
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  async function handleApprove(row, due_at) {
    try {
      await approveBorrow(row.id, due_at ? { due_at } : {})
      alert('Permintaan disetujui.')
      await loadPending()
      await loadSummary()
      onNeedRefresh?.()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal menyetujui permintaan.'
      alert(message)
    }
  }

  async function handleReject(row) {
    try {
      await rejectBorrow(row.id)
      alert('Permintaan ditolak.')
      await loadPending()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal menolak permintaan.'
      alert(message)
    }
  }

  function resetBookForm() {
    setBookForm(emptyBook)
  }

  async function submitBook(e) {
    e.preventDefault()
    setBookBusy(true)
    try {
      const payload = {
        isbn: bookForm.isbn,
        title: bookForm.title,
        author: bookForm.author || null,
        publisher: bookForm.publisher || null,
        year: bookForm.year ? Number(bookForm.year) : null,
        stock: Number(bookForm.stock || 0),
        is_digital: Boolean(bookForm.is_digital),
        file_url: bookForm.file_url || null,
      }
      if (bookForm.id) {
        await updateBook(bookForm.id, payload)
        alert('Buku diperbarui.')
      } else {
        await createBook(payload)
        alert('Buku baru ditambahkan.')
      }
      resetBookForm()
      await loadBooks()
      onNeedRefresh?.()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal menyimpan data buku.'
      alert(message)
    } finally {
      setBookBusy(false)
    }
  }

  async function removeBook(id) {
    if (!window.confirm('Hapus buku ini?')) return
    try {
      await deleteBook(id)
      alert('Buku dihapus.')
      await loadBooks()
      onNeedRefresh?.()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Tidak dapat menghapus buku.'
      alert(message)
    }
  }

  function resetMemberForm() {
    setMemberForm(emptyMember)
  }

  async function submitMember(e) {
    e.preventDefault()
    setMemberBusy(true)
    try {
      const payload = {
        member_code: memberForm.member_code,
        name: memberForm.name,
        email: memberForm.email || null,
        phone: memberForm.phone || null,
        address: memberForm.address || null,
      }
      if (memberForm.password) payload.password = memberForm.password

      if (memberForm.id) {
        await updateMember(memberForm.id, payload)
        alert('Data anggota diperbarui.')
      } else {
        const result = await createMember(payload)
        const info = result?.default_password
        alert(`Anggota baru dibuat.${info ? ` Password default: ${info}` : ''}`)
      }
      resetMemberForm()
      await loadMembers()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Gagal menyimpan data anggota.'
      alert(message)
    } finally {
      setMemberBusy(false)
    }
  }

  async function removeMember(id) {
    if (!window.confirm('Hapus anggota ini?')) return
    try {
      await deleteMember(id)
      alert('Anggota dihapus.')
      await loadMembers()
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Tidak dapat menghapus anggota.'
      alert(message)
    }
  }

  return (
    <div className="space-y-10" id="admin-dashboard">
      <section id="dashboard" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.BarChart3 size={18} />
          <h2 className="text-xl font-semibold">Ringkasan Aktivitas</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Buku"
            value={summary?.total_books ?? '-'}
            icon={<Icons.BookOpen size={20} />}
            loading={loadingSummary}
          />
          <StatCard
            label="Total Anggota"
            value={summary?.total_members ?? '-'}
            icon={<Icons.Users size={20} />}
            loading={loadingSummary}
          />
          <StatCard
            label="Permintaan Pending"
            value={summary?.pending_requests ?? '-'}
            icon={<Icons.AlertTriangle size={20} />}
            loading={loadingSummary}
          />
          <StatCard
            label="Sedang Dipinjam"
            value={summary?.active_borrows ?? '-'}
            icon={<Icons.ShieldCheck size={20} />}
            loading={loadingSummary}
          />
        </div>
      </section>

      <section id="pending-borrows" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.FilePlus2 size={18} />
          <h2 className="text-xl font-semibold">Persetujuan Peminjaman</h2>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 text-xs opacity-70 hover:opacity-100"
            onClick={loadPending}
            disabled={loadingPending}
          >
            <Icons.RefreshCcw size={14} />
            {loadingPending ? 'Memuat...' : 'Segarkan'}
          </button>
        </header>
        <div className="card space-y-3">
          {loadingPending ? (
            <div className="skeleton h-20 w-full" />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<Icons.ShieldCheck size={22} />}
              title="Tidak ada permintaan pending"
              description="Permintaan baru akan tampil di sini untuk ditindaklanjuti."
            />
          ) : (
            pending.map((row) => <PendingItem key={row.id} row={row} onApprove={handleApprove} onReject={handleReject} />)
          )}
        </div>
      </section>

      <section id="books-management" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.PenLine size={18} />
          <h2 className="text-xl font-semibold">Kelola Buku</h2>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 text-xs opacity-70 hover:opacity-100"
            onClick={loadBooks}
            disabled={loadingBooks}
          >
            <Icons.RefreshCcw size={14} />
            {loadingBooks ? 'Memuat...' : 'Segarkan'}
          </button>
        </header>
        <div className="card space-y-4">
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submitBook}>
            <FormInput label="ISBN" value={bookForm.isbn} onChange={(v) => setBookForm((prev) => ({ ...prev, isbn: v }))} required />
            <FormInput label="Judul" className="md:col-span-2" value={bookForm.title} onChange={(v) => setBookForm((prev) => ({ ...prev, title: v }))} required />
            <FormInput label="Penulis" value={bookForm.author} onChange={(v) => setBookForm((prev) => ({ ...prev, author: v }))} />
            <FormInput label="Penerbit" value={bookForm.publisher} onChange={(v) => setBookForm((prev) => ({ ...prev, publisher: v }))} />
            <FormInput label="Tahun" type="number" value={bookForm.year} onChange={(v) => setBookForm((prev) => ({ ...prev, year: v }))} />
            <FormInput label="Stok" type="number" value={bookForm.stock} onChange={(v) => setBookForm((prev) => ({ ...prev, stock: v }))} required />
            <FormInput label="URL File (jika digital)" value={bookForm.file_url} onChange={(v) => setBookForm((prev) => ({ ...prev, file_url: v }))} className="md:col-span-2" />
            <label className="flex items-center gap-2 text-xs uppercase opacity-70">
              <input type="checkbox" checked={bookForm.is_digital} onChange={(e) => setBookForm((prev) => ({ ...prev, is_digital: e.target.checked }))} />
              Buku Digital
            </label>
            <div className="md:col-span-4 flex gap-2">
              <button type="submit" className="btn" disabled={bookBusy}>
                {bookBusy ? (
                  <span className="flex items-center gap-2">
                    <Icons.Loader2 className="animate-spin" size={16} /> Menyimpan...
                  </span>
                ) : (
                  <>
                    <Icons.CheckCircle2 size={16} /> {bookForm.id ? 'Perbarui' : 'Tambahkan'}
                  </>
                )}
              </button>
              {bookForm.id && (
                <button type="button" className="btn bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={resetBookForm}>
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
            {loadingBooks ? (
              <div className="skeleton h-20 w-full" />
            ) : books.length === 0 ? (
              <EmptyState
                icon={<Icons.BookOpen size={22} />}
                title="Belum ada data buku"
                description="Gunakan formulir di atas untuk menambahkan buku baru."
              />
            ) : (
              books.map((book) => (
                <AdminItem
                  key={book.id}
                  title={book.title}
                  subtitle={`ISBN ${book.isbn} - Stok ${book.stock} - ${book.is_digital ? 'Digital' : 'Fisik'}`}
                  onEdit={() =>
                    setBookForm({
                      id: book.id,
                      isbn: book.isbn ?? '',
                      title: book.title ?? '',
                      author: book.author ?? '',
                      publisher: book.publisher ?? '',
                      year: book.year ?? '',
                      stock: book.stock ?? 0,
                      is_digital: Boolean(book.is_digital),
                      file_url: book.file_url ?? '',
                    })
                  }
                  onDelete={() => removeBook(book.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section id="members-management" className="space-y-4">
        <header className="flex items-center gap-2">
          <Icons.Users size={18} />
          <h2 className="text-xl font-semibold">Kelola Anggota</h2>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 text-xs opacity-70 hover:opacity-100"
            onClick={loadMembers}
            disabled={loadingMembers}
          >
            <Icons.RefreshCcw size={14} />
            {loadingMembers ? 'Memuat...' : 'Segarkan'}
          </button>
        </header>
        <div className="card space-y-4">
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submitMember}>
            <FormInput label="Kode Anggota" value={memberForm.member_code} onChange={(v) => setMemberForm((prev) => ({ ...prev, member_code: v }))} required />
            <FormInput label="Nama Lengkap" className="md:col-span-2" value={memberForm.name} onChange={(v) => setMemberForm((prev) => ({ ...prev, name: v }))} required />
            <FormInput label="Email" value={memberForm.email} onChange={(v) => setMemberForm((prev) => ({ ...prev, email: v }))} type="email" />
            <FormInput label="No. HP" value={memberForm.phone} onChange={(v) => setMemberForm((prev) => ({ ...prev, phone: v }))} />
            <FormInput label="Alamat" className="md:col-span-2" value={memberForm.address} onChange={(v) => setMemberForm((prev) => ({ ...prev, address: v }))} />
            <FormInput label={`Password ${memberForm.id ? '(opsional)' : ''}`} type="password" value={memberForm.password} onChange={(v) => setMemberForm((prev) => ({ ...prev, password: v }))} />
            <div className="md:col-span-4 flex gap-2">
              <button type="submit" className="btn" disabled={memberBusy}>
                {memberBusy ? (
                  <span className="flex items-center gap-2">
                    <Icons.Loader2 className="animate-spin" size={16} /> Menyimpan...
                  </span>
                ) : (
                  <>
                    <Icons.CheckCircle2 size={16} /> {memberForm.id ? 'Perbarui' : 'Tambahkan'}
                  </>
                )}
              </button>
              {memberForm.id && (
                <button type="button" className="btn bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={resetMemberForm}>
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
            {loadingMembers ? (
              <div className="skeleton h-20 w-full" />
            ) : members.length === 0 ? (
              <EmptyState
                icon={<Icons.Users size={22} />}
                title="Belum ada anggota"
                description="Tambahkan anggota melalui formulir di atas."
              />
            ) : (
              members.map((member) => (
                <AdminItem
                  key={member.id}
                  title={`${member.name} (${member.member_code})`}
                  subtitle={member.email ? `${member.email} - Username ${member.user?.username ?? '-'}` : 'Tanpa email'}
                  onEdit={() =>
                    setMemberForm({
                      id: member.id,
                      member_code: member.member_code ?? '',
                      name: member.name ?? '',
                      email: member.email ?? '',
                      phone: member.phone ?? '',
                      address: member.address ?? '',
                      password: '',
                    })
                  }
                  onDelete={() => removeMember(member.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function PendingItem({ row, onApprove, onReject }) {
  const [dueDate, setDueDate] = useState('')
  return (
    <div className="border border-white/10 rounded-xl2 p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{row.book?.title ?? 'Buku #' + row.book_id}</div>
          <div className="text-xs opacity-70">
            {row.member?.name ?? 'Member #' + row.member_id} - diminta {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
          </div>
        </div>
        <span className="badge bg-amber-500/20 text-amber-300 uppercase">pending</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input type="date" className="input sm:w-48" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div className="flex gap-2">
          <button type="button" className="btn !py-1.5" onClick={() => onApprove(row, dueDate || undefined)}>
            <Icons.CheckCircle2 size={16} /> Setujui
          </button>
          <button type="button" className="btn !py-1.5 bg-red-600 hover:bg-red-700" onClick={() => onReject(row)}>
            Tolak
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, loading }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-white/30 dark:bg-white/10">{icon}</div>
      <div>
        <div className="text-xs uppercase opacity-60">{label}</div>
        <div className="text-xl font-semibold">
          {loading ? <Icons.Loader2 className="animate-spin" size={18} /> : value}
        </div>
      </div>
    </div>
  )
}

function AdminItem({ title, subtitle, onEdit, onDelete }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2 last:border-b-0">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs opacity-70">{subtitle}</div>
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn !py-1.5 bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={onEdit}>
          <Icons.Edit3 size={14} /> Ubah
        </button>
        <button type="button" className="btn !py-1.5 bg-red-600 hover:bg-red-700" onClick={onDelete}>
          <Icons.Trash2 size={14} /> Hapus
        </button>
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', required = false, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase opacity-70">{label}</label>
      <input
        className="input mt-1"
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
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
