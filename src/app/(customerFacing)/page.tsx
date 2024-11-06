import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db";
import { cache } from "@/lib/cache";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const getMostPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    });
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
);

const getNewestProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  },
  ["/", "getNewestProducts"],
  { revalidate: 60 * 60 * 24 }
);

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        productFetcher={getMostPopularProducts}
        title="Most Popular"
      />
      <ProductGridSection productFetcher={getNewestProducts} title="Newest" />
    </main>
  );
}

type ProductGridSectionProps = {
  productFetcher: () => Promise<Product[]>;
  title: string;
};

function ProductGridSection({
  productFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" className="space-x-2" asChild>
          <Link href="/products">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div>
        <div className="grid grid-cols-1 mg:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense
            fallback={
              <>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </>
            }
          >
            <ProductSuspense productFetcher={productFetcher} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

type ProductSuspenseProps = {
  productFetcher: () => Promise<Product[]>;
};

async function ProductSuspense({ productFetcher }: ProductSuspenseProps) {
  const products = await productFetcher();

  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
