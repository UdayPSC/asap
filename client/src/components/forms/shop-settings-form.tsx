import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ShopSettings } from "@shared/schema";

const weekdays = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const pricingFormSchema = z.object({
  canePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  deliveryFee: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Delivery fee must be a valid number",
  }),
  minOrderQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Minimum order quantity must be at least 1",
  }),
});

const hoursFormSchema = z.object({
  isOpen: z.boolean(),
  // Morning shift
  morningShiftEnabled: z.boolean(),
  morningShiftStart: z.string(),
  morningShiftEnd: z.string(),
  // Afternoon shift
  afternoonShiftEnabled: z.boolean(),
  afternoonShiftStart: z.string(),
  afternoonShiftEnd: z.string(),
  // Closed shop message
  closedMessage: z.string().min(10, "Message must be at least 10 characters"),
  // Legacy fields
  openingTime: z.string(),
  closingTime: z.string(),
  workingDays: z.array(z.string()).min(1, {
    message: "Please select at least one working day",
  }),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;
type HoursFormValues = z.infer<typeof hoursFormSchema>;

export function ShopSettingsForm() {
  const { toast } = useToast();
  
  // Fetch current shop settings
  const { data: shopSettings, isLoading } = useQuery<ShopSettings>({
    queryKey: ["/api/shop-settings"],
  });
  
  const pricingForm = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      canePrice: "50",
      deliveryFee: "0",
      minOrderQuantity: "1",
    },
  });
  
  const hoursForm = useForm<HoursFormValues>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues: {
      isOpen: true,
      // Morning shift
      morningShiftEnabled: true,
      morningShiftStart: "08:00",
      morningShiftEnd: "12:00",
      // Afternoon shift
      afternoonShiftEnabled: true,
      afternoonShiftStart: "14:00",
      afternoonShiftEnd: "18:00",
      // Closed message
      closedMessage: "We're sorry, but the shop is currently closed for deliveries. Your order will be processed when we reopen.",
      // Legacy fields
      openingTime: "09:00",
      closingTime: "18:00",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
  });
  
  // Set form values when shop settings are loaded
  useEffect(() => {
    if (shopSettings) {
      pricingForm.reset({
        canePrice: shopSettings.canePrice.toString(),
        deliveryFee: shopSettings.deliveryFee?.toString() || "0",
        minOrderQuantity: shopSettings.minOrderQuantity?.toString() || "1",
      });
      
      hoursForm.reset({
        isOpen: shopSettings.isOpen || false,
        // Morning shift
        morningShiftEnabled: shopSettings.morningShiftEnabled ?? true,
        morningShiftStart: shopSettings.morningShiftStart || "08:00",
        morningShiftEnd: shopSettings.morningShiftEnd || "12:00",
        // Afternoon shift
        afternoonShiftEnabled: shopSettings.afternoonShiftEnabled ?? true,
        afternoonShiftStart: shopSettings.afternoonShiftStart || "14:00",
        afternoonShiftEnd: shopSettings.afternoonShiftEnd || "18:00",
        // Closed message
        closedMessage: shopSettings.closedMessage || "We're sorry, but the shop is currently closed for deliveries. Your order will be processed when we reopen.",
        // Legacy fields
        openingTime: shopSettings.openingTime || "09:00",
        closingTime: shopSettings.closingTime || "18:00",
        workingDays: shopSettings.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      });
    }
  }, [shopSettings, pricingForm, hoursForm]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<ShopSettings>) => {
      const res = await apiRequest("PATCH", "/api/shop-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-settings"] });
      toast({
        title: "Settings Updated",
        description: "Shop settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "An error occurred while updating shop settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onPricingSubmit(values: PricingFormValues) {
    updateSettingsMutation.mutate({
      canePrice: Number(values.canePrice),
      deliveryFee: Number(values.deliveryFee),
      minOrderQuantity: parseInt(values.minOrderQuantity),
    });
  }
  
  function onHoursSubmit(values: HoursFormValues) {
    updateSettingsMutation.mutate(values);
  }
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading shop settings...</div>;
  }
  
  return (
    <Tabs defaultValue="pricing" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pricing">Pricing Settings</TabsTrigger>
        <TabsTrigger value="hours">Business Hours</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pricing" className="p-4 pt-6">
        <Form {...pricingForm}>
          <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="space-y-6">
            <div className="grid grid-cols-6 gap-6">
              <FormField
                control={pricingForm.control}
                name="canePrice"
                render={({ field }) => (
                  <FormItem className="col-span-6 sm:col-span-3">
                    <FormLabel>Water Cane Price (₹)</FormLabel>
                    <FormControl>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">₹</span>
                        </div>
                        <Input {...field} className="pl-7" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pricingForm.control}
                name="minOrderQuantity"
                render={({ field }) => (
                  <FormItem className="col-span-6 sm:col-span-3">
                    <FormLabel>Minimum Order Quantity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum quantity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Cane</SelectItem>
                        <SelectItem value="2">2 Canes</SelectItem>
                        <SelectItem value="3">3 Canes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pricingForm.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem className="col-span-6">
                    <FormLabel>Delivery Fee (₹)</FormLabel>
                    <FormControl>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">₹</span>
                        </div>
                        <Input {...field} className="pl-7" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Leave as 0 for free delivery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Pricing"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="hours" className="p-4 pt-6">
        <Form {...hoursForm}>
          <form onSubmit={hoursForm.handleSubmit(onHoursSubmit)} className="space-y-6">
            <FormField
              control={hoursForm.control}
              name="isOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Shop is currently open for orders
                    </FormLabel>
                    <FormDescription>
                      Uncheck this to temporarily close the shop.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-4">Morning Shift</h3>
              
              <FormField
                control={hoursForm.control}
                name="morningShiftEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Morning shift enabled
                      </FormLabel>
                      <FormDescription>
                        Enable morning delivery shift
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-7 gap-4">
                <FormField
                  control={hoursForm.control}
                  name="morningShiftStart"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 flex items-end justify-center pb-2">
                  <span className="text-slate-500">to</span>
                </div>
                
                <FormField
                  control={hoursForm.control}
                  name="morningShiftEnd"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-4">Afternoon Shift</h3>
              
              <FormField
                control={hoursForm.control}
                name="afternoonShiftEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Afternoon shift enabled
                      </FormLabel>
                      <FormDescription>
                        Enable afternoon delivery shift
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-7 gap-4">
                <FormField
                  control={hoursForm.control}
                  name="afternoonShiftStart"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 flex items-end justify-center pb-2">
                  <span className="text-slate-500">to</span>
                </div>
                
                <FormField
                  control={hoursForm.control}
                  name="afternoonShiftEnd"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-4">Standard Shop Hours (Legacy)</h3>
              <div className="grid grid-cols-7 gap-4">
                <FormField
                  control={hoursForm.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 flex items-end justify-center pb-2">
                  <span className="text-slate-500">to</span>
                </div>
                
                <FormField
                  control={hoursForm.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={hoursForm.control}
              name="closedMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closed Shop Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Message to display when shop is closed"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be shown to customers when the shop is closed but still accepting orders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={hoursForm.control}
              name="workingDays"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Working Days</FormLabel>
                    <FormDescription>
                      Select the days your shop is open for deliveries.
                    </FormDescription>
                  </div>
                  <div className="space-y-3">
                    {weekdays.map((day) => (
                      <FormField
                        key={day.value}
                        control={hoursForm.control}
                        name="workingDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Hours"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
