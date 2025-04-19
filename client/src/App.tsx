import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import PlaceOrder from "@/pages/customer/place-order";
import OrderHistory from "@/pages/customer/order-history";
import CustomerProfile from "@/pages/customer/profile";

// Owner Pages
import OwnerDashboard from "@/pages/owner/dashboard";
import Orders from "@/pages/owner/orders";
import ShopSettings from "@/pages/owner/shop-settings";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Customer Routes */}
      <ProtectedRoute path="/customer/dashboard" component={CustomerDashboard} requiredRole="customer" />
      <ProtectedRoute path="/customer/place-order" component={PlaceOrder} requiredRole="customer" />
      <ProtectedRoute path="/customer/order-history" component={OrderHistory} requiredRole="customer" />
      <ProtectedRoute path="/customer/profile" component={CustomerProfile} requiredRole="customer" />
      
      {/* Owner Routes */}
      <ProtectedRoute path="/owner/dashboard" component={OwnerDashboard} requiredRole="owner" />
      <ProtectedRoute path="/owner/orders" component={Orders} requiredRole="owner" />
      <ProtectedRoute path="/owner/shop-settings" component={ShopSettings} requiredRole="owner" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
