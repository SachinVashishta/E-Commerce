# Payment Fix - Order POST Error

Status: 🔄 In Progress

## Steps:

- [✅] 1. Fix PaymentModal: Add explicit auth header to axios call
- [ ] 2. Verify API_URL includes '/api' prefix
- [ ] 3. Test payment flow, check Network tab
- [ ] 4. Verify order appears in Profile
- [ ] 5. Complete ✅

## Root Cause

Frontend `POST ${API_URL}/orders` missing `Authorization: Bearer token`
Backend requires `protect` middleware on `/api/orders`
