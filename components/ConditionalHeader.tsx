'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

const HIDDEN_PATHS = ['/owner', '/admin', '/login']

export default function ConditionalHeader() {
  const pathname = usePathname()
  const hidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p))

  if (hidden) return null
  return <Header />
}
