import React from 'react'
import { Icons } from './Icon'

export default function Filters({ q, setQ, year, setYear, sort, setSort, onApply, isDigitalOnly, setDigitalOnly }) {
  return (
    <div className="card flex flex-col md:flex-row gap-3 md:items-end">
      <div className="relative w-full md:flex-1">
        <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
        <input
          className="input pl-9"
          placeholder="Cari judul, penulis, atau ISBN"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <input
          className="input sm:w-28"
          type="number"
          placeholder="Tahun"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="1900"
        />
        <select className="input sm:w-40" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="title">Sortir: Judul</option>
          <option value="year">Sortir: Tahun</option>
          <option value="author">Sortir: Penulis</option>
        </select>
        {typeof setDigitalOnly === 'function' && (
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm">
            <input
              type="checkbox"
              className="accent-brand-600"
              checked={isDigitalOnly}
              onChange={(e) => setDigitalOnly(e.target.checked)}
            />
            Hanya digital
          </label>
        )}
        <button type="button" className="btn" onClick={onApply}>
          Terapkan
        </button>
      </div>
    </div>
  )
}
