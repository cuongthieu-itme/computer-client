// src/pages/NonMemberOrderInquiryPage.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query"; // Still using useMutation for on-demand fetch
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  fetchNonMemberOrderInquiry,
  NonMemberOrderInquiryRequestParamsDTO, // DTO for GET params
  NonMemberOrderInquiryResponseDTO,
} from "@/services/paymentService";
import { Loader2, Search, AlertCircle, ArrowLeft, ReceiptText } from "lucide-react";
import OrderDetailsDialog from "@/components/dialogs/OrderDetailsDialog";
import { FetchedOrderDetailsResultDTO } from "@/types/api/payment.api";
import { AxiosError } from "axios";

const NonMemberOrderInquiryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [email, setEmail] = useState("");
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [fetchedOrderData, setFetchedOrderData] = useState<FetchedOrderDetailsResultDTO | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlOrderNumber = queryParams.get("orderNumber");
    const urlEmail = queryParams.get("email");

    if (urlOrderNumber) {
      setOrderNumberInput(urlOrderNumber);
    }
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [location.search]);

  // useMutation is still suitable here for an action-triggered data fetch,
  // even if the underlying HTTP method is GET.
  // The mutationFn will now make a GET request.
  const inquiryMutation = useMutation<
    NonMemberOrderInquiryResponseDTO,
    AxiosError,
    NonMemberOrderInquiryRequestParamsDTO // Variables passed to mutate are now GET params
  >({
    mutationFn: fetchNonMemberOrderInquiry, // This function now makes a GET request
    onSuccess: (data) => {
      if (data.respCode === 2000 && data.result) {
        setFetchedOrderData(data.result as FetchedOrderDetailsResultDTO);
        setIsOrderDetailsModalOpen(true);
        toast({
          title: "Pesanan Ditemui", // Translated
          description: "Butiran pesanan anda telah diambil.", // Translated
        });
      } else {
        setFetchedOrderData(null);
        toast({
          title: "Pesanan Tidak Ditemui", // Translated
          description: data.respDesc || "Kami tidak dapat mencari pesanan dengan butiran yang diberikan. Sila semak maklumat anda dan cuba lagi.", // Translated
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setFetchedOrderData(null);
      const errorDesc = error.response?.data ? (error.response.data as any).respDesc : error.message;
      toast({
        title: "Carian Gagal", // Translated
        description: errorDesc || "Ralat tidak dijangka berlaku. Sila cuba lagi.", // Translated
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim() || !email.trim()) {
      toast({
        title: "Maklumat Tidak Lengkap", // Translated
        description: "Sila masukkan Nombor Pesanan dan Emel.", // Translated
        variant: "destructive",
      });
      return;
    }
    // Pass the params to the mutation, which will be used by fetchNonMemberOrderInquiry
    inquiryMutation.mutate({ orderNo: orderNumberInput, email });
  };



  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/20 via-background to-background dark:from-muted/10">
        <Navbar />
        <main className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-start flex-grow">
          <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm mt-4 md:mt-8 shadow-none sm:shadow-lg border-border/50">
            <CardHeader className="text-center items-center pb-5">
              <div className="p-4 bg-primary/10 rounded-full mb-3 inline-block">
                <ReceiptText className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Pertanyaan Pesanan Bukan Ahli</CardTitle> {/* Translated */}
              <CardDescription className="text-sm  text-muted-foreground pt-1">
                Masukkan nombor pesanan dan emel anda untuk menyemak status pesanan anda. {/* Translated */}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-6 pb-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumberInput" className="flex items-center text-sm font-medium">
                    Nombor Pesanan <span className="text-destructive ml-1">*</span> {/* Translated */}
                  </Label>
                  <Input
                    id="orderNumberInput"
                    placeholder="cth., ORD-123456789" // Translated
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    className="h-11 text-base"
                    required
                    aria-label="Nombor Pesanan" // Translated
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium">
                    Alamat Emel <span className="text-destructive ml-1">*</span> {/* Translated */}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="emel.anda@contoh.com" // Translated
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base"
                    required
                    aria-label="Alamat Emel" // Translated
                  />
                </div>

                {inquiryMutation.isError && !fetchedOrderData && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ralat Carian</AlertTitle> {/* Translated */}
                    <AlertDescription>
                      {(inquiryMutation.error as any)?.response?.data?.respDesc ||
                        inquiryMutation.error?.message ||
                        "Gagal mendapatkan pesanan. Sila semak butiran anda."} {/* Translated */}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 space-y-3">
                  <Button type="submit" className="w-full " disabled={inquiryMutation.isPending} aria-label="Semak Status Pesanan"> {/* Translated */}
                    {inquiryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mencari... {/* Translated */}
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Semak Status Pesanan {/* Translated */}
                      </>
                    )}
                  </Button>
                  
                   <Link to="/">
                  <Button variant="outline" className="w-full mt-3" aria-label="Kembali ke Laman Utama"> {/* Translated */}
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali ke Laman Utama {/* Translated */}
                  </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>

      {fetchedOrderData && (
        <OrderDetailsDialog
          isOpen={isOrderDetailsModalOpen}
          onOpenChange={setIsOrderDetailsModalOpen}
          orderData={fetchedOrderData}
          dialogTitle={`Butiran untuk Pesanan #${fetchedOrderData.orderProfile.orderNo}`} // Translated
        />
      )}
    </>
  );
};

export default NonMemberOrderInquiryPage;
