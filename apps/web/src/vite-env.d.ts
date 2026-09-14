/// <reference types="vite/client" />

// Razorpay's checkout.js attaches this global at runtime; no official types package.
interface Window {
  Razorpay: any;
}
