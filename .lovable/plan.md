# Beta Readiness Checklist — Optimalstock Pro

## What is already production-ready

| Area | Status |
| --- | --- |
| Landing page + pricing | Live (Basic ₦5k, Distribution ₦8k, Professional ₦15k) |
| Self-serve sign up / sign in / Google OAuth / reset password | Implemented and verified |
| Post-signup onboarding wizard (business → warehouse → products → CSV import) | Implemented |
| Email verification guard | Implemented |
| Dashboard with plan-based feature gating | Implemented; no hardcoded overrides remain |
| Paystack checkout + payment verification + billing page | Implemented with server-side plan/amount safeguards |
| Paystack webhook handler + status page + test button | Implemented; logs all events |
| Inventory CRUD, stock movements, barcode scanning, expiry alerts, reports | Implemented |
| Multi-channel sales tracking + receipt printing with inventory deduction | Implemented |
| Lead intelligence pipeline (acquisition → scoring → CRM stages) | Runs automatically; survey responses are ingested |
| Public live demo | Working |
| Security scan | Clean (no unresolved findings) |
| Production build | Passing |

## What must be configured before beta users can pay

1. **Register the Paystack webhook URL**
   - Copy the URL from `/admin/webhooks`.
   - Paste it into Paystack Dashboard → Settings → API Keys & Webhooks → Test Webhook URL.
   - Repeat for Live Webhook URL once live keys are active.

2. **Swap in the live Paystack secret key**
   - The current `PAYSTACK_SECRET_KEY` is whatever is saved in secrets.
   - Replace it with the live key from Paystack when you are ready to accept real money.

3. **Run one real (or test) end-to-end transaction**
   - Sign up → onboard → choose Basic plan → pay → return to `/payment/verify` → confirm `/billing` shows "Active" with a renewal date.
   - Refresh `/admin/webhooks` and confirm the `charge.success` event is logged as "Processed".

## What we should fix/improve before beta

1. **Post-email-verification redirect**
   - The auth redirect currently sends users to `/` after confirming email. For a new user this drops them out of the onboarding funnel. It should redirect to `/onboarding` or `/dashboard` depending on whether they have inventory.

2. **Post-Google-sign-in redirect**
   - We store `post_auth_redirect` in `sessionStorage` before the OAuth redirect, but the app does not read it and navigate after the user returns. The redirect URL is currently just `window.location.origin`. This means a user who clicked "Choose Distribution" and signed up via Google lands back on the homepage instead of `/checkout?plan=distribution`.

3. **Google OAuth provider configuration**
   - Google sign-in requires the Google provider to be configured in the backend the same turn it is first used. This needs to be verified (the knowledge file says to configure Google provider the same turn or first sign-in errors "Unsupported provider").

4. **Email verification policy check**
   - Confirm email confirmation is required for new signups in the backend. If auto-confirm is enabled, the verification guard is unnecessary. The current `useAuth` flow does not enforce confirmed email before the guard redirects to `/auth`.

5. **Trial/seed data for beta users**
   - Consider giving new beta users a 14-day free trial or automatically assigning a temporary "trial" plan so they can test Distribution/Professional features before paying. Right now the first user experience is locked to Basic until they pay.

6. **Support contact verification**
   - `support@optimalstockpro.com` is referenced in multiple places (billing, payment failure, webhook status). Verify this inbox is monitored before beta.

7. **Terms / Privacy / Cookie policy review**
   - The pages exist. Before beta, review them for accuracy: NDPR compliance, subscription terms, refund policy, actual data usage, and contact details.

## Recommended beta launch sequence

1. Merge or publish all pending changes.
2. Configure the backend Google OAuth provider and confirm email verification is required.
3. Fix the email-verification and Google redirects.
4. Register Paystack test webhook URL and run a test payment.
5. Switch to Paystack live keys and live webhook URL.
6. Run one real ₦5,000 payment end-to-end and verify the dashboard unlocks Basic features.
7. Optionally add a 14-day trial flag so beta testers can access paid features before paying.
8. Announce beta to the first cohort and monitor `/admin/webhooks`, `/billing`, and the Lead Intelligence dashboard.
