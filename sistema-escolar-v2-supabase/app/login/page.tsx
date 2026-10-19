'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(''); const form = new FormData(event.currentTarget); const { error } = await createClient().auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) }); if (error) { setError('E-mail ou senha inválidos.'); setLoading(false); return }; router.replace('/') ; router.refresh() }
  return <main><section className="card"><h1>Entrar no Sistema Escolar V2</h1><p>Use as credenciais criadas pelo administrador.</p><form onSubmit={login}><label>E-mail<input required name="email" type="email" autoComplete="email" /></label><label>Senha<input required name="password" type="password" autoComplete="current-password" /></label>{error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button></form></section></main>
}
