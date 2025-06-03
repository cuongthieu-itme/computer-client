import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ComputerProductDTO } from '@/data/computerProducts';
import { AlertCircle, Laptop } from 'lucide-react';
import React from 'react';
import ProductCard from './ProductCard.tsx';

interface ProductDisplaySectionProps {
  products?: ComputerProductDTO[];
  isLoading: boolean;
  error: Error | null;
}

const ProductDisplaySection: React.FC<ProductDisplaySectionProps> = ({ products, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="h-full flex flex-col overflow-hidden shadow-md">
            <AspectRatio ratio={16 / 9} className="bg-muted animate-pulse rounded-t-lg" />
            <CardHeader className="pb-3 pt-4">
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
              <div className="h-4 w-full bg-muted animate-pulse rounded-md"></div>
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md mt-1"></div>
            </CardHeader>
            <CardContent className="flex-grow pt-2 pb-4 space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded-md"></div>
              <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md"></div>
            </CardContent>
            <CardFooter className="p-4">
              <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-destructive/10 border border-destructive/30 rounded-lg p-6 shadow-lg">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-destructive mb-2">Không tải được sản phẩm</h3>
        <p className="text-muted-foreground mb-4">
          Chúng tôi đã gặp lỗi khi cố gắng lấy thông tin sản phẩm. Vui lòng thử tải lại trang hoặc kiểm tra lại sau.
        </p>
        <p className="text-xs text-destructive/80">Chi tiết lỗi: {error.message}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/30 border border-border rounded-lg p-8 shadow-md">
        <Laptop className="w-16 h-16 text-muted-foreground mb-6" strokeWidth={1.5} />
        <h3 className="text-2xl font-semibold text-foreground mb-3">Hiện không có sản phẩm</h3>
        <p className="text-muted-foreground max-w-md">
          Hiện không có sản phẩm nào được hiển thị. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
};

export default ProductDisplaySection;
