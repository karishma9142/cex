import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { getMyOrders, cancelOrder, getOrder } from '../lib/ordersApi'

function fmt(n, digits = 6) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits })
}

const STATUS_STYLES = {
  open:              'text-blue bg-blue/10',
  partially_filled:  'text-yellow-400 bg-yellow-400/10',
  filled:            'text-green bg-green/10',
  cancelled:         'text-ink3 bg-bg3',
}

function OrderRow({ order, onCancel, cancelling }) {
  const [expanded, setExpanded] = useState(false)
  const [fills, setFills] = useState(null)
  const cancellable = ['open', 'partially_filled'].includes(order.status)

  async function toggleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && fills === null) {
      try {
        const res = await getOrder(order._id)
        setFills(res.fills ?? [])
      } catch {
        setFills([])
      }
    }
  }

  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={toggleExpand}
        className="w-full grid grid-cols-2 sm:grid-cols-[0.9fr_0.6fr_0.6fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3
          px-5 py-3 text-left hover:bg-bg3/50 transition-colors duration-150">
        <span className="font-mono text-xs text-ink2 col-span-2 sm:col-span-1">
          {new Date(order.createdAt).toLocaleString('en-IN')}
        </span>
        <span className="font-mono text-xs text-ink">{order.symbol}</span>
        <span className={`font-mono text-xs uppercase ${order.side === 'buy' ? 'text-green' : 'text-red'}`}>
          {order.side}
        </span>
        <span className="font-mono text-xs text-ink2 capitalize">{order.type}</span>
        <span className="font-mono text-xs text-ink">{order.price ? fmt(order.price, 2) : 'market'}</span>
        <span className="font-mono text-xs text-ink2">{fmt(order.qty)}</span>
        <span className="flex justify-end">
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${STATUS_STYLES[order.status] ?? ''}`}>
            {order.status.replace('_', ' ')}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-ink3">
            <span>Filled {fmt(order.filledQty ?? 0)} / {fmt(order.qty)}</span>
            {cancellable && (
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(order._id) }}
                disabled={cancelling === order._id}
                className="text-red/80 hover:text-red disabled:opacity-40"
              >
                {cancelling === order._id ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
          </div>
          {fills === null && <p className="text-xs text-ink3 font-mono">Loading fills…</p>}
          {fills?.length === 0 && <p className="text-xs text-ink3 font-mono">No fills yet.</p>}
          {fills?.map(f => (
            <div key={f._id} className="flex items-center justify-between text-xs font-mono text-ink2 bg-bg3/50 rounded-lg px-3 py-2">
              <span>{new Date(f.createdAt).toLocaleTimeString('en-IN')}</span>
              <span>{fmt(f.price, 2)} × {fmt(f.qty)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const [filters, setFilters] = useState({ status: '', side: '', symbol: '' })
  const [page, setPage] = useState(1)
  const [cancelling, setCancelling] = useState(null)

  const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }

  const { data, loading, error, refetch } = usePolling(
    () => getMyOrders(params),
    { intervalMs: 5000, deps: [filters.status, filters.side, filters.symbol, page] }
  )

  async function handleCancel(orderId) {
    setCancelling(orderId)
    try {
      await cancelOrder(orderId)
      refetch()
    } finally {
      setCancelling(null)
    }
  }

  function updateFilter(key, value) {
    setPage(1)
    setFilters(f => ({ ...f, [key]: value }))
  }

  return (
    <DashboardLayout title="Orders">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filters.status} onChange={e => updateFilter('status', e.target.value)}
          className="bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-ink font-mono outline-none focus:border-blue/40">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="partially_filled">Partially filled</option>
          <option value="filled">Filled</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filters.side} onChange={e => updateFilter('side', e.target.value)}
          className="bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-ink font-mono outline-none focus:border-blue/40">
          <option value="">Buy & sell</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input
          value={filters.symbol}
          onChange={e => updateFilter('symbol', e.target.value.toUpperCase())}
          placeholder="Filter by symbol e.g. BTC/INR"
          className="bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-ink font-mono outline-none
            focus:border-blue/40 placeholder:text-ink3 w-56"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-red/20 bg-red/5 text-red text-sm">
          Couldn't load orders — {error.response?.data?.message ?? 'try refreshing'}
        </div>
      )}

      <div className="border border-border rounded-2xl bg-bg2 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[0.9fr_0.6fr_0.6fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3 px-5 py-3
          border-b border-border text-[11px] font-mono uppercase tracking-widest text-ink3">
          <span>Date</span><span>Symbol</span><span>Side</span><span>Type</span>
          <span>Price</span><span>Qty</span><span className="text-right">Status</span>
        </div>

        {loading && <div className="px-5 py-10 text-center text-ink3 text-sm font-mono">Loading orders…</div>}
        {!loading && (data?.orders ?? []).length === 0 && (
          <div className="px-5 py-10 text-center text-ink2 text-sm">
            No orders match these filters yet — place one from the Trade page.
          </div>
        )}

        {(data?.orders ?? []).map(o => (
          <OrderRow key={o._id} order={o} onCancel={handleCancel} cancelling={cancelling} />
        ))}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30">← Prev</button>
            <span className="text-xs font-mono text-ink3">Page {data.page} / {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
              className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}