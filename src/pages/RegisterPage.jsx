import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

// ── Password strength ────────────────────────────────────────
function getStrength(pw) {
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0-4
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red', 'bg-yellow-400', 'bg-blue', 'bg-green']
const STRENGTH_TEXT  = ['', 'text-red', 'text-yellow-400', 'text-blue', 'text-green']

function PasswordStrength({ password }) {
  const score = getStrength(password)
  if (!password) return null
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${i <= score ? STRENGTH_COLOR[score] : 'bg-border2'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-mono ${STRENGTH_TEXT[score]}`}>
        {STRENGTH_LABEL[score]}
      </span>
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────
function Field({ label, id, type = 'text', placeholder, value, onChange, error, children }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-mono text-ink3 tracking-widest uppercase">
        {label}
      </label>
      <div className={`rounded-lg transition-shadow duration-200 ${focused ? 'glow-blue-sm' : ''}`}>
        {children ?? (
          <input
            id={id} type={type} placeholder={placeholder}
            value={value} onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
              placeholder:text-ink3 outline-none transition-colors duration-150 font-body
              ${error ? 'border-red/50 focus:border-red' : 'border-border focus:border-blue/40'}`}
          />
        )}
      </div>
      {error && <p className="text-xs text-red font-mono">{error}</p>}
    </div>
  )
}

