import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { env } from "@/lib/env";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ValuePage from "./pages/ValuePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import LiquidChrome from '@/components/LiquidChrome';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

const PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.1]}
          speed={1}
          amplitude={0.6}
          interactive={true}>
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
        </LiquidChrome>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
