import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserForm from './user-form'

export const dynamic = 'force-dynamic'
export default async function UsersPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login')
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single(); if (me?.role !== 'admin') redirect('/')
  const { data: users } = await supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at', { ascending: false })
  return <main><h1>Usuários e privilégios</h1><p>Somente administradores podem criar acessos e escolher o perfil.</p><UserForm /><section className="card"><h2>Acessos cadastrados</h2>{users?.map((item) => <p key={item.id}><b>{item.full_name || item.email}</b> — {item.role}</p>)}</section></main>
}
