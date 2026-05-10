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
import { Eye, Download } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import TablePagination from "@/features/adminPanel/common/TablePagination";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import OrderDetailDialog from "@/features/adminPanel/orders/components/OrderDetailDialog";
import { useGetAllOrdersQuery } from "@/features/adminPanel/orders/ordersApi";
import { exportOrdersCSV } from "@/features/adminPanel/common/exportUtils";

const Orders = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const orders = data?.data || [];

  const formatPrice = (price: { $numberDecimal: string } | number): string => {
    if (typeof price === "object" && "$numberDecimal" in price) {
      return `₹${parseFloat(price.$numberDecimal).toFixed(2)}`;
    }
    return `₹${Number(price).toFixed(2)}`;
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Orders" subheading="Manage customer orders, track payments, and update delivery status." />

        {/* Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {["", "PENDING", "PAYMENT_PENDING", "CONFIRMED", "DELIVERED", "CANCELLED", "FAILED"].map((status) => (
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
          <Button variant="outline" size="sm" onClick={() => exportOrdersCSV(orders)} disabled={!orders.length}>
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={8} columns={6} /></Card>
        ) : !orders.length ? (
          <Card className="p-6"><EmptyState title="No orders found" description="Orders will appear here once customers place them." /></Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold text-center">Items</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold text-center">Payment</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs text-gray-600">
                          #{order._id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{order.user?.name || "N/A"}</div>
                            <div className="text-xs text-gray-500">{order.user?.email || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{order.items.length}</TableCell>
                        <TableCell className="font-medium">{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={order.paymentStatus} />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={order.orderStatus} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrderId(order._id)}
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

        {/* Order Detail Dialog */}
        {selectedOrderId && (
          <OrderDetailDialog
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onUpdate={() => { setSelectedOrderId(null); refetch(); }}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
