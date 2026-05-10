import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import {
  useGetOrderByIdQuery,
  useConfirmPaymentMutation,
  useCancelOrderMutation,
  useMarkDeliveredMutation,
} from "../ordersApi";
import { useCreateSalesInvoiceMutation } from "@/features/adminPanel/invoice/invoiceApi";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

interface OrderDetailDialogProps {
  orderId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderDetailDialog = ({ orderId, onClose, onUpdate }: OrderDetailDialogProps) => {
  const { data, isLoading } = useGetOrderByIdQuery(orderId);
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmPaymentMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [markDelivered, { isLoading: isDelivering }] = useMarkDeliveredMutation();
  const [createSalesInvoice, { isLoading: isGeneratingInvoice }] = useCreateSalesInvoiceMutation();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const order = data?.data;

  const formatPrice = (price: { $numberDecimal: string } | number): string => {
    if (typeof price === "object" && "$numberDecimal" in price) {
      return `₹${parseFloat(price.$numberDecimal).toFixed(2)}`;
    }
    return `₹${Number(price).toFixed(2)}`;
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment({ orderId }).unwrap();
      toast.success("Payment confirmed.");
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to confirm payment.");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder({ orderId, reason: "Cancelled by admin" }).unwrap();
      toast.success("Order cancelled.");
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel order.");
    }
  };

  const handleMarkDelivered = async () => {
    try {
      await markDelivered(orderId).unwrap();
      toast.success("Order marked as delivered.");
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark as delivered.");
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      await createSalesInvoice({
        orderId,
        taxRate: taxRate ? Number(taxRate) : undefined,
        discount: discount ? Number(discount) : undefined,
        notes: invoiceNotes || undefined,
      }).unwrap();
      toast.success("Sales invoice generated successfully.");
      setShowInvoiceForm(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate invoice.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D54F47]"></div>
          </div>
        ) : order ? (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.orderStatus} />
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium">{order.user?.name || "N/A"}</p>
                <p className="text-gray-500">{order.user?.email || ""}</p>
              </div>
              <div>
                <span className="text-gray-500">Payment Method:</span>
                <p className="font-medium capitalize">{order.paymentMethod.replace("_", " ")}</p>
                {order.transactionId && (
                  <p className="text-xs text-gray-400">Txn: {order.transactionId}</p>
                )}
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                {order.couponCode && (
                  <div className="mt-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Coupon: {order.couponCode}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Subtotal: {formatPrice(order.subtotal)} | Discount: -{formatPrice(order.discount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">
                      {item.product?.name || "Unknown Product"}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(order.orderStatus === "CONFIRMED" || order.orderStatus === "DELIVERED") && (
              <div className="mt-6 pt-4 border-t">
                {!showInvoiceForm ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInvoiceForm(true)}
                    className="flex items-center gap-2"
                  >
                    <FileText size={14} /> Generate Invoice
                  </Button>
                ) : (
                  <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Generate Sales Invoice</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D54F47]"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Discount ($)</label>
                        <input
                          type="number"
                          min={0}
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D54F47]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D54F47]"
                        placeholder="Invoice notes..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleGenerateInvoice}
                        disabled={isGeneratingInvoice}
                        className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                      >
                        {isGeneratingInvoice ? "Generating..." : "Create Invoice"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowInvoiceForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>

              {order.orderStatus === "PAYMENT_PENDING" && (
                <>
                  <Button
                    size="sm"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmPayment}
                    disabled={isConfirming}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isConfirming ? "Confirming..." : "Confirm Payment"}
                  </Button>
                </>
              )}

              {order.orderStatus === "CONFIRMED" && (
                <Button
                  size="sm"
                  onClick={handleMarkDelivered}
                  disabled={isDelivering}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isDelivering ? "Updating..." : "Mark Delivered"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Order not found.</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetailDialog;
