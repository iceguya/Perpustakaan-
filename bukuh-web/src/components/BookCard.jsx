import React from 'react'
import { Icons } from './Icon'


export default function BookCard({ book, onBorrow, disabled }) {
return (
<div className="card h-full flex flex-col">
<div className="flex-1">
<div className="flex items-start justify-between gap-3">
<h3 className="font-semibold leading-snug">{book.title}</h3>
<span className="badge">{book.year ?? '—'}</span>
</div>
<p className="mt-1 text-sm opacity-80">{book.author || 'Penulis tidak diketahui'}</p>
{book.publisher && <p className="mt-1 text-xs opacity-70">{book.publisher}</p>}
</div>
<div className="mt-4 flex items-center justify-between">
<div className="text-sm opacity-80">Stok: <b>{book.stock}</b></div>
<button className="btn !py-1.5" onClick={()=>onBorrow(book)} disabled={disabled || book.stock < 1}>
<Icons.BookOpen size={16}/> Pinjam
</button>
</div>
</div>
)
}