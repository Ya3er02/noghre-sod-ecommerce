import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Check,
  Star,
  ShieldCheck,
  Fingerprint,
  Scale,
  Award,
  TrendingUp,
  Info
} from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

/**
 * Product Detail Page
 * 
 * Implements luxury product page best practices:
 * - High-quality image gallery with zoom
 * - Detailed specifications
 * - Serial number display
 * - Buyback guarantee info
 * - Related products
 * - Reviews and ratings
 * - Social sharing
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);
  const cart = useCart();
  const favorites = useFavorites();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton h-96 rounded-xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          محصول یافت نشد
        </h2>
        <Button onClick={() => navigate('/products')}>
          بازگشت به محصولات
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    cart.addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    }
  };

  const discountPercent = product.discount || 
    (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-silver-700">خانه</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link to="/products" className="hover:text-silver-700">محصولات</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              className="relative bg-white rounded-2xl overflow-hidden shadow-lg aspect-square"
              whileHover={{ scale: isImageZoomed ? 1 : 1.02 }}
            >
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge variant="success">جدید</Badge>
                )}
                {discountPercent > 0 && (
                  <Badge variant="error">{discountPercent}% تخفیف</Badge>
                )}
              </div>

              {/* Zoom button */}
              <button
                onClick={() => setIsImageZoomed(!isImageZoomed)}
                className="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-silver-600 scale-105'
                        : 'border-gray-200 hover:border-silver-400'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              {product.nameEn && (
                <p className="text-lg text-gray-600">{product.nameEn}</p>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating!)
                          ? 'text-gold fill-gold'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} از ۵ ({product.reviewCount || 0} نظر)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-br from-silver-50 to-gray-50 rounded-xl p-6 border border-silver-200">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {new Intl.NumberFormat('fa-IR').format(product.price)}
                </span>
                <span className="text-lg text-gray-600">تومان</span>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-3">
                  <span className="text-lg text-gray-500 line-through">
                    {new Intl.NumberFormat('fa-IR').format(product.originalPrice)}
                  </span>
                  <Badge variant="error">
                    {discountPercent}% صرفه‌جویی
                  </Badge>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span>قیمت بر اساس نرخ روز نقره</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                <Scale className="w-6 h-6 text-silver-600" />
                <div>
                  <div className="text-sm text-gray-600">وزن</div>
                  <div className="font-bold text-gray-900">
                    {new Intl.NumberFormat('fa-IR').format(product.weight)} گرم
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                <Award className="w-6 h-6 text-silver-600" />
                <div>
                  <div className="text-sm text-gray-600">عیار</div>
                  <div className="font-bold text-gray-900">نقره {product.purity}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addedToCart}
                  className="flex-1 bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-700 hover:to-silver-800"
                  size="lg"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 ml-2" />
                      اضافه شد
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 ml-2" />
                      {product.inStock ? 'افزودن به سبد' : 'ناموجود'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => favorites.toggle(product.id)}
                  className={favorites.has(product.id) ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">ضمانت بازخرید</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">شماره سریال یکتا</span>
                </div>
              </div>
            </div>

            {/* Serial Number */}
            <div className="bg-gray-900 text-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Fingerprint className="w-6 h-6" />
                <h3 className="font-bold text-lg">شماره سریال</h3>
              </div>
              <div className="font-mono text-2xl text-gold tracking-wider">
                {product.serialNumber}
              </div>
              <p className="text-sm text-gray-400 mt-3">
                این شماره یکتا برای ارزیابی و بازخرید ضروری است
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">توضیحات</TabsTrigger>
              <TabsTrigger value="specs">مشخصات</TabsTrigger>
              <TabsTrigger value="buyback">بازخرید</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-200 pb-4">
                    <span className="text-gray-600">نام:</span>
                    <span className="font-bold text-gray-900 mr-3">{product.name}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <span className="text-gray-600">وزن:</span>
                    <span className="font-bold text-gray-900 mr-3">{product.weight} گرم</span>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <span className="text-gray-600">عیار:</span>
                    <span className="font-bold text-gray-900 mr-3">نقره {product.purity}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <span className="text-gray-600">دسته‌بندی:</span>
                    <span className="font-bold text-gray-900 mr-3">{product.category}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="buyback" className="mt-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-12 h-12 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      تضمین بازخرید
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      این محصول با تضمین بازخرید بر اساس نرخ روز نقره فروخته می‌شود.
                      برای بازخرید، فقط شماره سریال خود را وارد کنید.
                    </p>
                    <Link to="/value">
                      <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                        ارزیابی آنلاین
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
