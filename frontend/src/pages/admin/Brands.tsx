import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Header from "@/features/adminPanel/common/Header";
import {
  useGetAllBrandsQuery,
  type Brand,
} from "@/features/adminPanel/brand/brandApi";
import BrandTable from "@/features/adminPanel/brand/components/BrandTable";
import BrandFormDialog from "@/features/adminPanel/brand/components/BrandFormDialog";
import BrandDeleteDialog from "@/features/adminPanel/brand/components/BrandDeleteDialog";

const Brands = () => {
  const { data, isLoading, refetch } = useGetAllBrandsQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<{ id: string; name: string } | null>(null);

  const brands = data?.data || [];

  const handleAdd = () => {
    setEditingBrand(null);
    setFormOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setDeletingBrand({ id: brand._id, name: brand.name });
    setDeleteOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Brands" subheading="Manage product brands and their details." />

        {/* Actions */}
        <div className="flex items-center justify-end mb-6">
          <Button
            className="flex items-center gap-2 bg-[#D54F47] hover:bg-[#b8433c] text-white"
            onClick={handleAdd}
          >
            <Plus size={16} />
            Add Brand
          </Button>
        </div>

        {/* Table */}
        <BrandTable
          brands={brands}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialogs */}
        <BrandFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          brand={editingBrand}
          onSuccess={handleSuccess}
        />

        <BrandDeleteDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          brandId={deletingBrand?.id || null}
          brandName={deletingBrand?.name || ""}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default Brands;
