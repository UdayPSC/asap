import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrderDetailsProps {
  order: (Order & { 
    customer?: { 
      name: string, 
      phone: string, 
      email: string 
    } 
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export function OrderDetails({ order, isOpen, onClose, customer }: OrderDetailsProps) {
  if (!order) return null;

  // Format amount safely by ensuring it's a number before calling toFixed
  const formatAmount = (amount: any) => {
    // Convert to number if it's a string or return 0 if it's not a valid number
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (typeof amount === 'number' ? amount : 0);
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {customer && (
            <div>
              <h4 className="text-sm font-medium text-slate-900">Customer</h4>
              <div className="mt-1 text-sm text-slate-500">
                <p>{customer.name}</p>
                <p>{customer.phone}</p>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-slate-900">Delivery Address</h4>
            <p className="mt-1 text-sm text-slate-500">{order.address}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-900">Order Details</h4>
            <div className="mt-1 border-t border-b border-slate-200 py-2">
              <div className="flex justify-between text-sm">
                <span>Water Jars:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span>Total Amount:</span>
                <span className="font-medium">₹{formatAmount(order.amount)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Payment Method</h4>
              <p className="mt-1 text-sm text-slate-500">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                {order.paymentId && ` (ID: ${order.paymentId})`}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-900">Status</h4>
              <div className="mt-1">
                <Badge 
                  variant={order.status === 'delivered' ? 'success' : 'outline'} 
                  className={order.status !== 'delivered' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                >
                  {order.status === 'delivered' ? 'Delivered' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}