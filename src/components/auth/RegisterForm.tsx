import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/apiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import PrivacyPolicyTrigger from "../documents/PrivacyPolicyTrigger";
import TermsOfServiceTrigger from "../documents/TermsOfServiceTrigger";

interface CustomerCreateSuccessResponseDTO {
  respCode: number;
  respDesc: string;
  result?: {
    contactNo?: string;
    createdAt?: string;
    custId?: string;
    email?: string;
    fullName?: string;
    identificationNo?: string;
    isDisabled?: boolean;
  } | null;
}

interface ApiErrorDTO {
  respCode: number;
  respDesc: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

const directRegisterSchema = z
  .object({
    email: z.string().email({ message: "Địa chỉ email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string(),
    identificationNo: z.string().min(1, { message: "Cần nhập số CMND/CCCD hoặc hộ chiếu" }),
    fullName: z.string().min(1, { message: "Cần nhập họ tên đầy đủ" }),
    contactNo: z
      .string()
      .min(10, { message: "Số điện thoại phải có ít nhất 10 chữ số" })
      .regex(/^(\+?84|0)[0-9]{9,10}$/, { message: "Định dạng số điện thoại Việt Nam không hợp lệ (ví dụ: +84912345678 hoặc 0912345678)" }),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type DirectRegisterFormValues = z.infer<typeof directRegisterSchema>;

interface RegisterFormProps {
  onRegistrationSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistrationSuccess }) => {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DirectRegisterFormValues>({
    resolver: zodResolver(directRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      identificationNo: "",
      fullName: "",
      contactNo: "",
      agreedToTerms: false,
    },
  });

  const onSubmit: SubmitHandler<DirectRegisterFormValues> = async (data) => {
    setIsSubmitting(true);

    const registrationPayload = {
      email: data.email,
      password: data.password,
      identificationNo: data.identificationNo,
      fullName: data.fullName,
      contactNo: data.contactNo,
    };

    try {
      const response = await apiClient.post<CustomerCreateSuccessResponseDTO>("/auth/customer/create", registrationPayload);

      if (response.data && response.data.respCode === 2000) {
        toast({
          title: "Đăng ký thành công!",
          description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.",
        });
        reset(); // Clear the form fields
        onRegistrationSuccess(); // Callback to AuthPage (e.g., switch to login tab)
      } else {
        // Handle known API errors (e.g., email exists, validation errors from backend)
        toast({
          title: "Đăng ký thất bại",
          description: response.data.respDesc || "Không thể tạo tài khoản của bạn. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration API error:", error);
      let errorMessage = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";

      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>;
        if (axiosError.response && axiosError.response.data && axiosError.response.data.respCode === 4009) {
          errorMessage = axiosError.response.data.respDesc || "Khách hàng với email này đã tồn tại";
        } else if (axiosError.response && axiosError.response.data) {
          errorMessage = axiosError.response.data.respDesc || errorMessage;
        } else if (axiosError.request) {
          errorMessage = "Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối của bạn.";
        } else {
          errorMessage = axiosError.message;
        }
      }
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="email.ban@example.com"
          {...register("email")}
          className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="register-fullName">Họ tên đầy đủ</Label>
        <Input
          id="register-fullName"
          placeholder="Nhập họ tên đầy đủ của bạn"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={errors.fullName ? "true" : "false"}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="register-contactNo">Số điện thoại</Label>
        <Input
          id="register-contactNo"
          placeholder="+84912345678 hoặc 0912345678"
          {...register("contactNo")}
          className={errors.contactNo ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={errors.contactNo ? "true" : "false"}
        />
        {errors.contactNo && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.contactNo.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="register-password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Tạo mật khẩu"
            {...register("password")}
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={errors.password ? "true" : "false"}
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
        {errors.password && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu của bạn"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms-direct"
              checked={field.value}
              onCheckedChange={field.onChange}
              className={errors.agreedToTerms ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={errors.agreedToTerms ? "true" : "false"}
            />
          )}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="terms-direct" className="text-sm font-normal cursor-pointer">
            Tôi đồng ý với
            <TermsOfServiceTrigger>
              <span className="text-primary hover:underline">Điều khoản dịch vụ</span>
            </TermsOfServiceTrigger>
            <span className="pl-1">và</span>
            <PrivacyPolicyTrigger>
              <span className="text-primary hover:underline">Chính sách bảo mật</span>
            </PrivacyPolicyTrigger>
          </Label>
          {errors.agreedToTerms && (
            <p className="text-xs text-destructive" role="alert">
              {errors.agreedToTerms.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          "Đăng ký"
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
