import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hook";
import Header from "@/features/adminPanel/common/Header";
import ProductTable from "@/features/adminPanel/product/components/ProductTable";
import ProductFormDialog from "@/features/adminPanel/product/components/ProductFormDialog";
import ProductViewDialog from "@/features/adminPanel/product/components/ProductViewDialog";
import DeleteConfirmDialog from "@/features/adminPanel/product/components/DeleteConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import {
  useGetAllProductsQuery,
  type Product,
} from "@/features/adminPanel/product/productApi";
import {
  setCurrentPage,
  setSearch,
} from "@/features/adminPanel/product/productSlice";

const ProductManagement = () => {
  const dispatch = useAppDispatch();
  const { currentPage, search, selectedCategory, selectedBrand, sortField, sortOrder, limit } =
    useAppSelector((state) => state.product);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);

  // Fetch products with RTK Query
  const { data, isLoading, refetch } = useGetAllProductsQuery({
    page: currentPage,
    limit,
    search: search || undefined,
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
    sort: sortField || undefined,
    order: sortField ? sortOrder : undefined,
  });

  const products = data?.data || [];
  const totalProducts = (data as any)?.totalCount || 0;
  const totalPages = (data as any)?.totalPages || 1;

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleView = (productId: string) => {
    setViewingProductId(productId);
    setViewOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct({ id: product._id, name: product.name });
    setDeleteOpen(true);
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearch(e.target.value));
    },
    [dispatch]
  );

  const handleFormSuccess = () => {
    refetch();
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Products" subheading="Manage your product catalog and inventory." />

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            className="flex items-center gap-2 bg-[#D54F47] hover:bg-[#b8433c] text-white"
            onClick={handleAddProduct}
          >
            <Plus size={16} />
            Add Product
          </Button>
        </div>

        {/* Product Table */}
        <ProductTable
          products={products}
          currentPage={currentPage}
          totalPages={totalPages}
          totalProducts={totalProducts}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />

        {/* Dialogs */}
        <ProductFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          product={editingProduct}
          onSuccess={handleFormSuccess}
        />

        <ProductViewDialog
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          productId={viewingProductId}
        />

        <DeleteConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          productId={deletingProduct?.id || null}
          productName={deletingProduct?.name || ""}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
};

export default ProductManagement;
