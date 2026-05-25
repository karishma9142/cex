// import { useState, useEffect, useRef } from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// // ─── Data ────────────────────────────────────────────────────
// const NAV_LINKS = [
//   { label: 'Features',    href: '#features' },
//   { label: 'Markets',     href: '#markets'  },
//   { label: 'How it works',href: '#how'      },
// ]

// const TICKERS = [
//   { sym: 'BTC/INR', price: '₹58,42,100', chg: '▲ 2.41%', up: true  },
//   { sym: 'ETH/INR', price: '₹3,12,500',  chg: '▲ 1.82%', up: true  },
//   { sym: 'SOL/INR', price: '₹14,280',    chg: '▼ 0.63%', up: false },
// ]

// const FEATURES = [
//   { icon: '⚡', title: 'Sub-ms matching engine',     desc: 'Price-time priority built on Redis sorted sets. Limit and market orders with instant fill notifications.' },
//   { icon: '📡', title: 'Live WebSocket feeds',       desc: 'Real-time orderbook depth, trade tape, and ticker pushed via Socket.io. Your UI never goes stale.' },
//   { icon: '🔐', title: 'Secure wallet system',       desc: 'Dual-layer balance management with Redis + MongoDB. Locked funds prevent over-withdrawal during open orders.' },
//   { icon: '📊', title: 'Full OHLCV history',         desc: 'Candlestick data across 6 intervals from 1-minute to daily. Clean chart API ready to connect.' },
//   { icon: '🏦', title: 'Multi-asset wallets',        desc: 'INR, BTC, ETH and SOL wallets with deposit, withdrawal, and full transaction history out of the box.' },
//   { icon: '🛡️', title: 'Rate limiting + validation', desc: 'Zod schema validation on every endpoint. Tiered rate limits — tight on auth, generous on market data.' },
// ]

// const STEPS = [
//   { n: '01', title: 'Create your account', desc: 'Sign up with email. Your wallet is created automatically — no extra steps.' },
//   { n: '02', title: 'Fund your wallet',    desc: 'Deposit INR or crypto. Balances update instantly across Redis and MongoDB.' },
//   { n: '03', title: 'Pick a market',       desc: 'Browse BTC/INR, ETH/INR, SOL/INR with live 24h stats on every pair.' },
//   { n: '04', title: 'Place your order',    desc: 'Set price and quantity, hit buy or sell. The engine matches you in milliseconds.' },
// ]

// const MARKETS_DATA = [
//   { sym: 'BTC', quote: 'INR', price: '₹58,42,100', chg: '▲ 2.41%', up: true,  high: '₹59,10,000', low: '₹56,80,000', vol: '12.845'  },
//   { sym: 'ETH', quote: 'INR', price: '₹3,12,500',  chg: '▲ 1.82%', up: true,  high: '₹3,18,000',  low: '₹3,04,500',  vol: '48.320'  },
//   { sym: 'SOL', quote: 'INR', price: '₹14,280',    chg: '▼ 0.63%', up: false, high: '₹14,650',     low: '₹13,900',    vol: '204.510' },
// ]

// const MOCK_ASKS = [
//   { p: '58,46,200', q: '0.021', w: 28 },
//   { p: '58,44,800', q: '0.058', w: 52 },
//   { p: '58,43,500', q: '0.112', w: 78 },
// ]
// const MOCK_BIDS = [
//   { p: '58,43,100', q: '0.085', w: 68 },
//   { p: '58,41,900', q: '0.043', w: 38 },
//   { p: '58,40,500', q: '0.019', w: 18 },
// ]

// // ─── Scroll-reveal hook ──────────────────────────────────────
// function useReveal() {
//   const ref = useRef(null)
//   const [visible, setVisible] = useState(false)
//   useEffect(() => {
//     const obs = new IntersectionObserver(
//       ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
//       { threshold: 0.1 }
//     )
//     if (ref.current) obs.observe(ref.current)
//     return () => obs.disconnect()
//   }, [])
//   return [ref, visible]
// }

// function Reveal({ children, className = '', delay = 0 }) {
//   const [ref, visible] = useReveal()
//   return (
//     <div
//       ref={ref}
//       className={`transition-all duration-700 ${
//         visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
//       } ${className}`}
//       style={{ transitionDelay: `${delay}ms` }}
//     >
//       {children}
//     </div>
//   )
// }

// // ─── Navbar ──────────────────────────────────────────────────
// function Navbar() {
//   const { isAuthed } = useAuth()
//   const [scrolled, setScrolled] = useState(false)

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20)
//     window.addEventListener('scroll', onScroll)
//     return () => window.removeEventListener('scroll', onScroll)
//   }, [])

