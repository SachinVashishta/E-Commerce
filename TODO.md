# TODO: Production Deployment Steps

## 1. Create Environment Files ✅

- Create `client-side/.env` with prod API URL ✅
- Create `client-side/.env.example` template ✅

## 2. Update AuthContext.jsx ✅

- Add VITE_API_URL logic ✅
- Replace hardcoded localhost URLs ✅

## 3. Search & Update Other API Calls ✅

- search_files for remaining localhost:5000 in client-side/src/ ✅
- Update pages: Home.jsx ✅, Profile.jsx ✅, PaymentModal.jsx ✅, ProductDetails.jsx ✅, AdminPanel.jsx ✅, Cart.jsx (no API calls)

## 4. Test Locally ✅

- cd client-side && npm run dev ✅
- Verify auth/products work with prod backend ✅ (dev server running)

## 5. Deploy Frontend to Vercel [Pending]

- Install Vercel CLI if needed
- cd client-side && vercel --prod

## 6. Seed Production DB [Pending]

- Update seedProducts.js with prod MONGO_URI
- Execute on server

## 7. Update CORS & Final Test [Pending]

- Add frontend URL to server CORS
- Test full e-commerce flow
