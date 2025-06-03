// src/pages/TicketPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DatePicker, DatePickerProps } from "@/components/DatePicker";
import TicketSelector from "@/components/TicketSelector";
import { Button } from "@/components/ui/button";
import {
  Landmark,
  Calendar,
  Ticket as TicketIcon,
  ScrollText,
  HelpCircle,
  Building,
  MapPin,
  Clock,
  ClipboardList,
  GalleryVertical,
  Info,
  ListChecks,
  FileText,
  AlertCircle,
  Loader2,
  ExternalLink,
  CalendarDays,
  ShoppingBag,
  LogIn,
  UserPlus,
  CreditCard,
  Flower,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Cart, { CartItem, CartItemTicket } from "@/components/ticket/Cart";

import { fetchTicketProfileById, fetchTicketVariants } from "@/services/ticketService";
import { TicketProfileDataDTO, FetchTicketProfileResponseDTO, TicketVariantDTO } from "@/types/api/ticket.api";

import { useAuthStore } from "@/store/authStore";
import EnhancedImageGallery, { GalleryImage } from "@/components/EnhancedImageGallery";

import TicketDetailsTab from "@/components/ticket/TicketDetailsTab";
import OrganiserTab from "@/components/ticket/OrganiserTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  price: number;
  min: number;
  max: number;
  isSoldOut: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
  Ticket: TicketIcon,
  ScrollText,
  HelpCircle,
  Building,
  MapPin,
  Clock,
  ClipboardList,
  GalleryVertical,
  Landmark,
  Calendar,
  Info,
  ListChecks,
  FileText,
  AlertCircle,
  ExternalLink,
  CreditCard,
  UserPlus,
  Flower,
  default: FileText,
};

const LucideIconRenderer = ({ name, className, size = 20 }: { name: string; className?: string; size?: number }) => {
  const IconComponent = iconMap[name] || iconMap["default"];
  return <IconComponent className={className} size={size} />;
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } },
};

