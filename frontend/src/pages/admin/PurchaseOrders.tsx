import { useState } from "react";
import Header from "@/features/adminPanel/common/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import TablePagination from "@/features/adminPanel/common/TablePagination";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import CreatePODialog from "@/features/adminPanel/purchaseOrder/components/CreatePODialog";
import PODetailDialog from "@/features/adminPanel/purchaseOrder/components/PODetailDialog";
import { useGetAllPurchaseOrdersQuery } from "@/features/adminPanel/purchaseOrder/purchaseOrderApi";

const PurchaseOrders = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPOId, setDetailPOId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllPurchaseOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const purchaseOrders = data?.data || [];

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Purchase Orders" subheading="Manage supplier orders and receive goods into inventory." />

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {["", "PENDING", "PARTIAL", "COMPLETED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={statusFilter === status ? "bg-[#D54F47] hover:bg-[#b8433c] text-white" : ""}
              >
                {status || "All"}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
          >
            <Plus size={14} className="mr-1" /> Create PO
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={6} columns={5} /></Card>
        ) : !purchaseOrders.length ? (
          <Card className="p-6"><EmptyState title="No purchase orders" description="Create your first purchase order to get started." /></Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold text-center">Items</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((po) => (
                      <TableRow key={po._id}>
                        <TableCell className="font-medium">{po.supplierName}</TableCell>
                        <TableCell className="text-center">{po.items.length}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={po.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailPOId(po._id)}
                            className="p-2"
                          >
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <TablePagination
              currentPage={data?.page || 1}
              totalPages={data?.totalPages || 1}
              total={data?.total || 0}
              limit={10}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Create PO Dialog */}
        <CreatePODialog
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); refetch(); }}
        />

        {/* PO Detail Dialog */}
        {detailPOId && (
          <PODetailDialog
            purchaseOrderId={detailPOId}
            onClose={() => setDetailPOId(null)}
            onGrnSuccess={() => { setDetailPOId(null); refetch(); }}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;
