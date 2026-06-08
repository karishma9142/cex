import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── Password strength helpers ────────────────────────────────
function getStrength(pw) {
  let s = 0
  if (pw.length >= 8)              s++
  if (/[A-Z]/.test(pw))            s++
  if (/[0-9]/.test(pw))            s++
  if (/[^A-Za-z0-9]/.test(pw))    s++
  return s   // 0 – 4
}

const STRENGTH_LABEL = ['', 'Weak',        'Fair',     'Good',    'Strong']
const BAR_COLOR      = ['', 'bg-red',       'bg-yellow-400', 'bg-blue',  'bg-green']
const TEXT_COLOR     = ['', 'text-red',     'text-yellow-400','text-blue','text-green']

function StrengthBar({ password }) {
  const s = getStrength(password)
  if (!password) return null
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${i <= s ? BAR_COLOR[s] : 'bg-border2'}`}
          />
        ))}
      </div>
      <span className={`text-[11px] font-mono ${TEXT_COLOR[s]}`}>
        {STRENGTH_LABEL[s]}
      </span>
    </div>
  )
}

function Check({ ok, text }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] font-mono transition-colors duration-200
      ${ok ? 'text-green' : 'text-ink3'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
        shrink-0 transition-all duration-200
        ${ok ? 'border-green bg-green/10' : 'border-ink3'}`}>
        {ok && (
          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {text}
    </div>
  )
}

// ─── Feature list for right panel ────────────────────────────
const FEATURES = [
  { icon: '⚡', title: 'Instant execution',  desc: 'Sub-ms order matching on Redis' },
  { icon: '🔐', title: 'Secure wallet',       desc: 'Dual-layer Redis + MongoDB sync'  },
  { icon: '📊', title: 'Live orderbook',      desc: 'Real-time WebSocket feeds'        },
  { icon: '🏦', title: 'Multi-asset support', desc: 'INR, BTC, ETH, SOL wallets'       },
]

