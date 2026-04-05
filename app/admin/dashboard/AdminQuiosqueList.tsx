'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, Store, Edit } from 'lucide-react'

interface QuiosqueItem {
  id: string
  name: string
  city: string
  state: string
  plan: string
  owner_email?: string
}

export default function AdminQuiosqueList({ quiosques: initial }: { quiosques: QuiosqueItem[] }) {
  const [quiosques, setQuiosques] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const togglePremium = async (quiosqueId: string, currentPlan: string) => {
    setLoading(quiosqueId)
    try {
      const res = await fetch('/api/admin/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiosqueId, premium: currentPlan !== 'premium' }),
      })
      if (res.ok) {
        setQuiosques(prev =>
          prev.map(q =>
            q.id === quiosqueId
              ? { ...q, plan: currentPlan === 'premium' ? 'free' : 'premium' }
              : q
          )
        )
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null)
    }
  }

  if (quiosques.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <Store className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-slate-500">Nenhum quiosque cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-white">Gerenciar Premium</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {quiosques.map(q => (
          <div key={q.id} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-slate-900 dark:text-white">{q.name}</p>
                {q.plan === 'premium' && (
                  <Crown className="h-4 w-4 flex-shrink-0 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-slate-500">
                {q.city}, {q.state}
                {q.owner_email && ` • ${q.owner_email}`}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Link
                href={`/admin/edit-quiosque/${q.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                onClick={() => togglePremium(q.id, q.plan)}
                disabled={loading === q.id}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                  q.plan === 'premium'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
              {loading === q.id
                ? '...'
                : q.plan === 'premium'
                  ? 'Remover Premium'
                  : 'Ativar Premium'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
