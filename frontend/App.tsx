import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ValuePage from "./pages/ValuePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import LiquidChrome from '@/components/LiquidChrome';

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = "pk_test_Z2l2aW5nLWN1Yi00NC5jbGVyay5hY2NvdW50cy5kZXYk";

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
                      <LiquidChrome baseColor={[0.1, 0.1, 0.1]} speed={0.3} amplitude={0.4} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-background" dir="rtl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/value" element={<ValuePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
