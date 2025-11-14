import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from '@/components/ProductCarousel';
import LiquidChrome from '@/components/LiquidChrome';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, TrendingUp, QrCode } from "lucide-react";

export default function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await backend.product.list({ featured: true, limit: 6, offset: 0 });
      return response.products;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Liquid Chrome Background Effect */}
      <LiquidChrome 
        baseColor={[0.75, 0.75, 0.75]} 
        speed={0.15}
        amplitude={0.25}
        frequencyX={2.5}
        frequencyY={2.5}
        interactive={true}
      />
      
      <Header />
      
      <main className="flex-1">
        <section className="relative py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
              <h1 className="mb-6 text-4xl font-bold text-foreground md:text-6xl">
                سرمایه‌گذاری امن در نقره
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                با نقره سود، هر محصول دارای شماره سریال یکتا و تضمین بازخرید است. سرمایه‌گذاری هوشمندانه را با ما تجربه کنید.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="btn-interactive btn-magnetic">
                  <Link to="/products">
                    مشاهده محصولات
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="btn-interactive">
                  <Link to="/value">ارزش‌یابی محصول</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white/80 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3 stagger-container">
              <div className="flex flex-col items-center text-center card-lift bg-white/90 p-8 rounded-2xl shadow-lg">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 icon-bounce">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">تضمین بازخرید</h3>
                <p className="text-muted-foreground">
                  تضمین بازخرید همه محصولات با قیمت روز بازار
                </p>
              </div>

              <div className="flex flex-col items-center text-center card-lift bg-white/90 p-8 rounded-2xl shadow-lg">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 icon-bounce">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">شماره سریال یکتا</h3>
                <p className="text-muted-foreground">
                  هر محصول با شماره سریال یکتا و قابل ردیابی
                </p>
              </div>

              <div className="flex flex-col items-center text-center card-lift bg-white/90 p-8 rounded-2xl shadow-lg">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 icon-bounce">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">قیمت لحظه‌ای</h3>
                <p className="text-muted-foreground">
                  قیمت‌گذاری بر اساس نرخ روز جهانی نقره
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="bg-white py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center text-4xl font-bold text-foreground animate-fade-in-up">محصولات ویژه</h2>
              <ProductCarousel 
                products={featuredProducts.slice(0, 5)} 
                autoplay={true} 
                autoplayDelay={6000}
              />
            </div>
          </section>
        )}

        {featuredProducts && featuredProducts.length > 0 && (
          <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center text-3xl font-bold text-foreground animate-fade-in-up">محصولات ویژه</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-container">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button asChild variant="outline" className="btn-interactive">
                  <Link to="/products">مشاهده همه محصولات</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}