# Cart Navigation Fix

## Issue: "Go to Cart" navigates to Product Details not Cart

**Root Cause:** Card has `onClick={() => navigate('/product/${id}')}` on entire container  
**"Go to Cart" Link blocked by parent onClick**

**Plan:**

1. [ ] Fix ProductCard.jsx: Prevent event bubbling on cart button
2. [ ] Test navigation to /cart ✓

**Status:** Ready to fix
