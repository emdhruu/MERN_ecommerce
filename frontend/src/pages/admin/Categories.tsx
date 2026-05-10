import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Header from "@/features/adminPanel/common/Header";
import {
  useGetAllCategoriesQuery,
  useToggleCategoryActiveMutation,
  type Category,
} from "@/features/adminPanel/category/categoryApi";
import CategoryTable from "@/features/adminPanel/category/components/CategoryTable";
import CategoryFormDialog from "@/features/adminPanel/category/components/CategoryFormDialog";
import CategoryDeleteDialog from "@/features/adminPanel/category/components/CategoryDeleteDialog";
import toast from "react-hot-toast";

const Categories = () => {
  const { data, isLoading, refetch } = useGetAllCategoriesQuery();
  const [toggleActive] = useToggleCategoryActiveMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);

  const categories = data?.data || [];

  const handleAdd = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory({ id: category._id, name: category.name });
    setDeleteOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await toggleActive({ id: category._id, isActive: !category.isActive }).unwrap();
      toast.success(`Category ${category.isActive ? "deactivated" : "activated"} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Categories" subheading="Manage product categories and their status." />

        {/* Actions */}
        <div className="flex items-center justify-end mb-6">
          <Button
            className="flex items-center gap-2 bg-[#D54F47] hover:bg-[#b8433c] text-white"
            onClick={handleAdd}
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        {/* Table */}
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />

        {/* Dialogs */}
        <CategoryFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          category={editingCategory}
          onSuccess={handleSuccess}
        />

        <CategoryDeleteDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          categoryId={deletingCategory?.id || null}
          categoryName={deletingCategory?.name || ""}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default Categories;
