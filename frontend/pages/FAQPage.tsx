import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "چگونه می‌توانم از اصالت محصول اطمینان حاصل کنم؟",
      answer: "تمامی محصولات نقره سُد دارای شماره سریال یکتا و گواهی‌نامه اصالت هستند. شما می‌توانید با مراجعه به بخش ارزش‌یابی و وارد کردن شماره سریال، اطلاعات کامل محصول را مشاهده کنید.",
    },
    {
      question: "آیا بازخرید محصولات تضمین شده است؟",
      answer: "بله، نقره سُد تضمین می‌کند که تمامی محصولات را با قیمت منصفانه بر اساس نرخ روز بازار بازخرید کند. این تضمین بخشی از تعهد ما به مشتریان است.",
    },
    {
      question: "چگونه قیمت محصولات محاسبه می‌شود؟",
      answer: "قیمت محصولات بر اساس نرخ روز جهانی نقره که از منابع معتبر مانند TGJU دریافت می‌شود، محاسبه می‌گردد. به این قیمت، حق‌الزحمه و هزینه‌های مرتبط اضافه می‌شود.",
    },
    {
      question: "آیا امکان تحویل حضوری وجود دارد؟",
      answer: "بله، می‌توانید محصولات خود را به صورت حضوری از شعب ما دریافت کنید. همچنین امکان ارسال پستی با بیمه کامل نیز وجود دارد.",
    },
    {
      question: "مدت زمان تحویل سفارش چقدر است؟",
      answer: "برای سفارش‌های حضوری، تحویل فوری امکان‌پذیر است. برای ارسال پستی، بسته به مقصد، بین ۲ تا ۵ روز کاری زمان نیاز است.",
    },
    {
      question: "آیا می‌توان محصولات را به صورت قسطی خریداری کرد؟",
      answer: "در حال حاضر امکان خرید قسطی وجود ندارد، اما در آینده نزدیک این سرویس راه‌اندازی خواهد شد.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-center text-3xl font-bold text-foreground">سوالات متداول</h1>
            <p className="mt-2 text-center text-muted-foreground">
              پاسخ سوالات رایج در مورد نقره سُد
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border bg-card px-6">
                  <AccordionTrigger className="text-right hover:no-underline">
                    <span className="font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
