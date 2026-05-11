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
import { useGetPurchaseOrderByIdQuery, useReceiveGoodsMutation } from "../purchaseOrderApi";
import { useCreatePurchaseInvoiceMutation } from "@/features/adminPanel/invoice/invoiceApi";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

interface PODetailDialogProps {
  purchaseOrderId: string;
  onClose: () => void;
  onGrnSuccess: () => void;
}

const PODetailDialog = ({ purchaseOrderId, onClose }: PODetailDialogProps) => {
  const { data, isLoading } = useGetPurchaseOrderByIdQuery(purchaseOrderId);
  const [receiveGoods, { isLoading: isReceiving }] = useReceiveGoodsMutation();
  const [createPurchaseInvoice, { isLoading: isGeneratingInvoice }] = useCreatePurchaseInvoiceMutation();
  const [receivingQtys, setReceivingQtys] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const po = data?.data;

  const handleReceive = async () => {
    if (!po) return;

    const items = po.items
      .filter((item) => (receivingQtys[item._id] || 0) > 0)
      .map((item) => ({
        productId: item.productId._id,
        receivedQty: receivingQtys[item._id] || 0,
      }));

    if (!items.length) {
      toast.error("Enter at least one quantity to receive.");
      return;
    }

    try {
      await receiveGoods({ purchaseOrderId, items, note: note || undefined }).unwrap();
      toast.success("Goods received successfully.");
      setReceivingQtys({});
      setNote("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to receive goods.");
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      await createPurchaseInvoice({
        purchaseOrderId,
        taxRate: taxRate ? Number(taxRate) : undefined,
        notes: invoiceNotes || undefined,
      }).unwrap();
      toast.success("Purchase invoice generated successfully.");
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
        ) : po ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Purchase Order Details</h3>
                <p className="text-sm text-gray-500">Supplier: {po.supplierName}</p>
              </div>
              <StatusBadge status={po.status} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center">Received</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  {po.status !== "COMPLETED" && (
                    <TableHead className="text-center">Receive Now</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.items.map((item) => {
                  const pending = item.orderedQty - item.receivedQty;
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium text-sm">{item.productId.name}</TableCell>
                      <TableCell className="text-center">{item.orderedQty}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">{item.receivedQty}</TableCell>
                      <TableCell className="text-center">
                        <span className={pending > 0 ? "text-orange-600 font-medium" : "text-gray-400"}>
                          {pending}
                        </span>
                      </TableCell>
                      {po.status !== "COMPLETED" && (
                        <TableCell className="text-center">
                          <input
                            type="number"
                            min={0}
                            max={pending}
                            value={receivingQtys[item._id] || ""}
                            onChange={(e) =>
                              setReceivingQtys({ ...receivingQtys, [item._id]: Number(e.target.value) })
                            }
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#D54F47]"
                            placeholder="0"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {(po.status === "COMPLETED" || po.status === "PARTIAL") && (
              <div className="mt-4 pt-4 border-t">
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
                    <h4 className="text-sm font-semibold text-gray-900">Generate Purchase Invoice</h4>
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
                        <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
                        <input
                          type="text"
                          value={invoiceNotes}
                          onChange={(e) => setInvoiceNotes(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#D54F47]"
                          placeholder="Invoice notes..."
                        />
                      </div>
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

            {po.status !== "COMPLETED" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
                    placeholder="GRN note..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                  <Button
                    size="sm"
                    onClick={handleReceive}
                    disabled={isReceiving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isReceiving ? "Receiving..." : "Receive Goods"}
                  </Button>
                </div>
              </div>
            )}

            {po.status === "COMPLETED" && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Purchase Order not found.</p>
        )}
      </div>
    </div>
  );
};

export default PODetailDialog;
