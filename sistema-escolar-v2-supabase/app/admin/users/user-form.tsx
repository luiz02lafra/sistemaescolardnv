'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
export default function UserForm() {
  const router = useRouter(); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(''); const form = new FormData(event.currentTarget); const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) }); const result = await response.json(); setBusy(false); setMessage(result.error || 'Usuário criado com sucesso.'); if (response.ok) { event.currentTarget.reset(); router.refresh() } }
  return <form className="card" onSubmit={submit}><h2>Novo usuário</h2><label>Nome completo<input required name="fullName" maxLength={120} /></label><label>Gmail/e-mail<input required name="email" type="email" /></label><label>Senha inicial<input required name="password" type="password" minLength={8} /></label><label>Privilégio<select name="role" defaultValue="aluno"><option value="aluno">Aluno</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></label><button disabled={busy}>{busy ? 'Criando…' : 'Criar usuário'}</button>{message && <p>{message}</p>}</form>
}
