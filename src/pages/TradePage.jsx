import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { getMarket, getOrderbook, getRecentTrades, getTicker } from '../lib/marketsApi'
import { placeOrder, cancelOrder, getMyOrders } from '../lib/ordersApi'
import { pathToSymbol } from '../lib/symbol'

function fmt(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits })
}

// ─── Orderbook ladder ───────────────────────────────────────
function Ladder({ title, rows, side }) {
  const maxQty = Math.max(1, ...rows.map(r => r.qty))
  return (
    <div className="flex-1">
      <p className="text-[11px] font-mono uppercase tracking-widest text-ink3 mb-2 px-1">{title}</p>
      <div className="flex flex-col gap-0.5">
        {rows.length === 0 && (
          <p className="text-xs text-ink3 font-mono px-1 py-4 text-center">No orders</p>
        )}
        {rows.slice(0, 12).map((r, i) => (
          <div key={i} className="relative flex items-center justify-between px-2 py-1 rounded text-xs font-mono">
            <div
              className={`absolute inset-0 rounded ${side === 'bid' ? 'bg-green/10' : 'bg-red/10'}`}
              style={{ width: `${Math.min(100, (r.qty / maxQty) * 100)}%`, [side === 'bid' ? 'right' : 'left']: 0, left: side === 'bid' ? 'auto' : 0 }}
            />
            <span className={`relative z-10 ${side === 'bid' ? 'text-green' : 'text-red'}`}>{fmt(r.price)}</span>
            <span className="relative z-10 text-ink2">{fmt(r.qty, 6)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Place order form ────────────────────────────────────────
function OrderForm({ market, symbol, onPlaced }) {
  const [side, setSide]   = useState('buy')
  const [type, setType]   = useState('limit')
  const [price, setPrice] = useState('')
  const [qty, setQty]     = useState('')
  const [busy, setBusy]   = useState(false)
  const [msg, setMsg]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)

    if (!market?._id) {
      setMsg({ type: 'error', text: 'Market not loaded yet' })
      return
    }
    const qtyNum   = Number(qty)
    const priceNum = Number(price)
    if (!qtyNum || qtyNum <= 0) {
      setMsg({ type: 'error', text: 'Enter a quantity greater than 0' })
      return
    }
    if (type === 'limit' && (!priceNum || priceNum <= 0)) {
      setMsg({ type: 'error', text: 'Enter a price greater than 0' })
      return
    }

    setBusy(true)
    try {
      const body = {
        side, type, symbol,
        stockId: market._id,
        qty: qtyNum,
        ...(type === 'limit' ? { price: priceNum } : {}),
      }
      const res = await placeOrder(body)
      setMsg({ type: 'success', text: `Order ${res.order?.status ?? 'placed'} — ${res.fills?.length ?? 0} fill(s)` })
      setQty('')
      onPlaced?.()
    } catch (err) {
      const data = err.response?.data
      const text = data?.errors?.map(e => e.message).join(', ') ?? data?.message ?? 'Order failed'
      setMsg({ type: 'error', text })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-2xl bg-bg2 p-5 flex flex-col gap-4">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-bg3 rounded-xl">
        <button type="button" onClick={() => setSide('buy')}
          className={`h-9 rounded-lg text-sm font-semibold transition-all duration-150
            ${side === 'buy' ? 'bg-green/90 text-bg' : 'text-ink2 hover:text-ink'}`}>
          Buy
        </button>
        <button type="button" onClick={() => setSide('sell')}
          className={`h-9 rounded-lg text-sm font-semibold transition-all duration-150
            ${side === 'sell' ? 'bg-red/90 text-bg' : 'text-ink2 hover:text-ink'}`}>
          Sell
        </button>
      </div>

      {/* Limit / Market toggle */}
      <div className="flex gap-4 text-xs font-mono">
        {['limit', 'market'].map(t => (
          <label key={t} className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="type" checked={type === t} onChange={() => setType(t)}
              className="accent-blue" />
            <span className={`capitalize ${type === t ? 'text-ink' : 'text-ink3'}`}>{t}</span>
          </label>
        ))}
      </div>

      {type === 'limit' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
            Price ({market?.quoteAsset ?? '—'})
          </label>
          <input type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
              focus:border-blue/40 font-mono placeholder:text-ink3" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
          Quantity ({market?.baseAsset ?? '—'})
        </label>
        <input type="number" min="0" step="any" value={qty} onChange={e => setQty(e.target.value)}
          placeholder="0.00"
          className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
            focus:border-blue/40 font-mono placeholder:text-ink3" />
      </div>

      {msg && (
        <p className={`text-xs font-mono ${msg.type === 'error' ? 'text-red' : 'text-green'}`}>{msg.text}</p>
      )}

      <button type="submit" disabled={busy}
        className={`h-11 rounded-lg text-sm font-semibold transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${side === 'buy' ? 'bg-green/90 hover:bg-green text-bg' : 'bg-red/90 hover:bg-red text-bg'}`}>
        {busy ? 'Placing…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${market?.baseAsset ?? ''}`}
      </button>
    </form>
  )
}

export default function TradePage() {
  const { symbol: symbolPath } = useParams()
  const symbol = pathToSymbol(symbolPath ?? '')

  const { data: market } = usePolling(() => getMarket(symbol), { intervalMs: 20000, deps: [symbol] })
  const { data: ticker }    = usePolling(() => getTicker(symbol), { intervalMs: 3000, deps: [symbol] })
  const { data: book }      = usePolling(() => getOrderbook(symbol), { intervalMs: 2000, deps: [symbol] })
  const { data: trades }    = usePolling(() => getRecentTrades(symbol, 25), { intervalMs: 3000, deps: [symbol] })
  const { data: myOrdersRes, refetch: refetchOrders } = usePolling(
    () => getMyOrders({ symbol, status: 'open', limit: 20 }),
    { intervalMs: 4000, deps: [symbol] }
  )

  const [cancelling, setCancelling] = useState(null)

  async function handleCancel(orderId) {
    setCancelling(orderId)
    try {
      await cancelOrder(orderId)
      refetchOrders()
    } catch {
      // surfaced implicitly by the order staying in the list
    } finally {
      setCancelling(null)
    }
  }

  const bids = book?.bids ?? []
  const asks = book?.asks ?? []
  const sortedBids = [...bids].sort((a, b) => b.price - a.price)
  const sortedAsks = [...asks].sort((a, b) => a.price - b.price)

  return (
    <DashboardLayout
      title={symbol}
      actions={
        <div className="flex items-center gap-3 font-mono text-sm">
          {ticker?.lastPrice != null ? (
            <>
              <span className="text-ink font-semibold">{fmt(ticker.lastPrice)}</span>
              <span className={ticker.change24h >= 0 ? 'text-green' : 'text-red'}>
                {ticker.change24h >= 0 ? '▲' : '▼'} {fmt(Math.abs(ticker.change24h))}%
              </span>
            </>
          ) : (
            <span className="text-ink3">No trades in last 24h</span>
          )}
        </div>
      }
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* ── Left column: orderbook + trades ── */}
        <div className="flex flex-col gap-5">
          <div className="border border-border rounded-2xl bg-bg2 p-5">
            <div className="flex gap-6">
              <Ladder title="Bids" rows={sortedBids} side="bid" />
              <Ladder title="Asks" rows={sortedAsks} side="ask" />
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-bg2 p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-ink3 mb-3">Recent trades</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono uppercase tracking-widest text-ink3 pb-2 border-b border-border">
              <span>Price</span><span className="text-right">Qty</span><span className="text-right">Time</span>
            </div>
            <div className="flex flex-col max-h-64 overflow-y-auto">
              {(trades ?? []).length === 0 && (
                <p className="text-xs text-ink3 font-mono py-6 text-center">No trades yet</p>
              )}
              {(trades ?? []).map(t => (
                <div key={t._id} className="grid grid-cols-3 gap-2 py-1.5 text-xs font-mono">
                  <span className="text-ink">{fmt(t.price)}</span>
                  <span className="text-right text-ink2">{fmt(t.qty, 6)}</span>
                  <span className="text-right text-ink3">{new Date(t.createdAt).toLocaleTimeString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open orders for this symbol */}
          <div className="border border-border rounded-2xl bg-bg2 overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="font-display text-sm font-bold text-ink">Open orders — {symbol}</p>
            </div>
            {(myOrdersRes?.orders ?? []).length === 0 && (
              <div className="px-5 py-8 text-center text-ink2 text-sm">No open orders on this market.</div>
            )}
            {(myOrdersRes?.orders ?? []).map(o => (
              <div key={o._id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className={`uppercase ${o.side === 'buy' ? 'text-green' : 'text-red'}`}>{o.side}</span>
                  <span className="text-ink3">{o.type}</span>
                  <span className="text-ink">{o.price ? fmt(o.price) : 'market'}</span>
                  <span className="text-ink2">{fmt(o.qty - (o.filledQty ?? 0), 6)} left</span>
                </div>
                <button
                  onClick={() => handleCancel(o._id)}
                  disabled={cancelling === o._id}
                  className="text-red/80 hover:text-red disabled:opacity-40"
                >
                  {cancelling === o._id ? 'Cancelling…' : 'Cancel'}
                </button>
              </div>
            ))}
            <div className="px-5 py-2.5 border-t border-border">
              <Link to="/orders" className="text-xs font-mono text-blue hover:text-blue/80">
                View all orders →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right column: order form ── */}
        <div>
          <OrderForm market={market} symbol={symbol} onPlaced={refetchOrders} />
        </div>
      </div>
    </DashboardLayout>
  )
}