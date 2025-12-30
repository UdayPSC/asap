import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { OrderDetails } from "./order-details";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface OrderItemProps {
  order: Order & { 
    customer?: { 
      name: string, 
      phone: string, 
      email: string 
    } 
  };
  isOwner?: boolean;
  userName?: string;
  userPhone?: string;
}

export function OrderItem({ order, isOwner }: OrderItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: 'pending' | 'delivered' }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/completed'] });
      
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMarkDelivered = () => {
    updateStatusMutation.mutate({ orderId: order.id, status: 'delivered' });
  };

  return (
    <>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-blue-600 truncate">
            Order #{order.id}
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <Badge 
              variant={order.status === 'delivered' ? 'success' : 'outline'} 
              className={order.status !== 'delivered' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
            >
              {order.status === 'delivered' ? 'Delivered' : 'Pending'}
            </Badge>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="flex items-center text-sm text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.3 9.3a4 4 0 0 0-5.66-5.66M7.3 7.3a4 4 0 0 0 5.66 5.66" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9" />
              </svg>
              <p>{order.quantity} Water Jar{order.quantity > 1 ? 's' : ''}</p>
            </div>
            <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 sm:ml-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
              <p>{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
            <p>
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        
        {isOwner && order.status === 'pending' && (
          <div className="mt-4 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={handleMarkDelivered}
              disabled={updateStatusMutation.isPending}
            >
              Mark Delivered
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
          </div>
        )}
        
        {!isOwner && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
          </div>
        )}
      </div>
      
      <OrderDetails 
        order={order} 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
        customer={isOwner && order.customer ? order.customer : undefined}
      />
    </>
  );
}
