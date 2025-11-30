import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductFilter, type FilterState } from '@/components/ui/ProductFilter';
import { Button } from '@/components/ui/Button';

type ViewMode = 'grid' | 'list';

/**
 * ProductsPage Component
 * 
 * Implements best practices from luxury jewelry sites:
 * - Advanced filtering (price, weight, purity)
 * - Multiple view modes (grid/list)
 * - Responsive layout
 * - Loading states
 * - Empty states
 * - Pagination
 * - Dynamic filter counts
 */
export function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    purities: [],
    priceRange: [0, 100000000],
    weightRange: [0, 500],
    inStock: false,
    onSale: false,
    sortBy: 'newest',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    // Watch individual filter properties to avoid infinite loops
    filters.categories.join(','),
    filters.purities.join(','),
    filters.priceRange.join(','),
    filters.weightRange?.join(','),
    filters.inStock,
    filters.onSale,
    filters.sortBy,
  ]);
  
  const { data, isLoading, error, refetch } = useProducts({
    filters,
    pagination: {
      page: currentPage,
      limit: itemsPerPage,
    },
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  // Compute filter counts dynamically from all products
  // Note: This computes counts from current page only.
  // For accurate counts across all products, backend should provide facets.
  const filterOptions = useMemo(() => {
    // If no products loaded yet, return empty arrays
    if (!products.length) {
      return {
        categories: [],
        purities: [],
      };
    }

    // Count products by category
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.categoryId || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count products by purity (fineness)
    const purityCounts = products.reduce((acc, product) => {
      const purity = product.fineness === 925 ? '925' : '999';
      acc[purity] = (acc[purity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Map category IDs to labels (in real app, fetch from backend)
    const categoryLabels: Record<string, string> = {
      'necklace': 'گردنبند',
      'bracelet': 'دستبند',
      'earring': 'گوشواره',
      'ring': 'انگشتر',
      'pendant': 'پلاک',
    };

    return {
      categories: Object.entries(categoryCounts).map(([value, count]) => ({
        label: categoryLabels[value] || value,
        value,
        count,
      })),
      purities: Object.entries(purityCounts).map(([value, count]) => ({
        label: `نقره ${value}`,
        value,
        count,
      })),
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                محصولات نقره
              </h1>
              <p className="text-gray-600">
                {isLoading ? (
                  <span className="skeleton w-32 h-5 inline-block" />
                ) : (
                  `${new Intl.NumberFormat('fa-IR').format(totalCount)} محصول`
                )}
              </p>
            </div>

            {/* View Mode Toggle (Desktop) */}
            {!isMobile && (
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilter
                onFilterChange={setFilters}
                categories={filterOptions.categories}
                purities={filterOptions.purities}
                priceRange={{ min: 0, max: 100000000 }}
              />
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div key={i} className="skeleton h-96 rounded-xl" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  خطا در بارگذاری
                </h3>
                <p className="text-gray-600 mb-6">
                  لطفاً دوباره تلاش کنید
                </p>
                <Button onClick={() => refetch()}>
                  تلاش مجدد
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-gray-600 mb-6">
                  لطفاً فیلترهای خود را تغییر دهید
                </p>
                <Button onClick={() => setFilters({
                  categories: [],
                  purities: [],
                  priceRange: [0, 100000000],
                  weightRange: [0, 500],
                  inStock: false,
                  onSale: false,
                  sortBy: 'newest',
                })}>
                  پاک کردن فیلترها
                </Button>
              </div>
            )}

            {/* Products */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      >
                        <ProductCard
                          {...product}
                          className={viewMode === 'list' ? 'flex-row' : ''}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      قبلی
                    </Button>
                    
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              onClick={() => setCurrentPage(page)}
                              className="w-10 h-10"
                            >
                              {new Intl.NumberFormat('fa-IR').format(page)}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-2">…</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      بعدی
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
