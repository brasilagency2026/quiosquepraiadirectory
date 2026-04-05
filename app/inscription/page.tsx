'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Camera, MessageCircle, UtensilsCrossed, Crown,
  Check, X as XIcon, Eye, EyeOff, ExternalLink,
} from 'lucide-react'

export default function InscriptionPage() {
  const [step, setStep] = useState<'plans' | 'signup'>('plans')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou senha inválidos.')
        setLoading(false)
        return
      }
      router.push('/owner/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Verifique seu email para confirmar o cadastro.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="quiosquepraia.com" width={40} height={22} className="rounded" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">quiosquepraia.com</span>
          </Link>
          <Link href="/" className="text-sm text-cyan-600 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
            Cadastre seu quiosque no maior portal de praias do Brasil
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Escolha o plano ideal para dar visibilidade ao seu quiosque e atrair mais clientes.
          </p>
        </div>

        {step === 'plans' ? (
          <>
            {/* Plans Grid */}
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Free Plan */}
              <div className="relative flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4" />
                    Gratuito
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ 0</span>
                    <span className="text-slate-500"> /mês</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Marque presença no mapa e seja encontrado pelos turistas.
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Nome do quiosque</strong> visível no portal
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Posição exata</strong> no mapa (endereço ou geolocalização)
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Nome da praia e cidade
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <XIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Sem fotos</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <XIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Sem contato WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <XIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Sem solução integrada (menu digital + pagamento)</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <XIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Sem destaque no listing</span>
                  </li>
                </ul>

                <button
                  onClick={() => setStep('signup')}
                  className="w-full rounded-xl border-2 border-cyan-600 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  Cadastrar gratuitamente
                </button>
              </div>

              {/* Premium Plan */}
              <div className="relative flex flex-col rounded-2xl border-2 border-amber-400 bg-white p-8 shadow-lg dark:border-amber-500 dark:bg-slate-800">
                <div className="absolute -top-3.5 right-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                    <Crown className="h-3.5 w-3.5" />
                    RECOMENDADO
                  </span>
                </div>

                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="h-4 w-4" />
                    Premium
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">Premium</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Destaque total com fotos, contato direto e solução integrada.
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Tudo do plano gratuito
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <Camera className="mr-1 inline h-4 w-4 text-amber-500" />
                      Até <strong>5 fotos</strong> do quiosque
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <MessageCircle className="mr-1 inline h-4 w-4 text-green-500" />
                      <strong>Contato direto WhatsApp</strong> na página
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <UtensilsCrossed className="mr-1 inline h-4 w-4 text-orange-500" />
                      <strong>Solução integrada</strong> : menu digital via QR code no guarda-sol + pagamento via{' '}
                      <a
                        href="https://pay.quiosquepraia.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-cyan-600 underline hover:text-cyan-700"
                      >
                        pay.quiosquepraia.com
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Ficha completa: descrição, horários, serviços
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      <Crown className="mr-1 inline h-4 w-4 text-amber-500" />
                      <strong>Badge Premium</strong> e destaque no listing
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Avaliações Google Maps importadas
                    </span>
                  </li>
                </ul>

                <a
                  href="https://pay.quiosquepraia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-semibold text-white shadow-md transition hover:from-amber-500 hover:to-orange-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Assinar Premium em pay.quiosquepraia.com
                </a>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Após assinar, cadastre seu quiosque gratuitamente e o premium será ativado automaticamente.
                </p>
              </div>
            </div>

            {/* Comparison note */}
            <div className="mx-auto mt-12 max-w-2xl text-center">
              <p className="text-sm text-slate-500">
                Já tem conta?{' '}
                <button
                  onClick={() => {
                    setIsLogin(true)
                    setStep('signup')
                  }}
                  className="font-medium text-cyan-600 hover:underline"
                >
                  Faça login aqui
                </button>
              </p>
            </div>
          </>
        ) : (
          /* Signup/Login Form */
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isLogin ? 'Entrar na sua conta' : 'Criar sua conta'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isLogin
                    ? 'Entre para gerenciar seu quiosque'
                    : 'Cadastre-se para adicionar seu quiosque ao portal'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
                >
                  {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar conta'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setMessage('')
                  }}
                  className="text-sm text-cyan-600 hover:underline"
                >
                  {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
                </button>
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={() => setStep('plans')}
                  className="text-sm text-slate-400 hover:underline"
                >
                  ← Voltar aos planos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
