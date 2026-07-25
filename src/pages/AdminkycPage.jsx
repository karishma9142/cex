import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { listKyc, reviewKyc } from '../lib/kycApi'

const STATUS_TABS = ['PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED']

function ReviewRow({ user, onReviewed }) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const { kycData } = user

  async function handleApprove() {
    setBusy(true)
    try {
      await reviewKyc(user._id, 'approve')
      onReviewed()
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!reason.trim()) return
    setBusy(true)
    try {
      await reviewKyc(user._id, 'reject', reason.trim())
      onReviewed()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border border-border rounded-2xl bg-bg2 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-bold text-ink">{kycData?.fullName ?? user.userName}</p>
          <p className="text-xs font-mono text-ink3">{user.email}</p>
        </div>
        <span className="text-[11px] font-mono text-ink3 shrink-0">
          {kycData?.submittedAt ? new Date(kycData.submittedAt).toLocaleString('en-IN') : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div><span className="text-ink3">Document</span><br/><span className="text-ink">{kycData?.documentType}</span></div>
        <div><span className="text-ink3">Number</span><br/><span className="text-ink">{kycData?.documentNumber}</span></div>
        <div><span className="text-ink3">DOB</span><br/><span className="text-ink">{kycData?.dob ? new Date(kycData.dob).toLocaleDateString('en-IN') : '—'}</span></div>
        <div><span className="text-ink3">Country</span><br/><span className="text-ink">{kycData?.country}</span></div>
      </div>

      <div className="flex flex-wrap gap-3">
        {kycData?.documentFront && (
          <a href={kycData.documentFront} target="_blank" rel="noreferrer"
            className="text-xs font-mono text-blue hover:text-blue/80 underline underline-offset-2">
            View document front
          </a>
        )}
        {kycData?.documentBack && (
          <a href={kycData.documentBack} target="_blank" rel="noreferrer"
            className="text-xs font-mono text-blue hover:text-blue/80 underline underline-offset-2">
            View document back
          </a>
        )}
        {kycData?.selfieImage && (
          <a href={kycData.selfieImage} target="_blank" rel="noreferrer"
            className="text-xs font-mono text-blue hover:text-blue/80 underline underline-offset-2">
            View selfie
          </a>
        )}
      </div>

      {user.kycStatus === 'PENDING' && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          {rejecting ? (
            <div className="flex flex-col gap-2">
              <input value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Reason for rejection"
                className="bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none
                  focus:border-blue/40 placeholder:text-ink3" />
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={busy || !reason.trim()}
                  className="flex-1 h-9 rounded-lg text-xs font-semibold bg-red/90 hover:bg-red text-bg
                    disabled:opacity-50">
                  Confirm reject
                </button>
                <button onClick={() => setRejecting(false)} disabled={busy}
                  className="h-9 px-4 rounded-lg text-xs font-semibold text-ink2 hover:text-ink">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleApprove} disabled={busy}
                className="flex-1 h-9 rounded-lg text-xs font-semibold bg-green/90 hover:bg-green text-bg
                  disabled:opacity-50">
                {busy ? 'Working…' : 'Approve'}
              </button>
              <button onClick={() => setRejecting(true)} disabled={busy}
                className="flex-1 h-9 rounded-lg text-xs font-semibold border border-border2 text-ink
                  hover:border-red/40 hover:text-red disabled:opacity-50">
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {user.kycStatus === 'REJECTED' && kycData?.rejectedReason && (
        <p className="text-xs font-mono text-red pt-2 border-t border-border">
          Rejected: {kycData.rejectedReason}
        </p>
      )}
    </div>
  )
}

export default function AdminKycPage() {
  const [status, setStatus] = useState('PENDING')
  const [page, setPage] = useState(1)

  const { data, loading, refetch } = usePolling(
    () => listKyc({ status, page, limit: 10 }),
    { intervalMs: 8000, deps: [status, page] }
  )

  function changeStatus(s) {
    setStatus(s)
    setPage(1)
  }

  return (
    <DashboardLayout title="KYC review queue">
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => changeStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors duration-150
              ${status === s ? 'bg-blue/10 text-blue border border-blue/20' : 'text-ink2 border border-border hover:text-ink'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink3 text-sm font-mono">Loading…</p>}

      {!loading && (data?.users ?? []).length === 0 && (
        <div className="border border-border rounded-2xl bg-bg2 px-5 py-10 text-center text-ink2 text-sm">
          No submissions with status {status.replace('_', ' ').toLowerCase()}.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {(data?.users ?? []).map(u => (
          <ReviewRow key={u._id} user={u} onReviewed={refetch} />
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30">← Prev</button>
          <span className="text-xs font-mono text-ink3">Page {data.page} / {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
            className="text-xs font-mono text-ink2 hover:text-ink disabled:opacity-30">Next →</button>
        </div>
      )}
    </DashboardLayout>
  )
}