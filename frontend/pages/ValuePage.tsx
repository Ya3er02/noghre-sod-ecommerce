import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiquidBackground from "@/components/LiquidBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function ValuePage() {
  const [serial, setSerial] = useState("");
  const { toast } = useToast();

  const lookupMutation = useMutation({
    mutationFn: async (serial: string) => {
      return backend.scan2value.lookupSerial({ serial });
    },
    onError: (error) => {
      console.error("Lookup error:", error);
      toast({
        title: "خطا",
        description: "شماره سریال یافت نشد. لطفاً شماره را بررسی کنید.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serial.trim()) {
      lookupMutation.mutate(serial.trim());
    }
  };

  const data = lookupMutation.data;
  const product = data?.product;
  const calc = data?.valueCalculation;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
            <LiquidBackground>
      
      <main className="flex-1">
        <div className="border-b bg-gradient-to-br from-slate-50 to-slate-100 py-12 dark:from-slate-950 dark:to-slate-900">
          <div className="container mx-auto px-4">
                      <div className="content-card content-card-elevated">
            <h1 className="mb-4 text-center text-3xl font-bold text-foreground">ارزش‌یابی محصول</h1>
            <p className="mb-8 text-center text-muted-foreground">
              شماره سریال محصول خود را وارد کنید تا ارزش فعلی آن را مشاهده کنید
            </p>
                                  </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex gap-2">
                <Input
                  placeholder="شماره سریال"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" disabled={lookupMutation.isPending}>
                  <Search className="ml-2 h-4 w-4" />
                  جستجو
                </Button>
              </div>
            </form>
          </div>
        </div>

        {lookupMutation.isPending && (
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-muted-foreground">در حال جستجو...</p>
          </div>
        )}

        {product && calc && (
          <div className="container mx-auto px-4 py-12">
                      <div className="content-card content-card-elevated">
            <div className="mb-8 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">اطلاعات محصول</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">شماره سریال:</span>
                  <p className="font-medium text-foreground">{product.serial}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">وزن:</span>
                  <p className="font-medium text-foreground">{product.weightG} گرم</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">عیار:</span>
                  <p className="font-medium text-foreground">{product.fineness}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">تاریخ خرید:</span>
                  <p className="font-medium text-foreground">
                    {new Date(product.buyDate).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">شعبه خرید:</span>
                  <p className="font-medium text-foreground">{product.branch}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">وضعیت:</span>
                  <p className="font-medium text-foreground">{product.status}</p>
                </div>
              </div>
            </div>
                                  </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ارزش فعلی بازار
                  </CardTitle>
                  <CardDescription>بر اساس قیمت روز نقره</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(calc.currentMarketValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">تومان</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {calc.profitLoss >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    سود/زیان
                  </CardTitle>
                  <CardDescription>نسبت به قیمت خرید</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${calc.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {calc.profitLoss >= 0 ? "+" : ""}{formatPrice(calc.profitLoss)}
                  </p>
                  <p className={`text-sm ${calc.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {calc.profitLossPercent >= 0 ? "+" : ""}{calc.profitLossPercent.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>پیشنهاد بازخرید</CardTitle>
                  <CardDescription>قیمت تضمینی بازخرید</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(calc.guaranteedBuybackQuote)}
                  </p>
                  <p className="text-sm text-muted-foreground">تومان</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg">درخواست بازخرید</Button>
            </div>
          </div>
        )}
      </main>
                    </LiquidBackground>

      <Footer />
    </div>
  );
}
