/**
 * =============================================================================
 * STRIPE CLIENT CONFIGURATION
 * =============================================================================
 *
 * This file initializes and exports the Stripe SDK client for payment processing.
 * Stripe is used in AdStream for handling all monetary transactions between
 * brands and creators.
 *
 * STRIPE'S ROLE IN ADSTREAM:
 * --------------------------
 * 1. BRAND PAYMENTS: When a brand's bid is accepted, they pay through Stripe
 * 2. CREATOR PAYOUTS: Creators receive 80% of deal amounts via Stripe Connect
 * 3. PLATFORM FEES: AdStream retains 20% as platform fee
 *
 * STRIPE CONNECT WORKFLOW:
 * ------------------------
 * - Brands have a Stripe Customer ID for making payments
 * - Creators have a Stripe Connect Account for receiving payouts
 * - Payments are made using PaymentIntents
 * - Payouts are made using Transfers to connected accounts
 *
 * ENVIRONMENT VARIABLES:
 * ----------------------
 * STRIPE_SECRET_KEY: Your Stripe secret API key (starts with 'sk_')
 *   - Use sk_test_* for development/testing
 *   - Use sk_live_* for production
 *
 * IMPORTANT: Never expose the secret key in client-side code!
 * This client should only be used in API routes (server-side).
 *
 * USAGE:
 * ------
 * Import the stripe client in API routes:
 *   import { stripe } from '@/lib/stripe';
 *
 * Example operations:
 *   // Create a payment intent (for charging brands)
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: 10000, // $100.00 in cents
 *     currency: 'usd',
 *     customer: brand.stripeCustomerId,
 *   });
 *
 *   // Transfer funds to creator (for payouts)
 *   const transfer = await stripe.transfers.create({
 *     amount: 8000, // $80.00 in cents (80% of deal)
 *     currency: 'usd',
 *     destination: creator.stripeAccountId,
 *   });
 */

import Stripe from 'stripe';

/**
 * Initialize the Stripe client with configuration.
 *
 * Parameters:
 * - First argument: Secret API key from environment or placeholder for dev
 * - Second argument: Configuration object
 *   - apiVersion: Stripe API version to use (for consistent behavior)
 *
 * NOTE: The 'sk_test_placeholder' fallback is only for development/testing.
 * In production, STRIPE_SECRET_KEY must be properly configured.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20', // Pin to specific API version for stability
});
