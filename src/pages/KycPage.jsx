import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { usePolling } from '../lib/usePolling'
import { getMyKyc, submitKyc } from '../lib/kycApi'

const DOCUMENT_TYPES = [
  { value: 'AADHAAR',         label: 'Aadhaar card',      needsBack: true },
  { value: 'PAN',             label: 'PAN card',          needsBack: false },
  { value: 'PASSPORT',        label: 'Passport',          needsBack: false },
  { value: 'DRIVING_LICENSE', label: 'Driving licence',   needsBack: true },
  { value: 'VOTER_ID',        label: 'Voter ID',          needsBack: true },
]

const STATUS_META = {
  NOT_SUBMITTED: { label: 'Not submitted', style: 'text-ink3 bg-bg3' },
  PENDING:       { label: 'Under review',  style: 'text-yellow-400 bg-yellow-400/10' },
  APPROVED:      { label: 'Verified',      style: 'text-green bg-green/10' },
  REJECTED:      { label: 'Rejected',      style: 'text-red bg-red/10' },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.NOT_SUBMITTED
  return (
    <span className={`text-xs font-mono uppercase px-2.5 py-1 rounded-full ${meta.style}`}>
      {meta.label}
    </span>
  )
}

function FileField({ label, required, file, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">
        {label}{required && <span className="text-red"> *</span>}
      </label>
      <label className="flex items-center justify-between gap-3 bg-bg3 border border-border
        rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:border-blue/40 transition-colors">
        <span className={file ? 'text-ink' : 'text-ink3'}>
          {file ? file.name : 'Choose file (JPG, PNG, or PDF)'}
        </span>
        <span className="text-xs font-mono text-blue shrink-0">Browse</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}

function KycForm({ onSubmitted, rejectedReason }) {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('India')
  const [documentType, setDocumentType] = useState('AADHAAR')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentFront, setDocumentFront] = useState(null)
  const [documentBack, setDocumentBack] = useState(null)
  const [selfieImage, setSelfieImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState([])

  const docMeta = DOCUMENT_TYPES.find(d => d.value === documentType)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    setBusy(true)
    try {
      await submitKyc(
        { fullName, dob, country, documentType, documentNumber },
        { documentFront, documentBack, selfieImage }
      )
      onSubmitted()
    } catch (err) {
      const data = err.response?.data
      setErrors(data?.errors ?? [data?.message ?? 'Submission failed'])
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-2xl bg-bg2 p-6 flex flex-col gap-5 max-w-xl">
      {rejectedReason && (
        <div className="px-4 py-3 rounded-xl border border-red/20 bg-red/5 text-red text-sm">
          Your previous submission was rejected: <span className="font-medium">{rejectedReason}</span>.
          Please review and resubmit below.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Full legal name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="As shown on your ID"
            className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
              focus:border-blue/40 placeholder:text-ink3" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Date of birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)}
            className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
              focus:border-blue/40 font-mono" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Country</label>
          <input value={country} onChange={e => setCountry(e.target.value)}
            className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
              focus:border-blue/40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Document type</label>
          <select value={documentType} onChange={e => setDocumentType(e.target.value)}
            className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
              focus:border-blue/40">
            {DOCUMENT_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono text-ink3 tracking-widest uppercase">Document number</label>
        <input value={documentNumber} onChange={e => setDocumentNumber(e.target.value)}
          placeholder={`${docMeta?.label} number`}
          className="bg-bg3 border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none
            focus:border-blue/40 font-mono placeholder:text-ink3" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FileField label="Document front" required file={documentFront} onChange={setDocumentFront} />
        {docMeta?.needsBack && (
          <FileField label="Document back" required file={documentBack} onChange={setDocumentBack} />
        )}
      </div>

      <FileField label="Selfie holding your document" required file={selfieImage} onChange={setSelfieImage} />

      {errors.length > 0 && (
        <div className="px-4 py-3 rounded-xl border border-red/20 bg-red/5 text-red text-xs font-mono flex flex-col gap-1">
          {errors.map((e, i) => <span key={i}>• {typeof e === 'string' ? e : e.message}</span>)}
        </div>
      )}

      <button type="submit" disabled={busy}
        className="h-11 rounded-lg text-sm font-semibold bg-blue hover:bg-blue/90 text-white
          transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
        {busy ? 'Submitting…' : 'Submit for verification'}
      </button>
    </form>
  )
}

export default function KycPage() {
  const { data, loading, refetch } = usePolling(getMyKyc, { intervalMs: 10000 })
  const status = data?.kycStatus ?? 'NOT_SUBMITTED'
  const kycData = data?.kycData

  return (
    <DashboardLayout title="KYC verification" actions={!loading && <StatusBadge status={status} />}>
      {loading && (
        <div className="text-ink3 text-sm font-mono">Loading…</div>
      )}

      {!loading && (status === 'NOT_SUBMITTED' || status === 'REJECTED') && (
        <KycForm onSubmitted={refetch} rejectedReason={status === 'REJECTED' ? kycData?.rejectedReason : null} />
      )}

      {!loading && status === 'PENDING' && (
        <div className="border border-border rounded-2xl bg-bg2 p-6 max-w-xl flex flex-col gap-3">
          <p className="font-display text-base font-bold text-ink">Verification in progress</p>
          <p className="text-sm text-ink2">
            We've received your documents and they're being reviewed. This usually takes 1–2 business days.
          </p>
          {kycData && (
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs font-mono text-ink2 bg-bg3/50 rounded-xl p-4">
              <span className="text-ink3">Name</span><span className="text-ink">{kycData.fullName}</span>
              <span className="text-ink3">Document</span><span className="text-ink">{kycData.documentType}</span>
              <span className="text-ink3">Submitted</span>
              <span className="text-ink">{new Date(kycData.submittedAt).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      )}

      {!loading && status === 'APPROVED' && (
        <div className="border border-green/20 rounded-2xl bg-green/5 p-6 max-w-xl flex flex-col gap-3">
          <p className="font-display text-base font-bold text-green">You're verified ✓</p>
          <p className="text-sm text-ink2">
            Your identity has been confirmed. Withdrawals are unlocked on your account.
          </p>
          {kycData && (
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs font-mono text-ink2 bg-bg3/50 rounded-xl p-4">
              <span className="text-ink3">Name</span><span className="text-ink">{kycData.fullName}</span>
              <span className="text-ink3">Document</span><span className="text-ink">{kycData.documentType}</span>
              <span className="text-ink3">Approved</span>
              <span className="text-ink">{new Date(kycData.approvedAt).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}