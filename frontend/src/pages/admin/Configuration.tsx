import { useState, useEffect } from "react";
import Header from "@/features/adminPanel/common/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ToggleLeft, ToggleRight, Trash2, Edit, X } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import ConfirmDialog from "@/features/adminPanel/common/ConfirmDialog";
import {
  useGetAllTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useToggleTaxStatusMutation,
  useDeleteTaxMutation,
  useGetAllChargesQuery,
  useCreateChargeMutation,
  useUpdateChargeMutation,
  useToggleChargeStatusMutation,
  useDeleteChargeMutation,
} from "@/features/adminPanel/configuration/configurationApi";
import type { Tax, Charge } from "@/features/adminPanel/configuration/configurationApi";
import { useGetAllCategoriesQuery } from "@/features/adminPanel/category/categoryApi";
import { useGetAllProductsQuery } from "@/features/adminPanel/product/productApi";
import toast from "react-hot-toast";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState<"tax" | "charges">("tax");

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Configuration" subheading="Manage taxes and additional charges for your store." />

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("tax")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "tax"
                ? "bg-[#D54F47] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tax
          </button>
          <button
            onClick={() => setActiveTab("charges")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "charges"
                ? "bg-[#D54F47] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Charges
          </button>
        </div>

        {activeTab === "tax" ? <TaxTab /> : <ChargesTab />}
      </div>
    </div>
  );
};

const TaxTab = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTax, setEditTax] = useState<Tax | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllTaxesQuery();
  const [toggleStatus] = useToggleTaxStatusMutation();
  const [deleteTax, { isLoading: isDeleting }] = useDeleteTaxMutation();

  const taxes = data?.data || [];

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success("Tax status updated.");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTax(deleteId).unwrap();
      toast.success("Tax deleted.");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete tax.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
        >
          <Plus size={14} className="mr-1" /> Add Tax
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6"><LoadingSkeleton rows={4} columns={5} /></Card>
      ) : !taxes.length ? (
        <Card className="p-6"><EmptyState title="No taxes" description="Add your first tax configuration." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Rate</TableHead>
                  <TableHead className="font-semibold">Applicable To</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax) => (
                  <TableRow key={tax._id}>
                    <TableCell className="font-medium text-sm">{tax.name}</TableCell>
                    <TableCell className="text-sm">{tax.rate}%</TableCell>
                    <TableCell className="text-sm capitalize">{tax.applicableTo}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={tax.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditTax(tax)} className="p-2" title="Edit">
                          <Edit size={14} className="text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggle(tax._id)} className="p-2" title={tax.isActive ? "Deactivate" : "Activate"}>
                          {tax.isActive ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} className="text-gray-400" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(tax._id)} className="p-2 hover:bg-red-50">
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <TaxFormDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refetch(); }}
      />

      <TaxFormDialog
        isOpen={!!editTax}
        tax={editTax}
        onClose={() => setEditTax(null)}
        onSuccess={() => { setEditTax(null); refetch(); }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Tax"
        message="Are you sure you want to delete this tax? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};

const ChargesTab = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCharge, setEditCharge] = useState<Charge | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllChargesQuery();
  const [toggleStatus] = useToggleChargeStatusMutation();
  const [deleteCharge, { isLoading: isDeleting }] = useDeleteChargeMutation();

  const charges = data?.data || [];

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success("Charge status updated.");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCharge(deleteId).unwrap();
      toast.success("Charge deleted.");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete charge.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
        >
          <Plus size={14} className="mr-1" /> Add Charge
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6"><LoadingSkeleton rows={4} columns={6} /></Card>
      ) : !charges.length ? (
        <Card className="p-6"><EmptyState title="No charges" description="Add your first charge configuration." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Applicable To</TableHead>
                  <TableHead className="font-semibold">Order Condition</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge._id}>
                    <TableCell className="font-medium text-sm">{charge.name}</TableCell>
                    <TableCell className="text-sm capitalize">{charge.type}</TableCell>
                    <TableCell className="text-sm">
                      {charge.type === "percentage" ? `${charge.amount}%` : `₹${charge.amount}`}
                      {charge.maxAmount && <span className="text-xs text-gray-400 ml-1">(max ₹{charge.maxAmount})</span>}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{charge.applicableTo}</TableCell>
                    <TableCell className="text-sm">
                      {charge.minOrderAmount ? `Min ₹${charge.minOrderAmount}` : charge.maxOrderAmount ? `Max ₹${charge.maxOrderAmount}` : "Any order"}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={charge.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditCharge(charge)} className="p-2" title="Edit">
                          <Edit size={14} className="text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggle(charge._id)} className="p-2" title={charge.isActive ? "Deactivate" : "Activate"}>
                          {charge.isActive ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} className="text-gray-400" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(charge._id)} className="p-2 hover:bg-red-50">
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ChargeFormDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refetch(); }}
      />

      <ChargeFormDialog
        isOpen={!!editCharge}
        charge={editCharge}
        onClose={() => setEditCharge(null)}
        onSuccess={() => { setEditCharge(null); refetch(); }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Charge"
        message="Are you sure you want to delete this charge? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
};