// ─── Step indicator ───────────────────────────────────────────
function StepDot({ n, active, done }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center
      font-mono text-xs font-medium transition-all duration-300
      ${done
        ? 'bg-green/15 text-green border border-green/30'
        : active
          ? 'bg-blue text-white'
          : 'bg-bg3 text-ink3 border border-border'}`}>
      {done
        ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        : n}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [agreed,  setAgreed]  = useState(false)

  const strength = getStrength(form.password)

  function set(key) {
    return e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors(v => ({ ...v, [key]: '' }))
      if (apiErr) setApiErr('')
    }
  }

  // ── Step 1 validation ──────────────────────────────────────
  function validateStep1() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address'
    return e
  }

  // ── Step 2 validation ──────────────────────────────────────
  function validateStep2() {
    const e = {}
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match'
    if (!agreed)
      e.agree = 'You must accept the terms to continue'
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
    setErrors({}); setApiErr(''); setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/markets')
    } catch (err) {
      setApiErr(err.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left: decorative panel ───────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden
        bg-bg2 border-r border-border">

        <div className="absolute inset-0 bg-grid opacity-55" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 40% 50%,rgba(59,130,246,.06),transparent)' }} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-[15px] font-bold text-ink tracking-tight">
              NexTrade
            </span>
          </Link>

          {/* Headline + features */}
          <div className="animate-fade-up-2">
            <p className="font-mono text-xs text-blue tracking-[3px] uppercase mb-5">
              Why NexTrade
            </p>
            <h2 className="font-display text-4xl font-extrabold text-ink
              leading-tight tracking-tight mb-8">
              Join thousands of<br />
              <span className="text-blue">active traders</span>
            </h2>

            <div className="flex flex-col gap-3">
              {FEATURES.map(f => (
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

          <p className="font-mono text-[11px] text-ink3">© 2025 NexTrade</p>
        </div>
      </div>

      {/* ── Right: form panel ────────────────────────── */}
      <div className="w-full lg:w-[480px] flex flex-col justify-between p-8 lg:p-12">

        {/* Mobile logo */}
        <div className="lg:hidden animate-fade-up">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="font-display text-[15px] font-bold text-ink tracking-tight">
              NexTrade
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 animate-fade-up">
              <StepDot n="1" active={step === 1} done={step > 1} />
              <div className={`flex-1 h-px max-w-[40px] transition-colors duration-300
                ${step > 1 ? 'bg-green/30' : 'bg-border'}`} />
              <StepDot n="2" active={step === 2} done={false} />
              <span className="ml-2 text-[11px] text-ink3 font-mono">
                Step {step} of 2
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7 animate-fade-up">
              <h1 className="font-display text-[30px] font-extrabold text-ink
                tracking-tight mb-2">
                {step === 1 ? 'Create account' : 'Set your password'}
              </h1>
              <p className="text-sm text-ink2 font-light">
                {step === 1
                  ? 'Start trading in under 2 minutes'
                  : 'Choose a strong password for your account'}
              </p>
            </div>

            {/* API error banner */}
            {apiErr && (
              <div className="mb-5 flex items-start gap-2.5 bg-red/5 border
                border-red/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red mt-0.5 shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8"  x2="12"    y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12px] text-red font-mono">{apiErr}</p>
              </div>
            )}

            {/* ══════════════ STEP 1 ══════════════ */}
            {step === 1 && (
              <form onSubmit={handleNext} className="flex flex-col gap-4 animate-fade-up-2">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name"
                    className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
                    Full name
                  </label>
                  <input
                    id="name" type="text" placeholder="Aarav Kumar"
                    value={form.name} onChange={set('name')} autoFocus
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
                      placeholder:text-ink3 outline-none font-body transition-colors duration-150
                      ${errors.name
                        ? 'border-red/40 focus:border-red/60'
                        : 'border-border focus:border-blue/40'}`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red font-mono">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email"
                    className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
                    Email address
                  </label>
                  <input
                    id="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')}
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
                      placeholder:text-ink3 outline-none font-body transition-colors duration-150
                      ${errors.email
                        ? 'border-red/40 focus:border-red/60'
                        : 'border-border focus:border-blue/40'}`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red font-mono">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full h-11 rounded-xl font-display font-semibold
                    text-sm bg-blue hover:bg-blue/90 text-white tracking-wide
                    transition-all duration-150 active:scale-[.98]">
                  Continue →
                </button>
              </form>
            )}

            {/* ══════════════ STEP 2 ══════════════ */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-up-2">

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pw"
                    className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={set('password')}
                      autoFocus
                      className={`w-full bg-bg3 border rounded-lg px-4 py-3 pr-11
                        text-sm text-ink placeholder:text-ink3 outline-none font-body
                        transition-colors duration-150
                        ${errors.password
                          ? 'border-red/40 focus:border-red/60'
                          : 'border-border focus:border-blue/40'}`}
                    />
                    <button type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-ink3 hover:text-ink2 transition-colors">
                      {showPw ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                            a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
                            a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Strength bar */}
                  <StrengthBar password={form.password} />
                  {errors.password && (
                    <p className="text-[11px] text-red font-mono">{errors.password}</p>
                  )}

                  {/* Requirements checklist */}
                  {form.password && (
                    <div className="mt-1 flex flex-col gap-1.5 p-3
                      bg-bg3 border border-border rounded-lg">
                      <Check ok={form.password.length >= 8}         text="At least 8 characters" />
                      <Check ok={/[A-Z]/.test(form.password)}        text="One uppercase letter"  />
                      <Check ok={/[0-9]/.test(form.password)}        text="One number"            />
                      <Check ok={/[^A-Za-z0-9]/.test(form.password)} text="One special character" />
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm"
                    className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
                    Confirm password
                  </label>
                  <input
                    id="confirm" type="password"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    className={`w-full bg-bg3 border rounded-lg px-4 py-3 text-sm text-ink
                      placeholder:text-ink3 outline-none font-body transition-colors duration-150
                      ${errors.confirm
                        ? 'border-red/40 focus:border-red/60'
                        : form.confirm && form.confirm === form.password
                          ? 'border-green/40 focus:border-green/60'
                          : 'border-border focus:border-blue/40'}`}
                  />
                  {errors.confirm && (
                    <p className="text-[11px] text-red font-mono">{errors.confirm}</p>
                  )}
                  {form.confirm && form.confirm === form.password && !errors.confirm && (
                    <p className="text-[11px] text-green font-mono flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setAgreed(v => !v)}
                    className={`w-4 h-4 rounded border flex items-center justify-center
                      mt-0.5 shrink-0 cursor-pointer transition-all duration-150
                      ${agreed
                        ? 'bg-blue border-blue'
                        : 'border-border2 hover:border-blue/40'}`}
                  >
                    {agreed && (
                      <svg className="w-2.5 h-2.5 text-white"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-ink2 font-light leading-relaxed">
                    I agree to the{' '}
                    <span className="text-blue cursor-pointer hover:underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-blue cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                  </span>
                </label>
                {errors.agree && (
                  <p className="text-[11px] text-red font-mono -mt-2">{errors.agree}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrors({}) }}
                    className="w-24 h-11 rounded-xl font-display font-medium text-sm
                      text-ink2 border border-border hover:border-border2 hover:text-ink
                      transition-all duration-150">
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || strength < 2}
                    className="flex-1 h-11 rounded-xl font-display font-semibold text-sm
                      bg-blue hover:bg-blue/90 text-white tracking-wide
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
                        Creating…
                      </>
                    ) : 'Create account'}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 animate-fade-up-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-ink3 font-mono">already have an account?</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Link to="/login"
              className="block w-full h-10 rounded-xl border border-border text-sm
                text-ink2 font-medium text-center leading-10 animate-fade-up-3
                hover:border-border2 hover:text-ink transition-all duration-150">
              Sign in instead
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-ink3 font-mono animate-fade-up-4">
          © 2025 NexTrade
        </p>
      </div>
    </div>
  )
}
