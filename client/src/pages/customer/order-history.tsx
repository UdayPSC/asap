import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, Loader2 } from "lucide-react";
import { OrderItem } from "@/components/orders/order-item";
import { Order } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterValue = "all" | "pending" | "delivered";
type TimeFilterValue = "all" | "week" | "month" | "year";

export default function OrderHistory() {
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>("all");
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/customer'],
  });
  
  // Filter orders based on status and time
  const filteredOrders = orders?.filter(order => {
    // Filter by status
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    // Filter by time
    if (timeFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (timeFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      } else if (timeFilter === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        if (orderDate < yearAgo) return false;
      }
    }
    
    return true;
  }) || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                Order History
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" asChild>
                <Link href="/customer/dashboard">
                  <ChevronLeft className="-ml-1 mr-2 h-5 w-5" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-4 bg-white shadow rounded-lg p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as FilterValue)}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="time-filter" className="block text-sm font-medium text-slate-700 mb-1">
                Time Period
              </label>
              <Select
                value={timeFilter}
                onValueChange={(value) => setTimeFilter(value as TimeFilterValue)}
              >
                <SelectTrigger id="time-filter">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders List */}
          <div className="mt-4 bg-white shadow sm:rounded-lg">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <ul role="list" className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <li key={order.id}>
                    <OrderItem order={order} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-slate-600">No orders found matching the selected filters.</p>
                {statusFilter !== "all" || timeFilter !== "all" ? (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setStatusFilter("all");
                      setTimeFilter("all");
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Link href="/customer/place-order" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
                    Place your first order now!
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