//   return (
//     <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
//       px-6 md:px-14 h-[60px] transition-all duration-300
//       ${scrolled ? 'bg-bg/90 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>

//       <Link to="/" className="flex items-center gap-2.5">
//         <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center shrink-0">
//           <div className="w-2.5 h-2.5 rounded-sm bg-white" />
//         </div>
//         <span className="font-display text-[15px] font-bold text-ink tracking-tight">NexTrade</span>
//       </Link>

//       <div className="hidden md:flex items-center gap-1">
//         {NAV_LINKS.map(l => (
//           <a key={l.label} href={l.href}
//             className="px-3 py-1.5 rounded-lg text-sm font-body text-ink2
//               hover:text-ink hover:bg-bg3 transition-all duration-150">
//             {l.label}
//           </a>
//         ))}
//       </div>

//       <div className="flex items-center gap-2.5">
//         {isAuthed ? (
//           <Link to="/markets"
//             className="px-4 py-2 rounded-lg bg-blue hover:bg-blue/90 text-white
//               text-sm font-medium transition-all duration-150">
//             Dashboard
//           </Link>
//         ) : (
//           <>
//             <Link to="/login"
//               className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium
//                 text-ink2 border border-border2 hover:text-ink hover:border-ink3
//                 transition-all duration-150">
//               Sign in
//             </Link>
//             <Link to="/register"
//               className="px-4 py-2 rounded-lg bg-blue hover:bg-blue/90 text-white
//                 text-sm font-medium transition-all duration-150">
//               Get started
//             </Link>
//           </>
//         )}
//       </div>
//     </nav>
//   )
// }

// // ─── Ticker bar ──────────────────────────────────────────────
// function TickerBar() {
//   const items = [...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS]
//   return (
//     <div className="bg-bg2 border-t border-b border-border py-2.5 overflow-hidden">
//       <div className="flex gap-12 whitespace-nowrap w-max animate-ticker hover:[animation-play-state:paused]">
//         {items.map((t, i) => (
//           <div key={i} className="flex items-center gap-2.5 font-mono text-[13px]">
//             <span className="text-ink font-medium">{t.sym}</span>
//             <span className="text-ink2">{t.price}</span>
//             <span className={t.up ? 'text-green' : 'text-red'}>{t.chg}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ─── Mock Trading UI ─────────────────────────────────────────
// function MockUI() {
//   return (
//     <div className="bg-bg border border-border2 rounded-xl overflow-hidden shadow-2xl">
//       {/* Top bar */}
//       <div className="flex items-center gap-3 px-4 py-3 bg-bg3 border-b border-border">
//         <span className="font-mono text-sm font-medium text-ink">BTC / INR</span>
//         <span className="font-mono text-xl font-medium text-green">₹58,42,100</span>
//         <span className="font-mono text-xs text-green bg-green/10 px-2 py-0.5 rounded">▲ +2.41%</span>
//         <span className="ml-auto font-mono text-[11px] text-ink3 hidden sm:block">
//           H ₹59,10,000 &nbsp; L ₹56,80,000
//         </span>
//       </div>

//       {/* Body */}
//       <div className="grid grid-cols-[1fr_150px] h-[220px]">
//         {/* Chart */}
//         <div className="p-3 overflow-hidden">
//           <svg viewBox="0 0 320 190" className="w-full h-full" preserveAspectRatio="none">
//             <defs>
//               <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#3b82f6" stopOpacity=".12"/>
//                 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
//               </linearGradient>
//             </defs>
//             <line x1="0" y1="40"  x2="320" y2="40"  stroke="#1c2230" strokeWidth=".5"/>
//             <line x1="0" y1="90"  x2="320" y2="90"  stroke="#1c2230" strokeWidth=".5"/>
//             <line x1="0" y1="140" x2="320" y2="140" stroke="#1c2230" strokeWidth=".5"/>
//             <polygon
//               points="0,155 40,138 80,144 120,112 160,92 200,68 240,46 280,34 320,20 320,190 0,190"
//               fill="url(#cg)"
//             />
//             <polyline
//               points="0,155 40,138 80,144 120,112 160,92 200,68 240,46 280,34 320,20"
//               fill="none" stroke="#3b82f6" strokeWidth="1.5"
//             />
//             <circle cx="320" cy="20" r="3" fill="#3b82f6"/>
//           </svg>
//         </div>

