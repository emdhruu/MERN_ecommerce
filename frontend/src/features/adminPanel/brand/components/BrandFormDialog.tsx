import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  type Brand,
} from "../brandApi";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface BrandFormData {
  name: string;
  logoUrl: string;
  isActive: boolean;
}

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSuccess: () => void;
}

const BrandFormDialog = ({
  open,
  onClose,
  brand,
  onSuccess,
}: BrandFormDialogProps) => {
  const isEditing = !!brand;

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>();

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name,
        logoUrl: brand.logoUrl || "",
        isActive: brand.isActive,
      });
    } else {
      reset({
        name: "",
        logoUrl: "",
        isActive: true,
      });
    }
  }, [brand, reset]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      if (isEditing && brand) {
        await updateBrand({
          id: brand._id,
          name: data.name,
          logoUrl: data.logoUrl || undefined,
          isActive: data.isActive,
        }).unwrap();
        toast.success("Brand updated successfully");
      } else {
        await createBrand({
          name: data.name,
          logoUrl: data.logoUrl || undefined,
          isActive: data.isActive,
        }).unwrap();
        toast.success("Brand created successfully");
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
            {isEditing ? "Edit Brand" : "Add New Brand"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Brand name is required" })}
              placeholder="Enter brand name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              {...register("logoUrl")}
              placeholder="https://example.com/logo.png"
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
              {isEditing ? "Update Brand" : "Create Brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrandFormDialog;
