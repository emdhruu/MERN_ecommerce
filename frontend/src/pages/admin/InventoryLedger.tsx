import { useState } from "react";
import Header from "@/features/adminPanel/common/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import TablePagination from "@/features/adminPanel/common/TablePagination";
import LoadingSkeleton from "@/features/adminPanel/common/LoadingSkeleton";
import EmptyState from "@/features/adminPanel/common/EmptyState";
import { useGetAllLedgerEntriesQuery } from "@/features/adminPanel/inventory/ledgerApi";
import { useLazyGetLedgerByProductQuery } from "@/features/adminPanel/inventory/ledgerApi";
import { exportLedgerCSV, downloadLedgerPDF } from "@/features/adminPanel/common/exportUtils";
import toast from "react-hot-toast";

const InventoryLedger = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");

  const { data, isLoading } = useGetAllLedgerEntriesQuery({
    page,
    limit: 20,
    type: typeFilter || undefined,
    reference: referenceFilter || undefined,
  });

  const [fetchLedgerByProduct] = useLazyGetLedgerByProductQuery();

  const entries = data?.data || [];

  const handleProductPDF = async (productId: string, productName: string) => {
    try {
      const ledgerResult = await fetchLedgerByProduct({ productId, limit: 100 }).unwrap();
      const allEntries = ledgerResult?.data || [];

      if (!allEntries.length) {
        toast.error("No ledger entries found for this product.");
        return;
      }

      let totalIn = 0;
      let totalOut = 0;
      let totalReserved = 0;
      let totalReleased = 0;
      let totalAdjusted = 0;

      allEntries.forEach((e: any) => {
        if (e.type === "IN") totalIn += e.quantity;
        if (e.type === "OUT") totalOut += e.quantity;
        if (e.type === "RESERVE") totalReserved += e.quantity;
        if (e.type === "RELEASE") totalReleased += e.quantity;
        if (e.type === "ADJUST") totalAdjusted += e.quantity;
      });

      const currentStock = totalIn + totalReleased + totalAdjusted - totalOut - totalReserved;

      const rows = allEntries
        .map((entry: any) => {
          const isPositive = entry.type === "IN" || entry.type === "RELEASE";
          const color = isPositive ? "#16a34a" : entry.type === "ADJUST" ? "#6b7280" : "#dc2626";
          const sign = isPositive ? "+" : "-";
          return `
            <tr>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${new Date(entry.createdAt).toLocaleString()}</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><span style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">${entry.type}</span></td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: ${color};">${sign}${entry.quantity}</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 11px;">${entry.reference}</td>
              <td style="padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">${entry.note || "-"}</td>
            </tr>`;
        })
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Product Ledger - ${productName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; font-size: 14px; }
            .title { font-size: 22px; font-weight: 700; color: #D54F47; }
            .product-name { font-size: 16px; color: #374151; margin-top: 4px; }
            .date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
            .stat { padding: 14px; background: #f9fafb; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 22px; font-weight: 700; }
            .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 2px; }
            .green { color: #16a34a; }
            .red { color: #dc2626; }
            .blue { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            thead th { padding: 8px 10px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
            thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #9ca3af; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="title">Product Inventory Report</div>
          <div class="product-name">${productName}</div>
          <div class="date">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>

          <div class="summary">
            <div class="stat">
              <div class="stat-value green">+${totalIn}</div>
              <div class="stat-label">Total In</div>
            </div>
            <div class="stat">
              <div class="stat-value red">-${totalOut}</div>
              <div class="stat-label">Total Out</div>
            </div>
            <div class="stat">
              <div class="stat-value blue">${currentStock}</div>
              <div class="stat-label">Net Stock Movement</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #f59e0b;">${totalReserved}</div>
              <div class="stat-label">Total Reserved</div>
            </div>
            <div class="stat">
              <div class="stat-value green">${totalReleased}</div>
              <div class="stat-label">Total Released</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #6b7280;">${totalAdjusted}</div>
              <div class="stat-label">Adjustments</div>
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Movement History (${allEntries.length} entries)</h3>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reference</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            This is a computer generated report and does not require a signature.
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      toast.error("Failed to generate report.");
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Inventory Ledger" subheading="Complete audit trail of all inventory movements." />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Type:</span>
              {["", "IN", "OUT", "RESERVE", "RELEASE", "ADJUST"].map((type) => (
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Reference:</span>
              {["", "ORDER", "PURCHASE", "SYSTEM", "ADMIN"].map((ref) => (
                <Button
                  key={ref}
                  variant={referenceFilter === ref ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setReferenceFilter(ref); setPage(1); }}
                  className={referenceFilter === ref ? "bg-[#D54F47] hover:bg-[#b8433c] text-white" : ""}
                >
                  {ref || "All"}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadLedgerPDF(entries)} disabled={!entries.length}>
              <FileText size={14} className="mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportLedgerCSV(entries)} disabled={!entries.length}>
              <Download size={14} className="mr-1" /> CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <Card className="p-6"><LoadingSkeleton rows={10} columns={6} /></Card>
        ) : !entries.length ? (
          <Card className="p-6"><EmptyState title="No ledger entries" description="Inventory movements will appear here." /></Card>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold text-center">Type</TableHead>
                      <TableHead className="font-semibold text-center">Qty</TableHead>
                      <TableHead className="font-semibold text-center">Reference</TableHead>
                      <TableHead className="font-semibold">Note</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {entry.productId?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={entry.type} />
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <span className={
                            entry.type === "IN" || entry.type === "RELEASE"
                              ? "text-green-600"
                              : entry.type === "OUT" || entry.type === "RESERVE"
                              ? "text-red-600"
                              : "text-gray-600"
                          }>
                            {entry.type === "IN" || entry.type === "RELEASE" ? "+" : "-"}{entry.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {entry.reference}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                          {entry.note || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleProductPDF(entry.productId?._id, entry.productId?.name || "Unknown")}
                            className="p-2 h-8 w-8"
                            title="Download product report"
                          >
                            <FileText size={14} />
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
              limit={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryLedger;
