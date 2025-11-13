import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-center text-3xl font-bold text-foreground">تماس با ما</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">اطلاعات تماس</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">تلفن</h3>
                    <p className="text-muted-foreground">۰۲۱-۱۲۳۴۵۶۷۸</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">ایمیل</h3>
                    <p className="text-muted-foreground">info@noghresod.ir</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">آدرس</h3>
                    <p className="text-muted-foreground">
                      تهران، خیابان ولیعصر، پلاک ۱۲۳
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 font-semibold text-foreground">ساعات کاری</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>شنبه تا چهارشنبه: ۹:۰۰ - ۱۸:۰۰</p>
                  <p>پنج‌شنبه: ۹:۰۰ - ۱۴:۰۰</p>
                  <p>جمعه: تعطیل</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">ارسال پیام</h2>
              
              <form className="space-y-4">
                <div>
                  <Input placeholder="نام و نام خانوادگی" />
                </div>
                <div>
                  <Input type="email" placeholder="ایمیل" />
                </div>
                <div>
                  <Input placeholder="موضوع" />
                </div>
                <div>
                  <Textarea placeholder="پیام شما" rows={6} />
                </div>
                <Button type="submit" className="w-full">
                  ارسال پیام
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
