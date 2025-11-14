import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">نقره سود</h3>
            <p className="text-sm text-muted-foreground">
              پیشرو در سرمایه‌گذاری نقره با تضمین بازخرید و شماره سریال یکتا
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">دسترسی سریع</h3>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                محصولات
              </Link>
              <Link to="/value" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ارزش‌یابی
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                درباره ما
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                سوالات متداول
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">تماس با ما</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@noghresood.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>تهران، خیابان ولیعصر</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} نقره سود. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}