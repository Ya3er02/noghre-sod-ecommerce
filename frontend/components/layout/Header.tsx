import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X,
  Heart,
  ChevronDown,
  Phone,
  Mail
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { UserButton, SignInButton, useUser } from '@clerk/clerk-react';

/**
 * Header Component
 * 
 * Implements luxury jewelry e-commerce best practices:
 * - Mega menu for categories
 * - Sticky header with scroll behavior
 * - Cart indicator with count
 * - Search bar
 * - User authentication
 * - Mobile responsive
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const { isSignedIn } = useUser();
  const cart = useCart();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const itemCount = cart.getItemCount();

  // Handle scroll
  useState(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const navigation = [
    { name: 'صفحه اصلی', href: '/' },
    { 
      name: 'محصولات', 
      href: '/products',
      submenu: [
        { name: 'همه محصولات', href: '/products' },
        { name: 'گردنبند', href: '/products?category=necklace' },
        { name: 'دستبند', href: '/products?category=bracelet' },
        { name: 'گوشواره', href: '/products?category=earring' },
        { name: 'انگشتر', href: '/products?category=ring' },
      ]
    },
    { name: 'ارزیابی آنلاین', href: '/value' },
    { name: 'درباره ما', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-silver-700 to-gray-800 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+982188888888" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">۰۲۱-۸۸۸۸۸۸۸۸</span>
              </a>
              <a href="mailto:info@noghresood.shop" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">info@noghresood.shop</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/faq" className="hover:text-gold transition-colors hidden sm:inline">
                سوالات متداول
              </Link>
              <Link to="/track-order" className="hover:text-gold transition-colors">
                پیگیری سفارش
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        }}
        className="sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-silver-600 to-gray-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">نس</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">نقره سود</span>
                <span className="text-xs text-gray-500">سرمایه‌گذاری امن</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center gap-8">
                {navigation.map((item) => (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.href}
                      className={`flex items-center gap-1 font-medium transition-colors ${
                        location.pathname === item.href
                          ? 'text-silver-700'
                          : 'text-gray-700 hover:text-silver-600'
                      }`}
                    >
                      {item.name}
                      {item.submenu && <ChevronDown className="w-4 h-4" />}
                    </Link>
                    
                    {/* Submenu */}
                    {item.submenu && (
                      <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[200px]">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-silver-700 transition-colors"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="جستجو"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="w-5 h-5 text-gray-700" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="سبد خرید"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 ml-2" />
                    ورود
                  </Button>
                </SignInButton>
              )}

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="منو"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <form className="relative max-w-2xl mx-auto">
                  <input
                    type="search"
                    placeholder="جستجوی محصولات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-silver-500 focus:border-transparent"
                    autoFocus
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">منو</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 hover:text-silver-700 transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.submenu && (
                        <div className="mr-4 space-y-1 mt-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-600 hover:text-silver-600 transition-colors"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
