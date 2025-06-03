import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductDisplaySection from "@/components/ProductDisplaySection";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  HelpCircle,
  Info,
  Search,
  ShieldCheck
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ContactUsTrigger from "@/components/documents/ContactUsTrigger";
import { computerProducts } from "@/data/computerProducts";
import { cn } from "@/lib/utils";
import { fetchAllTicketGroups } from "@/services/ticketService";
import { FetchTicketGroupsResponseDTO, TicketGroupDTO } from "@/types/api/ticket.api";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const ticketSectionRef = useRef<HTMLDivElement>(null);

  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }));

  const {
    data: ticketApiResponse,
    isLoading: isLoadingTicketGroups,
    error: ticketGroupsError,
  } = useQuery<FetchTicketGroupsResponseDTO, Error>({
    queryKey: ["allTicketGroups"],
    queryFn: fetchAllTicketGroups,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoadingComputerProducts = false;
  const computerProductsError = null;

  const ticketGroups: TicketGroupDTO[] | undefined = ticketApiResponse?.respCode === 2000 ? ticketApiResponse.result.ticketGroups : undefined;

  const ticketDisplayError =
    ticketGroupsError ||
    (ticketApiResponse && ticketApiResponse.respCode !== 2000 ? new Error(ticketApiResponse.respDesc || t("pages.Index.error.failedToFetchTickets")) : null);

  const productDisplayError = computerProductsError;

  const carouselImages = [
    { src: "/banner1.jpg", alt: "Banner 1", label: "Banner 1" },
    { src: "/banner2.jpg", alt: "Banner 2", label: "Banner 2" },
    { src: "/banner3.png", alt: "Banner 3", label: "Banner 3" },
    { src: "/banner4.jpg", alt: "Banner 4", label: "Banner 4" },
    { src: "/banner5.png", alt: "Banner 5", label: "Banner 5" },
  ];

  useEffect(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTickets = () => {
    ticketSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToProducts = () => {
    document.getElementById('product-display-section')?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="w-full bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="relative w-full">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            plugins={[autoplayPlugin.current as any]}
            setApi={setApi}
            onMouseEnter={() => autoplayPlugin.current.stop()}
            onMouseLeave={() => autoplayPlugin.current.play()}
          >
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className={cn("relative w-full aspect-[18/9] overflow-hidden bg-gray-900", "xl:max-h-[750px]")}>
                    <img
                      src={image.src}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 z-0 w-full h-full object-cover filter blur-lg scale-105 opacity-30 md:opacity-40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="relative z-[5] w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/1200x675/E0E0E0/757575?text=${encodeURIComponent(
                          t("pages.Index.carousel.imageErrorPart1") + image.alt.substring(0, 30)
                        )}&font=inter`;
                        (e.target as HTMLImageElement).alt = `${t("pages.Index.carousel.altPlaceholderPart1")} ${image.alt}`;
                      }}
                    />
                    <div className="absolute inset-0 z-[10] bg-gradient-to-t from-black/20 via-black/10 to-transparent"></div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70  text-foreground rounded-full shadow-md" />
            <CarouselNext className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70  text-foreground rounded-full shadow-md" />
            {carouselImages.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow">
                {currentSlide + 1} / {carouselImages.length}
              </div>
            )}
          </Carousel>
        </div>

        <section className="py-6 sm:py-8 md:py-10 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <span className="mr-1.5 ">✦</span>
                  <span className="font-bold text-base sm:text-lg">Nền tảng chính thức</span>
                  <span className="ml-1.5">✦</span>
                </div>
                <span className="mx-5 text-3xl sm:text-4xl md:text-5xl font-bold my-3 sm:my-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary p-1">
                  Computer Store
                </span>
              </div>
              <div className="relative bg-card rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-background px-3 sm:px-4 py-1.5 rounded-full border shadow-sm">
                    <span className="text-primary font-bold text-sm sm:text-base whitespace-nowrap">Xin chào</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base mt-4 mb-6 text-card-foreground leading-relaxed">
                  Chào mừng bạn đến với Computer Store – nơi mà đam mê công nghệ gặp gỡ sự tin cậy và chất lượng. Tại đây, chúng tôi không chỉ cung cấp đa dạng các sản phẩm máy tính, linh kiện, phụ kiện và thiết bị công nghệ hiện đại nhất, mà còn cam kết mang đến cho bạn trải nghiệm mua sắm hoàn hảo với dịch vụ tư vấn chuyên nghiệp, hỗ trợ tận tình và giá cả cạnh tranh nhất trên thị trường. Cho dù bạn là người mới bắt đầu hay một chuyên gia công nghệ, Computer Store luôn đồng hành cùng bạn để đáp ứng mọi nhu cầu, giúp bạn khám phá những giải pháp tối ưu và nâng tầm trải nghiệm số của mình. Hãy để Computer Store trở thành điểm đến tin cậy cho mọi lựa chọn công nghệ của bạn!
                </p>

                <div className="">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full flex justify-between items-center py-2.5 sm:py-6 px-3 sm:px-4 text-sm hover:bg-secondary/80"
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    aria-expanded={isInfoOpen}
                  >
                    <div className="flex items-center ">
                      <Info className="h-4 w-4 mr-2" />
                      <span>Đặc điểm của nền tảng</span>
                    </div>
                    <motion.div animate={{ rotate: isInfoOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                  <AnimatePresence>
                    {isInfoOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mt-3 sm:mt-4 bg-background/50 p-4 sm:p-6 rounded-lg border">
                          <div className="space-y-3 sm:space-y-4 text-sm">
                            <p>
                              Computer Store cung cấp đa dạng các sản phẩm máy tính, linh kiện, phụ kiện và thiết bị công nghệ hiện đại nhất, từ các sản phẩm chính hãng đến các sản phẩm độc quyền. Chúng tôi cam kết mang đến cho khách hàng trải nghiệm mua sắm hoàn hảo với giá cả cạnh tranh nhất trên thị trường, đồng thời đảm bảo chất lượng sản phẩm và dịch vụ tư vấn chuyên nghiệp. Với Computer Store, bạn sẽ tìm thấy những giải pháp tối ưu và nâng tầm trải nghiệm số của mình, từ các sản phẩm máy tính, linh kiện, phụ kiện và thiết bị công nghệ hiện đại nhất, đến các sản phẩm độc quyền và các sản phẩm chính hãng. Computer Store cam kết mang đến cho khách hàng trải nghiệm mua sắm hoàn hảo với giá cả cạnh tranh nhất trên thị trường, đồng thời đảm bảo chất lượng sản phẩm và dịch vụ tư vấn chuyên nghiệp.
                            </p>
                            <p>
                              Computer Store cam kết mang đến cho khách hàng trải nghiệm mua sắm hoàn hảo với giá cả cạnh tranh nhất trên thị trường, đồng thời đảm bảo chất lượng sản phẩm và dịch vụ tư vấn chuyên nghiệp.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                              <Button className="gap-2" size="sm" onClick={handleScrollToProducts}>
                                <Search className="h-4 w-4" />
                                Xem sản phẩm
                              </Button>

                              <ContactUsTrigger className="w-auto">
                                <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                                  <HelpCircle className="h-4 w-4 " />
                                  Liên hệ
                                </Button>
                              </ContactUsTrigger>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1.5 text-primary" />
                  An toàn
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-primary" />
                  Hỗ trợ
                </div>
                <div className="flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1.5 text-primary" />
                  Chính thức
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <div
        className={`sticky top-[76px] md:top-[88px] z-20 bg-background/95 backdrop-blur-sm ${isScrolled ? "py-3 sm:py-3 shadow-md" : "py-3 sm:py-3 shadow-sm"
          } transition-all duration-200 border-b`}
      >
        <div className="container mx-auto px-4">
          <div className="relative max-w-xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                aria-label="Tìm kiếm sản phẩm"
                placeholder="Tìm kiếm sản phẩm"
                className="pl-10 pr-3 w-full shadow-sm h-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <section ref={ticketSectionRef} id="product-display-section" className="py-6 sm:py-8 w-full bg-muted/50 scroll-mt-24 md:scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <div className="col-span-12">
              <div className="mb-6 sm:mb-8 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold">Sản phẩm Máy Tính</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Các sản phẩm máy tính chất lượng cao</p>
              </div>
              <div className="md:border md:border-border/50 md:p-4 md:rounded-lg md:bg-card md:shadow-sm">
                <ProductDisplaySection products={computerProducts} isLoading={isLoadingComputerProducts} error={productDisplayError} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
