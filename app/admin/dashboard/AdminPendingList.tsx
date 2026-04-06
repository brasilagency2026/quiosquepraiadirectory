'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface PendingRegistration {
  id: string
  email: string
  whatsapp: string
  quiosque_name?: string
  beach_name?: string
  city?: string
  state?: string
  created_at: string
}

export default function AdminPendingList({ registrations: initial }: { registrations: PendingRegistration[] }) {
  const [registrations, setRegistrations] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/${action}-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id))
      }
    } catch {
      // silently fail
    } finally {
      setLoadingId(null)
    }
  }

  const formatWhatsAppLink = (whatsapp: string) => {
    const digits = whatsapp.replace(/\D/g, '')
    return `https://wa.me/${digits}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <CheckCircle className="mx-auto mb-3 h-8 w-8 text-green-400" />
        <p className="text-slate-500">Nenhuma inscrição pendente.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Inscrições pendentes ({registrations.length})
          </h2>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {registrations.map(r => (
          <div key={r.id} className="px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{r.email}</p>
                {r.quiosque_name && (
                  <p className="mt-0.5 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                    🏖️ {r.quiosque_name}{r.beach_name ? ` — ${r.beach_name}` : ''}
                    {r.city && r.state ? ` (${r.city}, ${r.state})` : ''}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                    {r.whatsapp}
                  </span>
                  <span>•</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <a
                  href={formatWhatsAppLink(r.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <button
                  onClick={() => handleAction(r.id, 'approve')}
                  disabled={loadingId === r.id}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
                >
                  {loadingId === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction(r.id, 'reject')}
                  disabled={loadingId === r.id}
                  className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
