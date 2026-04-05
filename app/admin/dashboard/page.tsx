import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, Users, Store } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/')
  }

  const { count: quiosquesCount } = await supabase
    .from('quiosques')
    .select('*', { count: 'exact', head: true })

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Shield className="h-6 w-6 text-cyan-500" />
          <span className="font-semibold text-slate-900 dark:text-white">Administração</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{quiosquesCount || 0}</p>
                <p className="text-sm text-slate-500">Quiosques cadastrados</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{usersCount || 0}</p>
                <p className="text-sm text-slate-500">Usuários registrados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm text-cyan-600 hover:underline">
            ← Voltar ao portal
          </Link>
        </div>
      </div>
    </div>
  )
}
