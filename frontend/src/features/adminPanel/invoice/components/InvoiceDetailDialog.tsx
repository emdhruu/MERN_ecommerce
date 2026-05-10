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
import { useGetInvoiceByIdQuery, useUpdateInvoiceStatusMutation } from "../invoiceApi";
import { exportSingleInvoiceCSV, downloadInvoicePDF } from "@/features/adminPanel/common/exportUtils";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceDetailDialogProps {
  invoiceId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const InvoiceDetailDialog = ({ invoiceId, onClose, onUpdate }: InvoiceDetailDialogProps) => {
  const { data, isLoading } = useGetInvoiceByIdQuery(invoiceId);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateInvoiceStatusMutation();

  const invoice = data?.data;

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ id: invoiceId, status }).unwrap();
      toast.success(`Invoice marked as ${status}.`);
      onUpdate();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status.");
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
        ) : invoice ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <p className="text-sm font-mono text-gray-500">{invoice.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={invoice.type === "SALES" ? "OUT" : "IN"} />
                <StatusBadge status={invoice.status} />
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-gray-500">{invoice.type === "SALES" ? "Customer" : "Supplier"}:</span>
                <p className="font-medium">
                  {invoice.type === "SALES" ? invoice.customer?.name : invoice.supplier?.name}
                </p>
                {invoice.customer?.email && (
                  <p className="text-gray-500 text-xs">{invoice.customer.email}</p>
                )}
              </div>
              <div>
                <span className="text-gray-500">Issued:</span>
                <p className="font-medium">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                  <span>₹{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {invoice.notes && (
              <p className="mt-4 text-sm text-gray-500 italic">Note: {invoice.notes}</p>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoicePDF(invoice)}
                >
                  <FileText size={14} className="mr-1" /> Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportSingleInvoiceCSV(invoice)}
                >
                  <Download size={14} className="mr-1" /> Download CSV
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                {invoice.status === "ISSUED" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("PAID")}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark Paid
                  </Button>
                )}
                {["DRAFT", "ISSUED"].includes(invoice.status) && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("CANCELLED")}
                    disabled={isUpdating}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Invoice not found.</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailDialog;
