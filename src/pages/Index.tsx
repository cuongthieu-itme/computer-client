import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TicketDisplaySection from "@/components/TicketDisplaySection";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React, { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Ticket,
  SlidersHorizontal,
  QrCode,
  BadgePercent,
  Info,
  Search,
  HelpCircle,
  ShieldCheck,
  Clock,
  BadgeCheck,
  ChevronDown,
  Bus,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  MoreHorizontal,
  Tag,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useQuery } from "@tanstack/react-query";
import { fetchAllTicketGroups } from "@/services/ticketService";
import { FetchTicketGroupsResponseDTO, TicketGroupDTO } from "@/types/api/ticket.api";
import { cn } from "@/lib/utils";
import ContactUsTrigger from "@/components/documents/ContactUsTrigger";

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

  const ticketGroups: TicketGroupDTO[] | undefined = ticketApiResponse?.respCode === 2000 ? ticketApiResponse.result.ticketGroups : undefined;

  const displayError =
    ticketGroupsError ||
    (ticketApiResponse && ticketApiResponse.respCode !== 2000 ? new Error(ticketApiResponse.respDesc || t("pages.Index.error.failedToFetchTickets")) : null);

  const carouselImages = [
    { src: "/e-t-0.jpg", alt: t("pages.Index.carousel.alt.banner0"), label: t("pages.Index.carousel.label.excitingEvents") },
    { src: "/e-t-1.jpg", alt: t("pages.Index.carousel.alt.banner1"), label: t("pages.Index.carousel.label.attractionsLeisure") },
    { src: "/e-t-2.jpg", alt: t("pages.Index.carousel.alt.banner2"), label: t("pages.Index.carousel.label.tourismTransport") },
    { src: "/e-t-3.jpg", alt: t("pages.Index.carousel.alt.banner3"), label: t("pages.Index.carousel.label.eventsExhibitions") },
    { src: "/e-t-4.jpg", alt: t("pages.Index.carousel.alt.banner4"), label: t("pages.Index.carousel.label.others") },
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

  // Categories for filter popover (assuming these might be dynamic or from a config later)
  // const categories = [
  //   { name: t("pages.Index.categories.attractionsLeisure"), count: 42, iconName: "Ticket" },
  //   { name: t("pages.Index.categories.tourismTransport"), count: 28, iconName: "Bus" },
  //   { name: t("pages.Index.categories.events"), count: 35, iconName: "CalendarIcon" },
  //   { name: t("pages.Index.categories.exhibitions"), count: 19, iconName: "ImageIcon" },
  //   { name: t("pages.Index.categories.others"), count: 14, iconName: "MoreHorizontal" },
  // ];

  // const LucideIcon = ({ name, className }: { name: string; className?: string }) => {
  //   const IconComponents: { [key: string]: React.ElementType } = {
  //     Ticket,
  //     Bus,
  //     CalendarIcon,
  //     ImageIcon,
  //     MoreHorizontal,
  //     Tag,
  //   };
  //   const IconComponent = IconComponents[name];
  //   return IconComponent ? <IconComponent className={className} /> : <Tag className={className} />;
  // };

  const handleScrollToTickets = () => {
    ticketSectionRef.current?.scrollIntoView({ behavior: "smooth" });
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
                  <span className="font-bold text-base sm:text-lg">{t("pages.Index.welcome.badge.officialPlatform")}</span>
                  <span className="ml-1.5">✦</span>
                </div>
                <span className="mx-5 text-3xl sm:text-4xl md:text-5xl font-bold my-3 sm:my-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary p-1">
                  {t("pages.Index.welcome.mainHeading")}
                </span>
              </div>
              <div className="relative bg-card rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-background px-3 sm:px-4 py-1.5 rounded-full border shadow-sm">
                    <span className="text-primary font-bold text-sm sm:text-base whitespace-nowrap">{t("pages.Index.welcome.greeting")}</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base mt-4 mb-6 text-card-foreground leading-relaxed">
                  {t("pages.Index.welcome.description")}
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
                      <span>{t("pages.Index.welcome.collapsible.platformFeatures")}</span>
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
                              {t("pages.Index.welcome.collapsible.infoParagraph1")}
                            </p>
                            <p>
                              {t("pages.Index.welcome.collapsible.infoParagraph2")}
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                              <Button className="gap-2" size="sm" onClick={handleScrollToTickets}>
                                <Search className="h-4 w-4" />
                                {t("pages.Index.welcome.collapsible.exploreTicketsButton")}
                              </Button>

                              <ContactUsTrigger className="w-auto">
                                <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                                  <HelpCircle className="h-4 w-4 " />
                                  {t("pages.Index.welcome.collapsible.contactUsButton")}
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
                  {t("pages.Index.welcome.features.securePayment")}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-primary" />
                  {t("pages.Index.welcome.features.customerSupport")}
                </div>
                <div className="flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1.5 text-primary" />
                  {t("pages.Index.welcome.features.officialPortal")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <div
        className={`sticky top-[76px] md:top-[88px] z-20 bg-background/95 backdrop-blur-sm ${
          isScrolled ? "py-3 sm:py-3 shadow-md" : "py-3 sm:py-3 shadow-sm"
        } transition-all duration-200 border-b`}
      >
        <div className="container mx-auto px-4">
          <div className="relative max-w-xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                aria-label={t("pages.Index.search.ariaLabel")}
                placeholder={t("pages.Index.search.placeholder")}
                className="pl-10 pr-3 w-full shadow-sm h-10 text-sm"
              />
            </div>
            {/* Filter Popover - keeping it commented out as per original, can be localized if re-enabled
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10" aria-label={t("pages.Index.filter.openFilters")}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80 p-0" align="end">
                <div className="p-3 sm:p-4 border-b">
                  <h4 className="font-medium text-sm sm:text-base">{t("pages.Index.filter.title")}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("pages.Index.filter.subtitle")}</p>
                </div>
                <div className="p-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-2 sm:p-3 rounded-lg border hover:bg-accent/10 hover:border-accent cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
                          <LucideIcon name={category.iconName} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-center">{category.name}</span>
                        <span className="text-xs text-muted-foreground">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 border-t flex justify-between">
                  <Button variant="ghost" size="sm">
                    {t("pages.Index.filter.clearButton")}
                  </Button>
                  <Button size="sm">{t("pages.Index.filter.applyButton")}</Button>
                </div>
              </PopoverContent>
            </Popover>
            */}
          </div>
        </div>
      </div>

      <section ref={ticketSectionRef} id="ticket-display-section" className="py-6 sm:py-8 w-full bg-muted/50 scroll-mt-24 md:scroll-mt-28">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <div className="col-span-12">
              <div className="mb-6 sm:mb-8 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold">{t("pages.Index.ticketDisplay.heading")}</h2>
                <p className="text-muted-foreground text-sm sm:text-base">{t("pages.Index.ticketDisplay.subheading")}</p>
              </div>
              <div className="md:border md:border-border/50 md:p-4 md:rounded-lg md:bg-card md:shadow-sm">
                <TicketDisplaySection ticketGroups={ticketGroups} isLoading={isLoadingTicketGroups} error={displayError} />
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