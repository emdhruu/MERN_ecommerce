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
import InvoiceDetailDialog from "@/features/adminPanel/invoice/components/InvoiceDetailDialog";
import { useGetAllInvoicesQuery } from "@/features/adminPanel/invoice/invoiceApi";
import { exportInvoiceCSV } from "@/features/adminPanel/common/exportUtils";

const Invoices = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAllInvoicesQuery({
    page,
    limit: 10,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const invoices = data?.data || [];

  const handleExportAll = () => {
    if (!invoices.length) return;
    exportInvoiceCSV(invoices);
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Invoices" subheading="View and manage sales and purchase invoices." />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Type:</span>
            {["", "SALES", "PURCHASE"].map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={typeFilter === type ? "bg-[#D54F47] hover:bg-[#b8433c] text-white" : ""}
              >
                {type || "All"}
              </Button>
            ))}

            <span className="text-sm text-gray-600 font-medium ml-4">Status:</span>
            {["", "DRAFT", "ISSUED", "PAID", "CANCELLED"].map((status) => (
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

          <Button variant="outline" size="sm" onClick={handleExportAll} disabled={!invoices.length}>
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={8} columns={7} /></Card>
        ) : !invoices.length ? (
          <Card className="p-6"><EmptyState title="No invoices" description="Invoices are generated from confirmed orders and purchase orders." /></Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Invoice #</TableHead>
                      <TableHead className="font-semibold text-center">Type</TableHead>
                      <TableHead className="font-semibold">Customer/Supplier</TableHead>
                      <TableHead className="font-semibold text-right">Total</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv._id}>
                        <TableCell className="font-mono text-xs font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={inv.type === "SALES" ? "OUT" : "IN"} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {inv.type === "SALES" ? inv.customer?.name : inv.supplier?.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{inv.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(inv.issuedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedId(inv._id)}
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

        {/* Detail Dialog */}
        {selectedId && (
          <InvoiceDetailDialog
            invoiceId={selectedId}
            onClose={() => setSelectedId(null)}
            onUpdate={() => { setSelectedId(null); refetch(); }}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;