interface TaxFormDialogProps {
  isOpen: boolean;
  tax?: Tax | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TaxFormDialog = ({ isOpen, tax, onClose, onSuccess }: TaxFormDialogProps) => {
  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: productsData } = useGetAllProductsQuery({ limit: 1000 });

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  const [name, setName] = useState(tax?.name || "");
  const [rate, setRate] = useState(tax?.rate?.toString() || "");
  const [applicableTo, setApplicableTo] = useState<"all" | "selective">(tax?.applicableTo || "all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(tax?.applicableProducts?.map((p) => p._id) || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(tax?.applicableCategories?.map((c) => c._id) || []);
  const [isActive, setIsActive] = useState(tax?.isActive ?? true);

  useEffect(() => {
    if (tax) {
      setName(tax.name);
      setRate(tax.rate.toString());
      setApplicableTo(tax.applicableTo);
      setSelectedProducts(tax.applicableProducts?.map((p) => p._id) || []);
      setSelectedCategories(tax.applicableCategories?.map((c) => c._id) || []);
      setIsActive(tax.isActive);
    } else {
      setName("");
      setRate("");
      setApplicableTo("all");
      setSelectedProducts([]);
      setSelectedCategories([]);
      setIsActive(true);
    }
  }, [tax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        rate: parseFloat(rate),
        applicableTo,
        applicableProducts: applicableTo === "selective" ? selectedProducts : [],
        applicableCategories: applicableTo === "selective" ? selectedCategories : [],
        isActive,
      };

      if (tax) {
        await updateTax({ ...payload, _id: tax._id }).unwrap();
        toast.success("Tax updated successfully.");
      } else {
        await createTax(payload).unwrap();
        toast.success("Tax created successfully.");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{tax ? "Edit Tax" : "Add Tax"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GST, VAT"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 18"
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
            <select
              value={applicableTo}
              onChange={(e) => setApplicableTo(e.target.value as "all" | "selective")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            >
              <option value="all">All Products</option>
              <option value="selective">Selective</option>
            </select>
          </div>

          {applicableTo === "selective" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <select
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50 min-h-[80px]"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                <select
                  multiple
                  value={selectedProducts}
                  onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50 min-h-[80px]"
                >
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>{prod.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taxActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="taxActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
            >
              {isCreating || isUpdating ? "Saving..." : tax ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ChargeFormDialogProps {
  isOpen: boolean;
  charge?: Charge | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ChargeFormDialog = ({ isOpen, charge, onClose, onSuccess }: ChargeFormDialogProps) => {
  const [createCharge, { isLoading: isCreating }] = useCreateChargeMutation();
  const [updateCharge, { isLoading: isUpdating }] = useUpdateChargeMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: productsData } = useGetAllProductsQuery({ limit: 1000 });

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  const [name, setName] = useState(charge?.name || "");
  const [type, setType] = useState<"fixed" | "percentage">(charge?.type || "fixed");
  const [amount, setAmount] = useState(charge?.amount?.toString() || "");
  const [applicableTo, setApplicableTo] = useState<"all" | "selective">(charge?.applicableTo || "all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(charge?.applicableProducts?.map((p) => p._id) || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(charge?.applicableCategories?.map((c) => c._id) || []);
  const [orderCondition, setOrderCondition] = useState<"none" | "min" | "max">(
    charge?.minOrderAmount ? "min" : charge?.maxOrderAmount ? "max" : "none"
  );
  const [orderAmount, setOrderAmount] = useState(
    charge?.minOrderAmount?.toString() || charge?.maxOrderAmount?.toString() || ""
  );
  const [maxAmount, setMaxAmount] = useState(charge?.maxAmount?.toString() || "");
  const [isActive, setIsActive] = useState(charge?.isActive ?? true);

  useEffect(() => {
    if (charge) {
      setName(charge.name);
      setType(charge.type);
      setAmount(charge.amount.toString());
      setApplicableTo(charge.applicableTo);
      setSelectedProducts(charge.applicableProducts?.map((p) => p._id) || []);
      setSelectedCategories(charge.applicableCategories?.map((c) => c._id) || []);
      setOrderCondition(charge.minOrderAmount ? "min" : charge.maxOrderAmount ? "max" : "none");
      setOrderAmount(charge.minOrderAmount?.toString() || charge.maxOrderAmount?.toString() || "");
      setMaxAmount(charge.maxAmount?.toString() || "");
      setIsActive(charge.isActive);
    } else {
      setName("");
      setType("fixed");
      setAmount("");
      setApplicableTo("all");
      setSelectedProducts([]);
      setSelectedCategories([]);
      setOrderCondition("none");
      setOrderAmount("");
      setMaxAmount("");
      setIsActive(true);
    }
  }, [charge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        type,
        amount: parseFloat(amount),
        applicableTo,
        applicableProducts: applicableTo === "selective" ? selectedProducts : [],
        applicableCategories: applicableTo === "selective" ? selectedCategories : [],
        minOrderAmount: orderCondition === "min" ? parseFloat(orderAmount) : null,
        maxOrderAmount: orderCondition === "max" ? parseFloat(orderAmount) : null,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        isActive,
      };

      if (charge) {
        await updateCharge({ ...payload, _id: charge._id }).unwrap();
        toast.success("Charge updated successfully.");
      } else {
        await createCharge(payload).unwrap();
        toast.success("Charge created successfully.");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{charge ? "Edit Charge" : "Add Charge"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Delivery Charges, Packaging Fee"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "fixed" | "percentage")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === "percentage" ? "Percentage (%)" : "Amount (₹)"}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === "percentage" ? "e.g. 5" : "e.g. 50"}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            />
          </div>

          {type === "percentage" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount Cap (₹)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="e.g. 100"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Condition</label>
            <select
              value={orderCondition}
              onChange={(e) => { setOrderCondition(e.target.value as "none" | "min" | "max"); setOrderAmount(""); }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            >
              <option value="none">Any Order (no condition)</option>
              <option value="min">Minimum Order Amount</option>
              <option value="max">Maximum Order Amount</option>
            </select>
          </div>

          {orderCondition !== "none" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {orderCondition === "min" ? "Min Order Amount (₹)" : "Max Order Amount (₹)"}
              </label>
              <input
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                placeholder={orderCondition === "min" ? "Apply only above this amount" : "Apply only below this amount"}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
            <select
              value={applicableTo}
              onChange={(e) => setApplicableTo(e.target.value as "all" | "selective")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50"
            >
              <option value="all">All Products</option>
              <option value="selective">Selective</option>
            </select>
          </div>

          {applicableTo === "selective" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <select
                  multiple
                  value={selectedCategories}
                  onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50 min-h-[80px]"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                <select
                  multiple
                  value={selectedProducts}
                  onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/50 min-h-[80px]"
                >
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>{prod.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chargeActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="chargeActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
            >
              {isCreating || isUpdating ? "Saving..." : charge ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuration;
