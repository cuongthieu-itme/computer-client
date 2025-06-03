// src/App.tsx
import { useEffect, useState } from "react"; // Added useState for debug bar height
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Import your page components
import Index from "./pages/Index";
import TicketPage from "./pages/TicketPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import NonMemberOrderInquiry from "./pages/NonMemberOrderInquiry";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import UserProfilePage from "./pages/UserProfilePage";
import CompleteRegistrationPage from "./pages/CompleteRegistrationPage";
import TicketEditorPage from "./pages/TicketEditorPage";
import PaymentRedirectPage from "./pages/PaymentRedirectPage";

import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute"; 

// Import the debug display component
import AuthDebugDisplay from '@/components/debug/AuthDebugDisplay'; // Adjust path if needed

const queryClient = new QueryClient();

interface AnimatedPageProps {
  children: React.ReactNode;
}

const pageVariants: Variants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

const APP_VERSION = "1.1.2-beta";
const AppRoutes = () => {
  const location = useLocation();
  const initializeAuthAction = useAuthStore.getState().initializeAuth;
  const [debugBarHeight, setDebugBarHeight] = useState(0);

  useEffect(() => {
    console.log(`Application Version: ${APP_VERSION}`);
    initializeAuthAction();
  }, [initializeAuthAction]);

  // // Effect to calculate debug bar height
  // useEffect(() => {
  //   if (import.meta.env.DEV) {
  //     const debugBar = document.querySelector('.fixed.top-0.z-\\[200\\]'); // Selector for AuthDebugDisplay
  //     if (debugBar) {
  //       setDebugBarHeight(debugBar.clientHeight);
  //     } else {
  //       // If the bar isn't rendered yet (e.g. isOpen is false initially in AuthDebugDisplay)
  //       // We set a default approximate height for the collapsed bar.
  //       // You might need to adjust this value based on the actual height of the collapsed bar.
  //       // For the provided AuthDebugDisplay, the collapsed height is mainly the button height.
  //       // Let's assume ~36px for a 'sm' button with padding.
  //       setDebugBarHeight(36); 
  //     }
  //   }
  // }, []); // Runs once, or you might add dependencies if the bar's height can change dynamically (e.g., when it opens/closes)

  return (
    // Apply padding-top to the main content area to prevent overlap with the fixed debug bar
    <div style={{ paddingTop: import.meta.env.DEV ? `${debugBarHeight}px` : '0px' }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
          <Route path="/tickets/:ticketGroupId" element={<AnimatedPage><TicketPage /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
          <Route path="/nonMemberOrderInquiry" element={<AnimatedPage><NonMemberOrderInquiry /></AnimatedPage>} />
          <Route path="/complete-registration" element={<AnimatedPage><CompleteRegistrationPage /></AnimatedPage>} />
          <Route path="/paymentRedirect" element={<AnimatedPage><PaymentRedirectPage /></AnimatedPage>} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
            <Route path="/order-confirmation" element={<AnimatedPage><OrderConfirmationPage /></AnimatedPage>} />
          </Route>

          <Route path="/admin/ticket-editor" element={<AnimatedPage><TicketEditorPage /></AnimatedPage>} />
          <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
