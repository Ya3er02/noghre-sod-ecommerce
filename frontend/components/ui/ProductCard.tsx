import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  weight: number; // وزن به گرم
  purity: string; // عیار (مثلاً 925 یا 999)
  serialNumber?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  className?: string;
}

export function ProductCard({
  id,
  name,
  nameEn,
  price,
  originalPrice,
  image,
  images = [],
  weight,
  purity,
  serialNumber,
  isNew = false,
  isFeatured = false,
  discount,
  inStock = true,
  rating,
  reviewCount,
  className = '',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [image, ...images];
  const currentImage = allImages[currentImageIndex];

  // محاسبه قیمت فرمت شده
  const formattedPrice = new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('fa-IR', {
        style: 'decimal',
        minimumFractionDigits: 0,
      }).format(originalPrice)
    : null;

  // تغییر تصویر با hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (allImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.floor(percentage * allImages.length);
    setCurrentImageIndex(Math.min(index, allImages.length - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-silver-400 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-gradient-to-r from-silver-600 to-silver-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
            جدید
          </span>
        )}
        {isFeatured && (
          <span className="bg-gradient-to-r from-gold to-gold-dark text-white px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            ویژه
          </span>
        )}
        {discount && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            {discount}% تخفیف
          </span>
        )}
        {!inStock && (
          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
            ناموجود
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="absolute top-3 left-3 z-10 flex flex-col gap-2"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isFavorite
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white shadow-md'
          }`}
          aria-label="افزودن به علاقه‌مندی‌ها"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavorite ? 'fill-current scale-110' : ''
            }`}
          />
        </button>
        <Link
          to={`/products/${id}`}
          className="p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-600 hover:bg-silver-600 hover:text-white transition-all duration-300 shadow-md"
          aria-label="مشاهده سریع"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Product Image */}
      <Link to={`/products/${id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <motion.img
          key={currentImageIndex}
          src={currentImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
        />
        
        {/* Image Indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <Link to={`/products/${id}`} className="block mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-silver-700 transition-colors">
            {name}
          </h3>
          {nameEn && (
            <p className="text-sm text-gray-500 font-medium mt-1">{nameEn}</p>
          )}
        </Link>

        {/* Specs */}
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">وزن:</span>
            <span className="font-bold text-gray-800">{weight} گرم</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1">
            <span className="font-medium">عیار:</span>
            <span className="font-bold text-gray-800">{purity}</span>
          </div>
        </div>

        {/* Serial Number */}
        {serialNumber && (
          <div className="mb-3 text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
            SN: {serialNumber}
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-gold fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-500">تومان</span>
          {formattedOriginalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!inStock}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            inStock
              ? 'bg-gradient-to-r from-silver-600 to-silver-700 hover:from-silver-700 hover:to-silver-800 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
        </motion.button>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(140, 147, 152, 0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}
