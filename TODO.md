# Update Frontend for Production Server URL

## Steps:

- [x] 1. Plan approved by user
- [x] 2. Create client-side/.env with VITE_API_URL=https://e-commerce-47.onrender.com/api
- [x] 3. Edit 6 JSX files: Remove localhost fallback, set API_URL = import.meta.env.VITE_API_URL
  - src/context/AuthContext.jsx
  - src/page/Home.jsx
  - src/page/Profile.jsx
  - src/page/AdminPanel.jsx
  - src/page/ProductDetails.jsx
  - src/components/PaymentModal.jsx
- [ ] 4. Test: cd client-side && npm run build (check for env usage)
- [ ] 5. User redeploys client-side to https://e-commerce-0047.onrender.com
- [ ] 6. Verify live API calls work, complete task
