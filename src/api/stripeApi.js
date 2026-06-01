import { api, API_BASE } from './client';

/**
 * Create a Stripe Checkout Session for the given price ID.
 * Returns the session URL to which the client should be redirected.
 */
export async function createCheckoutSession({ priceId }) {
  const data = await api.post('/stripe/create-checkout-session', { priceId });
  return data; // { url: 'https://checkout.stripe.com/...' }
}
