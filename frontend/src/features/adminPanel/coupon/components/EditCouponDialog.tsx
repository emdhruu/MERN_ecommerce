import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateCouponMutation } from "../couponApi";
import type { Coupon } from "../couponApi";
import toast from "react-hot-toast";

interface EditCouponDialogProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCouponDialog = ({ isOpen, coupon, onClose, onSuccess }: EditCouponDialogProps) => {
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    description: "",
    minPurchaseAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    userLimit: "1",
  });

  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  useEffect(() => {
    if (coupon) {
      const minPurchase = coupon.minPurchaseAmount
        ? (typeof coupon.minPurchaseAmount === "object" ? parseFloat((coupon.minPurchaseAmount as any).$numberDecimal) : Number(coupon.minPurchaseAmount))
        : 0;
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        description: coupon.description || "",
        minPurchaseAmount: minPurchase ? String(minPurchase) : "",
        maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
        validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : "",
        validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : "",
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
        userLimit: coupon.userLimit ? String(coupon.userLimit) : "1",
      });
    }
  }, [coupon]);

  if (!isOpen || !coupon) return null;

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error("Discount value must be positive.");
      return;
    }

    try {
      await updateCoupon({
        _id: coupon._id,
        code: form.code.toUpperCase(),
        type: "cart",
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        description: form.description || undefined,
        minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        userLimit: form.userLimit ? Number(form.userLimit) : 1,
      }).unwrap();
      toast.success("Coupon updated successfully.");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update coupon.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Coupon</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47] uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase ($)</label>
              <input
                type="number"
                value={form.minPurchaseAmount}
                onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ($)</label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
                placeholder="0 = unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
              <input
                type="number"
                value={form.userLimit}
                onChange={(e) => setForm({ ...form, userLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
              placeholder="Optional description"
            />
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCouponDialog;
