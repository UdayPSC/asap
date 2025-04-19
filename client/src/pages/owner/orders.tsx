import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, Filter, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderItem } from "@/components/orders/order-item";
import { Order } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

type PaymentFilterValue = "all" | "cod" | "online";
type DateFilterValue = "all" | "today" | "yesterday" | "week" | "month";

export default function Orders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterValue>("all");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("all");
  
  // Define the extended order type with customer info
  type OrderWithCustomer = Order & { 
    customer?: { 
      name: string, 
      phone: string, 
      email: string 
    } 
  };
  
  // Fetch pending orders
  const { data: pendingOrders, isLoading: pendingLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ['/api/orders/pending'],
  });
  
  // Fetch completed orders
  const { data: completedOrders, isLoading: completedLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ['/api/orders/completed'],
  });
  
  // Get the current orders based on active tab
  const currentOrders = activeTab === "pending" ? pendingOrders : completedOrders;
  const isLoading = activeTab === "pending" ? pendingLoading : completedLoading;
  
  // Filter orders based on payment method and date
  const filteredOrders = currentOrders?.filter(order => {
    // Filter by payment method
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === "today") {
        const startOfDay = today;
        if (orderDate < startOfDay) return false;
      } else if (dateFilter === "yesterday") {
        const startOfYesterday = new Date(today);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = today;
        if (orderDate < startOfYesterday || orderDate >= endOfYesterday) return false;
      } else if (dateFilter === "week") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        if (orderDate < startOfWeek) return false;
      } else if (dateFilter === "month") {
        const startOfMonth = new Date(today);
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);
        if (orderDate < startOfMonth) return false;
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
                Order Management
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" asChild>
                <Link href="/owner/dashboard">
                  <ChevronLeft className="-ml-1 mr-2 h-5 w-5" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b border-slate-200">
            <Tabs defaultValue="pending" onValueChange={setActiveTab}>
              <TabsList className="w-full flex bg-transparent rounded-none h-auto -mb-px">
                <TabsTrigger 
                  value="pending" 
                  className="rounded-none py-4 px-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 data-[state=inactive]:border-b-transparent border-b-2"
                >
                  Pending Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="rounded-none ml-8 py-4 px-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700 data-[state=inactive]:hover:border-slate-300 data-[state=inactive]:border-b-transparent border-b-2"
                >
                  Completed Orders
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Filters */}
          <div className="mt-4 bg-white p-4 sm:p-5 rounded-lg shadow mb-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 flex items-center flex-wrap gap-4">
                <div className="min-w-[200px]">
                  <label htmlFor="filter-payment" className="block text-sm font-medium text-slate-700">Payment Method</label>
                  <Select
                    value={paymentFilter}
                    onValueChange={(value) => setPaymentFilter(value as PaymentFilterValue)}
                  >
                    <SelectTrigger id="filter-payment" className="mt-1">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[200px]">
                  <label htmlFor="filter-date" className="block text-sm font-medium text-slate-700">Date</label>
                  <Select
                    value={dateFilter}
                    onValueChange={(value) => setDateFilter(value as DateFilterValue)}
                  >
                    <SelectTrigger id="filter-date" className="mt-1">
                      <SelectValue placeholder="Select Date Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentFilter("all");
                    setDateFilter("all");
                  }}
                >
                  <Filter className="-ml-1 mr-2 h-5 w-5 text-slate-500" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="pending" className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <ul role="list" className="divide-y divide-slate-200">
                    {filteredOrders.map((order) => (
                      <li key={order.id}>
                        <OrderItem 
                          order={order} 
                          isOwner={true} 
                          userName={user?.name}
                          userPhone={user?.phone}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-slate-600">No pending orders found.</p>
                    {(paymentFilter !== "all" || dateFilter !== "all") && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setPaymentFilter("all");
                          setDateFilter("all");
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <ul role="list" className="divide-y divide-slate-200">
                    {filteredOrders.map((order) => (
                      <li key={order.id}>
                        <OrderItem 
                          order={order} 
                          isOwner={true}
                          userName={user?.name}
                          userPhone={user?.phone}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-slate-600">No completed orders found.</p>
                    {(paymentFilter !== "all" || dateFilter !== "all") && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setPaymentFilter("all");
                          setDateFilter("all");
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
