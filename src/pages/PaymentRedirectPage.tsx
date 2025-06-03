// src/pages/PaymentRedirectPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2,
  AlertCircle,
  ShoppingCart,
  FileText,
  Download, // Added for Download Receipt button
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { fetchOrderDetails } from "@/services/paymentService";
import { FetchOrderDetailsResponseDTO, FetchedOrderDetailsResultDTO } from "@/types/api/payment.api";
import { useAuthStore } from "@/store/authStore";
import OrderDetailsDialog from "@/components/dialogs/OrderDetailsDialog"; // Import the reusable dialog

const PaymentRedirectPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderTicketGroupId = queryParams.get("orderTicketGroupId");

  const {
    data: apiResponse,
    isLoading,
    isError: isFetchError,
    error: fetchErrorData,
  } = useQuery<FetchOrderDetailsResponseDTO, Error, FetchOrderDetailsResponseDTO, [string, string | null]>({
    queryKey: ["orderDetails", orderTicketGroupId],
    queryFn: () => {
      if (!orderTicketGroupId) {
        return Promise.reject(new Error("Order ID is missing."));
      }
      return fetchOrderDetails(orderTicketGroupId);
    },
    enabled: !!orderTicketGroupId,
    retry: 1,
  });

  useEffect(() => {
    if (!orderTicketGroupId && !isLoading) {
      toast({
        title: "Akses Halaman Tidak Sah",
        description: "Tiada ID pesanan dijumpai dalam URL. Mengarahkan ke laman utama.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [orderTicketGroupId, isLoading, navigate, toast]);

  const handleCheckAnotherOrder = () => {
    if (isAuthenticated) {
      navigate("/order-confirmation");
    } else {
      if (apiResponse && apiResponse.result && apiResponse.result.orderProfile) {
        const { orderNo, buyerEmail } = apiResponse.result.orderProfile;
        const orderNumberParam = orderNo ? `orderNumber=${encodeURIComponent(orderNo)}` : "";
        const emailParam = buyerEmail ? `email=${encodeURIComponent(buyerEmail)}` : "";
        const queryParamsArray = [orderNumberParam, emailParam].filter((param) => param);

        navigate(`/nonMemberOrderInquiry${queryParamsArray.length > 0 ? "?" + queryParamsArray.join("&") : ""}`);
      } else {
        navigate("/nonMemberOrderInquiry");
        toast({
          title: "Maklumat Tidak Tersedia",
          description: "Butiran pesanan tidak tersedia sepenuhnya untuk mengisi pertanyaan.",
          variant: "default",
        });
      }
    }
  };

  const handleDownloadReceipt = (data?: FetchedOrderDetailsResultDTO) => {
    if (!data) return;
    // Implement your logic, e.g., initiate a PDF download
    toast({
      title: "Muat Turun Dimulakan",
      description: `Menyediakan resit untuk pesanan ${data.orderProfile.orderNo} (Belum Dilaksanakan).`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Mengesahkan Pesanan Anda...</h1>
          <p className="text-muted-foreground max-w-md">Sila tunggu sementara kami mengesahkan butiran pesanan anda. Ini tidak akan mengambil masa yang lama.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isFetchError || (apiResponse && apiResponse.respCode !== 2000)) {
    const errorMessage = fetchErrorData?.message || apiResponse?.respDesc || "Ralat tidak diketahui berlaku semasa mengambil butiran pesanan anda.";
    const isOrderNotFound = apiResponse?.respCode === 5003;

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-destructive mb-3">
            {isOrderNotFound ? "Pesanan Tidak Dijumpai" : "Pengesahan Pesanan Gagal"}
          </h1>
          <p className="text-muted-foreground max-w-lg mb-6">
            {isOrderNotFound
              ? `Kami tidak dapat mencari pesanan dengan ID: ${orderTicketGroupId}. Sila semak ID atau hubungi sokongan.`
              : "Kami tidak dapat mengambil butiran pesanan anda. Sila cuba lagi kemudian atau hubungi sokongan jika masalah berterusan."}
          </p>
          {!isOrderNotFound && <p className="text-sm text-destructive/80 mb-8">Ralat: {errorMessage}</p>}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")} variant="outline">
              Ke Laman Utama
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success State: Render OrderDetailsDialog's content inline
  if (apiResponse && apiResponse.respCode === 2000 && apiResponse.result) {
    const orderData = apiResponse.result as FetchedOrderDetailsResultDTO;
    const isOrderSuccess =
      orderData.orderProfile.transactionStatus?.toLowerCase() === "success" || orderData.orderProfile.transactionStatus?.toLowerCase() === "paid";

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-0 sm:px-4 py-4 md:py-8">
          {/* Render OrderDetailsDialog's content directly as a page section */}
          <div className="w-full max-w-2xl mx-auto">
            {" "}
            {/* Added max-width for consistency */}
            <OrderDetailsDialog
              renderAsPageSection={true} // Key prop to render inline
              orderData={orderData}
              // No isOpen or onOpenChange needed when rendering as page section
              // dialogTitle can be used by the component internally if it wants to show a title
            />
          </div>

          {/* Page-level actions displayed below the order details content */}
          <div className="container mx-auto pt-2">
            <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-4 max-w-md mx-auto">
              {/* {isOrderSuccess && (
                     <Button
                        onClick={() => handleDownloadReceipt(orderData)}
                        className="w-full sm:flex-1"
                        variant="default" // Or another appropriate variant
                    >
                        <Download className="mr-2 h-4 w-4" /> Muat Turun Resit
                    </Button>
                )} */}
              <Button onClick={() => navigate("/")} className="w-full sm:flex-1" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" /> Teruskan Membeli-belah
              </Button>
              <Button onClick={handleCheckAnotherOrder} className="w-full sm:flex-1">
                <FileText className="mr-2 h-4 w-4" /> Semak Pesanan Lain
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Jika anda mempunyai sebarang pertanyaan, sila hubungi sokongan pelanggan kami. <br />
              {orderData.orderProfile.buyerEmail && ` Pengesahan e-mel telah dihantar ke ${orderData.orderProfile.buyerEmail}.`}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fallback for any unexpected state
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mb-6" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Memproses Maklumat</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Kami sedang memproses maklumat. Sila tunggu sebentar atau cuba menyegarkan halaman.
        </p>
        <Button onClick={() => navigate("/")}>Ke Laman Utama</Button>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentRedirectPage;