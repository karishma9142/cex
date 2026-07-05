import api from './api'

// Mirrors backend/routes/marketRoutes.js (public reads) +
// order-data endpoints mounted at /api/tickers etc. in server.js
//
// Market symbols look like "BTC/INR". The "/" is a real character in the
// symbol, not a path separator, so it must be percent-encoded (-> "BTC%2FINR")
// before going into a URL path segment. Otherwise `/trades/${symbol}` becomes
// TWO path segments ("/trades/BTC/INR"), which the backend's single
// "/trades/:symbol" route silently 404s on.

export const getMarkets = () =>
  api.get('/markets').then(r => r.data.markets)

export const getMarket = (symbol) =>
  api.get(`/markets/${encodeURIComponent(symbol)}`).then(r => r.data.market)

export const getAllTickers = () =>
  api.get('/tickers').then(r => r.data.tickers)

export const getTicker = (symbol) =>
  api.get(`/ticker/${encodeURIComponent(symbol)}`).then(r => r.data)

export const getOrderbook = (symbol, depth = 20) =>
  api.get(`/orderbook/${encodeURIComponent(symbol)}`, { params: { depth } }).then(r => r.data)

export const getRecentTrades = (symbol, limit = 50) =>
  api.get(`/trades/${encodeURIComponent(symbol)}`, { params: { limit } }).then(r => r.data.trades)

export const getOHLCV = (symbol, interval = '1h', limit = 100) =>
  api.get(`/ohlcv/${encodeURIComponent(symbol)}`, { params: { interval, limit } }).then(r => r.data)