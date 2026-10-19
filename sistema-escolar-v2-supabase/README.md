# Sistema Escolar V2 — Supabase + Netlify

Esta entrega é uma versão Next.js para publicar no Netlify. Ela tem login por e-mail, banco Supabase, sessão SSR, interface responsiva e criação de usuários somente por administrador.

## Segurança

- A chave `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pode ficar no navegador.
- A `SUPABASE_SECRET_KEY` **nunca** pode aparecer em `NEXT_PUBLIC_*`, GitHub ou código cliente.
- A senha inicial do administrador não foi gravada neste projeto. Defina-a somente no terminal/variáveis de ambiente.
- Um visitante não escolhe o próprio privilégio. Apenas o administrador cria um Gmail/e-mail e seleciona `aluno`, `professor` ou `admin`.

## 1. Criar o banco no Supabase

1. Abra o projeto Supabase e vá para **SQL Editor**.
2. Crie uma consulta, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Authentication > URL Configuration**, defina a URL do site do Netlify quando ela existir, por exemplo `https://seu-site.netlify.app`.
4. Em **Authentication > Providers > Email**, mantenha e-mail/senha habilitado. Para produção, configure um SMTP próprio.

## 2. Criar o administrador inicial

No seu computador, dentro desta pasta, copie `.env.example` para `.env.local`, preencha `SUPABASE_SECRET_KEY` e escolha uma senha forte no campo `ADMIN_INITIAL_PASSWORD`. Então execute:

```cmd
npm install
npm run create-admin
```

Use o e-mail do administrador configurado em `ADMIN_INITIAL_EMAIL` para entrar em `/login`.

## 3. Testar localmente

```cmd
npm run dev
```

Abra `http://localhost:3000`.

## 4. Publicar no Netlify

1. Envie esta pasta para um repositório GitHub privado.
2. No Netlify, clique em **Add new project > Import an existing project** e conecte o repositório.
3. Confirme o comando de build `npm run build` e a versão Node 20 (o `netlify.toml` já define isso).
4. Em **Site configuration > Environment variables**, crie estas variáveis para Production e Deploy Previews:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Clique em **Deploy site**.
6. Copie a URL do Netlify e adicione-a em **Supabase > Authentication > URL Configuration** como **Site URL** e em **Redirect URLs**.
7. Faça um novo deploy após alterar variáveis.

## Criar novos usuários

Entre com o administrador e abra **Gerenciar usuários e privilégios** no painel. Informe nome, Gmail/e-mail, senha inicial e o privilégio. A rota é protegida no servidor e usa a chave secreta apenas no Netlify.

## Observação sobre o banco antigo

O sistema Flask/SQLite anterior não é convertido automaticamente por este projeto. Para importar alunos, turmas e notas existentes, exporte-os para CSV, crie as tabelas escolares no Supabase e faça a carga antes de ativar o uso em produção.
