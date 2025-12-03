# نقره سود | Noghre Sood

<div dir="rtl">

## درباره پروژه

نقره سود یک پلتفرم تخصصی فروشگاهی آنلاین برای خرید و فروش محصولات نقره با هدف سرمایه‌گذاری امن است.

### ویژگی‌های اصلی

- ✅ **تضمین بازخرید**: بازخرید همه محصولات با قیمت روز بازار
- ✅ **شماره سریال یکتا**: هر محصول دارای شناسه منحصر به فرد و قابل ردیابی
- ✅ **قیمت‌گذاری لحظه‌ای**: بر اساس نرخ روز جهانی نقره
- ✅ **ارزش‌یابی آنلاین**: بررسی و ارزیابی محصولات با شماره سریال
- ✅ **طراحی RTL**: بهینه‌سازی شده برای زبان فارسی
- ✅ **رابط کاربری مدرن**: طراحی لوکس با انیمیشن‌های نرم

</div>

---

## About

Noghre Sood is a specialized online e-commerce platform for buying and selling silver products with a focus on secure investment.

### Key Features

- ✅ **Buyback Guarantee**: Guaranteed buyback of all products at market price
- ✅ **Unique Serial Numbers**: Each product has a unique trackable identifier
- ✅ **Real-time Pricing**: Based on global silver spot prices
- ✅ **Online Valuation**: Assessment and evaluation of products by serial number
- ✅ **RTL Design**: Optimized for Persian language
- ✅ **Modern UI**: Luxury design with smooth animations

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.0 + TypeScript
- **Build Tool**: Vite 6.2.5
- **Styling**: Tailwind CSS 4.1.11 + Custom CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Routing**: React Router DOM 7.6.3
- **State Management**: TanStack Query
- **Font**: Vazirmatn (Persian-optimized)

### Backend
- **Framework**: Encore.dev
- **API**: RESTful

### Deployment
- **Platform**: VPS Cloud Server
- **Package Manager**: Bun

---

## 🚀 Getting Started

### Prerequisites

```bash
# Install Node.js (v18 or higher)
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce

# Install frontend dependencies
cd frontend
bun install

# Install backend dependencies (if needed)
cd ../backend
bun install
```

### Development

```bash
# Run frontend development server
cd frontend
bun run dev

# Run backend (in separate terminal)
cd backend
encore run
```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
cd frontend
bun run build
bun run preview
```

---

## 📁 Project Structure

```
noghre-sod-ecommerce/
├── frontend/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── styles/          # CSS files
│   │   ├── typography.css   # Persian typography system
│   │   ├── colors.css       # Luxury silver color palette
│   │   └── animations.css   # Micro-interactions & animations
│   ├── lib/             # Utility functions
│   ├── index.html       # HTML entry point
│   ├── index.css        # Main CSS file
│   └── package.json     # Dependencies
│
├── backend/
│   └── [backend files]
│
├── IMPLEMENTATION_SUMMARY.md  # Implementation details
└── README.md                  # This file
```

---

## 🎨 Design System

### Typography
- **Font Family**: Vazirmatn (300-900 weights)
- **Type Scale**: 13px - 60px (optimized for Persian)
- **Line Heights**: 1.3 - 2.1 (RTL-specific)
- **Responsive**: Adapts to mobile, tablet, and desktop

### Colors
- **Primary**: Silver palette (9 shades)
- **Accent**: Gold (#d4af37)
- **Neutrals**: Premium grayscale
- **Status**: Green, Blue, Red with light variants

### Animations
- Button ripples and magnetic hover
- Card lift and 3D tilt effects
- Scroll-triggered animations
- Loading skeletons
- Smooth transitions (cubic-bezier easing)

---

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed implementation notes
- [VPS Deployment Guide](./VPS_DEPLOYMENT.md) - VPS deployment instructions
- [Development Guide](./DEVELOPMENT.md) - Development guidelines (if exists)

---

## 🧠 Testing

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

### Testing Checklist
- [ ] All pages load correctly
- [ ] RTL layout works properly
- [ ] Fonts render correctly
- [ ] Animations are smooth (60fps)
- [ ] Responsive design works on all devices
- [ ] Forms submit correctly
- [ ] Navigation functions properly

---

## 🚀 Deployment

For detailed deployment instructions to your VPS server, please refer to [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md).

### Quick Deploy

```bash
# Run the VPS deployment script
./deploy-vps.sh
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=your_backend_url
VITE_APP_NAME=نقره سود
```

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary and confidential.

---

## 📧 Contact

- **Website**: [noghresood.shop](https://noghresood.shop)
- **Email**: info@noghresood.com

---

## 🚀 Recent Updates

### Version 1.0.0 (November 2025)

- ✅ Brand name corrected to "نقره سود" throughout
- ✅ Implemented comprehensive Persian typography system
- ✅ Added luxury silver-inspired color palette
- ✅ Created modern animation and micro-interaction system
- ✅ Full RTL optimization
- ✅ Performance improvements with font preconnect
- ✅ Enhanced accessibility
- ✅ Modern card-based design system
- ✅ Migrated to VPS deployment

---

**Made with ❤️ for silver investors**