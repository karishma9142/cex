import api from './api'

// Mirrors backend/routes/orderRoutes.js (protected)

export const placeOrder = (order) =>
  api.post('/orders', order).then(r => r.data)

export const cancelOrder = (orderId) =>
  api.delete(`/orders/${orderId}`).then(r => r.data)

export const getMyOrders = (params = {}) =>
  api.get('/orders/my', { params }).then(r => r.data)

export const getOrder = (orderId) =>
  api.get(`/orders/my/${orderId}`).then(r => r.data)