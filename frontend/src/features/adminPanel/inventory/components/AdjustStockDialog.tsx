import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdjustStockMutation } from "../inventoryApi";
import toast from "react-hot-toast";

interface AdjustStockDialogProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustStockDialog = ({
  isOpen,
  productId,
  productName,
  onClose,
  onSuccess,
}: AdjustStockDialogProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState("");
  const [adjustStock, { isLoading }] = useAdjustStockMutation();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (quantity === 0) {
      toast.error("Quantity cannot be zero.");
      return;
    }
    if (!note.trim()) {
      toast.error("Note is required for adjustments.");
      return;
    }

    try {
      await adjustStock({ productId, quantity, note }).unwrap();
      toast.success("Stock adjusted successfully.");
      setQuantity(0);
      setNote("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to adjust stock.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Adjust Stock</h3>
        <p className="text-sm text-gray-500 mb-4">{productName}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (positive to add, negative to remove)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
              placeholder="e.g. 10 or -5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (required)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47] resize-none"
              rows={3}
              placeholder="Reason for adjustment..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
          >
            {isLoading ? "Adjusting..." : "Adjust Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockDialog;
