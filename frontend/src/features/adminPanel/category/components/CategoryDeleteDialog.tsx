import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDeleteCategoryMutation } from "../categoryApi";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface CategoryDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string | null;
  categoryName: string;
  onSuccess: () => void;
}

const CategoryDeleteDialog = ({
  open,
  onClose,
  categoryId,
  categoryName,
  onSuccess,
}: CategoryDeleteDialogProps) => {
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!categoryId) return;

    try {
      await deleteCategory({ id: categoryId }).unwrap();
      toast.success("Category deleted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Category
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{categoryName}"</span>?
            This will permanently remove the category.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDeleteDialog;
