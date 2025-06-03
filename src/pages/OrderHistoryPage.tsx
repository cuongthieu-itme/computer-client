// src/pages/OrderHistoryPage.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderHistoryChecker from "@/components/OrderHistoryChecker";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText } from "lucide-react"; // Changed from History to ReceiptText


const OrderHistoryPage = () => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/20 via-background to-background dark:from-muted/10">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-start flex-grow">
        <Card className="w-full max-w-2xl shadow-xl border-border/50 bg-card/95 backdrop-blur-sm mt-4 md:mt-8">
          <CardHeader className="text-center items-center">
            {/* Icon updated to ReceiptText */}
            <div className="p-4 bg-primary/10 rounded-full mb-3 inline-block">
              <ReceiptText className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
              Non-Member Order Inquiry
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground pt-1">
              Check the status of your past orders by providing the details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <OrderHistoryChecker onBackToHome={handleNavigateHome} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
