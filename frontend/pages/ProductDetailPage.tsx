import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");
      return backend.product.get({ slug });
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">محصول یافت نشد</p>
        </main>
        <Footer />
      </div>
    );
  }

  const primaryImage = product.images[0] || { url: "/placeholder.svg", altText: product.name };
  const price = product.currentPriceIrr || product.basePriceIrr;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={primaryImage.url}
                alt={primaryImage.altText || product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">{product.name}</h1>
                <div className="flex items-center gap-2">
                  {product.stockStatus === "IN_STOCK" && (
                    <Badge variant="default">موجود</Badge>
                  )}
                  {product.stockStatus === "OUT_OF_STOCK" && (
                    <Badge variant="destructive">ناموجود</Badge>
                  )}
                  {product.stockStatus === "PRE_ORDER" && (
                    <Badge>پیش‌فروش</Badge>
                  )}
                </div>
              </div>

              <div className="border-t border-b py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{formatPrice(price)}</span>
                  <span className="text-muted-foreground">تومان</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">مشخصات</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">وزن:</span>
                    <span className="font-medium text-foreground">{product.weightG} گرم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عیار:</span>
                    <span className="font-medium text-foreground">{product.fineness}</span>
                  </div>
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ابعاد:</span>
                      <span className="font-medium text-foreground">{product.dimensions}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">شناسه محصول:</span>
                    <span className="font-medium text-foreground">{product.sku}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">توضیحات</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>

              <Button 
                size="lg" 
                className="w-full"
                disabled={product.stockStatus === "OUT_OF_STOCK"}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                افزودن به سبد خرید
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
