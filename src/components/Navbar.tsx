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
import { FileText, LogIn, LogOut, Menu, Settings, ShoppingCart, UserCircle2, UserPlus, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm dark:bg-background/95">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <img src="/logo-cpt.png" alt="Logo" className="h-[78px] sm:h-[83px] py-3" />
          <span className="ml-2 font-bold text-[23px] text-primary hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent py-3">
            Computer Store
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {isAuthenticated && user ? <UserCircle2 size={18} /> : <UserRound size={18} />}
                  <span>
                    {isAuthenticated && user ? user.fullName || "Tài khoản của tôi" : "Tài khoản của tôi"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="px-2">
                <DropdownMenuLabel>
                  {isAuthenticated && user ? user.fullName || user.email : "Tài khoản của tôi"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Tài khoản của tôi</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/order-confirmation">
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="mr-3 h-4 w-4" />
                        <span>Đơn hàng của tôi</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <DropdownMenuItem className="cursor-pointer">
                        <LogIn className="mr-3 h-4 w-4" />
                        <span>Đăng nhập</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/login?tab=register">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserPlus className="mr-3 h-4 w-4" />
                        <span>Đăng ký</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ModeToggle />
          <Link to="/cart">
            <Button variant="outline" size="icon" className="relative w-9 h-9">
              <ShoppingCart size={16} />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>
          <button
            className="text-foreground"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Đóng" : "Mở"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col gap-1 dark:bg-background border-t dark:border-border">
            <div className="px-3 py-2">
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                {isAuthenticated && user ? user.fullName || user.email : "Tài khoản của tôi"}
              </div>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <Settings size={16} className="mr-2 inline-block" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                  <DropdownMenuSeparator className="my-5" />
                  <button
                    className="w-full px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 text-left flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent" onClick={toggleMenu}>
                    <LogIn size={16} className="mr-2 inline-block" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/login?tab=register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
                    onClick={toggleMenu}
                  >
                    <UserPlus size={16} className="mr-2 inline-block" />
                    <span>Đăng ký</span>
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
