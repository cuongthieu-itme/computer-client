// src/components/auth/RegisterForm.tsx
import { useState } from "react";
import { Link } from "react-router-dom"; // Keep for Terms/Privacy links
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Added Loader2
import { useLanguage } from "@/contexts/LanguageContext";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";
import PrivacyPolicyTrigger from "../documents/PrivacyPolicyTrigger";
import TermsOfPurchaseTrigger from "../documents/TermsOfPurchaseTrigger";
import TermsOfServiceTrigger from "../documents/TermsOfServiceTrigger";

interface CustomerCreateSuccessResponseDTO {
  respCode: number;
  respDesc: string;
  result?: {
    // Assuming the success result might contain some user info, though not strictly needed by the form after success
    contactNo?: string;
    createdAt?: string;
    custId?: string;
    email?: string;
    fullName?: string;
    identificationNo?: string;
    isDisabled?: boolean;
  } | null;
}

// Assuming a generic error DTO structure
interface ApiErrorDTO {
  respCode: number;
  respDesc: string;
  message?: string; // Optional, for more generic errors
  errors?: Array<{ field: string; message: string }>; // Optional, for field-specific errors
}

// Define the Zod schema for direct registration
const directRegisterSchema = z
  .object({
    email: z.string().email({ message: "Alamat emel tidak sah" }), // Translated
    password: z.string().min(6, { message: "Kata laluan mesti sekurang-kurangnya 6 aksara" }), // Translated
    confirmPassword: z.string(),
    identificationNo: z.string().min(1, { message: "Nombor pengenalan diperlukan" }), // Translated
    fullName: z.string().min(1, { message: "Nama penuh diperlukan" }), // Translated
    contactNo: z
      .string()
      .min(10, { message: "Nombor telefon mesti sekurang-kurangnya 10 digit" }) // Translated
      .regex(/^(\+?6?01)[0-9]{7,9}$/, { message: "Format nombor telefon bimbit Malaysia tidak sah (cth., +60123456789 atau 0123456789)" }), // Translated
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "Anda mesti bersetuju dengan Syarat Perkhidmatan dan Dasar Privasi.", // Translated
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata laluan tidak sepadan", // Translated
    path: ["confirmPassword"], // Apply error to confirmPassword field
  });

type DirectRegisterFormValues = z.infer<typeof directRegisterSchema>;