//         {/* Orderbook */}
//         <div className="border-l border-border p-2.5 overflow-hidden">
//           <div className="grid grid-cols-2 text-[10px] text-ink3 uppercase tracking-wide mb-1.5 pb-1.5 border-b border-border">
//             <span>Price</span><span className="text-right">Qty</span>
//           </div>

//           {MOCK_ASKS.map((a, i) => (
//             <div key={i} className="relative grid grid-cols-2 py-0.5">
//               <div className="absolute right-0 top-0 bottom-0 opacity-15 bg-red rounded-sm"
//                 style={{ width: `${a.w}%` }} />
//               <span className="font-mono text-[11px] text-red relative z-10">{a.p}</span>
//               <span className="font-mono text-[11px] text-ink2 text-right relative z-10">{a.q}</span>
//             </div>
//           ))}

//           <div className="text-center text-[10px] text-ink3 font-mono py-1 border-y border-border my-1">
//             Spread ₹400
//           </div>

//           {MOCK_BIDS.map((b, i) => (
//             <div key={i} className="relative grid grid-cols-2 py-0.5">
//               <div className="absolute right-0 top-0 bottom-0 opacity-15 bg-green rounded-sm"
//                 style={{ width: `${b.w}%` }} />
//               <span className="font-mono text-[11px] text-green relative z-10">{b.p}</span>
//               <span className="font-mono text-[11px] text-ink2 text-right relative z-10">{b.q}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── Main page ───────────────────────────────────────────────
// export default function LandingPage() {
//   return (
//     <div className="min-h-screen bg-bg text-ink font-body">
//       <Navbar />

//       {/* ── HERO ──────────────────────────────────────── */}
//       <section className="relative min-h-screen flex flex-col items-center
//         justify-center text-center px-6 pt-20 pb-16 overflow-hidden">

//         {/* Backgrounds */}
//         <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
//         <div className="absolute inset-0 pointer-events-none"
//           style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 30%, rgba(59,130,246,.07), transparent)' }} />

//         {/* Badge */}
//         <div className="animate-fade-up flex items-center gap-2 bg-bg3 border border-border2
//           px-3.5 py-1.5 rounded-full font-mono text-xs text-blue mb-7">
//           <span className="w-1.5 h-1.5 rounded-full bg-green animate-blink" />
//           Live matching engine — real-time WebSocket feeds
//         </div>

//         {/* Headline */}
//         <h1 className="animate-fade-up-2 font-display font-extrabold
//           text-[clamp(46px,8vw,92px)] leading-[.95] tracking-[-3px] mb-6">
//           Professional crypto<br />
//           <span className="text-blue">trading platform</span>
//         </h1>

//         <p className="animate-fade-up-3 max-w-[480px] text-[17px] text-ink2
//           font-light leading-relaxed mb-10">
//           Instant order matching, live orderbooks, and deep liquidity — all powered
//           by a Redis-backed matching engine built for speed.
//         </p>

//         {/* CTAs */}
//         <div className="animate-fade-up-4 flex gap-3 mb-16">
//           <Link to="/register"
//             className="px-7 py-3.5 rounded-xl bg-blue hover:bg-blue/90 text-white
//               font-display font-semibold text-[15px] tracking-wide
//               transition-all duration-150 active:scale-[.98]">
//             Start trading free
//           </Link>
//           <a href="#markets"
//             className="px-7 py-3.5 rounded-xl border border-border2 text-ink2
//               hover:text-ink hover:border-ink3 font-medium text-[15px]
//               transition-all duration-150">
//             View markets
//           </a>
//         </div>

//         {/* Stats strip */}
//         <div className="animate-fade-up-5 flex divide-x divide-border
//           border border-border rounded-xl bg-bg2 overflow-hidden">
//           {[
//             { n: '₹42Cr+', l: 'Daily volume'    },
//             { n: '<1ms',    l: 'Order execution' },
//             { n: '3+',      l: 'Trading pairs'   },
//             { n: '99.9%',   l: 'Uptime'          },
//           ].map(s => (
//             <div key={s.l} className="px-6 md:px-8 py-4 text-left">
//               <p className="font-mono text-[22px] font-medium text-ink leading-none mb-1">{s.n}</p>
//               <p className="text-xs text-ink3">{s.l}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── TICKER ────────────────────────────────────── */}
//       <TickerBar />

