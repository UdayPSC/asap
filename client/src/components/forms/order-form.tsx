import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShopSettings } from "@shared/schema";

const orderFormSchema = z.object({
  quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Please select a valid quantity",
  }),
  address: z.string().min(5, { message: "Please enter a valid delivery address" }),
  paymentMethod: z.enum(["cod", "online"], {
    required_error: "Please select a payment method",
  }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export function OrderForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { isLoaded, openRazorpayCheckout } = useRazorpay();
  
  // Fetch shop settings for pricing
  const { data: shopSettings } = useQuery<ShopSettings>({
    queryKey: ["/api/shop-settings"],
  });
  
  const canePrice = shopSettings?.canePrice || 50;
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: "1",
      address: user?.address || "",
      paymentMethod: "cod",
    },
  });
  
  // Update address field when user data changes
  useEffect(() => {
    if (user?.address) {
      form.setValue("address", user.address);
    }
  }, [user, form]);
  
  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      quantity: number;
      amount: number;
      address: string;
      paymentMethod: "cod" | "online";
      paymentId?: string;
    }) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${data.id} has been received!`,
      });
      form.reset();
      setIsConfirmOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message || "An error occurred while placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function calculateTotalAmount(quantity: number) {
    return quantity * canePrice;
  }
  
  function onSubmit(values: OrderFormValues) {
    const quantity = parseInt(values.quantity);
    const amount = calculateTotalAmount(quantity);
    
    setOrderDetails({
      quantity,
      amount,
      address: values.address,
      paymentMethod: values.paymentMethod,
    });
    
    setIsConfirmOpen(true);
  }
  
  function handleConfirmOrder() {
    if (orderDetails.paymentMethod === "online") {
      if (!isLoaded) {
        toast({
          title: "Payment Service Not Ready",
          description: "Payment service is still loading. Please try again in a moment.",
          variant: "destructive"
        });
        return;
      }
      
      // Razorpay expects amount in paise (1 INR = 100 paise)
      openRazorpayCheckout({
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
        amount: orderDetails.amount * 100,
        name: "ASAP Water Jars Delivery",
        description: `Water jars Order - ${orderDetails.quantity} Jars`,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        handler: function(response: any) {
          // Payment successful, create order with payment ID
          createOrderMutation.mutate({
            ...orderDetails,
            paymentId: response.razorpay_payment_id,
          });
        }
      });
    } else {
      // For COD, just create the order
      createOrderMutation.mutate(orderDetails);
    }
  }
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Water Cane Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Water Jar Quantity</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Jar</SelectItem>
                      <SelectItem value="2">2 Jars</SelectItem>
                      <SelectItem value="3">3 Jars</SelectItem>
                      <SelectItem value="4">4 Jars</SelectItem>
                      <SelectItem value="5">5 Jars</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Display */}
            <div className="sm:col-span-3">
              <FormLabel>Price</FormLabel>
              <div className="mt-1 flex items-center">
                <span className="text-lg font-medium text-slate-900">₹{canePrice.toFixed(2)}</span>
                <span className="ml-2 text-sm text-slate-500">per jar</span>
              </div>
            </div>
            
            {/* Delivery Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-6">
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="123 Main St, Apartment 4B, Mumbai, 400001"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="sm:col-span-6">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="mt-2 space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="payment-cod" />
                        <Label htmlFor="payment-cod">Cash on Delivery (COD)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="payment-razorpay" />
                        <Label htmlFor="payment-razorpay">Pay Online (Razorpay)</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      {/* Order Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Confirmation</DialogTitle>
            <DialogDescription>
              Please review your order details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          {orderDetails && (
            <div className="mt-4 space-y-4">
              <div className="border-t border-b border-slate-200 py-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Items:</span>
                  <span className="text-sm font-medium text-slate-900">{orderDetails.quantity} Water Jar{orderDetails.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-slate-500">Total Amount:</span>
                  <span className="text-sm font-medium text-slate-900">₹{orderDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-slate-500">Payment Method:</span>
                  <span className="text-sm font-medium text-slate-900">{orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-slate-500">Delivery Address:</span>
                  <span className="text-sm font-medium text-slate-900 text-right max-w-[50%]">{orderDetails.address}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder} disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? "Processing..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
