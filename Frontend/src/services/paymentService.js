import { nodeApi } from './api';

// plan must be one of the backend's PlanType values: 'growth' | 'business'
export const createSubscription = (plan) =>
  nodeApi.post('/payments/subscribe', { plan });

// Lightweight read of current status — safe to call often while polling
export const getPaymentStatus = (paymentId) =>
  nodeApi.get(`/payments/${paymentId}/status`);

// Forces an immediate check against Bakong (heavier — use for an
// explicit "I've paid" click, not on every poll tick)
export const checkPaymentNow = (paymentId) =>
  nodeApi.post(`/payments/${paymentId}/check`);

// Current user's active subscription, or null if none/expired
export const getMySubscription = () =>
  nodeApi
    .get('/payments/subscription/me')
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });

// The QR endpoint is behind auth, so it can't be used directly as an
// <img src>. Fetch it as a blob and hand back an object URL instead.
// Remember to URL.revokeObjectURL(...) the result when you're done with it.
export const getPaymentQrImageUrl = (paymentId) =>
  nodeApi
    .get(`/payments/${paymentId}/qr-image`, { responseType: 'blob' })
    .then((res) => URL.createObjectURL(res.data));