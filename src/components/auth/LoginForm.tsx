import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/apiClient";
import { ApiErrorDTO, LoginRequestDTO, LoginResponseDTO, UserDTO } from "@/types/api/auth.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Địa chỉ email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const resetPasswordEmailSchema = z.object({
  resetEmail: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
});
type ResetPasswordEmailValues = z.infer<typeof resetPasswordEmailSchema>;

interface ResetPasswordResponseDTO {
  respCode: number;
  respDesc: string;
  result?: {
    status: boolean;
  };
}

interface LoginFormProps {
  onLoginSuccess: (userData: UserDTO, accessToken: string, refreshToken: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { toast } = useToast();

  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isSubmittingResetEmail, setIsSubmittingResetEmail] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register: registerResetEmail,
    handleSubmit: handleSubmitResetEmail,
    formState: { errors: resetEmailErrors },
    reset: resetEmailForm,
  } = useForm<ResetPasswordEmailValues>({
    resolver: zodResolver(resetPasswordEmailSchema),
    defaultValues: { resetEmail: "" },
  });


  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (formData) => {
    setIsSubmittingLogin(true);
    const loginPayload: LoginRequestDTO = {
      username: formData.email,
      password: formData.password,
      userType: "customer",
    };

    try {
      const response = await apiClient.post<LoginResponseDTO>(
        "/auth/login",
        loginPayload
      );

      if (response.data && response.data.respCode === 2000 && response.data.result) {
        const { accessToken, refreshToken, user } = response.data.result;
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng trở lại, ${user.fullName || user.email}!`,
        });
        onLoginSuccess(user, accessToken, refreshToken);
        resetLogin();
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: response.data.respDesc || "Thông tin không hợp lệ hoặc phản hồi không như mong đợi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login API error:", error);
      let errorMessage = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data) {
          errorMessage = axiosError.response.data.respDesc || axiosError.response.data.message || errorMessage;
        } else if (axiosError.request) {
          errorMessage = "Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối của bạn hoặc điểm cuối API.";
        } else {
          errorMessage = axiosError.message;
        }
      }
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const onResetPasswordEmailSubmit: SubmitHandler<ResetPasswordEmailValues> = async (formData) => {
    setIsSubmittingResetEmail(true);
    try {
      const response = await apiClient.post<ResetPasswordResponseDTO>("/auth/customer/reset-password", {
        email: formData.resetEmail,
      });

      if (response.data && response.data.respCode === 2000 && response.data.result?.status) {
        toast({
          title: "Email đặt lại mật khẩu đã được gửi",
          description: "Nếu email tồn tại trong hệ thống của chúng tôi, liên kết đặt lại mật khẩu sẽ được gửi đến.",
        });
        resetEmailForm();
        setIsResetPasswordDialogOpen(false);
      } else {
        toast({
          title: "Yêu cầu thất bại",
          description: response.data.respDesc || "Không thể xử lý yêu cầu của bạn. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset password API error:", error);
      let errorMessage = "Đã xảy ra lỗi không mong muốn.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data) {
          errorMessage = axiosError.response.data.respDesc || axiosError.response.data.message || errorMessage;
        }
      }
      toast({
        title: "Yêu cầu thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingResetEmail(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="emel.anda@contoh.com"
            {...registerLogin("email")}
            className={loginErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={loginErrors.email ? "true" : "false"}
          />
          {loginErrors.email && (
            <p className="text-xs text-destructive pt-1" role="alert">
              {loginErrors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="login-password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerLogin("password")}
              className={loginErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={loginErrors.password ? "true" : "false"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {loginErrors.password && (
            <p className="text-xs text-destructive pt-1" role="alert">
              {loginErrors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmittingLogin}>
          {isSubmittingLogin ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
        <div className="text-center text-sm">
          <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" type="button" className="text-primary hover:underline p-0 h-auto">
                Quên mật khẩu?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Quên mật khẩu?</DialogTitle>
                <DialogDescription>
                  Nhập địa chỉ email của bạn dưới đây. Nếu email tồn tại trong hệ thống của chúng tôi, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu của bạn.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitResetEmail(onResetPasswordEmailSubmit)} className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="reset-email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="emel.anda@contoh.com"
                    {...registerResetEmail("resetEmail")}
                    className={resetEmailErrors.resetEmail ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {resetEmailErrors.resetEmail && (
                    <p className="text-xs text-destructive pt-1">
                      {resetEmailErrors.resetEmail.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isSubmittingResetEmail}>
                    {isSubmittingResetEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi liên kết đặt lại"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
