import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  weightG: number;
  basePriceIrr: number;
  currentPriceIrr?: number;
  stockStatus: string;
  images: Array<{ url: string; altText?: string }>;
}

export default function ProductCard({
  name,
  slug,
  weightG,
  basePriceIrr,
  currentPriceIrr,
  stockStatus,
  images,
}: ProductCardProps) {
  const primaryImage = images.find(img => img) || { url: "/placeholder.svg", altText: name };
  const price = currentPriceIrr || basePriceIrr;

  return (
    <Link to={`/products/${slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {stockStatus === "OUT_OF_STOCK" && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              ناموجود
            </Badge>
          )}
          {stockStatus === "PRE_ORDER" && (
            <Badge className="absolute left-2 top-2">پیش‌فروش</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">وزن: {weightG} گرم</p>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
