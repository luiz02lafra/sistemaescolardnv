import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('full_name,role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  return <main><p>Sistema Escolar V2</p><h1>Olá, {profile?.full_name || user.email}</h1><p>Perfil: <b>{profile?.role || 'aluno'}</b></p>
    <section className="grid"><article className="metric"><small>Ambiente</small><b>Escolar</b></article><article className="metric"><small>Acesso</small><b>Protegido</b></article><article className="metric"><small>Versão</small><b>Mobile</b></article></section>
    <section className="card"><h2>Seu painel</h2><p>Use este espaço para acompanhar turmas, atividades, notas e frequência conforme o seu perfil.</p>{isAdmin && <Link className="link" href="/admin/users">Gerenciar usuários e privilégios →</Link>}</section>
    <form action="/api/auth/signout" method="post"><button>Sair</button></form>
  </main>
}
