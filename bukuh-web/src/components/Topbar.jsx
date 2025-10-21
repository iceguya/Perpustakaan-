import React from 'react'
import { Icons } from './Icon'


export default function Topbar({ user, onLogout }) {
    return (
    <header className="sticky top-0 z-30 border-b border-white/60 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-[#0b1220]/60">
     <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl2 bg-brand-600 text-white"><Icons.Library size={18} /></div>
        <span className="font-semibold tracking-wide">Bukuh Library</span>
        </div>
    <div className="flex items-center gap-4">
    {user ? (
<>
    <span className="badge"><Icons.User2 size={14} /> {user.name} <span className="opacity-60">({user.role})</span></span>
    <button className="btn !py-1.5" onClick={onLogout}><Icons.LogOut size={16} /> Logout</button>
</>
) : (
    <span className="badge"><Icons.LogIn size={14} /> belum login</span>
)}
        </div>
    </div>
</header>
)
}