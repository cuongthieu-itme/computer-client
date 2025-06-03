// src/components/OrderHistoryChecker.tsx Clau
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Loader2, // For loading state on button
  AlertCircle,
  Ticket,
  User,
  Mail,
  CalendarDays,
  CreditCard,
  QrCode,
  Download, // For a potential download button
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext"; // For internationalization

interface OrderHistoryCheckerProps {
  onBackToHome: () => void; // Changed from onBackToCart
}

// Sample Order Detail Structure (for demonstration when order is found)
interface SampleOrderDetail {
  orderNumber: string;
  attractionName: string;
  visitDate: string;
  reservationNumber: string; // This might be the same as orderNumber
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  totalPaid: number;
  qrCodeUrl: string;
}


const OrderHistoryChecker: React.FC<OrderHistoryCheckerProps> = ({ onBackToHome }) => {
  const { t } = useLanguage(); // For i18n
  const [reservationNumber, setReservationNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderFound, setOrderFound] = useState<SampleOrderDetail | null>(null); // Store found order details
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false); // To show "not found" message only after a search
  const { toast } = useToast();

  const handleCheckOrder = () => {
    if (!reservationNumber || !name || !email) {
      toast({
        title: "Maklumat Tidak Lengkap",
        description: "Sila isi semua maklumat yang diperlukan.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "E-mel Tidak Sah",
        description: "Sila masukkan alamat e-mel yang sah.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true); // Mark that a search has been attempted
    setOrderFound(null); // Reset previous order details

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Demo order check
      if (reservationNumber.toUpperCase().startsWith("ZJ-") && name.length > 2 && email.includes('@')) {
        // Simulate finding an order
        const foundOrderData: SampleOrderDetail = {
          orderNumber: reservationNumber.toUpperCase(),
          attractionName: "Zoo Johor - Pakej Keluarga",
          visitDate: "15 Mei 2025",
          reservationNumber: reservationNumber.toUpperCase(), // Often same as order number
          items: [
            { name: "Dewasa", quantity: 2, price: 30.00 },
            { name: "Kanak-kanak", quantity: 3, price: 15.00 },
          ],
          paymentMethod: "FPX (Maybank)",
          paymentStatus: "Dibayar",
          paymentDate: "1 Mei 2025",
          totalPaid: 105.00,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${reservationNumber.toUpperCase()}&format=svg`,
        };
        setOrderFound(foundOrderData);
        toast({
          title: "Pesanan Dijumpai",
          description: "Butiran pesanan anda telah diambil.",
        });
      } else {
        // No specific toast here, the inline Alert will handle "not found"
      }
    }, 1500);
  };

  // Function to reset the form and search state
  const handleSearchAgain = () => {
    setReservationNumber("");
    setName("");
    setEmail("");
    setOrderFound(null);
    setSearchAttempted(false);
    setIsSearching(false);
  };


  if (orderFound) {
    // Display Order Details
    return (
      <div className="space-y-6">
        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
          <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-700 dark:text-green-300 font-semibold">Pesanan Dijumpai!</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            Butiran untuk pesanan {orderFound.orderNumber} ditunjukkan di bawah.
          </AlertDescription>
        </Alert>

        {/* Ticket Information Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center text-lg">
              <Ticket className="mr-2 h-5 w-5 text-primary" />
              Maklumat Tiket
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{orderFound.attractionName}</span>
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">Aktif</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Tarikh Lawatan: {orderFound.visitDate}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Nombor Tempahan: <span className="font-medium text-foreground">{orderFound.reservationNumber}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-border">
              <h4 className="text-sm font-semibold mb-1.5">Butiran:</h4>
              {orderFound.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-0.5">
                  <span>{item.name} × {item.quantity}</span>
                  <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Maklumat Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kaedah Pembayaran:</span>
              <span>{orderFound.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{orderFound.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tarikh:</span>
              <span>{orderFound.paymentDate}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 mt-2 border-t border-border text-base">
              <span>Jumlah Bayaran:</span>
              <span>RM {orderFound.totalPaid.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center text-lg">
              <QrCode className="mr-2 h-5 w-5 text-primary" />
              Kod QR Masuk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
            <img
              src={orderFound.qrCodeUrl}
              alt={"Kod QR Masuk untuk pesanan " + orderFound.orderNumber}
              className="w-40 h-40 md:w-48 md:h-48 mb-3 rounded-md border bg-white p-1"
            />
            <p className="text-sm text-muted-foreground">
              Tunjukkan kod QR ini di pintu masuk untuk kemasukan.
            </p>
            {/* <Button variant="outline" className="mt-4 w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Muat Turun Tiket (PDF)
            </Button> */}
          </CardContent>
        </Card>

        <Button onClick={handleSearchAgain} variant="outline" className="w-full mt-6">
          <Search className="mr-2 h-4 w-4" />
          Cari Pesanan Lain
        </Button>
        <Button onClick={onBackToHome} className="w-full mt-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Laman Utama
        </Button>
      </div>
    );
  }

  // Display Search Form
  return (
    <div className="space-y-6">
      {searchAttempted && !isSearching && !orderFound && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Pesanan Tidak Dijumpai</AlertTitle>
          <AlertDescription>
            Kami tidak dapat mencari pesanan dengan butiran yang diberikan. Sila semak maklumat anda dan cuba lagi.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Label htmlFor="reservationNumber" className="flex items-center text-sm font-medium">
          <Ticket className="mr-2 h-4 w-4 text-primary/80" />
          Nombor Tempahan <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="reservationNumber"
          placeholder="cth. ZJ-123456-789"
          value={reservationNumber}
          onChange={(e) => setReservationNumber(e.target.value)}
          className="h-11 text-base"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="name" className="flex items-center text-sm font-medium">
          <User className="mr-2 h-4 w-4 text-primary/80" />
          Nama Penuh <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Masukkan nama penuh anda seperti pada pesanan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 text-base"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="email" className="flex items-center text-sm font-medium">
          <Mail className="mr-2 h-4 w-4 text-primary/80" />
          Alamat E-mel <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Masukkan alamat e-mel yang digunakan untuk pesanan"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 text-base"
        />
      </div>

      <div className="pt-4 space-y-3">
        <Button
          className="w-full h-12 text-base"
          disabled={isSearching}
          onClick={handleCheckOrder}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mencari...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Semak Pesanan
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onBackToHome} className="w-full h-12 text-base">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Kembali ke Laman Utama
        </Button>
      </div>
    </div>
  );
};

export default OrderHistoryChecker;