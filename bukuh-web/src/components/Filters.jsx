import React from 'react'
import { Icons } from './Icon'


export default function Filters({ q, setQ, year, setYear, sort, setSort, onApply }) {
return (
<div className="card flex flex-col md:flex-row gap-3 items-center">
<div className="relative w-full md:w-1/2">
<Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"/>
<input className="input pl-9" placeholder="Cari judul atau penulis" value={q}
onChange={(e)=>setQ(e.target.value)} />
</div>
<input className="input w-full md:w-28" type="number" placeholder="Tahun" value={year}
onChange={(e)=>setYear(e.target.value)} />
<select className="input w-full md:w-44" value={sort} onChange={(e)=>setSort(e.target.value)}>
<option value="title">Sortir: Judul</option>
<option value="year">Sortir: Tahun</option>
<option value="author">Sortir: Penulis</option>
</select>
<button className="btn" onClick={onApply}>Terapkan</button>
</div>
)
}