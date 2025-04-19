import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { OrderItem } from "@/components/orders/order-item";
import { Order } from "@shared/schema";
import { Loader2, ShoppingCart, History, User } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/customer'],
  });
  
  // Get only recent orders for dashboard display
  const recentOrders = orders?.slice(0, 3) || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome to your Dashboard</h1>
          <p className="mt-1 text-slate-600">Manage your water deliveries all in one place.</p>
          
          <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* Place Order Card */}
            <DashboardCard 
              icon={<ShoppingCart size={20} />}
              title="New Order"
              subtitle="Place an Order"
              linkText="Order water canes"
              linkHref="/customer/place-order"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            {/* Order History Card */}
            <DashboardCard 
              icon={<History size={20} />}
              title="Order History"
              subtitle="Your Orders"
              linkText="View order history"
              linkHref="/customer/order-history"
              iconBgColor="bg-indigo-100"
              iconColor="text-indigo-600"
            />

            {/* Profile Card */}
            <DashboardCard 
              icon={<User size={20} />}
              title="Your Profile"
              subtitle="Update Profile"
              linkText="Manage your information"
              linkHref="/customer/profile"
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-slate-900">Recent Orders</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-slate-200">
                  {recentOrders.map((order) => (
                    <li key={order.id}>
                      <OrderItem order={order} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                <p className="text-slate-600">You haven't placed any orders yet.</p>
                <p className="mt-2">
                  <a href="/customer/place-order" className="text-blue-600 hover:text-blue-500">
                    Place your first order now!
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