//       {/* ── FEATURES ──────────────────────────────────── */}
//       <section id="features" className="py-24 px-6 max-w-[1180px] mx-auto">
//         <Reveal>
//           <span className="font-mono text-xs text-blue tracking-[3px] uppercase block mb-3">
//             Why NexTrade
//           </span>
//           <h2 className="font-display text-[clamp(30px,4vw,48px)] font-bold
//             tracking-tight leading-[1.1] mb-3">
//             Built for serious traders
//           </h2>
//           <p className="text-[15px] text-ink2 max-w-[400px] font-light leading-relaxed">
//             Every layer engineered for speed, accuracy, and reliability at scale.
//           </p>
//         </Reveal>

//         <Reveal delay={100}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px
//             bg-border border border-border rounded-2xl overflow-hidden mt-14">
//             {FEATURES.map((f, i) => (
//               <div key={i}
//                 className="bg-bg2 hover:bg-bg3 p-8 transition-colors duration-200 group">
//                 <div className="w-10 h-10 rounded-xl bg-blue/10 border border-blue/20
//                   flex items-center justify-center text-lg mb-5">
//                   {f.icon}
//                 </div>
//                 <h3 className="font-display text-[16px] font-semibold mb-2 tracking-tight">
//                   {f.title}
//                 </h3>
//                 <p className="text-[13px] text-ink2 leading-[1.7] font-light">{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </Reveal>
//       </section>

//       {/* ── TRADING PREVIEW ───────────────────────────── */}
//       <section className="bg-bg2 border-t border-b border-border py-20 px-6">
//         <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

//           <Reveal>
//             <MockUI />
//           </Reveal>

//           <Reveal delay={100}>
//             <span className="font-mono text-xs text-blue tracking-[3px] uppercase block mb-4">
//               The trading experience
//             </span>
//             <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold
//               tracking-tight leading-[1.1] mb-10">
//               Professional UI.<br />Zero friction.
//             </h2>

//             <div className="flex flex-col gap-6">
//               {[
//                 { n: '01', t: 'Click-to-fill pricing',  d: 'Click any price in the orderbook and it fills your order form instantly.' },
//                 { n: '02', t: 'Limit and market orders', d: 'Full support for both types. Market orders execute at best available price.' },
//                 { n: '03', t: 'Live fill notifications', d: 'Order status updates in real time via WebSocket. See fills as they happen.' },
//                 { n: '04', t: 'Cancel any open order',   d: 'Cancel open or partial orders anytime. Locked funds released immediately.' },
//               ].map(p => (
//                 <div key={p.n} className="flex gap-4">
//                   <div className="w-7 h-7 rounded-lg bg-blue/10 border border-blue/25
//                     flex items-center justify-center font-mono text-[11px] text-blue
//                     font-medium shrink-0 mt-0.5">
//                     {p.n}
//                   </div>
//                   <div>
//                     <p className="font-display font-semibold text-[15px] mb-1 tracking-tight">{p.t}</p>
//                     <p className="text-[13px] text-ink2 font-light leading-relaxed">{p.d}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* ── HOW IT WORKS ──────────────────────────────── */}
//       <section id="how" className="py-24 px-6 max-w-[1100px] mx-auto text-center">
//         <Reveal>
//           <span className="font-mono text-xs text-blue tracking-[3px] uppercase block mb-3">
//             Get started
//           </span>
//           <h2 className="font-display text-[clamp(30px,4vw,48px)] font-bold
//             tracking-tight leading-[1.1]">
//             Up and trading in four steps
//           </h2>
//         </Reveal>

//         <Reveal delay={100}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
//             {STEPS.map((s, i) => (
//               <div key={i}
//                 className="bg-bg2 border border-border hover:border-border2
//                   rounded-xl p-7 text-left transition-all duration-200 group">
//                 <div className="w-8 h-8 rounded-lg bg-blue/10 border border-blue/25
//                   flex items-center justify-center font-mono text-xs text-blue
//                   font-medium mb-5 group-hover:bg-blue group-hover:text-white
//                   group-hover:border-blue transition-all duration-300">
//                   {s.n}
//                 </div>
//                 <p className="font-display font-semibold text-[15px] mb-2 tracking-tight">{s.title}</p>
//                 <p className="text-[13px] text-ink2 font-light leading-relaxed">{s.desc}</p>
//               </div>
//             ))}
//           </div>
//         </Reveal>
//       </section>

//       {/* ── MARKETS TABLE ─────────────────────────────── */}
//       <section id="markets" className="bg-bg2 border-t border-b border-border py-20 px-6">
//         <div className="max-w-[980px] mx-auto">
//           <Reveal>
//             <span className="font-mono text-xs text-blue tracking-[3px] uppercase block mb-3">
//               Live markets
//             </span>
//             <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold
//               tracking-tight leading-[1.1]">
//               Available trading pairs
//             </h2>
//           </Reveal>