const TicketPage = () => {
  const { ticketGroupId } = useParams<{ ticketGroupId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMobile = useIsMobile();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentTicketCategories, setCurrentTicketCategories] = useState<TicketCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false); // For any category load
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("ticket");
  const [showPaymentRedirectDialog, setShowPaymentRedirectDialog] = useState<boolean>(false);

  // New states for robust initial load
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState<boolean>(false);
  const [initialCategoryLoadError, setInitialCategoryLoadError] = useState<string | null>(null);

  const USE_HARDCODED_DEMO_IMAGES = true;
  const NAVBAR_HEIGHT_PX = 78;
  const MOBILE_STICKY_TABS_BAR_HEIGHT_CLASSES = "h-14";
  const MOBILE_STICKY_CART_BAR_HEIGHT_CLASSES = "pb-24";

  const {
    data: apiResponse,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery<FetchTicketProfileResponseDTO, Error, FetchTicketProfileResponseDTO, [string, string | undefined]>({
    queryKey: ["ticketProfile", ticketGroupId],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      if (!id) throw new Error("ID Kumpulan Tiket tiada untuk pertanyaan."); // Translated
      return fetchTicketProfileById(id);
    },
    enabled: !!ticketGroupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Transform isTicketInternal from "1"/"0" to boolean
      if (data.respCode === 2000 && data.result?.ticketProfile) {
        return {
          ...data,
          result: {
            ...data.result,
            ticketProfile: { ...data.result.ticketProfile, isTicketInternalBoolean: data.result.ticketProfile.isTicketInternal === "1" },
          },
        };
      }
      return data;
    },
  });

  const ticketGroupData: TicketProfileDataDTO | undefined = apiResponse?.respCode === 2000 ? apiResponse.result.ticketProfile : undefined;

  const displayError =
    profileError || (apiResponse && apiResponse.respCode !== 2000 ? new Error(apiResponse.respDesc || "Gagal memuatkan butiran tiket.") : null); // Translated

  // Fetch categories for manual date changes by the user (after initial setup)
  const fetchTicketCategoriesForDate = useCallback(
    async (date: Date, groupData: TicketProfileDataDTO) => {
      if (!date || !groupData?.ticketGroupId) {
        setCurrentTicketCategories([]);
        return;
      }
      setIsLoadingCategories(true);
      setQuantities({}); // Reset quantities when date changes
      setInitialCategoryLoadError(null); // Clear initial load error as user is manually changing date

      try {
        const variantsResponse = await fetchTicketVariants(groupData.ticketGroupId.toString(), date);
        if (variantsResponse.respCode === 2000 && variantsResponse.result?.ticketVariants) {
          let fetchedTickets: TicketCategory[] = variantsResponse.result.ticketVariants.map((variant: TicketVariantDTO) => ({
            id: variant.ticketId,
            name: variant.itemDesc1,
            description: variant.itemDesc2 || variant.itemDesc3 || undefined,
            price: variant.unitPrice,
            min: 0, // Assuming min 0, adjust if API provides this
            max: variant.qty + 10, // Simulation from original, adjust based on actual API
            isSoldOut: variant.qty + 10 === 0, // Simulation from original
          }));
          setCurrentTicketCategories(fetchedTickets);
          if (fetchedTickets.length === 0) {
            toast({ title: "Tiada Tiket Tersedia", description: `Tiada tiket ditemui untuk ${format(date, "PPP")}.`, variant: "default" }); // Translated
          }
        } else {
          toast({
            title: "Ralat Mendapatkan Tiket", // Translated
            description: variantsResponse.respDesc || "Tidak dapat memuatkan jenis tiket untuk tarikh yang dipilih.", // Translated
            variant: "destructive",
          });
          setCurrentTicketCategories([]);
        }
      } catch (err: any) {
        console.error("Gagal mendapatkan kategori tiket:", err); // Translated
        toast({ title: "Ralat", description: err.message || "Ralat tidak dijangka berlaku semasa memuatkan jenis tiket.", variant: "destructive" }); // Translated
        setCurrentTicketCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    },
    [toast]
  );

  // useEffect for subsequent date changes by the user
  useEffect(() => {
    if (isInitialSetupComplete && selectedDate && ticketGroupData) {
      fetchTicketCategoriesForDate(selectedDate, ticketGroupData);
    }
  }, [isInitialSetupComplete, selectedDate, ticketGroupData, fetchTicketCategoriesForDate]);

  // useEffect for robust initial category fetch
  useEffect(() => {
    if (!ticketGroupData || !selectedDate || isInitialSetupComplete) {
      // If data isn't ready, or initial setup already ran, do nothing.
      // If ticketGroupData is loaded but we determined initial setup is already complete (e.g. from a quick path)
      // ensure date picker is enabled for any subsequent user interactions.
      if (ticketGroupData && !isInitialSetupComplete && !isLoadingProfile) {
        setIsInitialSetupComplete(true); // Fallback to ensure datepicker is enabled if this effect is skipped
      }
      return;
    }

    let attempts = 0;
    const maxAttempts = 2; // Initial attempt + 1 retry
    const initialDelayMs = 1000; // 1-second breather before first attempt
    const retryDelayMs = 2000; // 2 seconds between retries

    let componentIsMounted = true; // To prevent state updates on unmounted component
    let overallTimeoutId: NodeJS.Timeout | null = null;

    const performInitialFetch = async () => {
      if (!componentIsMounted) return;

      setIsLoadingCategories(true);
      setInitialCategoryLoadError(null);
      attempts++;

      try {
        const response = await fetchTicketVariants(ticketGroupData.ticketGroupId.toString(), selectedDate);
        if (!componentIsMounted) return; // Check again after await

        if (response.respCode === 2000 && response.result?.ticketVariants) {
          let fetchedTickets: TicketCategory[] = response.result.ticketVariants.map((variant: TicketVariantDTO) => ({
            id: variant.ticketId,
            name: variant.itemDesc1,
            description: variant.itemDesc2 || variant.itemDesc3 || undefined,
            price: variant.unitPrice,
            min: 0,
            max: variant.qty + 10, // Simulation from original
            isSoldOut: variant.qty + 10 === 0, // Simulation from original
          }));
          setCurrentTicketCategories(fetchedTickets);
          setQuantities({});
          setIsLoadingCategories(false);
          setIsInitialSetupComplete(true);
          if (overallTimeoutId) clearTimeout(overallTimeoutId);
          return; // Success
        } else {
          throw new Error(response.respDesc || `Ralat API ${response.respCode} mendapatkan kategori tiket.`); // Translated
        }
      } catch (error: any) {
        if (!componentIsMounted) return; // Check again after await
        console.error(`Percubaan muat awal ${attempts} gagal:`, error); // Translated
        if (attempts < maxAttempts) {
          toast({ title: `Percubaan ${attempts} Gagal`, description: "Mencuba semula untuk mendapatkan kategori tiket...", variant: "default" }); // Translated
          setTimeout(() => {
            if (componentIsMounted) performInitialFetch();
          }, retryDelayMs);
        } else {
          toast({
            title: "Muatan Awal Gagal", // Translated
            description: "Tidak dapat memuatkan kategori tiket. Sila cuba pilih tarikh atau muat semula.", // Translated
            variant: "destructive",
          });
          setCurrentTicketCategories([]);
          setInitialCategoryLoadError("Gagal memuatkan kategori tiket pada mulanya. Sila pilih tarikh."); // Translated
          setIsLoadingCategories(false);
          setIsInitialSetupComplete(true); // Allow user interaction even if initial load failed
          if (overallTimeoutId) clearTimeout(overallTimeoutId);
        }
      }
    };

    // Start initial fetch after a short delay
    setTimeout(() => {
      if (componentIsMounted) performInitialFetch();
    }, initialDelayMs);

    // Overall timeout for the initial setup process
    overallTimeoutId = setTimeout(() => {
      if (componentIsMounted && !isInitialSetupComplete) {
        toast({
          title: "Pemuatan Mengambil Masa Lebih Lama Daripada Dijangka", // Translated
          description: "Membolehkan pemilihan tarikh. Jika kategori belum dimuatkan, sila cuba tukar tarikh atau muat semula.", // Translated
          variant: "default",
        });
        setIsInitialSetupComplete(true); // Enable date picker
        setIsLoadingCategories(false); // Stop loading indicator
        if (currentTicketCategories.length === 0 && !initialCategoryLoadError) {
          setInitialCategoryLoadError("Pemuatan kategori tiket tamat masa. Sila pilih tarikh."); // Translated
        }
      }
    }, 10000); // 10 seconds timeout for the entire initial setup process

    return () => {
      // Cleanup
      componentIsMounted = false;
      if (overallTimeoutId) clearTimeout(overallTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketGroupData, isInitialSetupComplete, toast]); // selectedDate removed, uses initial selectedDate
  // fetchTicketCategoriesForDate removed as it's for manual changes

  const handleQuantityChange = (id: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: quantity }));
  };

  const totalAmount = useMemo(() => {
    return currentTicketCategories.reduce((sum, category) => {
      const quantity = quantities[category.id] || 0;
      return sum + category.price * quantity;
    }, 0);
  }, [quantities, currentTicketCategories]);

  const totalTickets = useMemo(() => {
    return Object.values(quantities).reduce((sum, quantity) => sum + (quantity || 0), 0);
  }, [quantities]);

  const handleCheckout = () => {
    if (isMobile) window.scrollTo({ top: 0, behavior: "smooth" });
    if (!selectedDate) {
      toast({ title: "Pilih tarikh", description: "Sila pilih tarikh lawatan.", variant: "destructive" }); // Translated
      return;
    }
    if (totalTickets === 0) {
      toast({ title: "Tiada tiket dipilih", description: "Sila tambah tiket untuk meneruskan.", variant: "destructive" }); // Translated
      return;
    }
    // if (!isAuthenticated) {
    //     setShowAuthDialog(true);
    //     return;
    // }
    setShowCart(true);
  };

  const handleCartCancel = () => setShowCart(false);

  const handlePaymentInitiated = (orderID?: number, redirectURL?: string) => {
    setShowCart(false);
    setShowPaymentRedirectDialog(true);
    setTimeout(() => {
      setShowPaymentRedirectDialog(false);
      if (redirectURL) {
        toast({ title: "Mengarahkan ke Pembayaran", description: "Anda akan diarahkan untuk melengkapkan pembayaran anda." }); // Translated
        window.location.href = redirectURL;
      } else if (orderID) {
        // Reset state after successful order (if no redirect)
        setSelectedDate(new Date());
        setQuantities({});
        setCurrentTicketCategories([]);
        toast({ title: "Pesanan Disahkan!", description: `ID Pesanan anda ialah ${orderID}. Semak emel anda untuk butiran.` }); // Translated
        navigate("/order-confirmation", { state: { orderId: orderID } });
      } else {
        toast({ title: "Isu Pesanan", description: "Terdapat isu semasa memulakan pesanan anda. Sila cuba lagi.", variant: "destructive" }); // Translated
      }
    }, 2500); // Give user time to see the dialog
  };

  const cartItems: CartItem[] = useMemo(() => {
    if (!selectedDate || !ticketGroupData) return [];
    const cartEntryId = `${ticketGroupData.ticketGroupId}_${selectedDate.toISOString().split("T")[0]}`;

    const ticketsForCart: CartItemTicket[] = currentTicketCategories
      .filter((cat) => (quantities[cat.id] || 0) > 0)
      .map((cat) => ({ id: cat.id, category: cat.name, quantity: quantities[cat.id] || 0, price: cat.price }));

    if (ticketsForCart.length === 0) return [];

    return [
      {
        id: cartEntryId,
        ticketGroupId: ticketGroupData.ticketGroupId.toString(),
        groupType: ticketGroupData.groupType,
        name: ticketGroupData.groupName,
        date: selectedDate,
        tickets: ticketsForCart,
      },
    ];
  }, [selectedDate, quantities, currentTicketCategories, ticketGroupData]);

  const datePickerProps: DatePickerProps = {
    date: selectedDate,
    setDate: setSelectedDate,
    disabled: isLoadingProfile || !isInitialSetupComplete || (ticketGroupData && !ticketGroupData.isActive) || isLoadingCategories,
    minDate: ticketGroupData?.activeStartDate ? new Date(ticketGroupData.activeStartDate) : new Date(), // Ensure minDate is today or future
    maxDate: ticketGroupData?.activeEndDate ? new Date(ticketGroupData.activeEndDate) : undefined,
    placeholder: "Pilih tarikh", // Translated
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto my-10" />
          <p className="text-lg text-muted-foreground">Memuatkan maklumat tiket...</p> {/* Translated */}
        </div>
        <Footer />
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center flex-grow flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto my-10" />
          <h2 className="text-2xl font-semibold text-destructive mb-4">Berlaku Ralat</h2> {/* Translated */}
          <p className="text-base text-muted-foreground">{displayError.message}</p>
          <Button onClick={() => navigate("/")} className="mt-6">
            Pergi ke Laman Utama {/* Translated */}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticketGroupData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center flex-grow flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto my-10" />
          <p className="text-xl font-medium text-muted-foreground">Maklumat tiket tidak ditemui.</p> {/* Translated */}
          <Button onClick={() => navigate("/")} className="mt-6">
            Pergi ke Laman Utama {/* Translated */}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-0 sm:px-4 py-5 sm:py-8 flex-grow">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center text-foreground">Sahkan Pilihan Anda</h1>{" "}
          {/* Translated */}
          <Cart items={cartItems} onPaymentComplete={handlePaymentInitiated} onCancel={handleCartCancel} isMember={isAuthenticated} />
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImagesForComponent: GalleryImage[] = ticketGroupData.groupGallery
    ? ticketGroupData.groupGallery.map((img) => ({
        groupGalleryId: img.groupGalleryId,
        uniqueExtension: img.uniqueExtension,
        attachmentName: img.attachmentName,
      }))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Mobile Sticky Tabs */}
      {isMobile && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="sticky bg-background/95 backdrop-blur-sm shadow-md py-2 px-3 z-30 md:hidden"
          style={{ top: `${NAVBAR_HEIGHT_PX}px` }}
        >
          <TabsList className="grid grid-cols-3 w-full bg-muted p-1 h-auto">
            <TabsTrigger
              value="ticket"
              className="text-xs py-1.5 data-[state=active]:text-sm data-[state=active]:font-semibold data-[state=active]:text-primary"
            >
              Tiket {/* Translated */}
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs py-1.5 data-[state=active]:text-sm data-[state=active]:font-semibold data-[state=active]:text-primary"
            >
              Butiran {/* Translated */}
            </TabsTrigger>
            <TabsTrigger
              value="organiser"
              className="text-xs py-1.5 data-[state=active]:text-sm data-[state=active]:font-semibold data-[state=active]:text-primary"
            >
              Penganjur {/* Translated */}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Header Section */}
      <header
        className={cn(
          "relative bg-gradient-to-r from-primary/25 via-primary/15 to-transparent overflow-hidden h-[205px] flex items-center justify-center md:pl-6",
          isMobile && `mt-0`
        )}
      >
        {(() => {
          let thumbnailUrl = "";
          if (ticketGroupId === "1") {
            thumbnailUrl = "/tamanbotani1.jpg";
          } else if (ticketGroupId === "2") {
            thumbnailUrl = "/zoo1.jpg";
          } else {
            thumbnailUrl = "/bsi1.jpg";
          }
          return (
            <img
              src={thumbnailUrl}
              alt="Latar belakang pemandangan untuk pengepala halaman tiket" // Translated
              className="absolute inset-0 w-full h-full object-cover opacity-5 blur-sm pointer-events-none select-none"
              aria-hidden="true"
            />
          );
        })()}

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex md:flex-row md:items-center gap-x-3 sm:gap-x-4 gap-y-2 mb-2 sm:mb-3">
            <LucideIconRenderer name="Landmark" className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{ticketGroupData.groupName}</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-2 sm:mb-3 py-2 sm:py-0 max-w-3xl">{ticketGroupData.groupDesc}</p>
        </div>
      </header>

      <main className={cn("sm:container mx-auto py-1 sm:py-8 flex-grow", isMobile && MOBILE_STICKY_CART_BAR_HEIGHT_CLASSES)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 sm:gap-6">
          {/* Left Column: Tabs and Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="sm:shadow-lg sm:border-border sm:border sm:rounded-lg">
              <CardContent className="p-3 sm:p-4 md:p-6">
                {" "}
                {/* Use CardContent for consistent padding */}
                <Tabs defaultValue="ticket" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className={cn("w-full bg-muted mb-4 sm:mb-6 p-2", isMobile ? "hidden" : "grid grid-cols-1 sm:grid-cols-3")}>
                    <TabsTrigger
                      value="ticket"
                      className="text-xs py-2 sm:text-sm data-[state=active]:text-sm data-[state=active]:sm:text-base data-[state=active]:font-semibold"
                    >
                      Tiket {/* Translated */}
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="text-xs py-2 sm:text-sm data-[state=active]:text-sm data-[state=active]:sm:text-base data-[state=active]:font-semibold"
                    >
                      Butiran {/* Translated */}
                    </TabsTrigger>
                    <TabsTrigger
                      value="organiser"
                      className="text-xs py-2 sm:text-sm data-[state=active]:text-sm data-[state=active]:sm:text-base data-[state=active]:font-semibold"
                    >
                      Penganjur {/* Translated */}
                    </TabsTrigger>
                  </TabsList>

                  {/* Ticket Tab Content */}
                  <TabsContent value="ticket" className="space-y-4 md:space-y-6">
                    {(galleryImagesForComponent.length > 0 || USE_HARDCODED_DEMO_IMAGES) && (
                      <Card>
                        <CardHeader className="p-3 sm:p-4">
                          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                            <LucideIconRenderer name="GalleryVertical" className="text-primary" /> Galeri {/* Translated */}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4">
                          <EnhancedImageGallery
                            images={galleryImagesForComponent}
                            ticketGroupName={ticketGroupData.groupName}
                            ticketGroupId={ticketGroupId}
                            useHardcodedDemoImages={USE_HARDCODED_DEMO_IMAGES}
                          />
                        </CardContent>
                      </Card>
                    )}
                    <Card>
                      <CardHeader className="p-3 sm:p-4">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                          <LucideIconRenderer name="Calendar" className="text-primary" /> Pilih Tarikh Lawatan {/* Translated */}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-1 px-3 sm:px-4">
                        <DatePicker {...datePickerProps} />
                        {!ticketGroupData.isActive && (
                          <p className="text-xs sm:text-sm text-destructive mt-3 sm:mt-4">Tarikan ini tidak tersedia untuk tempahan pada masa ini.</p>
                        )}
                        {ticketGroupData.isActive && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-3 mx-1 mb-2 sm:mb-0">
                            Tiket hanya sah untuk tarikh yang dipilih. Sila semak waktu operasi. {/* Translated */}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3 sm:p-4">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                          <LucideIconRenderer name="Ticket" className="text-primary" /> Pilih Tiket {/* Translated */}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="min-h-[150px] sm:min-h-[200px] flex flex-col justify-center relative p-3 sm:p-4">
                        <AnimatePresence mode="wait">
                          {initialCategoryLoadError &&
                            !isLoadingCategories && ( // Display error if initial load failed and not currently loading
                              <motion.div
                                key="initial-load-error"
                                variants={contentVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="flex flex-col items-center justify-center text-center py-6 sm:py-8 text-destructive"
                              >
                                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 mb-2" strokeWidth={1.5} />
                                <p className="text-xs sm:text-sm font-medium">{initialCategoryLoadError}</p>
                              </motion.div>
                            )}
                          {!selectedDate && !initialCategoryLoadError && (
                            <motion.div
                              key="prompt-date"
                              variants={contentVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="bg-muted/80 border border-dashed border-muted-foreground/40 p-4 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center"
                            >
                              <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 text-muted-foreground/80" strokeWidth={1.5} />
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground/80">Sila pilih tarikh lawatan di atas</p>{" "}
                              {/* Translated */}
                              <p className="text-xs text-muted-foreground/90 mt-1">Tiket yang tersedia akan dipaparkan di sini.</p> {/* Translated */}
                            </motion.div>
                          )}
                          {selectedDate && isLoadingCategories && (
                            <motion.div
                              key="loading-categories"
                              variants={contentVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="flex flex-col items-center justify-center text-muted-foreground py-6 sm:py-8 sm:-mt-8"
                            >
                              <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary mb-2 sm:mb-3" />
                              <p className="text-xs sm:text-sm">Memuatkan pilihan tiket untuk {format(selectedDate, "PPP")}...</p> {/* Translated */}
                            </motion.div>
                          )}
                          {selectedDate && !isLoadingCategories && currentTicketCategories.length === 0 && !initialCategoryLoadError && (
                            <motion.div
                              key="no-tickets"
                              variants={contentVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="flex flex-col items-center justify-center text-center py-6 sm:py-8 sm:-mt-8"
                            >
                              <TicketIcon className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-muted-foreground/70" strokeWidth={1.5} />
                              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                                Tiada tiket tersedia untuk tarikh yang dipilih. {/* Translated */}
                              </div>
                              <div className="text-xs text-muted-foreground/80 mt-1">Sila cuba tarikh lain atau semak semula kemudian.</div>{" "}
                              {/* Translated */}
                            </motion.div>
                          )}
                          {selectedDate && !isLoadingCategories && currentTicketCategories.length > 0 && !initialCategoryLoadError && (
                            <motion.div key="ticket-selector" variants={contentVariants} initial="initial" animate="animate" exit="exit">
                              <TicketSelector categories={currentTicketCategories} quantities={quantities} onQuantityChange={handleQuantityChange} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Details Tab Content */}
                  <TabsContent value="details">
                    {" "}
                    {ticketGroupData && <TicketDetailsTab ticketGroupData={ticketGroupData} LucideIconRenderer={LucideIconRenderer} />}
                  </TabsContent>

                  {/* Organiser Tab Content */}
                  <TabsContent value="organiser">
                    {ticketGroupData && <OrganiserTab ticketGroupData={ticketGroupData} LucideIconRenderer={LucideIconRenderer} />}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 p-3 sm:p-0 mb-3">
            {" "}
            {/* Added mb-3 for spacing before footer on mobile */}
            <Card className="shadow border-border md:sticky md:top-28">
              <CardHeader className="p-4 sm:p-5">
                <CardTitle className="text-lg sm:text-xl font-semibold">Ringkasan Pesanan</CardTitle> {/* Translated */}
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-4 sm:p-5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarikh Dipilih</span> {/* Translated */}
                  <span className="font-medium text-foreground">
                    {selectedDate ? selectedDate.toLocaleDateString("ms-MY", { year: "numeric", month: "long", day: "numeric" }) : "Belum dipilih"}{" "}
                    {/* Translated & locale */}
                  </span>
                </div>
                <div className="border-t border-border pt-2 sm:pt-3 space-y-1">
                  {currentTicketCategories
                    .filter((cat) => (quantities[cat.id] || 0) > 0)
                    .map((cat) => {
                      const quantity = quantities[cat.id] || 0;
                      if (quantity === 0) return null;
                      return (
                        <div key={cat.id} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {cat.name} × {quantity}
                          </span>
                          <span className="text-foreground">RM {(cat.price * quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  {totalTickets === 0 && <div className="italic text-muted-foreground text-center py-10">Tiada tiket dipilih.</div>}{" "}
                  {/* Translated */}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t p-4 sm:p-5">
                <div className="flex justify-between font-semibold w-full text-sm sm:text-base">
                  <span className="text-foreground">Jumlah Keseluruhan</span> {/* Translated */}
                  <span className="text-primary">RM {totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full text-sm sm:text-base py-2.5 md:py-3 font-semibold"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={
                    totalTickets === 0 ||
                    !selectedDate ||
                    !ticketGroupData.isActive ||
                    isLoadingProfile ||
                    isLoadingCategories ||
                    !isInitialSetupComplete
                  }
                >
                  {isLoadingCategories ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                  Teruskan ke Pembayaran {/* Translated */}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-1 sm:mt-2">
                  Dengan meneruskan, anda bersetuju dengan Syarat Perkhidmatan dan Polisi Bayaran Balik kami. {/* Translated */}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Cart/Checkout Bar */}
      {isMobile && totalTickets > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-sm border-t z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="mx-4 mx-auto flex items-center justify-between gap-3">
            <div className="flex-shrink min-w-0">
              <p className="text-xs text-muted-foreground truncate">{totalTickets} item dipilih</p> {/* Translated */}
              <p className="text-lg font-bold text-primary">RM {totalAmount.toFixed(2)}</p>
            </div>
            <Button onClick={handleCheckout} className="font-semibold flex-shrink-0 px-4 py-2.5 text-sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Lihat Troli {/* Translated */}
            </Button>
          </div>
        </div>
      )}

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="p-4 sm:p-6 text-center">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Log Masuk atau Daftar</DialogTitle> {/* Translated */}
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              Untuk menyimpan sejarah pesanan anda dan untuk daftar keluar yang lebih pantas pada masa akan datang, sila log masuk atau cipta akaun.{" "}
              {/* Translated */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 pt-3 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAuthDialog(false);
                setShowCart(true);
              }}
              className="w-full text-sm sm:text-base"
            >
              Teruskan sebagai Tetamu {/* Translated */}
            </Button>
            <Link to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} className="w-full">
              <Button className="w-full text-sm sm:text-base">
                <LogIn className="mr-2 h-4 w-4" /> Log Masuk / Daftar {/* Translated */}
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Redirect Dialog */}
      <Dialog open={showPaymentRedirectDialog} onOpenChange={setShowPaymentRedirectDialog}>
        <DialogContent className="sm:max-w-md p-8 text-center">
          <DialogHeader className="items-center">
            <div className="p-3 bg-primary/10 rounded-full inline-block mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">Mengarahkan ke Pembayaran</DialogTitle> {/* Translated */}
            <DialogDescription className="text-sm text-muted-foreground mt-2 text-center">
              Sila tunggu sementara kami memindahkan anda dengan selamat ke gerbang pembayaran. Jangan tutup atau muat semula halaman ini.{" "}
              {/* Translated */}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
          <DialogFooter className="text-xs text-muted-foreground">Pemprosesan pembayaran selamat oleh JohorPay.</DialogFooter> {/* Translated */}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default TicketPage;
