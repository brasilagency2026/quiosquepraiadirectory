import { Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function SuporteContatoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Suporte & Contato</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Precisa de ajuda? Entre em contato conosco.
        </p>

        <div className="mt-10 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                <Mail className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Email</h2>
                <p className="text-sm text-slate-500">contato@portalquiosques.com.br</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">WhatsApp</h2>
                <p className="text-sm text-slate-500">Disponível em breve</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Localização</h2>
                <p className="text-sm text-slate-500">Brasil</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-cyan-50 p-6 dark:bg-cyan-900/20">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Quer cadastrar seu quiosque?
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            É rápido e gratuito! Cadastre seu quiosque de praia e ganhe visibilidade online.
          </p>
          <Link
            href="/login/proprietario"
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            Cadastrar meu quiosque
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm text-cyan-600 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
