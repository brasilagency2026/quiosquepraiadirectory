'use client'

import { Crown } from 'lucide-react'

export default function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm ${className}`}
    >
      <Crown className="h-3 w-3" />
      Premium
    </span>
  )
}
