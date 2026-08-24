import { supabase } from './supabase'

/**
 * First-time email OTP otherwise sends the Confirm signup template (a link,
 * no 6-digit code). Confirm the user first so GoTrue uses the Magic Link
 * template, which includes the code the login form asks for.
 */
export async function prepareEmailLogin(email: string) {
  if (!supabase) return
  try {
    await supabase.functions.invoke('prepare-email-login', {
      body: { email },
    })
  } catch {
    // OTP still works; new users may get a confirmation link instead of a code.
  }
}
