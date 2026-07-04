import api from './api'

// Mirrors backend/routes/marketRoutes.js (public reads) +
// order-data endpoints mounted at /api/tickers etc. in server.js

export const getMarkets = () =>
  api.get('/markets').then(r => r.data.markets)

export const getMarket = (symbol) =>
  api.get(`/markets/${symbol}`).then(r => r.data.market)

export const getAllTickers = () =>
  api.get('/tickers').then(r => r.data.tickers)

export const getTicker = (symbol) =>
  api.get(`/ticker/${symbol}`).then(r => r.data)

export const getOrderbook = (symbol, depth = 20) =>
  api.get(`/orderbook/${symbol}`, { params: { depth } }).then(r => r.data)

export const getRecentTrades = (symbol, limit = 50) =>
  api.get(`/trades/${symbol}`, { params: { limit } }).then(r => r.data.trades)

export const getOHLCV = (symbol, interval = '1h', limit = 100) =>
  api.get(`/ohlcv/${symbol}`, { params: { interval, limit } }).then(r => r.data)