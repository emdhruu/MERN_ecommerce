import { useState } from "react";
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
import { Plus, ToggleLeft, ToggleRight, Trash2, Edit } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import ConfirmDialog from "@/features/adminPanel/common/ConfirmDialog";
import CreateCouponDialog from "@/features/adminPanel/coupon/components/CreateCouponDialog";
import EditCouponDialog from "@/features/adminPanel/coupon/components/EditCouponDialog";
import { useGetAllCouponsQuery, useToggleCouponStatusMutation, useDeleteCouponMutation } from "@/features/adminPanel/coupon/couponApi";
import type { Coupon } from "@/features/adminPanel/coupon/couponApi";
import toast from "react-hot-toast";

const Coupons = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllCouponsQuery();
  const [toggleStatus] = useToggleCouponStatusMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const coupons = data?.data || [];

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success("Coupon status updated.");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon(deleteId).unwrap();
      toast.success("Coupon deleted.");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete coupon.");
    }
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Coupons" subheading="Create and manage discount coupons for your store." />

        {/* Actions */}
        <div className="flex items-center justify-end mb-6">
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
          >
            <Plus size={14} className="mr-1" /> Create Coupon
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={6} columns={7} /></Card>
        ) : !coupons.length ? (
          <Card className="p-6"><EmptyState title="No coupons" description="Create your first coupon to offer discounts." /></Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Discount</TableHead>
                    <TableHead className="font-semibold">Valid Until</TableHead>
                    <TableHead className="font-semibold text-center">Usage</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-mono font-medium text-sm">{coupon.code}</TableCell>
                      <TableCell className="text-sm">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                        {coupon.maxDiscount && (
                          <span className="text-xs text-gray-400 ml-1">(max ₹{coupon.maxDiscount})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={isExpired(coupon.validUntil) ? "text-red-500" : "text-gray-600"}>
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                        {isExpired(coupon.validUntil) && (
                          <span className="text-xs text-red-400 ml-1">(expired)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {coupon.usedBy?.length || 0}
                        {coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={coupon.isActive ? "active" : "inactive"} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditCoupon(coupon)}
                            className="p-2"
                            title="Edit"
                          >
                            <Edit size={14} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggle(coupon._id)}
                            className="p-2"
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            {coupon.isActive
                              ? <ToggleRight size={14} className="text-green-600" />
                              : <ToggleLeft size={14} className="text-gray-400" />
                            }
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(coupon._id)}
                            className="p-2 hover:bg-red-50"
                          >
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

        {/* Create Dialog */}
        <CreateCouponDialog
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); refetch(); }}
        />

        {/* Edit Dialog */}
        <EditCouponDialog
          isOpen={!!editCoupon}
          coupon={editCoupon}
          onClose={() => setEditCoupon(null)}
          onSuccess={() => { setEditCoupon(null); refetch(); }}
        />

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Coupon"
          message="Are you sure you want to delete this coupon? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
};

export default Coupons;
