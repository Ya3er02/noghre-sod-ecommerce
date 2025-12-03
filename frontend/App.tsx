import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { env } from '@/lib/env';
import ErrorBoundary from '@/components/ErrorBoundary';
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
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export default function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.1] as [number, number, number]}
          speed={1}
          amplitude={0.6}
          interactive={true}
        >
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <div className="min-h-screen bg-background" dir="rtl">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/value" element={<ValuePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="*" element={
                      <div className="min-h-screen flex items-center justify-center" dir="rtl">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold">۴۰۴</h1>
                          <p className="mt-2">صفحه یافت نشد</p>
                          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
                            بازگشت به صفحه اصلی
                          </Link>
                        </div>
                      </div>
                    } />
                  </Routes>
                </ErrorBoundary>
                <Toaster />
              </div>
            </BrowserRouter>
          </QueryClientProvider>
        </LiquidChrome>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
