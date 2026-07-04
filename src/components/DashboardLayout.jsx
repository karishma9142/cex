import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/markets', label: 'Markets', icon: MarketsIcon },
  { to: '/trade/BTC-INR', label: 'Trade', icon: TradeIcon, matchPrefix: '/trade' },
  { to: '/wallet', label: 'Wallet', icon: WalletIcon },
  { to: '/orders', label: 'Orders', icon: OrdersIcon },
]

function MarketsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TradeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="10" width="3" height="8" rx="0.5" />
      <rect x="10.5" y="5" width="3" height="13" rx="0.5" />
      <rect x="18" y="13" width="3" height="5" rx="0.5" />
    </svg>
  )
}
function WalletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
function OrdersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M5 4h14v16l-3.5-2-3.5 2-3.5-2L5 20V4z" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" />
    </svg>
  )
}
function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardLayout({ children, title, actions }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col w-[220px] shrink-0 border-r border-border
        bg-bg2 px-4 py-6">
        <Link to="/markets" className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
          </div>
          <span className="font-display text-[15px] font-bold text-ink tracking-tight">
            NexTrade
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => {
                const active = item.matchPrefix
                  ? window.location.pathname.startsWith(item.matchPrefix)
                  : isActive
                return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body
                  transition-colors duration-150
                  ${active
                    ? 'bg-blue/10 text-blue border border-blue/20'
                    : 'text-ink2 border border-transparent hover:text-ink hover:bg-bg3'}`
              }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-sm text-ink font-medium truncate">
              {user?.fullName ?? user?.userName ?? 'Trader'}
            </p>
            <p className="text-[11px] text-ink3 font-mono truncate">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm
              text-ink2 hover:text-red hover:bg-red/5 transition-colors duration-150"
          >
            <LogoutIcon className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-bg/95 backdrop-blur-xl border-b
          border-border px-4 h-14 flex items-center justify-between">
          <Link to="/markets" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center">
              <div className="w-2 h-2 rounded-sm bg-white" />
            </div>
            <span className="font-display text-sm font-bold text-ink">NexTrade</span>
          </Link>
          <button onClick={handleLogout} className="text-ink3 hover:text-red">
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg2/95 backdrop-blur-xl
          border-t border-border flex items-center justify-around h-16">
          {NAV.map(item => {
            const active = item.matchPrefix
              ? window.location.pathname.startsWith(item.matchPrefix)
              : window.location.pathname === item.to
            return (
              <NavLink key={item.label} to={item.to}
                className={`flex flex-col items-center gap-1 text-[10px] font-mono
                  ${active ? 'text-blue' : 'text-ink3'}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Page header */}
        <header className="px-5 md:px-8 pt-6 md:pt-8 pb-4 flex items-center justify-between gap-4">
          <h1 className="font-display text-xl md:text-2xl font-extrabold text-ink tracking-tight">
            {title}
          </h1>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        <main className="flex-1 px-5 md:px-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}