import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await backend.category.list();
      return response.categories;
    },
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      return backend.product.list({
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        limit: 20,
        offset: 0,
      });
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-muted/50 py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-4 text-3xl font-bold text-foreground">محصولات</h1>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">
                {productsData?.total || 0} محصول موجود
              </p>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="همه دسته‌بندی‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground">در حال بارگذاری...</div>
          ) : productsData?.products.length === 0 ? (
            <div className="text-center text-muted-foreground">محصولی یافت نشد</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsData?.products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
