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
  useCreateProductMutation,
  useUpdateProductMutation,
  type Product,
} from "../productApi";
import { useGetAllCategoriesQuery } from "@/features/adminPanel/category/categoryApi";
import { useGetAllBrandsQuery } from "@/features/adminPanel/brand/brandApi";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salesPrice: number | null;
  discountPercentage: number;
  category: string;
  brand: string;
  stock: number;
  images: string;
  isFeatured: boolean;
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductFormDialog = ({
  open,
  onClose,
  product,
  onSuccess,
}: ProductFormDialogProps) => {
  const isEditing = !!product;

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>();

  useEffect(() => {
    if (product) {
      const price =
        typeof product.price === "object"
          ? parseFloat(product.price.$numberDecimal)
          : product.price;
      const salesPrice = product.salesPrice
        ? typeof product.salesPrice === "object"
          ? parseFloat(product.salesPrice.$numberDecimal)
          : product.salesPrice
        : null;

      reset({
        name: product.name,
        description: product.description,
        price,
        salesPrice,
        discountPercentage: product.discountPercentage || 0,
        category: product.category._id,
        brand: product.brand._id,
        stock: product.stock,
        images: product.images.join(", "),
        isFeatured: product.isFeatured,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        salesPrice: null,
        discountPercentage: 0,
        category: "",
        brand: "",
        stock: 0,
        images: "",
        isFeatured: false,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const imagesArray = data.images
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);

      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        salesPrice: data.salesPrice ? Number(data.salesPrice) : null,
        discountPercentage: Number(data.discountPercentage) || 0,
        category: data.category,
        brand: data.brand,
        stock: Number(data.stock),
        images: imagesArray,
        thumbnail: imagesArray[0],
        isFeatured: data.isFeatured,
        inStock: Number(data.stock) > 0,
      };

      if (isEditing && product) {
        await updateProduct({ id: product._id, ...payload }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created successfully");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Product name is required" })}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Enter product description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price & Sales Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesPrice">Sale Price</Label>
              <Input
                id="salesPrice"
                type="number"
                step="0.01"
                {...register("salesPrice")}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Discount & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount %</Label>
              <Input
                id="discountPercentage"
                type="number"
                {...register("discountPercentage", {
                  min: { value: 0, message: "Min 0%" },
                  max: { value: 100, message: "Max 100%" },
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock cannot be negative" },
                })}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category & Brand Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <select
                id="brand"
                {...register("brand", { required: "Brand is required" })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a brand</option>
                {brands
                  .filter((b) => b.isActive)
                  .map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
              </select>
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Image URLs * (comma separated)</Label>
            <Textarea
              id="images"
              {...register("images", {
                required: "At least one image URL is required",
              })}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              rows={2}
            />
            <button
              type="button"
              onClick={() => setValue("images", "https://placehold.co/500x500?text=Product")}
              className="text-xs text-[#D54F47] hover:underline"
            >
              Use placeholder image
            </button>
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              {...register("isFeatured")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isFeatured">Mark as Featured</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#f05249] hover:bg-[#e04a41] text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
