import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCreatePurchaseOrderMutation } from "../purchaseOrderApi";
import { useGetAllProductsQuery } from "@/features/adminPanel/product/productApi";
import toast from "react-hot-toast";

interface CreatePODialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface POItem {
  productId: string;
  orderedQty: number;
}

const CreatePODialog = ({ isOpen, onClose, onSuccess }: CreatePODialogProps) => {
  const [supplierName, setSupplierName] = useState("");
  const [items, setItems] = useState<POItem[]>([{ productId: "", orderedQty: 1 }]);
  const [createPO, { isLoading }] = useCreatePurchaseOrderMutation();
  const { data: productsData } = useGetAllProductsQuery({ limit: 100 });

  if (!isOpen) return null;

  const products = productsData?.data || [];

  const addItem = () => {
    setItems([...items, { productId: "", orderedQty: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof POItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!supplierName.trim()) {
      toast.error("Supplier name is required.");
      return;
    }
    const validItems = items.filter((i) => i.productId && i.orderedQty > 0);
    if (!validItems.length) {
      toast.error("At least one valid item is required.");
      return;
    }

    try {
      await createPO({ supplierName, items: validItems }).unwrap();
      toast.success("Purchase Order created successfully.");
      setSupplierName("");
      setItems([{ productId: "", orderedQty: 1 }]);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create Purchase Order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Purchase Order</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.orderedQty}
                    onChange={(e) => updateItem(index, "orderedQty", Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
                    placeholder="Qty"
                  />
                  {items.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeItem(index)} className="p-2">
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
          >
            {isLoading ? "Creating..." : "Create PO"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePODialog;
