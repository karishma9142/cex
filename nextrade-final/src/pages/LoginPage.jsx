import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── Ticker data for the right panel ─────────────────────────
const TICKERS = [
  { sym: 'BTC/INR', price: '₹58,42,100', chg: '+2.41%', up: true  },
  { sym: 'ETH/INR', price: '₹3,12,500',  chg: '+1.82%', up: true  },
  { sym: 'SOL/INR', price: '₹14,280',    chg: '-0.63%', up: false },
]

const STATS = [
  { n: '<1ms',  l: 'Order execution' },
  { n: '99.9%', l: 'Uptime'          },
  { n: '3+',    l: 'Trading pairs'   },
]

// ─── Eye icons ────────────────────────────────────────────────
function EyeOpen() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
        a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
        a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
function EyeClosed() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ─── Reusable input field ─────────────────────────────────────
function Field({ label, id, type = 'text', placeholder, value, onChange, error, right }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id}
          className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
          {label}
        </label>
        {right}
      </div>
      <div className={`rounded-lg transition-shadow duration-200
        ${focused ? 'glow-blue-sm' : ''}`}>
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
            placeholder:text-ink3 outline-none font-body transition-colors duration-150
            ${error
              ? 'border-red/40 focus:border-red/60'
              : 'border-border focus:border-blue/40'}`}
        />
      </div>
      {error && <p className="text-[11px] text-red font-mono">{error}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  function set(key) {
    return e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors(v => ({ ...v, [key]: '' }))
      if (apiErr) setApiErr('')
    }
  }

  function validate() {
    const e = {}
    if (!form.email.trim())    e.email    = 'Email is required'
    if (!form.password)        e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setApiErr(''); setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/markets')
    } catch (err) {
      setApiErr(err.response?.data?.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left: form panel ─────────────────────────── */}
      <div className="w-full lg:w-[460px] flex flex-col justify-between p-8 lg:p-12">

        {/* Logo */}
        <div className="animate-fade-up">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-[15px] font-bold text-ink tracking-tight">
              NexTrade
            </span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-8 animate-fade-up">
              <h1 className="font-display text-[30px] font-extrabold text-ink
                tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-ink2 font-light">
                Sign in to access your trading account
              </p>
            </div>

            {/* API error banner */}
            {apiErr && (
              <div className="mb-5 flex items-start gap-2.5 bg-red/5 border
                border-red/20 rounded-xl px-4 py-3 animate-fade-up">
                <svg className="w-4 h-4 text-red mt-0.5 shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"    y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12px] text-red font-mono">{apiErr}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-up-2">

              {/* Email */}
              <Field
                label="Email address" id="email" type="email"
                placeholder="you@example.com"
                value={form.email} onChange={set('email')}
                error={errors.email}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="pw"
                    className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
                    Password
                  </label>
                  <button type="button"
                    className="text-[11px] text-ink3 hover:text-blue font-mono transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 pr-11
                      text-sm text-ink placeholder:text-ink3 outline-none font-body
                      transition-colors duration-150
                      ${errors.password
                        ? 'border-red/40 focus:border-red/60'
                        : 'border-border focus:border-blue/40'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-ink3 hover:text-ink2 transition-colors">
                    {showPw ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red font-mono">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full h-11 rounded-xl font-display font-semibold
                  text-sm bg-blue hover:bg-blue/90 text-white tracking-wide
                  transition-all duration-150 active:scale-[.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 animate-fade-up-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-ink3 font-mono">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-ink2 animate-fade-up-3">
              No account?{' '}
              <Link to="/register"
                className="text-blue hover:text-blue/80 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-[11px] text-ink3 font-mono animate-fade-up-4">
          © 2025 NexTrade
        </p>
      </div>

      {/* ── Right: decorative panel ───────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden
        bg-bg2 border-l border-border">

        <div className="absolute inset-0 bg-grid opacity-55" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 60% 40%,rgba(59,130,246,.06),transparent)' }} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Headline */}
          <div className="animate-fade-up-2">
            <p className="font-mono text-xs text-blue tracking-[3px] uppercase mb-5">
              Live market data
            </p>
            <h2 className="font-display text-4xl font-extrabold text-ink
              leading-tight tracking-tight mb-4">
              Trade at the<br />
              <span className="text-blue">speed of now</span>
            </h2>
            <p className="text-sm text-ink2 font-light max-w-xs leading-relaxed">
              Sub-millisecond order matching. Real-time WebSocket feeds.
              Professional-grade crypto exchange.
            </p>
          </div>

          {/* Market overview */}
          <div className="flex flex-col gap-3 animate-fade-up-3">
            <p className="font-mono text-xs text-ink3 tracking-widest uppercase mb-1">
              Market overview
            </p>
            {TICKERS.map(t => (
              <div key={t.sym}
                className="flex items-center justify-between px-4 py-3
                  border border-border rounded-xl bg-bg3/60 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                    text-xs font-bold
                    ${t.up ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                    {t.sym[0]}
                  </div>
                  <span className="font-mono text-sm font-medium text-ink">{t.sym}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-ink">{t.price}</p>
                  <p className={`font-mono text-xs ${t.up ? 'text-green' : 'text-red'}`}>
                    {t.chg}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 animate-fade-up-4">
            {STATS.map(s => (
              <div key={s.l}
                className="bg-bg3/70 border border-border rounded-xl p-4 backdrop-blur-sm">
                <p className="font-mono text-lg font-medium text-ink mb-1">{s.n}</p>
                <p className="text-xs text-ink3">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