//           <Reveal delay={100}>
//             <div className="mt-12 border border-border rounded-2xl overflow-hidden overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-bg3 border-b border-border">
//                     {['Pair','Last price','24h change','24h high','24h low','Volume',''].map(h => (
//                       <th key={h} className="text-left px-4 py-3 text-[11px] font-mono
//                         text-ink3 uppercase tracking-wider font-normal whitespace-nowrap">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {MARKETS_DATA.map((m, i) => (
//                     <tr key={i}
//                       className="border-b border-border last:border-0
//                         hover:bg-bg3 cursor-pointer transition-colors duration-100"
//                       onClick={() => window.location.href = `/trade/${m.sym}%2F${m.quote}`}>
//                       <td className="px-4 py-4">
//                         <span className="font-mono font-medium text-[14px] text-ink">
//                           {m.sym}
//                         </span>
//                         <span className="font-mono text-[12px] text-ink3">/{m.quote}</span>
//                       </td>
//                       <td className="px-4 py-4 font-mono text-[13px] text-ink">{m.price}</td>
//                       <td className="px-4 py-4">
//                         <span className={`inline-flex items-center font-mono text-xs
//                           px-2.5 py-1 rounded-md font-medium
//                           ${m.up
//                             ? 'text-green bg-green/10'
//                             : 'text-red bg-red/10'}`}>
//                           {m.chg}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 font-mono text-[13px] text-ink2">{m.high}</td>
//                       <td className="px-4 py-4 font-mono text-[13px] text-ink2">{m.low}</td>
//                       <td className="px-4 py-4 font-mono text-[13px] text-ink2">{m.vol}</td>
//                       <td className="px-4 py-4">
//                         <Link
//                           to={`/trade/${m.sym}%2F${m.quote}`}
//                           onClick={e => e.stopPropagation()}
//                           className="px-3.5 py-1.5 rounded-lg text-xs font-semibold
//                             text-blue bg-blue/10 border border-blue/25
//                             hover:bg-blue hover:text-white hover:border-blue
//                             transition-all duration-150">
//                           Trade
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* ── CTA ───────────────────────────────────────── */}
//       <section className="relative py-28 px-6 text-center overflow-hidden">
//         <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
//         <div className="absolute inset-0 pointer-events-none"
//           style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(59,130,246,.06), transparent)' }} />

//         <Reveal>
//           <h2 className="font-display text-[clamp(34px,5vw,60px)] font-extrabold
//             tracking-tight leading-[1.05] mb-4">
//             Ready to{' '}
//             <span className="text-blue">start trading?</span>
//           </h2>
//           <p className="text-[16px] text-ink2 mb-12 font-light max-w-md mx-auto leading-relaxed">
//             Join NexTrade and experience professional-grade crypto trading on a real matching engine.
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Link to="/register"
//               className="px-8 py-3.5 rounded-xl bg-blue hover:bg-blue/90 text-white
//                 font-display font-semibold text-[15px] tracking-wide
//                 transition-all duration-150 active:scale-[.98]">
//               Create free account
//             </Link>
//             <Link to="/login"
//               className="px-8 py-3.5 rounded-xl border border-border2 text-ink2
//                 hover:text-ink hover:border-ink3 font-medium text-[15px]
//                 transition-all duration-150">
//               Sign in
//             </Link>
//           </div>
//         </Reveal>
//       </section>

//       {/* ── FOOTER ────────────────────────────────────── */}
//       <footer className="border-t border-border bg-bg2 px-6 md:px-14 py-8
//         flex flex-col sm:flex-row items-center justify-between gap-4">
//         <div className="flex items-center gap-2">
//           <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center">
//             <div className="w-2 h-2 rounded-sm bg-white" />
//           </div>
//           <span className="font-display text-sm font-bold text-ink2 tracking-tight">NexTrade</span>
//         </div>

//         <div className="flex gap-5">
//           {NAV_LINKS.map(l => (
//             <a key={l.label} href={l.href}
//               className="text-[13px] text-ink3 hover:text-ink2 transition-colors">
//               {l.label}
//             </a>
//           ))}
//           <Link to="/login"  className="text-[13px] text-ink3 hover:text-ink2 transition-colors">Sign in</Link>
//         </div>

//         <p className="font-mono text-[11px] text-ink3">© 2025 NexTrade</p>
//       </footer>
//     </div>
//   )
// }