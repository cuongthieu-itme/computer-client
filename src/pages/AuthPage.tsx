import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import PrivacyPolicyTrigger from "@/components/documents/PrivacyPolicyTrigger";
import TermsOfServiceTrigger from "@/components/documents/TermsOfServiceTrigger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { UserDTO } from "@/types/api/auth.api";
import { History, LogIn, Ticket, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
            <CardTitle className="text-2xl font-bold text-primary">Đăng nhập / Đăng ký</CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? "Đăng nhập vào tài khoản của bạn để tiếp tục"
                : "Tạo tài khoản mới để bắt đầu"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
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
                <span>Tra cứu đơn hàng không cần đăng nhập</span>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">Khách hàng không đăng ký tài khoản vẫn có thể kiểm tra trạng thái đơn hàng</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
            <p className="text-xs px-4">
              Bằng việc tiếp tục, bạn đồng ý với
              <TermsOfServiceTrigger>
                <span className="text-primary transition-colors cursor-pointer"> Điều khoản dịch vụ</span>
              </TermsOfServiceTrigger>
              và
              <PrivacyPolicyTrigger>
                <span className="text-primary transition-colors cursor-pointer"> Chính sách bảo mật</span>
              </PrivacyPolicyTrigger>
              của chúng tôi
            </p>
            <p className="mt-4">
              <Link to="/" className="text-primary underline text-sm">
                Trở về trang chủ
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
