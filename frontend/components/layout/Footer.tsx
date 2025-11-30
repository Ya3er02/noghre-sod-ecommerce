import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  ShieldCheck,
  Award,
  CreditCard,
  Truck
} from 'lucide-react';

/**
 * Footer Component
 * 
 * Implements luxury e-commerce footer best practices:
 * - Multi-column layout
 * - Trust badges
 * - Newsletter subscription
 * - Social media links
 * - Payment methods
 * - Legal links
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: 'همه محصولات', href: '/products' },
      { name: 'گردنبند', href: '/products?category=necklace' },
      { name: 'دستبند', href: '/products?category=bracelet' },
      { name: 'گوشواره', href: '/products?category=earring' },
      { name: 'انگشتر', href: '/products?category=ring' },
    ],
    support: [
      { name: 'سوالات متداول', href: '/faq' },
      { name: 'راهنمای خرید', href: '/guide' },
      { name: 'شیوه‌های ارسال', href: '/shipping' },
      { name: 'شیوه‌های پرداخت', href: '/payment' },
      { name: 'ضمانت بازگشت', href: '/return-policy' },
    ],
    company: [
      { name: 'درباره نقره سود', href: '/about' },
      { name: 'تماس با ما', href: '/contact' },
      { name: 'بلاگ', href: '/blog' },
      { name: 'فرصت‌های شغلی', href: '/careers' },
      { name: 'قوانین و مقررات', href: '/terms' },
    ],
    services: [
      { name: 'ارزیابی آنلاین', href: '/value' },
      { name: 'بازخرید نقره', href: '/buyback' },
      { name: 'گواهی اصالت', href: '/certificate' },
      { name: 'پیگیری سفارش', href: '/track-order' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/noghresood', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/noghresood', color: 'hover:text-blue-400' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/noghresood', color: 'hover:text-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/noghresood', color: 'hover:text-blue-700' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, text: 'تضمین اصالت' },
    { icon: Award, text: 'گارانتی بازگشت' },
    { icon: Truck, text: 'ارسال سریع' },
    { icon: CreditCard, text: 'پرداخت امن' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-3 justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-silver-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <badge.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-gray-300">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-silver-600 to-gray-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">نس</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">نقره سود</span>
                <span className="text-xs text-gray-400">سرمایه‌گذاری امن</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              پلتفرم تخصصی خرید و فروش محصولات نقره با تضمین بازخرید و شماره سریال یکتا.
              سرمایه‌گذاری امن با قیمت‌گذاری لحظه‌ای.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+982188888888" className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors">
                <Phone className="w-5 h-5" />
                <span>۰۲۱-۸۸۸۸۸۸۸۸</span>
              </a>
              <a href="mailto:info@noghresood.shop" className="flex items-center gap-3 text-gray-400 hover:text-gold transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@noghresood.shop</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳۴</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-all ${social.color} hover:scale-110`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">محصولات</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">پشتیبانی</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">شرکت</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-12 border-t border-gray-800">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-3">خبرنامه نقره سود</h3>
            <p className="text-gray-400 mb-6">
              از آخرین تخفیف‌ها و محصولات جدید مطلع شوید
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-white placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-semibold rounded-lg transition-all"
              >
                عضویت
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-right">
              © {currentYear} نقره سود. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-gold transition-colors">
                حریم خصوصی
              </Link>
              <Link to="/terms" className="hover:text-gold transition-colors">
                قوانین و مقررات
              </Link>
              <Link to="/sitemap" className="hover:text-gold transition-colors">
                نقشه سایت
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
