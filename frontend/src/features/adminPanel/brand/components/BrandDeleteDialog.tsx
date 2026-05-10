import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDeleteBrandMutation } from "../brandApi";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface BrandDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  brandId: string | null;
  brandName: string;
  onSuccess: () => void;
}

const BrandDeleteDialog = ({
  open,
  onClose,
  brandId,
  brandName,
  onSuccess,
}: BrandDeleteDialogProps) => {
  const [deleteBrand, { isLoading }] = useDeleteBrandMutation();

  const handleDelete = async () => {
    if (!brandId) return;

    try {
      await deleteBrand(brandId).unwrap();
      toast.success("Brand deleted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete brand");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Brand
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">"{brandName}"</span>?
            This will permanently remove the brand.
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

export default BrandDeleteDialog;
