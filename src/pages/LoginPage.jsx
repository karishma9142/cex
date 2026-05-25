import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

// ── Tiny reusable input ──────────────────────────────────────
function Field({ label, id, type = 'text', placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-mono text-ink3 tracking-widest uppercase">
        {label}
      </label>
      <div className={`relative rounded-lg transition-all duration-200 ${
        focused ? 'glow-blue-sm' : ''
      }`}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
            placeholder:text-ink3 outline-none transition-colors duration-150
            font-body
            ${error
              ? 'border-red/50 focus:border-red'
              : 'border-border focus:border-blue/40'
            }`}
        />
      </div>
      {error && (
        <p className="text-xs text-red font-mono">{error}</p>
      )}
    </div>
  )
}

// ── Animated market ticker strip ─────────────────────────────
const TICKERS = [
  { sym: 'BTC/INR', price: '₹58,42,100', chg: '+2.41%', up: true },
  { sym: 'ETH/INR', price: '₹3,12,500',  chg: '+1.82%', up: true },
  { sym: 'SOL/INR', price: '₹14,280',    chg: '-0.63%', up: false },
]

function TickerRow({ sym, price, chg, up }) {
  return (
    <div className="flex items-center justify-between px-4 py-3
      border border-border rounded-xl bg-bg3/60 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
          ${up ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
          {sym.split('/')[0][0]}
        </div>
        <span className="font-mono text-sm font-medium text-ink">{sym}</span>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-ink">{price}</p>
        <p className={`font-mono text-xs ${up ? 'text-green' : 'text-red'}`}>{chg}</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  function validate() {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }
    setErrors({})
    setApiErr('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signin', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify(data.user))
      navigate('/markets')
    } catch (err) {
      setApiErr(err.response?.data?.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left panel — form ─────────────────────────── */}
      <div className="w-full lg:w-[480px] flex flex-col justify-between p-8 lg:p-12 relative z-10">

        {/* Logo */}
        <div className="animate-fade-up">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-base font-700 text-ink tracking-tight">
              NexTrade
            </span>
          </Link>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-8 animate-fade-up">
              <h1 className="font-display text-3xl font-800 text-ink tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-ink2 font-light">
                Sign in to access your trading account
              </p>
            </div>

            {/* API error */}
            {apiErr && (
              <div className="mb-5 flex items-start gap-3 bg-red/5 border border-red/20
                rounded-xl px-4 py-3 animate-fade-up">
                <svg className="w-4 h-4 text-red mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-red font-mono">{apiErr}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-up-2">
              <Field
                label="Email address" id="email" type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email}
              />

              {/* Password with show/hide */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-mono text-ink3 tracking-widest uppercase">
                    Password
                  </label>
                  <button type="button" className="text-xs text-ink3 hover:text-blue
                    transition-colors font-mono">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 pr-11
                      text-sm text-ink placeholder:text-ink3 outline-none
                      transition-colors duration-150 font-body
                      ${errors.password
                        ? 'border-red/50 focus:border-red'
                        : 'border-border focus:border-blue/40'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-ink3 hover:text-ink2 transition-colors"
                  >
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red font-mono">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 w-full h-11 rounded-xl font-display font-600
                  text-sm tracking-wide overflow-hidden group
                  bg-blue hover:bg-blue/90
                  text-white transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 animate-fade-up-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-ink3 font-mono">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-ink2 animate-fade-up-3">
              Don't have an account?{' '}
              <Link to="/register"
                className="text-blue hover:text-blue/80 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-ink3 font-mono animate-fade-up-4">
          © 2025 NexTrade · All rights reserved
        </p>
      </div>

      {/* ── Right panel — decorative ──────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden
        bg-bg2 border-l border-border">

        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-60" />

        {/* Blue radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{background: 'radial-gradient(ellipse 60% 60% at 60% 40%, rgba(59,130,246,.06), transparent)'}} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Top: headline */}
          <div className="animate-fade-up-2">
            <p className="font-mono text-xs text-blue tracking-widest uppercase mb-5">
              Live market data
            </p>
            <h2 className="font-display text-4xl font-800 text-ink leading-tight
              tracking-tight mb-4">
              Trade at the<br/>
              <span className="text-blue">speed of now</span>
            </h2>
            <p className="text-sm text-ink2 font-light max-w-xs leading-relaxed">
              Sub-millisecond order matching. Real-time WebSocket feeds. Professional-grade crypto exchange.
            </p>
          </div>

          {/* Middle: market cards */}
          <div className="flex flex-col gap-3 animate-fade-up-3">
            <p className="font-mono text-xs text-ink3 tracking-widest uppercase mb-1">
              Market overview
            </p>
            {TICKERS.map(t => <TickerRow key={t.sym} {...t} />)}
          </div>

          {/* Bottom: stats */}
          <div className="grid grid-cols-3 gap-4 animate-fade-up-4">
            {[
              { n: '<1ms',   l: 'Order execution' },
              { n: '99.9%',  l: 'Uptime' },
              { n: '3+',     l: 'Trading pairs' },
            ].map(s => (
              <div key={s.l} className="bg-bg3/70 border border-border rounded-xl p-4 backdrop-blur-sm">
                <p className="font-mono text-lg font-500 text-ink mb-1">{s.n}</p>
                <p className="text-xs text-ink3">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
