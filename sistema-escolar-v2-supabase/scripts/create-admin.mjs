import { createClient } from '@supabase/supabase-js'

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SECRET_KEY: secret, ADMIN_INITIAL_EMAIL: email, ADMIN_INITIAL_PASSWORD: password } = process.env
if (!url || !secret || !email || !password) throw new Error('Defina URL, SUPABASE_SECRET_KEY, ADMIN_INITIAL_EMAIL e ADMIN_INITIAL_PASSWORD no ambiente.')
const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'Administrador' }, app_metadata: { role: 'admin' } })
if (error) throw error
const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: 'Administrador', role: 'admin' })
if (profileError) throw profileError
console.log(`Administrador criado: ${email}`)
