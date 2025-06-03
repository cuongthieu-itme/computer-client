import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Assuming this is the correct path
import { Eye, EyeOff, UserCircle2, Save, ShieldCheck, LogOut, Edit3, Mail, Phone, Lock, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/authStore";
import { UserDTO } from "@/types/api/auth.api"; // Assuming this is the correct path
import { useNavigate } from "react-router-dom"; // Already imported in your code
import apiClient from "@/lib/apiClient"; // Import your API client

// Types for API responses (based on your provided structure)
interface CustomerProfile {
  custId: string;
  email: string;
  fullName: string;
  identificationNo: string;
  contactNo: string;
}

interface GetProfileResponse {
  respCode: number;
  respDesc: string;
  result: {
    customerProfile: CustomerProfile;
  };
}

interface UpdateProfileResponse {
  respCode: number;
  respDesc: string;
  result: {
    status: boolean;
  };
}

interface ChangePasswordResponse {
  respCode: number;
  respDesc: string;
  result: {
    status: boolean;
  };
}


const UserProfilePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Already declared in your code
  const user = useAuthStore((state) => state.user as UserDTO | null);
  const logoutAction = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // const navigate = useAuthStore((state) => state.navigate); // Assuming navigate is part of authStore for consistency or import from react-router-dom

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // Email is read-only, fetched from profile
  const [contactNo, setContactNo] = useState("");
  const [identificationNo, setIdentificationNo] = useState("");

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (custId: string) => {
    setIsLoadingProfile(true);
    try {
      const response = await apiClient.get<GetProfileResponse>(`/api/customer/profile?custId=${custId}`);
      if (response.data.respCode === 2000 && response.data.result?.customerProfile) {
        const profile = response.data.result.customerProfile;
        setFullName(profile.fullName || "");
        setEmail(profile.email || "");
        setContactNo(profile.contactNo || "");
        setIdentificationNo(profile.identificationNo || "");
      } else {
        toast({
          title: "Ralat Mendapatkan Profil", // Translated
          description: response.data.respDesc || "Tidak dapat mengambil data profil.", // Translated
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Ralat mendapatkan profil:", error); // Translated
      toast({
        title: "Ralat API", // Translated
        description: error.response?.data?.respDesc || "Ralat tidak dijangka berlaku semasa mendapatkan profil anda.", // Translated
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (navigate) navigate('/login'); // Use navigate from authStore or react-router-dom
    } else if (user?.custId) {
      fetchUserProfile(user.custId);
    } else {
      // Handle case where user is authenticated but custId is missing (should ideally not happen)
      setIsLoadingProfile(false);
      toast({
        title: "Data Pengguna Tidak Lengkap", // Translated
        description: "ID Pelanggan tiada. Tidak dapat mendapatkan profil.", // Translated
        variant: "destructive",
      });
    }
  }, [user, isAuthenticated, navigate, fetchUserProfile, toast]);


  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.custId) {
      toast({ title: "Ralat", description: "ID Pengguna tidak ditemui.", variant: "destructive" }); // Translated
      return;
    }

    setIsSavingProfile(true);
    const profileData = {
      custId: user.custId,
      email: email, // Email is typically not changed by user directly or requires verification
      fullName,
      identificationNo,
      contactNo,
    };

    try {
      const response = await apiClient.put<UpdateProfileResponse>("/api/customer/profile", profileData);
      if (response.data.respCode === 2000 && response.data.result?.status) {
        toast({
          title: "Profil Dikemas Kini", // Translated
          description: "Maklumat profil anda telah berjaya dikemas kini.", // Translated
        });
        setIsEditingProfile(false);
        // Optionally, re-fetch profile to ensure data consistency if backend modifies data upon save
        fetchUserProfile(user.custId);
        // Consider updating the user object in Zustand store if it's used across the app
        // For example: authStore.setUser({ ...user, fullName, contactNo, identificationNo });
      } else {
        toast({
          title: "Kemas Kini Gagal", // Translated
          description: response.data.respDesc || "Tidak dapat mengemas kini profil.", // Translated
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Ralat kemas kini profil:", error); // Translated
      toast({
        title: "Ralat API", // Translated
        description: error.response?.data?.respDesc || "Ralat tidak dijangka berlaku semasa mengemas kini profil anda.", // Translated
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.custId) {
      toast({ title: "Ralat", description: "ID Pengguna tidak ditemui.", variant: "destructive" }); // Translated
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Kata Laluan Tidak Sepadan", // Translated
        description: "Kata laluan baharu dan pengesahan kata laluan tidak sepadan.", // Translated
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) { // Assuming min length is 6
      toast({
        title: "Kata Laluan Terlalu Pendek", // Translated
        description: "Kata laluan baharu mesti sekurang-kurangnya 6 aksara.", // Translated
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    const passwordData = {
      custId: user.custId,
      currentPassword,
      newPassword,
    };

    try {
      const response = await apiClient.put<ChangePasswordResponse>("/api/customer/password", passwordData);
      if (response.data.respCode === 2000 && response.data.result?.status) {
        toast({
          title: "Kata Laluan Ditukar", // Translated
          description: "Kata laluan anda telah berjaya dikemas kini.", // Translated
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast({
          title: "Penukaran Kata Laluan Gagal", // Translated
          description: response.data.respDesc || "Tidak dapat menukar kata laluan. Sila semak kata laluan semasa anda.", // Translated
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Ralat tukar kata laluan:", error); // Translated
      toast({
        title: "Ralat API", // Translated
        description: error.response?.data?.respDesc || "Ralat tidak dijangka berlaku.", // Translated
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logoutAction();
    if (navigate) navigate("/"); // Use navigate from authStore or react-router-dom
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    // Reset fields to original values by re-fetching (or from initial state if stored)
    if (user?.custId) {
        fetchUserProfile(user.custId);
    }
  }

  if (isLoadingProfile && isAuthenticated) { // Only show full page loader if authenticated and loading
    return (
        <div className="min-h-screen flex flex-col bg-muted/20">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </main>
            <Footer />
        </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Profil Saya</h1> {/* Translated */}
            <p className="text-muted-foreground text-base md:text-lg">
              Lihat dan urus maklumat peribadi dan tetapan akaun anda. {/* Translated */}
            </p>
          </header>

          {/* Personal Information Card */}
          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl md:text-2xl flex items-center mb-1">
                  <UserCircle2 className="mr-3 h-5.5 w-5.5 text-primary" />
                  Butiran Peribadi {/* Translated */}
                </CardTitle>
                <CardDescription>
                  Pastikan maklumat peribadi anda sentiasa terkini. {/* Translated */}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={isEditingProfile ? handleCancelEdit : () => setIsEditingProfile(true)}
                className="gap-2"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 size={16} />}
                {isEditingProfile ? "Batal" : "Sunting Profil"} {/* Translated */}
              </Button>
            </CardHeader>
            <form onSubmit={handleProfileSave}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center"><UserCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />Nama Penuh</Label> {/* Translated */}
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditingProfile || isSavingProfile}
                      className={!isEditingProfile ? "bg-muted/50 cursor-not-allowed" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Alamat Emel</Label> {/* Translated */}
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly // Email should not be editable by user directly
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNo" className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" />Nombor Telefon</Label> {/* Translated */}
                    <Input
                      id="contactNo"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      disabled={!isEditingProfile || isSavingProfile}
                      className={!isEditingProfile ? "bg-muted/50 cursor-not-allowed" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identificationNo" className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />No. KP/Pasport</Label> {/* Translated */}
                    <Input
                      id="identificationNo"
                      value={identificationNo}
                      onChange={(e) => setIdentificationNo(e.target.value)}
                      disabled={!isEditingProfile || isSavingProfile}
                      className={!isEditingProfile ? "bg-muted/50 cursor-not-allowed" : ""}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              {isEditingProfile && (
                <CardFooter className="border-t pt-6">
                  <Button type="submit" className="w-full md:w-auto ml-auto gap-2" disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                    Simpan Perubahan Profil {/* Translated */}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>

          {/* Change Password Card */}
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center mb-1">
                <Lock className="mr-3 h-5.5 w-5.5 text-primary" />
                Tukar Kata Laluan {/* Translated */}
              </CardTitle>
              <CardDescription>
                Kemas kini kata laluan akaun anda untuk keselamatan yang lebih baik. {/* Translated */}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Kata Laluan Semasa</Label> {/* Translated */}
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Masukkan kata laluan semasa anda" // Translated
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Sembunyikan kata laluan semasa" : "Tunjukkan kata laluan semasa"} // Translated
                      disabled={isChangingPassword}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Kata Laluan Baharu</Label> {/* Translated */}
                     <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Masukkan kata laluan baharu" // Translated
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={isChangingPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Sembunyikan kata laluan baharu" : "Tunjukkan kata laluan baharu"} // Translated
                          disabled={isChangingPassword}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Sahkan Kata Laluan Baharu</Label> {/* Translated */}
                    <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder="Sahkan kata laluan baharu" // Translated
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                          disabled={isChangingPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? "Sembunyikan pengesahan kata laluan baharu" : "Tunjukkan pengesahan kata laluan baharu"} // Translated
                           disabled={isChangingPassword}
                        >
                          {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" className="w-full md:w-auto ml-auto gap-2" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={18} />}
                  Kemas Kini Kata Laluan {/* Translated */}
                </Button>
              </CardFooter>
            </form>
          </Card>

           {/* Logout Section */}
           <div className="mt-8 text-end">
            <Button variant="destructive" onClick={handleLogout} className="gap-2 px-10">
              <LogOut size={18} /> Log Keluar {/* Translated */}
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
