// src/pages/AuthPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { History, LogIn, UserPlus, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

import TermsOfServiceTrigger from "@/components/documents/TermsOfServiceTrigger";
import PrivacyPolicyTrigger from "@/components/documents/PrivacyPolicyTrigger";

import { useAuthStore } from "@/store/authStore";
import { UserDTO } from "@/types/api/auth.api";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const zustandLoginAction = useAuthStore((state) => state.login);

  const getTabFromQuery = () => {
    const queryParams = new URLSearchParams(location.search);
    const tabQuery = queryParams.get("tab");
    return tabQuery === "register" ? "register" : "login";
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromQuery());

  useEffect(() => {
    const tabFromQuery = getTabFromQuery();
    if (tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [location.search, activeTab]);

  const handleTabChange = useCallback(
    (newTabValue: string) => {
      setActiveTab(newTabValue);
      const queryParams = new URLSearchParams(location.search);
      if (newTabValue === "login") {
        queryParams.delete("tab");
      } else {
        queryParams.set("tab", newTabValue);
      }
      navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
    },
    [navigate, location.pathname, location.search]
  );

  const handleLoginSuccess = (userData: UserDTO, accessToken: string, refreshToken: string) => {
    zustandLoginAction(userData, accessToken, refreshToken);
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const handleRegistrationSuccess = () => {
    handleTabChange("login");
  };

  const handleOrderHistory = () => {
    navigate("/nonMemberOrderInquiry");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:to-secondary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center flex-grow">
        <Card className="w-full max-w-md shadow-xl border-border/50 bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Ticket className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">{t("pages.AuthPage.title")}</CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? t("pages.AuthPage.description.login")
                : t("pages.AuthPage.description.register")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LogIn className="mr-2 h-4 w-4" /> {t("pages.AuthPage.tabs.login")}
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus className="mr-2 h-4 w-4" /> {t("pages.AuthPage.tabs.register")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-border/50">
              <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleOrderHistory}>
                <History size={18} />
                <span>{t("pages.AuthPage.nonMemberInquiry.button")}</span>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">{t("pages.AuthPage.nonMemberInquiry.description")}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
            <p className="text-xs px-4">
              {t("pages.AuthPage.footer.agreementPart1")}
              <TermsOfServiceTrigger>
                <span className="text-primary transition-colors cursor-pointer">{t("common.termsOfService")}</span>
              </TermsOfServiceTrigger>
              {t("pages.AuthPage.footer.agreementPart2")}
              <PrivacyPolicyTrigger>
                <span className="text-primary transition-colors cursor-pointer">{t("common.privacyPolicy")}</span>
              </PrivacyPolicyTrigger>
              {t("pages.AuthPage.footer.agreementPart3")}
            </p>
            <p className="mt-4">
              <Link to="/" className="text-primary underline text-sm">
                {t("pages.AuthPage.footer.backToHome")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;