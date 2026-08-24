import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin != null && isAllowedOrigin(origin)
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://trevoraquino.me",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "trev4ev.github.io" ||
      hostname.endsWith(".github.io") ||
      hostname === "trevoraquino.me" ||
      hostname.endsWith(".trevoraquino.me")
    )
  } catch {
    return false
  }
}

function json(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  })
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return null
  }
  return email
}

function alreadyRegistered(message: string) {
  return /already been registered|already exists|email_exists|user already/i.test(
    message,
  )
}

type AdminUser = {
  id: string
  email?: string
  email_confirmed_at?: string | null
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service credentials")
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function findUserByEmail(
  admin: ReturnType<typeof adminClient>,
  email: string,
): Promise<AdminUser | null> {
  const byEmail = admin.auth.admin as typeof admin.auth.admin & {
    getUserByEmail?: (email: string) => Promise<{
      data: { user: AdminUser | null }
      error: { message: string } | null
    }>
  }
  if (typeof byEmail.getUserByEmail === "function") {
    const { data, error } = await byEmail.getUserByEmail(email)
    if (!error && data?.user) return data.user
  }

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) throw error
    const users = data.users as AdminUser[]
    const found = users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (users.length < 200) return null
  }
  return null
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin")
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) })
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin)
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin)
  }

  const email = normalizeEmail(
    payload && typeof payload === "object" && "email" in payload
      ? (payload as { email: unknown }).email
      : null,
  )
  if (!email) {
    return json({ error: "Enter a valid email." }, 400, origin)
  }

  try {
    const admin = adminClient()
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    })
    if (created.error && !alreadyRegistered(created.error.message)) {
      throw created.error
    }

    if (created.error) {
      const existing = await findUserByEmail(admin, email)
      if (existing && !existing.email_confirmed_at) {
        const updated = await admin.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
        })
        if (updated.error) throw updated.error
      }
    }

    return json({ ok: true }, 200, origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not prepare login"
    console.error("prepare-email-login", message)
    return json({ error: "Could not prepare login" }, 500, origin)
  }
})
