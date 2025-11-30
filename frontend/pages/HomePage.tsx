import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  TrendingUp, 
  Fingerprint, 
  Star, 
  ArrowRight,
  Sparkles,
  Award,
  BarChart3
} from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useSilverPrice } from '@/hooks/useSilverPrice';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';

/**
 * HomePage Component
 * 
 * Implements luxury e-commerce best practices:
 * - Hero section with value proposition
 * - Trust indicators
 * - Featured products
 * - Real-time pricing
 * - Social proof
 * - Clear CTAs
 */
export function HomePage() {
  const { data: featured, isLoading } = useFeaturedProducts(8);
  const { data: silverPrice } = useSilverPrice();
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.3 });
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.2, freezeOnceVisible: true });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-silver-50 to-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-silver-400) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: heroVisible ? 1 : 0, scale: heroVisible ? 1 : 0.8 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-silver-100 to-gold-light px-4 py-2 rounded-full mb-6"
            >
              <Award className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-gray-800">
                برترین فروشگاه نقره در ایران
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              سرمایه‌گذاری
              <br />
              <span className="bg-gradient-to-r from-silver-600 via-gray-700 to-silver-600 bg-clip-text text-transparent">
                امن و سودآور
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              خرید و فروش محصولات نقره با تضمین بازخرید
              <br />
              همراه با شماره سریال یکتا و قیمت‌گذاری لحظه‌ای
            </p>

            {/* Live Silver Price */}
            {silverPrice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: heroVisible ? 1 : 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-10 border border-silver-200"
              >
                <TrendingUp className="w-5 h-5 text-gold" />
                <div className="text-right">
                  <span className="text-sm text-gray-600">قیمت لحظه‌ای نقره:</span>
                  <span className="text-lg font-bold text-gray-900 mx-2">
                    {new Intl.NumberFormat('fa-IR').format(silverPrice.irt)}
                  </span>
                  <span className="text-sm text-gray-600">تومان</span>
                  <span className={`text-sm mx-2 ${
                    silverPrice.changePercent24h > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({silverPrice.changePercent24h > 0 ? '+' : ''}
                    {silverPrice.changePercent24h.toFixed(2)}%)
                  </span>
                </div>
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: heroVisible ? 1 : 0, y: heroVisible ? 0 : 20 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                asChild
                size="lg"
                className="group bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-700 hover:to-silver-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/products">
                  مشاهده محصولات
                  <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-silver-400 text-silver-800 hover:bg-silver-50"
              >
                <Link to="/value">
                  ارزیابی آنلاین
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-silver-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-silver-600 rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: featuresVisible ? 1 : 0, y: featuresVisible ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              چرا نقره سود؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              بهترین راه‌کار برای حفظ ارزش دارایی‌های شما
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'تضمین بازخرید',
                description: 'بازخرید همه محصولات با قیمت روز بازار',
                color: 'from-green-500 to-emerald-600',
              },
              {
                icon: Fingerprint,
                title: 'شماره سریال یکتا',
                description: 'هر محصول دارای شناسه منحصر به فرد و قابل ردیابی',
                color: 'from-blue-500 to-indigo-600',
              },
              {
                icon: BarChart3,
                title: 'قیمت‌گذاری لحظه‌ای',
                description: 'بر اساس نرخ جهانی نقره به‌روزرسانی می‌شود',
                color: 'from-purple-500 to-pink-600',
              },
              {
                icon: Star,
                title: 'ارزیابی آنلاین',
                description: 'بررسی و ارزیابی محصولات با شماره سریال',
                color: 'from-orange-500 to-red-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: featuresVisible ? 1 : 0, 
                  y: featuresVisible ? 0 : 30 
                }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-silver-400 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-gold" />
                محصولات ویژه
              </h2>
              <p className="text-lg text-gray-600">
                برگزیده‌ترین محصولات برای سرمایه‌گذاری
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/products">
                مشاهده همه
                <ArrowRight className="w-4 h-4 mr-2" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-96 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured?.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-silver-600 via-gray-700 to-silver-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(45deg, transparent 45%, white 45%, white 55%, transparent 55%)`,
            backgroundSize: '20px 20px',
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              آماده سرمایه‌گذاری هستید؟
            </h2>
            <p className="text-xl mb-10 text-gray-200">
              با نقره سود، امنیت مالی خود را تضمین کنید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Link to="/products">
                  شروع خرید
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link to="/about">
                  درباره ما
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