// ── Check row ────────────────────────────────────────────────
function Check({ ok, text }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-mono transition-colors duration-200
      ${ok ? 'text-green' : 'text-ink3'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
        transition-all duration-200 shrink-0
        ${ok ? 'border-green bg-green/10' : 'border-ink3'}`}>
        {ok && (
          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      {text}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step,    setStep]    = useState(1) // 1 = info, 2 = password
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [agreed,  setAgreed]  = useState(false)

  const strength = getStrength(form.password)

  function validateStep1() {
    const e = {}
    if (!form.name || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address'
    return e
  }

  function validateStep2() {
    const e = {}
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match'
    if (!agreed)
      e.agree = 'You must accept the terms'
    return e
  }

  function handleNext(e) {
    e.preventDefault()
    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiErr('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', {
        fullName:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
      })
      console.log(fullName);
      localStorage.setItem('token', data.token)
      localStorage.setItem('user',  JSON.stringify(data.user))
      navigate('/markets')
    } catch (err) {
      setApiErr(err.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left panel — decorative ──────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden
        bg-bg2 border-r border-border">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 pointer-events-none"
          style={{background: 'radial-gradient(ellipse 60% 60% at 40% 50%, rgba(59,130,246,.06), transparent)'}} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-base font-700 text-ink tracking-tight">
              NexTrade
            </span>
          </Link>

          {/* Center content */}
          <div className="animate-fade-up-2">
            <p className="font-mono text-xs text-blue tracking-widest uppercase mb-5">
              Why NexTrade
            </p>
            <h2 className="font-display text-4xl font-800 text-ink leading-tight
              tracking-tight mb-8">
              Join thousands of<br/>
              <span className="text-blue">active traders</span>
            </h2>

            {/* Feature list */}
            <div className="flex flex-col gap-4">
              {[
                { icon: '⚡', title: 'Instant execution',   desc: 'Sub-ms order matching on Redis' },
                { icon: '🔐', title: 'Secure wallet',        desc: 'Dual-layer Redis + MongoDB sync' },
                { icon: '📊', title: 'Live orderbook',       desc: 'Real-time WebSocket feeds' },
                { icon: '🏦', title: 'Multi-asset support',  desc: 'INR, BTC, ETH, SOL wallets' },
              ].map(f => (
                <div key={f.title}
                  className="flex items-center gap-4 bg-bg3/60 border border-border
                    rounded-xl px-4 py-3 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-blue/10 border border-blue/20
                    flex items-center justify-center text-base shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{f.title}</p>
                    <p className="text-xs text-ink2 font-light">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-xs text-ink3">© 2025 NexTrade</p>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────── */}
      <div className="w-full lg:w-[480px] flex flex-col justify-between p-8 lg:p-12">

        {/* Mobile logo */}
        <div className="lg:hidden animate-fade-up">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-base font-700 text-ink">NexTrade</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 animate-fade-up">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                    font-mono text-xs font-500 transition-all duration-300
                    ${step === s
                      ? 'bg-blue text-white'
                      : step > s
                        ? 'bg-green/15 text-green border border-green/30'
                        : 'bg-bg3 text-ink3 border border-border'
                    }`}>
                    {step > s
                      ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      : s
                    }
                  </div>
                  {s < 2 && (
                    <div className={`w-10 h-px transition-colors duration-300
                      ${step > s ? 'bg-green/30' : 'bg-border'}`} />
                  )}
                </div>
              ))}
              <span className="ml-2 text-xs text-ink3 font-mono">
                Step {step} of 2
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7 animate-fade-up">
              <h1 className="font-display text-3xl font-800 text-ink tracking-tight mb-2">
                {step === 1 ? 'Create account' : 'Set password'}
              </h1>
              <p className="text-sm text-ink2 font-light">
                {step === 1
                  ? 'Start trading in under 2 minutes'
                  : 'Choose a strong password for your account'}
              </p>
            </div>

            {/* API error */}
            {apiErr && (
              <div className="mb-5 flex items-start gap-3 bg-red/5 border border-red/20
                rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-red font-mono">{apiErr}</p>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form onSubmit={handleNext} className="flex flex-col gap-4 animate-fade-up-2">
                <Field
                  label="Full name" id="name"
                  placeholder="Aarav Kumar"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  error={errors.name}
                />
                <Field
                  label="Email address" id="email" type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                />
                <button
                  type="submit"
                  className="mt-2 w-full h-11 rounded-xl font-display font-600 text-sm
                    bg-blue hover:bg-blue/90 text-white tracking-wide
                    transition-all duration-150 active:scale-[.98]"
                >
                  Continue →
                </button>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-up-2">

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pw" className="text-xs font-mono text-ink3 tracking-widest uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className={`w-full bg-bg3 border rounded-lg px-4 py-3 pr-11
                        text-sm text-ink placeholder:text-ink3 outline-none
                        transition-colors duration-150 font-body
                        ${errors.password ? 'border-red/50' : 'border-border focus:border-blue/40'}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink2">
                      {showPw
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                  {errors.password && <p className="text-xs text-red font-mono">{errors.password}</p>}

                  {/* Requirements */}
                  {form.password && (
                    <div className="mt-2 flex flex-col gap-1.5 p-3
                      bg-bg3 border border-border rounded-lg">
                      <Check ok={form.password.length >= 8}        text="At least 8 characters" />
                      <Check ok={/[A-Z]/.test(form.password)}       text="One uppercase letter" />
                      <Check ok={/[0-9]/.test(form.password)}       text="One number" />
                      <Check ok={/[^A-Za-z0-9]/.test(form.password)} text="One special character" />
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm" className="text-xs font-mono text-ink3 tracking-widest uppercase">
                    Confirm password
                  </label>
                  <input
                    id="confirm" type="password"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
                      placeholder:text-ink3 outline-none transition-colors duration-150 font-body
                      ${errors.confirm ? 'border-red/50' : 'border-border focus:border-blue/40'}
                      ${form.confirm && form.confirm === form.password ? 'border-green/40' : ''}`}
                  />
                  {errors.confirm && <p className="text-xs text-red font-mono">{errors.confirm}</p>}
                  {form.confirm && form.confirm === form.password && (
                    <p className="text-xs text-green font-mono flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAgreed(v => !v)}
                    className={`w-4 h-4 rounded border flex items-center justify-center
                      mt-0.5 shrink-0 transition-all duration-150 cursor-pointer
                      ${agreed
                        ? 'bg-blue border-blue'
                        : 'border-border2 group-hover:border-blue/40'
                      }`}
                  >
                    {agreed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-ink2 font-light leading-relaxed">
                    I agree to the{' '}
                    <span className="text-blue cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-blue cursor-pointer hover:underline">Privacy Policy</span>
                  </span>
                </label>
                {errors.agree && <p className="text-xs text-red font-mono -mt-2">{errors.agree}</p>}

                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrors({}) }}
                    className="w-24 h-11 rounded-xl font-display font-500 text-sm
                      text-ink2 border border-border hover:border-border2 hover:text-ink
                      transition-all duration-150"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || strength < 2}
                    className="flex-1 h-11 rounded-xl font-display font-600 text-sm
                      bg-blue hover:bg-blue/90 text-white tracking-wide
                      transition-all duration-150 active:scale-[.98]
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating account…
                      </span>
                    ) : 'Create account'}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 animate-fade-up-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-ink3 font-mono">already have an account?</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Link to="/login"
              className="block w-full h-10 rounded-xl border border-border
                text-sm text-ink2 font-medium text-center leading-10
                hover:border-border2 hover:text-ink transition-all duration-150
                animate-fade-up-3">
              Sign in instead
            </Link>
          </div>
        </div>

        <p className="text-xs text-ink3 font-mono animate-fade-up-4">
          © 2025 NexTrade · All rights reserved
        </p>
      </div>
    </div>
  )
}
