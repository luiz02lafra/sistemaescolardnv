import { NextResponse } from 'next/server'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const roles = new Set(['aluno', 'professor', 'admin'])
export async function POST(request: Request) {
  const session = await createSessionClient(); const { data: { user } } = await session.auth.getUser(); if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  const { data: profile } = await session.from('profiles').select('role').eq('id', user.id).single(); if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  const body = await request.json(); const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''; const password = typeof body.password === 'string' ? body.password : ''; const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''; const role = typeof body.role === 'string' ? body.role : ''
  if (!email || !fullName || password.length < 8 || !roles.has(role)) return NextResponse.json({ error: 'Preencha os dados; a senha deve ter ao menos 8 caracteres.' }, { status: 400 })
  const secret = process.env.SUPABASE_SECRET_KEY; if (!secret) return NextResponse.json({ error: 'SUPABASE_SECRET_KEY não configurada no Netlify.' }, { status: 500 })
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName }, app_metadata: { role } })
  if (error || !data.user) return NextResponse.json({ error: error?.message || 'Não foi possível criar o usuário.' }, { status: 400 })
  const { error: profileError } = await admin.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
