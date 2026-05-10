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
import { Settings2 } from "lucide-react";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import TablePagination from "@/features/adminPanel/common/TablePagination";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import type { InventoryItem } from "../inventoryApi";

interface InventoryTableProps {
  data: InventoryItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onAdjust: (productId: string, productName: string) => void;
}

const InventoryTable = ({
  data,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onAdjust,
}: InventoryTableProps) => {
  const getStockStatus = (item: InventoryItem) => {
    if (item.availableStock === 0) return "Out of Stock";
    if (item.availableStock <= item.lowStockThreshold) return "Low Stock";
    return "In Stock";
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSkeleton rows={8} columns={6} />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="p-6">
        <EmptyState title="No inventory records" description="Inventory records will appear here once products are stocked." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold text-center">Available</TableHead>
                <TableHead className="font-semibold text-center">Reserved</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Threshold</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item._id} className={item.availableStock <= item.lowStockThreshold ? "bg-red-50/50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product?.thumbnail && (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="h-8 w-8 rounded object-cover border"
                        />
                      )}
                      <span className="font-medium text-gray-900 text-sm">
                        {item.product?.name || "Unknown Product"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{item.availableStock}</TableCell>
                  <TableCell className="text-center text-blue-600 font-medium">{item.reservedStock}</TableCell>
                  <TableCell className="text-center">{item.totalStock}</TableCell>
                  <TableCell className="text-center text-gray-500">{item.lowStockThreshold}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={getStockStatus(item)} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjust(item.productId, item.product?.name || "")}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Settings2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default InventoryTable;
