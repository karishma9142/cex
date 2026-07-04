import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { getWallet, deposit, withdraw, getTransactions } from '../lib/walletApi'

const ASSETS = ['INR', 'BTC', 'ETH', 'SOL']

function fmt(n, digits = 4) {
  if (n === null || n === undefined || Number.isNaN(n)) return '0'
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits })
}

function reshapeWallet(raw) {
  const out = {}
  for (const asset of ASSETS) {
    out[asset] = {
      available: Number(raw?.[`${asset}_available`] ?? 0),
      locked:    Number(raw?.[`${asset}_locked`] ?? 0),
    }
  }
  return out
}

function AssetCard({ asset, balance }) {
  return (
    <div className="border border-border rounded-2xl bg-bg2 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-sm text-ink font-medium">{asset}</span>
        <div className="w-7 h-7 rounded-lg bg-bg3 border border-border2 flex items-center
          justify-center text-[11px] font-bold text-blue">
          {asset[0]}
        </div>
      </div>
      <p className="font-mono text-2xl text-ink font-semibold mb-1">
        {fmt(balance.available, asset === 'INR' ? 2 : 6)}
      </p>
      <p className="text-[11px] text-ink3 font-mono uppercase tracking-wide">Available</p>
      {balance.locked > 0 && (
        <p className="mt-3 text-xs text-ink2 font-mono">
          {fmt(balance.locked, asset === 'INR' ? 2 : 6)} locked in open orders
        </p>
      )}
    </div>
  )
}

function TransferForm({ mode, onSubmit }) {
  const [asset, setAsset] = useState('INR')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    const value = Number(amount)
    if (!value || value <= 0) {
      setMsg({ type: 'error', text: 'Enter an amount greater than 0' })
      return
    }
    setBusy(true)
    try {
      const res = await onSubmit(asset, value)
      setMsg({ type: 'success', text: res.message ?? `${mode === 'deposit' ? 'Deposited' : 'Withdrew'} ${value} ${asset}` })
      setAmount('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message ?? `${mode} failed` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-2xl bg-bg2 p-5 flex flex-col gap-4">
      <p className="font-display text-sm font-bold text-ink capitalize">{mode}</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Asset</label>
        <select
          value={asset}
          onChange={e => setAsset(e.target.value)}
          className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
            focus:border-blue/40 font-mono"
        >
          {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Amount</label>
        <input
          type="number" min="0" step="any" value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
            focus:border-blue/40 font-mono placeholder:text-ink3"
        />
      </div>

      {msg && (
        <p className={`text-xs font-mono ${msg.type === 'error' ? 'text-red' : 'text-green'}`}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className={`h-10 rounded-lg text-sm font-semibold transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${mode === 'deposit'
            ? 'bg-green/90 hover:bg-green text-bg'
            : 'bg-bg3 border border-border2 hover:border-red/40 hover:text-red text-ink'}`}
      >
        {busy ? 'Processing…' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
      </button>
    </form>
  )
}

export default function WalletPage() {
  const { data, loading, error, refetch } = usePolling(getWallet, { intervalMs: 5000 })
  const [page, setPage] = useState(1)
  const { data: txData, refetch: refetchTx } = usePolling(
    () => getTransactions({ page, limit: 10 }),
    { intervalMs: 8000, deps: [page] }
  )

  const balances = reshapeWallet(data?.wallet)

  async function handleDeposit(asset, amount) {
    const res = await deposit(asset, amount)
    refetch(); refetchTx()
    return res
  }
  async function handleWithdraw(asset, amount) {
    const res = await withdraw(asset, amount)
    refetch(); refetchTx()
    return res
  }

  return (
    <DashboardLayout title="Wallet">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-red/20 bg-red/5 text-red text-sm">
          Couldn't load wallet — {error.response?.data?.message ?? 'try refreshing'}
        </div>
      )}

      {/* Balances */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? ASSETS.map(a => (
              <div key={a} className="border border-border rounded-2xl bg-bg2 p-5 h-[132px] animate-pulse" />
            ))
          : ASSETS.map(a => <AssetCard key={a} asset={a} balance={balances[a]} />)}
      </div>

      {/* Deposit / withdraw */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <TransferForm mode="deposit" onSubmit={handleDeposit} />
        <TransferForm mode="withdraw" onSubmit={handleWithdraw} />
      </div>

      {/* Transaction history */}
      <div className="border border-border rounded-2xl bg-bg2 overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="font-display text-sm font-bold text-ink">Transaction history</p>
        </div>

        <div className="hidden sm:grid grid-cols-[1fr_0.7fr_0.7fr_1fr_0.7fr] gap-3 px-5 py-3
          border-b border-border text-[11px] font-mono uppercase tracking-widest text-ink3">
          <span>Date</span>
          <span>Type</span>
          <span>Asset</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>

        {(txData?.transactions ?? []).length === 0 && (
          <div className="px-5 py-10 text-center text-ink2 text-sm">No transactions yet.</div>
        )}

        {(txData?.transactions ?? []).map(tx => (
          <div key={tx._id} className="grid grid-cols-2 sm:grid-cols-[1fr_0.7fr_0.7fr_1fr_0.7fr] gap-3
            px-5 py-3 border-b border-border last:border-b-0 text-sm">
            <span className="font-mono text-xs text-ink2 col-span-2 sm:col-span-1">
              {new Date(tx.createdAt).toLocaleString('en-IN')}
            </span>
            <span className={`font-mono text-xs capitalize ${tx.type === 'deposit' ? 'text-green' : 'text-red'}`}>
              {tx.type}
            </span>
            <span className="font-mono text-xs text-ink">{tx.asset}</span>
            <span className="text-right font-mono text-xs text-ink">{fmt(tx.amount)}</span>
            <span className="text-right font-mono text-xs text-ink3 capitalize">{tx.status}</span>
          </div>
        ))}

        {txData && txData.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs font-mono text-ink3">Page {txData.page} / {txData.pages}</span>
            <button
              onClick={() => setPage(p => Math.min(txData.pages, p + 1))}
              disabled={page >= txData.pages}
              className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}