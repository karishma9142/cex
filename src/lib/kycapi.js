import api from './api'

// Mirrors backend/routes/kycRoutes.js

/**
 * Submit (or resubmit after a rejection) KYC documents.
 * fields: { fullName, dob, country, documentType, documentNumber }
 * files:  { documentFront, documentBack?, selfieImage }  (File objects)
 */
export const submitKyc = (fields, files) => {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  if (files.documentFront) form.append('documentFront', files.documentFront)
  if (files.documentBack)  form.append('documentBack',  files.documentBack)
  if (files.selfieImage)   form.append('selfieImage',   files.selfieImage)

  return api.post('/kyc', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getMyKyc = () =>
  api.get('/kyc/me').then(r => r.data)

// ── Admin ──────────────────────────────────────────────────────
export const listKyc = (params = {}) =>
  api.get('/kyc', { params }).then(r => r.data)

export const reviewKyc = (userId, action, reason) =>
  api.patch(`/kyc/${userId}`, { action, reason }).then(r => r.data)