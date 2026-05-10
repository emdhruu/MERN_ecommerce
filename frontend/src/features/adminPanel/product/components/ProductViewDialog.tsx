import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetProductByIdQuery, type Product } from "../productApi";
import { Loader2 } from "lucide-react";

interface ProductViewDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string | null;
}

const getPrice = (price: { $numberDecimal: string } | number | null | undefined): string => {
  if (!price) return "-";
  if (typeof price === "object" && "$numberDecimal" in price) {
    return `₹${parseFloat(price.$numberDecimal).toFixed(2)}`;
  }
  return `₹${Number(price).toFixed(2)}`;
};

const ProductViewDialog = ({ open, onClose, productId }: ProductViewDialogProps) => {
  const { data, isLoading } = useGetProductByIdQuery(productId!, {
    skip: !productId,
  });

  const product: Product | undefined = data?.data;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Images */}
            {product.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Images</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-gray-900 font-medium">{product.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-gray-900">{product.category?.name || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-gray-700 mt-1">{product.description}</p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="text-gray-900 font-semibold text-lg">
                  {getPrice(product.price)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sale Price</h3>
                <p className="text-green-600 font-semibold text-lg">
                  {getPrice(product.salesPrice)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Discount</h3>
                <p className="text-gray-900">{product.discountPercentage}%</p>
              </div>
            </div>

            {/* Stock & Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.stock > 20
                      ? "bg-green-100 text-green-800"
                      : product.stock > 5
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock} units
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Featured</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.isFeatured
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.isFeatured ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                <p className="text-gray-900">{product.brand?.name || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Product not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;
