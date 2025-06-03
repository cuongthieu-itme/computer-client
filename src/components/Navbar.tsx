// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, UserRound, ShoppingCart, FileText, Settings, LogOut, UserCircle2, LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
// import { ModeToggle } from '@/components/ModeToggle';
import LanguageSelector from './LanguageSelector'; 
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuthStore } from "@/store/authStore";
import { UserDTO } from "@/types/api/auth.api";
import { cn } from "@/lib/utils"; // Import cn utility

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage(); // language and setLanguage for mobile example
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user as UserDTO | null);
  const logoutAction = useAuthStore((state) => state.logout);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutAction();
    setIsMenuOpen(false);
    navigate("/");
  };

  // Sample languages for mobile menu, adjust as needed
  // For full localization, these names might also come from common.json
  const availableLanguages = [
    { code: "en", name: t("components.Navbar.mobileMenu.lang.en") },
    { code: "ms", name: t("components.Navbar.mobileMenu.lang.ms") },
    { code: "zh-CN", name: t("components.Navbar.mobileMenu.lang.zhCN") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm dark:bg-background/95">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and Brand Name */}
        <Link to="/" className="flex items-center gap-1">
          <img src="/portal-e-ticket-logo.png" alt={t("components.Navbar.logoAlt")} className="h-[78px] sm:h-[83px] py-3" />
          <span className="ml-2 font-bold text-[23px] text-primary hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent ">
            {t("components.Navbar.brandName")}
          </span>
        </Link>

        {/* Desktop navigation items */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {/* Placeholder for potential future links */}
          {/* <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("components.Navbar.links.events", "Events")}</Link> */}
          {/* <Link to="/attractions" className="text-sm font-medium text-muted-foreground hover:text-primary">{t("components.Navbar.links.attractions", "Attractions")}</Link> */}

          <div className="flex items-center gap-2">
            <LanguageSelector />
            {/* <ModeToggle /> */}
            {/* Cart Icon - commented out as per original */}
            {/* <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {isAuthenticated && user ? <UserCircle2 size={18} /> : <UserRound size={18} />}
                  <span>
                    {isAuthenticated && user ? user.fullName || t("components.Navbar.account.myAccount") : t("components.Navbar.account.myAccount")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="px-2">
                <DropdownMenuLabel>
                  {isAuthenticated && user ? user.fullName || user.email : t("components.Navbar.account.myAccount")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-3 h-4 w-4" />
                        <span>{t("components.Navbar.account.personalInfo")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/order-confirmation">
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="mr-3 h-4 w-4" />
                        <span>{t("components.Navbar.account.orderHistory")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t("common.logout")}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <DropdownMenuItem className="cursor-pointer">
                        <LogIn className="mr-3 h-4 w-4" />
                        <span>{t("common.login")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/login?tab=register">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserPlus className="mr-3 h-4 w-4" />
                        <span>{t("common.register")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/nonMemberOrderInquiry">
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="mr-3 h-4 w-4" />
                        <span>{t("components.Navbar.account.nonMemberOrderInquiry")}</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu button and cart icon */}
        <div className="flex items-center gap-3 md:hidden">
          {/* <ModeToggle /> */}
          {/* Mobile Cart Icon - commented out as per original */}
          {/* <Link to="/cart">
            <Button variant="outline" size="icon" className="relative w-9 h-9">
              <ShoppingCart size={16} />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                0
              </span>
            </Button>
          </Link> */}
          <button
            className="text-foreground"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? t("components.Navbar.mobileMenu.close") : t("components.Navbar.mobileMenu.open")}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile navigation drawer */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col gap-1 dark:bg-background border-t dark:border-border">
            {/* Language selection section - Example if LanguageSelector component is not used here */}
            <div className="px-3 py-2">
              <div className="mb-2 text-sm font-medium text-muted-foreground">{t("common.language")}</div>
              {availableLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => {
                    setLanguage(lang.code as "en" | "ms" | "zh-CN"); // Cast to ensure type safety
                    // toggleMenu(); // Optionally close menu on language change
                  }}
                >
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
            <DropdownMenuSeparator />

            <div className="px-3 py-2">
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                {isAuthenticated && user ? user.fullName || user.email : t("components.Navbar.account.myAccount")}
              </div>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <Settings size={16} className="mr-2 inline-block" />
                    <span>{t("components.Navbar.account.personalInfo")}</span>
                  </Link>
                  <Link
                    to="/order-confirmation"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <FileText size={16} className="mr-2 inline-block" />
                    <span>{t("components.Navbar.account.orderHistory")}</span>
                  </Link>
                  <DropdownMenuSeparator className="my-5" />
                  <button
                    className="w-full px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 text-left flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>{t("common.logout")}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent" onClick={toggleMenu}>
                    <LogIn size={16} className="mr-2 inline-block" />
                    <span>{t("common.login")}</span>
                  </Link>
                  <Link
                    to="/login?tab=register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <UserPlus size={16} className="mr-2 inline-block" />
                    <span>{t("common.register")}</span>
                  </Link>
                  <Link
                    to="/nonMemberOrderInquiry"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <FileText size={16} className="mr-2 inline-block" />
                    <span>{t("components.Navbar.account.nonMemberOrderInquiry")}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
