import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Order } from "@shared/schema";
import { ClipboardList, Settings, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OwnerDashboard() {
  // Fetch pending orders
  const { data: pendingOrders, isLoading: pendingLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/pending'],
  });
  
  // Fetch completed orders
  const { data: completedOrders, isLoading: completedLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/completed'],
  });
  
  // Calculate statistics
  const isLoading = pendingLoading || completedLoading;
  const pendingOrdersCount = pendingOrders?.length || 0;
  
  // Get orders delivered today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deliveredToday = completedOrders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }) || [];
  
  // Helper function to safely convert order amount to number
  const getNumberAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') return parseFloat(amount) || 0;
    return 0;
  };

  // Calculate revenue with proper number conversion
  const todayRevenue = deliveredToday.reduce((total, order) => 
    total + getNumberAmount(order.amount), 0).toFixed(2);
  const todayOrdersCount = deliveredToday.length;
  
  // Calculate monthly revenue
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyOrders = completedOrders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= firstDayOfMonth;
  }) || [];
  
  const monthlyRevenue = monthlyOrders.reduce((total, order) => 
    total + getNumberAmount(order.amount), 0).toFixed(2);
  const monthlyOrdersCount = monthlyOrders.length;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Owner Dashboard</h1>
          <p className="mt-1 text-slate-600">Manage your water cane delivery business.</p>
          
          <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Orders Card */}
            <DashboardCard 
              icon={<ClipboardList size={20} />}
              title="Manage Orders"
              subtitle="View & Update Orders"
              linkText="View all orders"
              linkHref="/owner/orders"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            {/* Shop Settings Card */}
            <DashboardCard 
              icon={<Settings size={20} />}
              title="Shop Settings"
              subtitle="Update Business Settings"
              linkText="Manage settings"
              linkHref="/owner/shop-settings"
              iconBgColor="bg-indigo-100"
              iconColor="text-indigo-600"
            />
          </div>

          {/* Business Stats */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-slate-900">Recent Orders</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-slate-500">Pending Orders</h3>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-2xl font-semibold text-slate-900">{pendingOrdersCount}</div>
                      {pendingOrdersCount > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Needs Attention</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-slate-500">Delivered Today</h3>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-2xl font-semibold text-slate-900">{todayOrdersCount}</div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-slate-500">Total Revenue Today</h3>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-2xl font-semibold text-slate-900">₹{todayRevenue}</div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{todayOrdersCount} Orders</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-medium text-slate-500">This Month</h3>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-2xl font-semibold text-slate-900">₹{monthlyRevenue}</div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{monthlyOrdersCount} Orders</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}