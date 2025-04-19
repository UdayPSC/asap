import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { OrderForm } from "@/components/forms/order-form";
import { ShopSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function PlaceOrder() {
  const { toast } = useToast();
  
  // Fetch shop settings to check if shop is open
  const { data: shopSettings, isLoading } = useQuery<ShopSettings>({
    queryKey: ["/api/shop-settings"],
  });
  
  // Get current day of the week
  const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
  
  // Check if current day is a working day
  const isWorkingDay = shopSettings?.workingDays?.includes(currentDay) || false;
  
  // Check if shop is currently in one of its shifts
  const currentTimeStr = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  // Format time for comparison (convert "14:30" to comparable time)
  const formatTimeForComparison = (timeStr: string | null | undefined) => {
    if (!timeStr) return "00:00";
    // If already in 24-hour format like "14:30", return as is
    if (timeStr.includes(":")) return timeStr;
    
    // Otherwise, assume it's in format like "2:30 PM" and convert
    const date = new Date(`1/1/2023 ${timeStr}`);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  const isInMorningShift = shopSettings?.morningShiftEnabled && 
    currentTimeStr >= formatTimeForComparison(shopSettings?.morningShiftStart) && 
    currentTimeStr <= formatTimeForComparison(shopSettings?.morningShiftEnd);
    
  const isInAfternoonShift = shopSettings?.afternoonShiftEnabled && 
    currentTimeStr >= formatTimeForComparison(shopSettings?.afternoonShiftStart) && 
    currentTimeStr <= formatTimeForComparison(shopSettings?.afternoonShiftEnd);
  
  // Determine if the shop is currently open based on shifts and working days
  const isShopOpen = (isInMorningShift || isInAfternoonShift) && isWorkingDay && shopSettings?.isOpen;
  
  // Always allow orders, even when shop is closed
  const canPlaceOrder = true;
  
  // Display closed message when applicable
  const showClosedMessage = !isShopOpen && shopSettings;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                Place New Order
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

          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                </div>
              ) : !canPlaceOrder ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Shop is currently closed</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We're sorry, but the shop is currently closed for deliveries.
                    {!isWorkingDay && ` We don't deliver on ${currentDay}s.`}
                    <br />
                    Please check back during our regular business hours: {shopSettings?.openingTime} - {shopSettings?.closingTime}
                  </p>
                </div>
              ) : (
                <>
                  {showClosedMessage && (
                    <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
                      <h3 className="text-red-800 font-medium">Shop is currently closed</h3>
                      <p className="text-red-700 mt-1">{shopSettings?.closedMessage || "We're sorry, but the shop is currently closed for deliveries."}</p>
                      <div className="mt-3 text-sm text-gray-700">
                        <strong>Shop Hours:</strong>
                        <ul className="mt-1 list-disc list-inside space-y-1 ml-2">
                          {shopSettings?.morningShiftEnabled && (
                            <li>Morning: {shopSettings?.morningShiftStart || "08:00"} - {shopSettings?.morningShiftEnd || "12:00"}</li>
                          )}
                          {shopSettings?.afternoonShiftEnabled && (
                            <li>Afternoon: {shopSettings?.afternoonShiftStart || "14:00"} - {shopSettings?.afternoonShiftEnd || "18:00"}</li>
                          )}
                        </ul>
                        <p className="mt-2">
                          <strong>Working Days:</strong> {shopSettings?.workingDays?.join(', ') || "Monday-Saturday"}
                        </p>
                      </div>
                    </div>
                  )}
                  <OrderForm />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
