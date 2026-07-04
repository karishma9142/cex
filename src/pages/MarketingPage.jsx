import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { getMarkets, getAllTickers } from '../lib/marketsApi'
import { symbolToPath } from '../lib/symbol'

function fmt(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits })
}

function ChangeBadge({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-ink3 font-mono text-xs">—</span>
  }
  const up = value >= 0
  return (
    <span className={`font-mono text-xs px-1.5 py-0.5 rounded-md
      ${up ? 'text-green bg-green/10' : 'text-red bg-red/10'}`}>
      {up ? '▲' : '▼'} {fmt(Math.abs(value))}%
    </span>
  )
}

export default function MarketsPage() {
  const { data: markets, loading: loadingMarkets, error: marketsError } =
    usePolling(getMarkets, { intervalMs: 15000 })

  const { data: tickers } = usePolling(getAllTickers, { intervalMs: 4000 })

  const tickerBySymbol = new Map((tickers ?? []).map(t => [t.symbol, t]))

  return (
    <DashboardLayout title="Markets">
      {marketsError && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-red/20 bg-red/5 text-red text-sm">
          Couldn't load markets — {marketsError.response?.data?.message ?? 'is the API running?'}
        </div>
      )}

      <div className="border border-border rounded-2xl bg-bg2 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3
          border-b border-border text-[11px] font-mono uppercase tracking-widest text-ink3">
          <span>Market</span>
          <span className="text-right">Last price</span>
          <span className="text-right">24h change</span>
          <span className="text-right">24h high</span>
          <span className="text-right">24h low</span>
          <span className="text-right">24h volume</span>
        </div>

        {loadingMarkets && (
          <div className="px-5 py-10 text-center text-ink3 text-sm font-mono">Loading markets…</div>
        )}

        {!loadingMarkets && markets?.length === 0 && (
          <div className="px-5 py-10 text-center text-ink2 text-sm">
            No markets yet. Ask an admin to create one via <code className="font-mono text-ink3">POST /api/markets</code>.
          </div>
        )}

        {markets?.map(m => {
          const t = tickerBySymbol.get(m.symbol)
          return (
            <Link
              key={m.symbol}
              to={`/trade/${symbolToPath(m.symbol)}`}
              className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-4
                border-b border-border last:border-b-0 hover:bg-bg3/60 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-bg3 border border-border2 flex items-center
                  justify-center text-xs font-bold text-blue shrink-0">
                  {m.baseAsset[0]}
                </div>
                <div>
                  <p className="font-mono text-sm text-ink font-medium">{m.symbol}</p>
                  <p className={`text-[11px] font-mono
                    ${m.status === 'active' ? 'text-green' : 'text-ink3'}`}>
                    {m.status}
                  </p>
                </div>
              </div>
              <span className="text-right font-mono text-sm text-ink self-center">
                {t?.lastPrice != null ? fmt(t.lastPrice) : 'No trades'}
              </span>
              <span className="text-right self-center">
                <ChangeBadge value={t?.change24h} />
              </span>
              <span className="text-right font-mono text-sm text-ink2 self-center">{fmt(t?.high24h)}</span>
              <span className="text-right font-mono text-sm text-ink2 self-center">{fmt(t?.low24h)}</span>
              <span className="text-right font-mono text-sm text-ink2 self-center">{fmt(t?.volume24h, 4)}</span>
            </Link>
          )
        })}
      </div>
    </DashboardLayout>
  )
}