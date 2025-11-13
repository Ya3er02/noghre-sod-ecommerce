import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-center text-3xl font-bold text-foreground">درباره نقره سُد</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
            <p className="text-lg leading-relaxed text-muted-foreground">
              نقره سُد، پیشرو در زمینه سرمایه‌گذاری نقره با رویکردی نوین و امن است. ما با ارائه محصولات نقره با شماره سریال یکتا و تضمین بازخرید، فرصتی مطمئن برای سرمایه‌گذاری در اختیار شما قرار می‌دهیم.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-foreground">ماموریت ما</h2>
            <p className="leading-relaxed text-muted-foreground">
              ماموریت ما ایجاد بستری امن و شفاف برای سرمایه‌گذاری در نقره است. ما معتقدیم که هر فرد باید بتواند با اطمینان کامل در فلزات گرانبها سرمایه‌گذاری کند.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-foreground">تعهدات ما</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>اصالت و کیفیت تضمینی تمامی محصولات</li>
              <li>شفافیت کامل در قیمت‌گذاری بر اساس نرخ روز جهانی</li>
              <li>تضمین بازخرید با قیمت منصفانه</li>
              <li>ردیابی آسان محصولات با شماره سریال یکتا</li>
              <li>خدمات مشاوره‌ای تخصصی</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-foreground">چرا نقره سُد؟</h2>
            <p className="leading-relaxed text-muted-foreground">
              با بیش از یک دهه تجربه در صنعت فلزات گرانبها، نقره سُد با ارائه خدمات حرفه‌ای و قابل اعتماد، اعتماد هزاران مشتری را جلب کرده است. محصولات ما دارای گواهی‌نامه‌های معتبر بین‌المللی بوده و کیفیت آن‌ها توسط مراجع ذی‌صلاح تایید شده است.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
