import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const isMobile = useMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Nav links based on user status and role
  const renderLinks = () => {
    if (!user) {
      return (
        <div className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/auth" onClick={() => closeMenu()}>Customer Login</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth?owner=true" onClick={() => closeMenu()}>Owner Login</Link>
          </Button>
        </div>
      );
    } else if (user.role === "customer") {
      return (
        <div className="flex space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/customer/dashboard" onClick={() => closeMenu()}>Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/customer/place-order" onClick={() => closeMenu()}>Place Order</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/customer/order-history" onClick={() => closeMenu()}>Order History</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/customer/profile" onClick={() => closeMenu()}>Profile</Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            Logout
          </Button>
        </div>
      );
    } else if (user.role === "owner") {
      return (
        <div className="flex space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/owner/dashboard" onClick={() => closeMenu()}>Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/owner/orders" onClick={() => closeMenu()}>Orders</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/owner/shop-settings" onClick={() => closeMenu()}>Shop Settings</Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            Logout
          </Button>
        </div>
      );
    }
  };

  // Mobile links have a different layout
  const renderMobileLinks = () => {
    if (!user) {
      return (
        <div className="space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/auth" onClick={() => closeMenu()}>Customer Login</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/auth?owner=true" onClick={() => closeMenu()}>Owner Login</Link>
          </Button>
        </div>
      );
    } else if (user.role === "customer") {
      return (
        <div className="space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/customer/dashboard" onClick={() => closeMenu()}>Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/customer/place-order" onClick={() => closeMenu()}>Place Order</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/customer/order-history" onClick={() => closeMenu()}>Order History</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/customer/profile" onClick={() => closeMenu()}>Profile</Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
            Logout
          </Button>
        </div>
      );
    } else if (user.role === "owner") {
      return (
        <div className="space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/owner/dashboard" onClick={() => closeMenu()}>Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/owner/orders" onClick={() => closeMenu()}>Orders</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/owner/shop-settings" onClick={() => closeMenu()}>Shop Settings</Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
            Logout
          </Button>
        </div>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {renderLinks()}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {renderMobileLinks()}
          </div>
        </div>
      )}
    </header>
  );
}
