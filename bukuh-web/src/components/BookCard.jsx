import React from 'react'
import { Icons } from './Icon'

export default function BookCard({ book, onBorrow, onRead, disabled }) {
  const isDigital = Boolean(book?.is_digital)
  const hasFile = Boolean(book?.file_url)
  const canBorrow = typeof onBorrow === 'function'
  const handleBorrow = () => {
    if (canBorrow) onBorrow(book)
  }
  const handleRead = () => {
    if (typeof onRead === 'function') {
      onRead(book)
      return
    }
    if (hasFile && typeof window !== 'undefined') {
      window.open(book.file_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="card h-full flex flex-col gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{book.title}</h3>
          <span className="badge">{book.year ?? '—'}</span>
        </div>
        <p className="text-sm opacity-80">{book.author || 'Penulis tidak diketahui'}</p>
        {book.publisher && <p className="text-xs opacity-70">{book.publisher}</p>}
        <div className="flex flex-wrap gap-2 text-xs">
          {isDigital ? (
            <span className="badge bg-brand-100/70 dark:bg-brand-500/20 text-brand-700 dark:text-brand-200">
              <Icons.BookMarked size={12} /> Digital
            </span>
          ) : (
            <span className="badge">
              <Icons.BookOpen size={12} /> Fisik
            </span>
          )}
          <span className="badge">
            <Icons.Users size={12} /> Stok: <strong>{book.stock}</strong>
          </span>
        </div>
      </div>
      {canBorrow && !isDigital && (
        <button
          type="button"
          className="btn !py-1.5 justify-center"
          onClick={handleBorrow}
          disabled={disabled || book.stock < 1}
        >
          <Icons.BookOpen size={16} /> Ajukan Pinjam
        </button>
      )}
      {isDigital && (
        <>
          <button
            type="button"
            className="btn !py-1.5 justify-center"
            onClick={handleRead}
            disabled={disabled || (!hasFile && typeof onRead !== 'function')}
          >
            <Icons.BookMarked size={16} /> Baca Digital
          </button>
          {!hasFile && (
            <div className="text-xs opacity-70">
              File digital belum tersedia. Hubungi petugas perpustakaan.
            </div>
          )}
        </>
      )}
    </div>
  )
}
