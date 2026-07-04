import api from './api'

// Mirrors backend/routes/walletRoutes.js

export const getWallet = () =>
  api.get('/wallet').then(r => r.data)

export const deposit = (asset, amount, extra = {}) =>
  api.post('/wallet/deposit', { asset, amount, ...extra }).then(r => r.data)

export const withdraw = (asset, amount) =>
  api.post('/wallet/withdraw', { asset, amount }).then(r => r.data)

export const getTransactions = (params = {}) =>
  api.get('/wallet/transactions', { params }).then(r => r.data)