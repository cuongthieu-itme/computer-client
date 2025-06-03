// src/components/dialogs/OrderDetailsDialog.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, CheckCircle2, XCircle, FileText, UserCircle, Ticket, QrCode as QrCodeIcon, ZoomIn, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FetchedOrderDetailsResultDTO, ConfirmedOrderTicketInfoDTO } from "@/types/api/payment.api";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

interface OrderDetailsDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  orderData: FetchedOrderDetailsResultDTO | null;
  isLoading?: boolean;
  error?: Error | null;
  dialogTitle?: string;
  onPrimaryAction?: (orderData: FetchedOrderDetailsResultDTO) => void;
  renderAsPageSection?: boolean;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  orderData,
  isLoading = false,
  error = null,
  dialogTitle = "Butiran Pesanan",
  onPrimaryAction,
  renderAsPageSection = false,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrValue, setSelectedQrValue] = useState<string | null>(null);
  const [selectedQrTitle, setSelectedQrTitle] = useState<string>("");

  useEffect(() => {
  }, [isQrModalOpen, selectedQrValue]);

  const openQrModal = (value: string, title: string) => {
    setSelectedQrValue(value);
    setSelectedQrTitle(title);
    setIsQrModalOpen(true);
  };

  const formatTransactionDate = (dateStr?: string) => {
    if (!dateStr) return "T/A";
    try {
      const date = dateStr.includes("T") ? parseISO(dateStr) : new Date(dateStr.replace(/-/g, "/"));
      return isValid(date) ? format(date, "PPP p") : "Tarikh Tidak Sah";
    } catch {
      return "Tarikh Tidak Sah";
    }
  };

  const getPaymentMethodDisplay = (orderProfile?: FetchedOrderDetailsResultDTO["orderProfile"]) => {
    if (!orderProfile) return "T/A";
    if (orderProfile.bankName && orderProfile.bankCode) {
      return `FPX (${orderProfile.bankName})`;
    }
    return "Kad / Lain-lain";
  };

  const renderSharedOrderContent = (
    profile: FetchedOrderDetailsResultDTO["orderProfile"],
    ticketProf: FetchedOrderDetailsResultDTO["ticketProfile"]
  ) => {
    const isSuccess = profile.transactionStatus?.toLowerCase() === "success" || profile.transactionStatus?.toLowerCase() === "paid";
    const isFailed = profile.transactionStatus?.toLowerCase() === "failed" || profile.transactionStatus?.toLowerCase() === "unpaid";
    const isPending = !isSuccess && !isFailed;

    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {isFailed && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Isu Pembayaran</AlertTitle>
            <AlertDescription>
              {profile.statusMessage || "Pembayaran anda tidak dapat diproses. Sila cuba lagi atau hubungi bank anda."}
            </AlertDescription>
          </Alert>
        )}
        {isPending && (
          <Alert
            variant="default"
            className="mb-4 bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Memproses Pesanan</AlertTitle>
            <AlertDescription>Pesanan ini sedang diproses. Status mungkin dikemas kini tidak lama lagi.</AlertDescription>
          </Alert>
        )}

        <section className="border-b pb-3 sm:pb-4">
          <h3 className="text-md sm:text-lg font-semibold mb-2 text-foreground flex items-center">
            <UserCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Butiran Pelanggan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm">
            <p>
              <strong>Nama:</strong> {profile.buyerName || "T/A"}
            </p>
            <p>
              <strong>Emel:</strong> {profile.buyerEmail || "T/A"}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-md sm:text-lg font-semibold mb-2 text-foreground flex items-center">
            <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Butiran Pesanan
          </h3>
          <div className="space-y-1 text-[13px] bg-muted/20 p-4 rounded-md border">
            <p>
              <strong className="mr-1">Nombor Pesanan:</strong> {profile.orderNo || "T/A"}
            </p>
            <p>
              <strong className="mr-1">Tarikan:</strong> {ticketProf?.groupName || profile.productDesc || "T/A"}
            </p>
            {profile.orderTicketInfo?.[0]?.admitDate && isValid(parseISO(profile.orderTicketInfo[0].admitDate)) && (
              <p>
                <strong className="mr-1">Tarikh Lawatan:</strong> {format(parseISO(profile.orderTicketInfo[0].admitDate), "PPP")}
              </p>
            )}
            <p>
              <strong className="mr-1">Tarikh Pesanan:</strong> {formatTransactionDate(profile.transactionDate || profile.createdAt)}
            </p>
            <p>
              <strong className="mr-1">Jumlah Amaun:</strong> RM {typeof profile.totalAmount === "number" ? profile.totalAmount.toFixed(2) : "T/A"}
            </p>
            <p>
              <strong className="mr-1">Kaedah Pembayaran:</strong> {getPaymentMethodDisplay(profile)}
            </p>
            <p>
              <strong className="mr-1">Status Transaksi:</strong>{" "}
              <span
                className={cn(
                  "font-semibold capitalize",
                  isSuccess && "text-green-600",
                  isFailed && "text-destructive",
                  isPending && "text-yellow-600"
                )}
              >
                {profile.transactionStatus || "T/A"}
              </span>
            </p>
            {profile.statusMessage && (
              <p>
                <strong>Mesej:</strong> {profile.statusMessage}
              </p>
            )}
          </div>
        </section>

        {profile.orderTicketInfo && profile.orderTicketInfo.length > 0 && (
          <section>
            <h3 className="text-md sm:text-lg font-semibold mb-2 text-foreground flex items-center">
              <Ticket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Tiket Dibeli
            </h3>
            <div className="space-y-3">
              {profile.orderTicketInfo.map((ticket: ConfirmedOrderTicketInfoDTO) => {
                const itemSubtotal =
                  typeof ticket.quantityBought === "number" && typeof ticket.unitPrice === "number"
                    ? (ticket.quantityBought * ticket.unitPrice).toFixed(2)
                    : "T/A";
                return (
                  <div key={ticket.orderTicketInfoId} className="p-4 border rounded-lg bg-background text-xs sm:text-sm shadow-sm">
                    <p className="font-semibold text-sm sm:text-base text-foreground mb-1">{ticket.itemDesc1 || "Tiket Tidak Diketahui"}</p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs mb-1.5">{ticket.itemDesc2 || "Tiada penerangan tambahan."}</p>
                    <div className="grid grid-cols-2 gap-x-2 text-[10px] sm:text-xs text-muted-foreground mb-2">
                      <span>
                        Kuantiti: <span className="font-medium text-foreground">{ticket.quantityBought ?? "T/A"}</span>
                      </span>
                      <span className="text-end">
                        Harga Unit:{" "}
                        <span className="font-medium text-foreground">
                          RM {typeof ticket.unitPrice === "number" ? ticket.unitPrice.toFixed(2) : "T/A"}
                        </span>
                      </span>
                    </div>
                    <p className="text-right font-semibold text-[11px] sm:text-sm text-primary mt-1 border-t pt-2">Jumlah: RM {itemSubtotal}</p>
                    {isSuccess && ticket.encryptedId && (
                      <div className="pt-5 text-center">
                        <h4 className="text-[10px] sm:text-xs font-medium mb-1 text-foreground flex items-center justify-center">
                          <QrCodeIcon className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> Kod QR Tiket
                        </h4>
                        <div
                          className="flex justify-center p-1 bg-white rounded-md shadow-inner inline-block cursor-pointer hover:shadow-sm transition-shadow"
                          onClick={() => openQrModal(ticket.encryptedId!, ticket.itemDesc1 || "Kod QR Tiket")}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") openQrModal(ticket.encryptedId!, ticket.itemDesc1 || "Kod QR Tiket");
                          }}
                          aria-label="Lihat kod QR lebih besar untuk tiket ini"
                        >
                          <QRCodeCanvas
                            value={ticket.encryptedId}
                            size={128}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"L"}
                            includeMargin={true}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="my-2 sm:text-xs h-auto py-2"
                          onClick={() => openQrModal(ticket.encryptedId!, ticket.itemDesc1 || "Kod QR Tiket")}
                        >
                          <ZoomIn className="mr-1 h-2 w-2" /> Zum
                        </Button>
                        <p className="-mt-1 text-[9px] sm:text-[10px] text-muted-foreground/80 break-all px-1">ID: {ticket.encryptedId}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  };

  const OrderContentLayout: React.FC = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Memuatkan butiran pesanan...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center min-h-[300px]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="font-semibold text-destructive">Ralat Memuatkan Butiran</p>
          <p className="text-sm text-muted-foreground mt-1 px-4">{error.message || "Tidak dapat mengambil butiran pesanan."}</p>
        </div>
      );
    }
    if (!orderData || !orderData.orderProfile) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center min-h-[300px]">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-semibold">Tiada Data Pesanan</p>
          <p className="text-sm text-muted-foreground mt-1">Butiran pesanan tidak tersedia.</p>
        </div>
      );
    }

    const { orderProfile, ticketProfile } = orderData;
    const isSuccess = orderProfile.transactionStatus?.toLowerCase() === "success" || orderProfile.transactionStatus?.toLowerCase() === "paid";
    const isFailed = orderProfile.transactionStatus?.toLowerCase() === "failed" || orderProfile.transactionStatus?.toLowerCase() === "unpaid";
    const isPending = !isSuccess && !isFailed;

    const headerDisplay = (
      <div
        className={cn(
          "text-center items-center border-b pb-4 sm:pb-6 pt-6 sm:pt-8 flex flex-col flex-shrink-0",
          renderAsPageSection ? "bg-muted/20 rounded-t-lg" : "bg-background sticky top-0 z-10"
        )}
      >
        {isSuccess && <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mb-2 sm:mb-3" />}
        {isFailed && <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive mb-2 sm:mb-3" />}
        {isPending && <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mb-2 sm:mb-3 animate-spin" />}
        <h2
          className={`text-lg sm:text-xl md:text-2xl font-bold ${isSuccess ? "text-green-600" : isFailed ? "text-destructive" : "text-yellow-600"}`}
        >
          {isSuccess && "Pembayaran Berjaya!"}
          {isFailed && "Pembayaran Gagal"}
          {isPending && "Status Pesanan: Menunggu"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-2">
          {renderAsPageSection
            ? `Pesanan #${orderProfile.orderNo}`
            : dialogTitle === "Butiran Pesanan"
            ? `Butiran untuk Pesanan #${orderProfile.orderNo}`
            : dialogTitle}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 px-2">
          {isFailed && `Isu dengan pembayaran untuk pesanan #${orderProfile.orderNo}. ${orderProfile.statusMessage || ""}`}
          {isPending && `Pesanan #${orderProfile.orderNo} sedang diproses. ${orderProfile.statusMessage || ""}`}
        </p>
      </div>
    );

    if (renderAsPageSection) {
      return (
        <Card className="w-full flex flex-col border rounded-lg">
          {headerDisplay}

          {renderSharedOrderContent(orderProfile, ticketProfile)}
        </Card>
      );
    }

    // Dialog Mode: Using your scrolling solution
    return (
      <>
        {headerDisplay}
        <div className="flex-grow min-h-0 overflow-y-auto" style={{ maxHeight: "calc(100% - 120px - 70px)" }}>
          {renderSharedOrderContent(orderProfile, ticketProfile)}
        </div>
      </>
    );
  };

  // Main return structure of the OrderDetailsDialog component
  return (
    <>
      {renderAsPageSection ? (
        // If rendering as a page section, output OrderContentLayout directly
        <OrderContentLayout />
      ) : (
        // Otherwise, wrap OrderContentLayout in the main Dialog for modal display
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-lg">
            <OrderContentLayout />
            <DialogHeader className="text-center pt-1 sm:pt-2">
              <DialogTitle></DialogTitle>
            </DialogHeader>
            {!isLoading &&
              !error &&
              orderData && ( // Dialog footer
                <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end flex-shrink-0 bg-background z-10">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Tutup
                    </Button>
                  </DialogClose>
                  {/* {orderData?.orderProfile?.transactionStatus?.toLowerCase() === "success" && onPrimaryAction && (
                    <Button onClick={() => onPrimaryAction(orderData)} className="w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" /> Muat Turun Resit
                    </Button>
                  )} */}
                </div>
              )}
          </DialogContent>
        </Dialog>
      )}

      {/* Nested Dialog for QR Code Zoom - This is ALWAYS part of the component's render tree,
         its visibility is controlled by isQrModalOpen state.
         This ensures it's available regardless of how OrderContentLayout is rendered.
     */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-xs md:max-w-sm flex flex-col items-center p-4 sm:p-6 z-[60]">
          <DialogHeader className="text-center pt-1 sm:pt-2">
            <DialogTitle className="text-md sm:text-lg font-semibold">{selectedQrTitle || "Kod QR"}</DialogTitle>
          </DialogHeader>
          {selectedQrValue && (
            <div className="p-3 sm:p-4 my-3 sm:my-4 bg-white rounded-lg shadow-lg inline-block">
              <QRCodeCanvas value={selectedQrValue} size={228} bgColor={"#ffffff"} fgColor={"#000000"} level={"M"} includeMargin={true} />
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-muted-foreground max-w-full text-center break-all px-2">ID: {selectedQrValue}</p>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-3 sm:mt-4 w-full">
              Tutup
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderDetailsDialog;
