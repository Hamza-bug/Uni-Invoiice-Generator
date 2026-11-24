import { useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'

export default function Login({ onAuthenticated }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!/^\d{4}$/.test(pin)) {
      setError('Enter your 4-digit PIN to continue.')
      return
    }

    setIsSubmitting(true)
    try {
      if (!window.api?.login) {
        throw new Error('Secure login is available when running the desktop app.')
      }

      const result = await window.api.login(pin)
      if (result?.success && result.data?.authenticated) {
        onAuthenticated()
        return
      }

      if (result?.success === false) {
        throw new Error(result.error || 'Unable to verify the PIN. Please try again.')
      }

      setError('That PIN was not recognized. Please try again.')
      setPin('')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-screen relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#101b17] px-5 py-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(163,230,53,0.16),transparent_52%),linear-gradient(135deg,#101b17_0%,#182720_52%,#111a16_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <section className="login-card relative w-full max-w-[420px] animate-[login-arrive_500ms_ease-out_both] rounded-2xl border border-white/15 bg-white/[0.085] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-8">
        <div className="login-card-header mb-6 flex items-center justify-between">
          <div className="login-brand-icon grid size-12 place-items-center rounded-xl bg-lime-300 text-[#17211d] shadow-[0_8px_24px_rgba(190,242,100,0.18)]">
            <LockKeyhole size={21} strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-white/55">
            <ShieldCheck size={15} className="text-lime-300" aria-hidden="true" />
            Local &amp; private
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase text-lime-300">Welcome back</p>
        <h1 className="text-[28px] font-semibold leading-tight text-white">
          Unlock Invoice Manager
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Enter your access PIN to open your workspace.
        </p>

        <form className="login-form mt-6" onSubmit={handleSubmit}>
          <label htmlFor="login-pin" className="mb-2 block text-xs font-medium text-white/75">
            4-digit PIN
          </label>
          <input
            id="login-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
              if (error) setError('')
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'login-error' : undefined}
            placeholder="••••"
            className="login-pin h-12 w-full rounded-lg border border-white/15 bg-black/20 px-4 text-center text-lg tracking-[0.35em] text-white outline-none transition placeholder:text-white/25 focus:border-lime-300/70 focus:ring-4 focus:ring-lime-300/10"
          />

          {error && (
            <p id="login-error" role="alert" className="mt-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || pin.length !== 4}
            className="login-submit mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lime-300 px-4 text-sm font-semibold text-[#17211d] transition hover:bg-lime-200 focus:outline-none focus:ring-4 focus:ring-lime-300/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying…' : 'Login'}
            {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>

        <p className="login-footer mt-5 border-t border-white/10 pt-4 text-center text-xs text-white/40">
          Your business data stays on this device.
        </p>
      </section>

      <style>{`
        @keyframes login-arrive {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-height: 500px) {
          .login-screen { padding-block: 0.75rem; }
          .login-card { padding: 1rem; }
          .login-card-header { margin-bottom: 1rem; }
          .login-brand-icon { width: 2.5rem; height: 2.5rem; }
          .login-form { margin-top: 1rem; }
          .login-pin { height: 2.5rem; }
          .login-submit { height: 2.5rem; margin-top: 0.75rem; }
          .login-footer { margin-top: 1rem; padding-top: 0.75rem; }
        }
      `}</style>
    </main>
  )
}