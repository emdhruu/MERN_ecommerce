import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  type Category,
} from "../categoryApi";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

const CategoryFormDialog = ({
  open,
  onClose,
  category,
  onSuccess,
}: CategoryFormDialogProps) => {
  const isEditing = !!category;

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl || "",
        isActive: category.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
        imageUrl: "",
        isActive: true,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const slug = data.name.toLowerCase().replace(/\s+/g, "-");

      if (isEditing && category) {
        await updateCategory({
          id: category._id,
          name: data.name,
          slug,
          description: data.description,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory({
          name: data.name,
          slug,
          description: data.description,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive,
        }).unwrap();
        toast.success("Category created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Category name is required" })}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Enter category description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...register("imageUrl")}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#f05249] hover:bg-[#e04a41] text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
