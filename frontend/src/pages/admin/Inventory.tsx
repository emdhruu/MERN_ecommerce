import { useState } from "react";
import Header from "@/features/adminPanel/common/Header";
import InventoryTable from "@/features/adminPanel/inventory/components/InventoryTable";
import AdjustStockDialog from "@/features/adminPanel/inventory/components/AdjustStockDialog";
import { useGetAllInventoryQuery } from "@/features/adminPanel/inventory/inventoryApi";
import { exportInventoryCSV } from "@/features/adminPanel/common/exportUtils";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Inventory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustDialog, setAdjustDialog] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  const { data, isLoading, refetch } = useGetAllInventoryQuery({
    page,
    limit: 10,
    lowStock: lowStockOnly || undefined,
    search: search || undefined,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Inventory" subheading="Manage stock levels, track movements, and monitor low stock alerts." />

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={lowStockOnly ? "default" : "outline"}
              size="sm"
              onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
              className={lowStockOnly ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
            >
              <AlertTriangle size={14} className="mr-1" />
              Low Stock
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportInventoryCSV(data?.data || [])} disabled={!data?.data?.length}>
              <Download size={14} className="mr-1" /> Export
            </Button>
            <Link to="/admin/inventory/ledger">
              <Button variant="outline" size="sm">Ledger</Button>
            </Link>
            <Link to="/admin/inventory/purchase-orders">
              <Button size="sm" className="bg-[#D54F47] hover:bg-[#b8433c] text-white">
                Purchase Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          data={data?.data || []}
          isLoading={isLoading}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          total={data?.total || 0}
          limit={10}
          onPageChange={setPage}
          onAdjust={(productId, productName) =>
            setAdjustDialog({ isOpen: true, productId, productName })
          }
        />

        {/* Adjust Stock Dialog */}
        <AdjustStockDialog
          isOpen={adjustDialog.isOpen}
          productId={adjustDialog.productId}
          productName={adjustDialog.productName}
          onClose={() => setAdjustDialog({ isOpen: false, productId: "", productName: "" })}
          onSuccess={() => {
            setAdjustDialog({ isOpen: false, productId: "", productName: "" });
            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default Inventory;
