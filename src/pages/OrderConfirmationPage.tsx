// src/pages/OrderConfirmationPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpDown,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ChevronRight, // Keep for "View Details" button
} from "lucide-react";
// Removed icons that are now handled by OrderDetailsDialog:
// FileText, Download, CalendarDays, Ticket, QrCode, CreditCard, UserCircle, Tag

import { useAuthStore } from "@/store/authStore";
import { fetchUserOrderHistory } from "@/services/paymentService";
import {
  FetchOrderHistoryResponseDTO,
  OrderHistoryItemDTO,
  FetchedOrderDetailsResultDTO, // To match prop type of OrderDetailsDialog
} from "@/types/api/payment.api";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { getTicketGroupImageUrl } from "@/lib/imageUtils";
import OrderDetailsDialog from "@/components/dialogs/OrderDetailsDialog"; // Import the reusable dialog
import FullScreenLoader from "@/components/common/FullScreenLoader"; // For auth loading

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  const [sortNewest, setSortNewest] = useState(true);

  // selectedOrder will now be of type FetchedOrderDetailsResultDTO | null
  // as OrderHistoryItemDTO has the same structure as FetchedOrderDetailsResultDTO
  const [selectedOrderData, setSelectedOrderData] = useState<FetchedOrderDetailsResultDTO | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: orderHistoryResponse,
    isLoading: isLoadingOrders,
    isError: isOrderFetchError,
    error: orderFetchErrorData,
  } = useQuery<FetchOrderHistoryResponseDTO, Error, FetchOrderHistoryResponseDTO, string[]>({
    queryKey: ["userOrderHistory"],
    queryFn: fetchUserOrderHistory,
    enabled: isAuthenticated && !isLoadingAuth, // Only fetch if authenticated and auth loading is done
  });

  const sortedOrders = useMemo(() => {
    if (orderHistoryResponse?.result?.orderTicketGroups) {
      return [...orderHistoryResponse.result.orderTicketGroups].sort((a, b) => {
        const dateA = a.orderProfile.createdAt && isValid(parseISO(a.orderProfile.createdAt)) ? parseISO(a.orderProfile.createdAt).getTime() : 0;
        const dateB = b.orderProfile.createdAt && isValid(parseISO(b.orderProfile.createdAt)) ? parseISO(b.orderProfile.createdAt).getTime() : 0;
        return sortNewest ? dateB - dateA : dateA - dateB;
      });
    }
    return [];
  }, [orderHistoryResponse, sortNewest]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      toast({
        title: "Log Masuk Diperlukan", // Translated
        description: "Sila log masuk untuk melihat sejarah pesanan anda.", // Translated
        variant: "destructive",
      });
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [isLoadingAuth, isAuthenticated, navigate, toast, location.pathname]);

  const toggleSortOrder = () => {
    setSortNewest(!sortNewest);
  };

  const handleViewDetails = (orderItem: OrderHistoryItemDTO) => {
    // OrderHistoryItemDTO has the same structure as FetchedOrderDetailsResultDTO
    setSelectedOrderData(orderItem as FetchedOrderDetailsResultDTO);
    setIsDetailDialogOpen(true);
  };

  const handleDialogPrimaryAction = (orderData: FetchedOrderDetailsResultDTO) => {
    // Example: Implement PDF download or other primary action
    toast({
      title: "Tindakan Dicetuskan", // Translated
      description: `Muat turun resit untuk pesanan ${orderData.orderProfile.orderNo} (Belum dilaksanakan).`, // Translated
    });
  };

  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return "T/B"; // Translated N/A
    try {
      const date = dateStr.includes("T") ? parseISO(dateStr) : new Date(dateStr.replace(/-/g, "/"));
      return isValid(date) ? format(date, "dd MMM yyyy, p") : "Tarikh Tidak Sah"; // Consistent date format, removed locale
    } catch {
      return "Tarikh Tidak Sah"; // Translated
    }
  };

  if (isLoadingAuth) {
    return <FullScreenLoader />; // Use FullScreenLoader while auth state is loading
  }

  if (!isAuthenticated && !isLoadingAuth) {
    // Ensure redirect only after auth check is complete
    // This state is mostly handled by the useEffect redirect, but serves as a fallback.
    // FullScreenLoader handles the initial loading phase.
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-6" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-destructive">Akses Ditolak</h2> {/* Translated */}
          <p className="text-sm sm:text-base text-muted-foreground mb-6">Sila log masuk untuk melihat sejarah pesanan anda.</p> {/* Translated */}
          <Button onClick={() => navigate("/login", { state: { from: location.pathname } })} size="lg">
            Pergi ke Log Masuk {/* Translated */}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoadingOrders) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-primary">Sejarah Pesanan Saya</h1> {/* Translated */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-4">
                  <div className="h-5 sm:h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardContent>
                <CardFooter className="p-4 flex justify-end">
                  <div className="h-9 sm:h-10 bg-muted rounded w-20 sm:w-24"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isOrderFetchError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-destructive mb-2">Gagal Memuatkan Pesanan</h2> {/* Translated */}
          <p className="text-sm sm:text-base text-muted-foreground mb-4">{orderFetchErrorData?.message || "Ralat tidak dijangka berlaku."}</p> {/* Translated */}
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["userOrderHistory"] })}>Cuba Lagi</Button> {/* Translated */}
        </div>
        <Footer />
      </div>
    );
  }

  if (!sortedOrders || sortedOrders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 sm:h-20 w-16 sm:w-20 text-muted-foreground mb-6" strokeWidth={1} />
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">Tiada Pesanan Lagi</h2> {/* Translated */}
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm sm:max-w-md">
            Nampaknya anda belum membuat sebarang pesanan. Mula meneroka tiket dan tarikan kami! {/* Translated */}
          </p>
          <Button onClick={() => navigate("/")} size="lg" className="px-6 py-3 text-sm sm:text-base">
            Terokai Tiket {/* Translated */}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-grow container mx-auto p-3 sm:p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary text-center sm:text-left">Sejarah Pesanan Saya</h1> {/* Translated */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-1.5 w-full sm:w-auto text-xs sm:text-sm px-3 py-2"
          >
            <ArrowUpDown size={14} /> {/* Adjusted size for sm button */}
            Isih: {sortNewest ? "Terbaru Dahulu" : "Terlama Dahulu"} {/* Translated */}
          </Button>
        </div>

        <div className="space-y-4 md:space-y-6">
          {sortedOrders.map((orderItem) => (
            <Card
              key={orderItem.orderProfile.orderTicketGroupId}
              className="shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <CardHeader className="p-3 sm:p-4 md:px-5 border-b">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div className="flex-grow">
                    <CardTitle className="text-base sm:text-lg text-foreground">Pesanan: {orderItem.orderProfile.orderNo}</CardTitle> {/* Translated */}
                    <CardDescription className="text-xs sm:text-sm mt-0.5">
                      Dibuat pada: {formatOrderDate(orderItem.orderProfile.createdAt)} {/* Translated */}
                    </CardDescription>
                  </div>
                  <span
                    className={cn(
                      "ml-auto self-start sm:self-center mt-1 sm:mt-0 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold capitalize whitespace-nowrap",
                      orderItem.orderProfile.transactionStatus?.toLowerCase() === "success" ||
                        orderItem.orderProfile.transactionStatus?.toLowerCase() === "paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-300"
                        : orderItem.orderProfile.transactionStatus?.toLowerCase() === "failed" ||
                          orderItem.orderProfile.transactionStatus?.toLowerCase() === "unpaid"
                        ? "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300"
                        : orderItem.orderProfile.transactionStatus?.toLowerCase() === "pending" ||
                          orderItem.orderProfile.transactionStatus?.toLowerCase() === "processing"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    )}
                  >
                    {orderItem.orderProfile.transactionStatus || "T/B"} {/* Translated N/A */}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                  {(() => {
                    let thumbnailUrl = "";
                    const ticketGroupId = orderItem.ticketProfile.ticketGroupId?.toString();
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
                        alt={orderItem.ticketProfile.groupName || "Imej Tarikan"} // Translated
                        className="w-20 sm:w-37 h-20 object-cover rounded-md border flex-shrink-0"
                        aria-hidden="false"
                      />
                    );
                  })()}
                  <div className="ml-1 flex-grow min-w-0">
                    <p className="font-semibold text-sm sm:text-base md:text-lg truncate">
                      {orderItem.ticketProfile.groupName || orderItem.orderProfile.productDesc || "Nama Tarikan Tidak Tersedia"} {/* Translated */}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Tarikh Lawatan:{" "} {/* Translated */}
                      {orderItem.orderProfile.orderTicketInfo?.[0]?.admitDate
                        ? format(parseISO(orderItem.orderProfile.orderTicketInfo[0].admitDate), "PPP") // Removed locale
                        : "T/B"} {/* Translated N/A */}
                    </p>
                  </div>
                </div>
                <div className="text-right pt-2 sm:pt-3 border-t ">
                  <p className="text-xs sm:text-sm text-muted-foreground">Jumlah Keseluruhan</p> {/* Translated */}
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-primary">
                    RM {typeof orderItem.orderProfile.totalAmount === "number" ? orderItem.orderProfile.totalAmount.toFixed(2) : "T/B"} {/* Translated N/A */}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-3 sm:p-4 md:p-5 bg-muted/30 flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewDetails(orderItem)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  Lihat Butiran <ChevronRight size={16} /> {/* Translated */}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <Footer />

      {/* Use OrderDetailsDialog for displaying selected order */}
      {selectedOrderData && (
        <OrderDetailsDialog
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          orderData={selectedOrderData} // Pass the selected order data
          dialogTitle={`Butiran untuk Pesanan: ${selectedOrderData.orderProfile.orderNo}`} // Translated
          onPrimaryAction={handleDialogPrimaryAction} // Optional: for actions like download
          // renderAsPageSection is false by default, so it will be a modal
        />
      )}
    </div>
  );
};

export default OrderConfirmationPage;