interface RegisterFormProps {
  onRegistrationSuccess: () => void; // Callback to AuthPage to switch tab
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistrationSuccess }) => {
  const { t } = useLanguage(); // For internationalization
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control, // For Controller component (Checkbox)
    formState: { errors },
    reset, // To clear the form on success
  } = useForm<DirectRegisterFormValues>({
    resolver: zodResolver(directRegisterSchema),
    defaultValues: {
      // Set default values for the form fields
      email: "",
      password: "",
      confirmPassword: "",
      identificationNo: "",
      fullName: "",
      contactNo: "",
      agreedToTerms: false,
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<DirectRegisterFormValues> = async (data) => {
    setIsSubmitting(true);

    // Construct the payload for the API
    const registrationPayload = {
      email: data.email,
      password: data.password,
      identificationNo: data.identificationNo,
      fullName: data.fullName,
      contactNo: data.contactNo,
    };

    try {
      // API Endpoint: POST - {{base_url}}/auth/customer/create
      const response = await apiClient.post<CustomerCreateSuccessResponseDTO>("/auth/customer/create", registrationPayload);

      if (response.data && response.data.respCode === 2000) {
        toast({
          title: "Pendaftaran Berjaya!", // Translated
          description: "Akaun anda telah dicipta. Sila log masuk untuk meneruskan.", // Translated
        });
        reset(); // Clear the form fields
        onRegistrationSuccess(); // Callback to AuthPage (e.g., switch to login tab)
      } else {
        // Handle known API errors (e.g., email exists, validation errors from backend)
        toast({
          title: "Pendaftaran Gagal", // Translated
          description: response.data.respDesc || "Tidak dapat mencipta akaun anda. Sila cuba lagi.", // Translated
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration API error:", error);
      let errorMessage = "Ralat tidak dijangka berlaku. Sila cuba lagi."; // Translated

      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorDTO>; // Type assertion
        // Check for specific error code for existing email
        if (axiosError.response && axiosError.response.data && axiosError.response.data.respCode === 4009) {
          errorMessage = axiosError.response.data.respDesc || "Pelanggan dengan emel ini sudah wujud"; // Translated
        } else if (axiosError.response && axiosError.response.data) {
          // Use backend's description if available
          errorMessage = axiosError.response.data.respDesc || errorMessage;
        } else if (axiosError.request) {
          // Network error or no response from server
          errorMessage = "Tiada respons daripada pelayan. Sila semak sambungan anda."; // Translated
        } else {
          // Other Axios errors
          errorMessage = axiosError.message;
        }
      }
      toast({
        title: "Pendaftaran Gagal", // Translated
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle password visibility functions
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1">
        <Label htmlFor="register-email">Emel</Label> {/* Translated */}
        <Input
          id="register-email"
          type="email"
          placeholder="emel.anda@contoh.com" // Translated
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

      {/* Full Name Field */}
      <div className="space-y-1">
        <Label htmlFor="register-fullName">Nama Penuh</Label> {/* Translated */}
        <Input
          id="register-fullName"
          placeholder="Masukkan nama penuh anda" // Translated
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

      {/* Identification Number Field */}
      <div className="space-y-1">
        <Label htmlFor="register-identificationNo">No. KP / Pasport</Label> {/* Translated */}
        <Input
          id="register-identificationNo"
          placeholder="Masukkan No. KP atau Pasport anda" // Translated
          {...register("identificationNo")}
          className={errors.identificationNo ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={errors.identificationNo ? "true" : "false"}
        />
        {errors.identificationNo && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.identificationNo.message}
          </p>
        )}
      </div>

      {/* Contact Number Field */}
      <div className="space-y-1">
        <Label htmlFor="register-contactNo">Nombor Telefon</Label> {/* Translated */}
        <Input
          id="register-contactNo"
          placeholder="+60123456789"
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

      {/* Password Field */}
      <div className="space-y-1">
        <Label htmlFor="register-password">Kata Laluan</Label> {/* Translated */}
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Cipta kata laluan" // Translated
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
            aria-label={showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
          >
            {" "}
            {/* Translated */}
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1">
        <Label htmlFor="register-confirm-password">Sahkan Kata Laluan</Label> {/* Translated */}
        <div className="relative">
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Sahkan kata laluan anda" // Translated
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
            aria-label={showConfirmPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
          >
            {" "}
            {/* Translated */}
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive pt-1" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="flex items-start space-x-2 pt-2">
        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms-direct" // Ensure unique ID if multiple forms exist on a page, though unlikely here
              checked={field.value}
              onCheckedChange={field.onChange}
              className={errors.agreedToTerms ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={errors.agreedToTerms ? "true" : "false"}
            />
          )}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="terms-direct" className="text-sm font-normal cursor-pointer">
            Saya bersetuju dengan {/* Translated */}
            <TermsOfServiceTrigger>
              <span className="text-primary hover:underline">Syarat Perkhidmatan</span>
            </TermsOfServiceTrigger>
            <span className="pl-1">dan</span> {/* Translated */}
            <PrivacyPolicyTrigger>
              <span className="text-primary hover:underline">Dasar Privasi</span>
            </PrivacyPolicyTrigger>
          </Label>
          {errors.agreedToTerms && (
            <p className="text-xs text-destructive" role="alert">
              {errors.agreedToTerms.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mencipta Akaun... {/* Translated */}
          </>
        ) : (
          "Cipta Akaun" // Translated
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
