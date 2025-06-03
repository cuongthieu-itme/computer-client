// src/components/auth/LoginForm.tsx
import { useState } from "react";
// Link is not used directly for forgot password anymore, it will be a button to open dialog
// import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Added Loader2
import { useLanguage } from "@/contexts/LanguageContext";
import { AxiosError } from "axios";

import apiClient from "@/lib/apiClient";
import { LoginRequestDTO, LoginResponseDTO, ApiErrorDTO, UserDTO } from "@/types/api/auth.api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // To close dialog programmatically if needed or via X button
} from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().email({ message: "Alamat emel tidak sah" }),
  password: z.string().min(6, { message: "Kata laluan mesti sekurang-kurangnya 6 aksara" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Schema for reset password email
const resetPasswordEmailSchema = z.object({
  resetEmail: z.string().email({ message: "Sila masukkan alamat emel yang sah." }),
});
type ResetPasswordEmailValues = z.infer<typeof resetPasswordEmailSchema>;

interface ResetPasswordResponseDTO {
  respCode: number;
  respDesc: string;
  result?: { // Result might not always be present on error
    status: boolean;
  };
}


interface LoginFormProps {
  onLoginSuccess: (userData: UserDTO, accessToken: string, refreshToken: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage(); // Assuming t() will be used elsewhere or with a different setup
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
          title: "Log Masuk Berjaya",
          description: `Selamat kembali, ${user.fullName || user.email}!`,
        });
        onLoginSuccess(user, accessToken, refreshToken);
        resetLogin();
      } else {
        toast({
          title: "Log Masuk Gagal",
          description: response.data.respDesc || "Butiran tidak sah atau respons tidak dijangka.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login API error:", error);
      let errorMessage = "Ralat tidak dijangka berlaku. Sila cuba lagi.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data) {
          errorMessage = axiosError.response.data.respDesc || axiosError.response.data.message || errorMessage;
        } else if (axiosError.request) {
          errorMessage = "Tiada respons daripada pelayan. Sila semak sambungan anda atau titik akhir API.";
        } else {
          errorMessage = axiosError.message;
        }
      }
      toast({
        title: "Log Masuk Gagal",
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
          title: "Emel untuk Tetapan Semula Telah Dihantar",
          description: "Jika emel tersebut wujud dalam sistem kami, pautan untuk menetapkan semula kata laluan akan dihantar.",
        });
        resetEmailForm();
        setIsResetPasswordDialogOpen(false); // Close dialog on success
      } else {
        toast({
          title: "Permintaan Gagal",
          description: response.data.respDesc || "Tidak dapat memproses permintaan anda. Sila cuba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset password API error:", error);
      let errorMessage = "Ralat tidak dijangka berlaku.";
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data) {
          errorMessage = axiosError.response.data.respDesc || axiosError.response.data.message || errorMessage;
        }
      }
      toast({
        title: "Permintaan Gagal",
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
          <Label htmlFor="login-email">Emel</Label>
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
          <Label htmlFor="login-password">Kata Laluan</Label>
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
              aria-label={showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
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
              Sedang Log Masuk...
            </>
          ) : (
            "Log Masuk"
          )}
        </Button>
        <div className="text-center text-sm">
          <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" type="button" className="text-primary hover:underline p-0 h-auto">
                Lupa kata laluan?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Lupa Kata Laluan?</DialogTitle>
                <DialogDescription>
                  Masukkan alamat emel anda di bawah. Jika ia wujud dalam sistem kami, kami akan menghantar pautan untuk menetapkan semula kata laluan anda.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitResetEmail(onResetPasswordEmailSubmit)} className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="reset-email" className="sr-only">
                    Emel
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
                        Menghantar...
                      </>
                    ) : (
                      "Hantar Pautan Tetapan Semula"
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
