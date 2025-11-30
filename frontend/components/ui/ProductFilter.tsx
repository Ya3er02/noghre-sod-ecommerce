import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Slider from '@radix-ui/react-slider';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: FilterOption[];
  purities?: FilterOption[];
  priceRange?: PriceRange;
  className?: string;
}

export interface FilterState {
  categories: string[];
  purities: string[];
  priceRange: [number, number];
  weightRange?: [number, number];
  inStock: boolean;
  onSale: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'weight';
}

const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 100000000 };
const DEFAULT_WEIGHT_RANGE: [number, number] = [0, 500];

export function ProductFilter({
  onFilterChange,
  categories = [],
  purities = [],
  priceRange = DEFAULT_PRICE_RANGE,
  className = '',
}: ProductFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    purities: [],
    priceRange: [priceRange.min, priceRange.max],
    weightRange: DEFAULT_WEIGHT_RANGE,
    inStock: false,
    onSale: false,
    sortBy: 'newest',
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleCategory = (value: string) => {
    const newCategories = filters.categories.includes(value)
      ? filters.categories.filter((c) => c !== value)
      : [...filters.categories, value];
    updateFilters({ categories: newCategories });
  };

  const togglePurity = (value: string) => {
    const newPurities = filters.purities.includes(value)
      ? filters.purities.filter((p) => p !== value)
      : [...filters.purities, value];
    updateFilters({ purities: newPurities });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      purities: [],
      priceRange: [priceRange.min, priceRange.max],
      weightRange: DEFAULT_WEIGHT_RANGE,
      inStock: false,
      onSale: false,
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.purities.length +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-silver-600 to-silver-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        <SlidersHorizontal className="w-5 h-5" />
        {activeFilterCount > 0 && (
          <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed lg:sticky top-0 right-0 h-screen lg:h-auto w-80 lg:w-full bg-white lg:bg-transparent z-50 lg:z-auto overflow-y-auto shadow-2xl lg:shadow-none ${className}`}
          >
            <div className="p-6 lg:p-0 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between lg:hidden">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-6 h-6" />
                  فیلترها
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between bg-silver-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {activeFilterCount} فیلتر فعال
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    پاک کردن همه
                  </button>
                </div>
              )}

              {/* Sort By */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  مرتب‌سازی براساس
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilters({ sortBy: e.target.value as FilterState['sortBy'] })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-silver-500 focus:border-transparent transition-all"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="popular">محبوب‌ترین</option>
                  <option value="price-asc">ارزان‌ترین</option>
                  <option value="price-desc">گران‌ترین</option>
                  <option value="weight">وزن</option>
                </select>
              </div>

              {/* Accordion Filters */}
              <Accordion.Root type="multiple" defaultValue={['categories', 'purity', 'price']}>
                {/* Categories */}
                {categories.length > 0 && (
                  <Accordion.Item value="categories" className="border-b border-gray-200">
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full flex items-center justify-between py-4 text-right hover:text-silver-700 transition-colors group">
                        <span className="font-semibold text-gray-900">دسته‌بندی</span>
                        <ChevronDown className="w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-4 space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category.value}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category.value)}
                              onChange={() => toggleCategory(category.value)}
                              className="w-4 h-4 text-silver-600 border-gray-300 rounded focus:ring-silver-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              {category.label}
                            </span>
                          </div>
                          {category.count !== undefined && (
                            <span className="text-xs text-gray-400">({category.count})</span>
                          )}
                        </label>
                      ))}
                    </Accordion.Content>
                  </Accordion.Item>
                )}

                {/* Purity/Karat */}
                {purities.length > 0 && (
                  <Accordion.Item value="purity" className="border-b border-gray-200">
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full flex items-center justify-between py-4 text-right hover:text-silver-700 transition-colors group">
                        <span className="font-semibold text-gray-900">عیار نقره</span>
                        <ChevronDown className="w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-4 space-y-2">
                      {purities.map((purity) => (
                        <label
                          key={purity.value}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.purities.includes(purity.value)}
                              onChange={() => togglePurity(purity.value)}
                              className="w-4 h-4 text-silver-600 border-gray-300 rounded focus:ring-silver-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              {purity.label}
                            </span>
                          </div>
                          {purity.count !== undefined && (
                            <span className="text-xs text-gray-400">({purity.count})</span>
                          )}
                        </label>
                      ))}
                    </Accordion.Content>
                  </Accordion.Item>
                )}

                {/* Price Range */}
                <Accordion.Item value="price" className="border-b border-gray-200">
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-center justify-between py-4 text-right hover:text-silver-700 transition-colors group">
                      <span className="font-semibold text-gray-900">محدوده قیمت</span>
                      <ChevronDown className="w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="pb-4 space-y-4">
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        updateFilters({ priceRange: value as [number, number] })
                      }
                      min={priceRange.min}
                      max={priceRange.max}
                      step={100000}
                      minStepsBetweenThumbs={1}
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-gradient-to-r from-silver-500 to-silver-600 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-silver-600 rounded-full hover:bg-silver-50 focus:outline-none focus:ring-2 focus:ring-silver-500 focus:ring-offset-2 cursor-grab active:cursor-grabbing" />
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-silver-600 rounded-full hover:bg-silver-50 focus:outline-none focus:ring-2 focus:ring-silver-500 focus:ring-offset-2 cursor-grab active:cursor-grabbing" />
                    </Slider.Root>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Intl.NumberFormat('fa-IR').format(filters.priceRange[0])} تومان
                      </span>
                      <span className="text-gray-600">
                        {new Intl.NumberFormat('fa-IR').format(filters.priceRange[1])} تومان
                      </span>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>

                {/* Weight Range */}
                <Accordion.Item value="weight" className="border-b border-gray-200">
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-center justify-between py-4 text-right hover:text-silver-700 transition-colors group">
                      <span className="font-semibold text-gray-900">محدوده وزن</span>
                      <ChevronDown className="w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="pb-4 space-y-4">
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={filters.weightRange}
                      onValueChange={(value) =>
                        updateFilters({ weightRange: value as [number, number] })
                      }
                      min={DEFAULT_WEIGHT_RANGE[0]}
                      max={DEFAULT_WEIGHT_RANGE[1]}
                      step={5}
                      minStepsBetweenThumbs={1}
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
                        <Slider.Range className="absolute bg-gradient-to-r from-silver-500 to-silver-600 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-silver-600 rounded-full hover:bg-silver-50 focus:outline-none focus:ring-2 focus:ring-silver-500 focus:ring-offset-2 cursor-grab active:cursor-grabbing" />
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-silver-600 rounded-full hover:bg-silver-50 focus:outline-none focus:ring-2 focus:ring-silver-500 focus:ring-offset-2 cursor-grab active:cursor-grabbing" />
                    </Slider.Root>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {filters.weightRange?.[0]} گرم
                      </span>
                      <span className="text-gray-600">
                        {filters.weightRange?.[1]} گرم
                      </span>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>

              {/* Quick Filters */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilters({ inStock: e.target.checked })}
                    className="w-4 h-4 text-silver-600 border-gray-300 rounded focus:ring-silver-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    فقط کالاهای موجود
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilters({ onSale: e.target.checked })}
                    className="w-4 h-4 text-silver-600 border-gray-300 rounded focus:ring-silver-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    حراج و تخفیف‌دار
                  </span>
                </label>
              </div>

              {/* Apply Button (Mobile) */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden w-full bg-gradient-to-r from-silver-600 to-silver-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-silver-700 hover:to-silver-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                اعمال فیلترها
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
}
