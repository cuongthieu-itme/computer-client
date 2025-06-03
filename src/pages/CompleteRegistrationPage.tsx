
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const CompleteRegistrationPage = () => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // In a real app, this would come from a query parameter or context
  const [email, setEmail] = useState("user@example.com"); 
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms and Privacy Policy",
        description: "Please agree to the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to save user data
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Complete",
        description: "Your membership has been successfully created!",
        duration: 5000,
      });
      // Redirect to login page instead of profile page
      navigate("/login");
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center flex-grow">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-primary text-center">Complete Your Registration</CardTitle>
            <CardDescription className="text-center">
              Your email has been verified. Please provide the following information to complete your membership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Verified Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+60 12 345 6789"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm leading-none cursor-pointer"
                >
                  I agree to the {" "}
                  <Link to="/terms-of-service" className="text-primary underline hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-primary underline hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Membership"}
                {!isSubmitting && <Check size={18} />}
              </Button>
            </form>
          </CardContent>
          {/* Removed the duplicated Terms and Privacy notice from footer */}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CompleteRegistrationPage;
