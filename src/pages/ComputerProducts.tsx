import ProductDisplaySection from '@/components/ProductDisplaySection';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { fetchComputerProducts } from '@/data/computerProducts';
import { useQuery } from '@tanstack/react-query';
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from 'lucide-react';
import React from 'react';

const carouselImages = [
  {
    src: "/computer-banner-1.jpg",
    alt: "Gaming PC và Laptop",
    fallback: "https://placehold.co/1200x400/3b82f6/ffffff?text=Gaming+PC+và+Laptop",
  },
  {
    src: "/computer-banner-2.jpg",
    alt: "Phụ kiện Gaming",
    fallback: "https://placehold.co/1200x400/10b981/ffffff?text=Phụ+kiện+Gaming",
  },
  {
    src: "/computer-banner-3.jpg",
    alt: "Linh kiện máy tính",
    fallback: "https://placehold.co/1200x400/8b5cf6/ffffff?text=Linh+kiện+máy+tính",
  },
];

const ComputerProducts: React.FC = () => {
  const {
    data: computerApiResponse,
    isLoading: isLoadingComputerProducts,
    error: computerProductsError,
  } = useQuery({
    queryKey: ["allComputerProducts"],
    queryFn: fetchComputerProducts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full rounded-xl overflow-hidden border shadow-md"
        >
          <CarouselContent>
            {carouselImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full bg-muted">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = image.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{image.alt}</h2>
                    <p className="text-white/90 mb-6 max-w-md hidden md:block">
                      Khám phá các sản phẩm công nghệ hàng đầu cho nhu cầu của bạn
                    </p>
                    <Button className="w-fit bg-primary hover:bg-primary/90 group">
                      <span>Khám phá ngay</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sản phẩm máy tính</h1>
        <p className="text-muted-foreground mt-2">
          Khám phá các sản phẩm máy tính, linh kiện và phụ kiện cao cấp
        </p>
      </div>

      <div className="mb-10">
        <ProductDisplaySection
          products={computerApiResponse?.result?.products}
          isLoading={isLoadingComputerProducts}
          error={computerProductsError as Error}
        />
      </div>
    </div>
  );
};

export default ComputerProducts;
