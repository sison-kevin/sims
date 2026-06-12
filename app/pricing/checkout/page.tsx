import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/pricing/checkout-page-client";

export default function PricingCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
