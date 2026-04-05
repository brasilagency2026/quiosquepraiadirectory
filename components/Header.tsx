'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="quiosquepraia.com" width={40} height={22} className="rounded" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            quiosquepraia.com
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              pathname === '/' ? 'text-cyan-600' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Início
          </Link>
          <Link
            href="/suporte-contato"
            className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              pathname === '/suporte-contato' ? 'text-cyan-600' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Contato
          </Link>
          <Link
            href="/login/proprietario"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            Área do Proprietário
          </Link>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-slate-700 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-slate-700 dark:text-white" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setMenuOpen(false)}>
              Início
            </Link>
            <Link href="/suporte-contato" className="text-sm font-medium text-slate-700 dark:text-slate-300" onClick={() => setMenuOpen(false)}>
              Contato
            </Link>
            <Link href="/login/proprietario" className="text-sm font-medium text-cyan-600" onClick={() => setMenuOpen(false)}>
              Área do Proprietário
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
