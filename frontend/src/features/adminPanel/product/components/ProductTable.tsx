import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../productApi";

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onView: (productId: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ProductTable = ({
  products,
  currentPage,
  totalPages,
  totalProducts,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  isLoading,
}: ProductTableProps) => {
  const formatPrice = (price: { $numberDecimal: string } | number | null | undefined): string => {
    if (!price) return "-";
    if (typeof price === "object" && "$numberDecimal" in price) {
      return `₹${parseFloat(price.$numberDecimal).toFixed(2)}`;
    }
    return `₹${Number(price).toFixed(2)}`;
  };

  const limit = products.length || 10;
  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f05249]"></div>
          <span className="ml-3 text-gray-500">Loading products...</span>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or add a new product.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Sale Price</TableHead>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Brand</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover border"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.isFeatured && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell>
                    {product.salesPrice ? (
                      <span className="text-green-600 font-medium">
                        {formatPrice(product.salesPrice)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700">
                      {product.category?.name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700">
                      {product.brand?.name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(product._id)}
                        className="p-2 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Eye size={14} className="text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="p-2 hover:bg-green-50 hover:border-green-200"
                      >
                        <Edit size={14} className="text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(product)}
                        className="p-2 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}-{endItem}</span> of{" "}
          <span className="font-medium">{totalProducts}</span> products
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNumber: number;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className={`px-3 ${
                    currentPage === pageNumber
                      ? "bg-[#f05249] hover:bg-[#e04a41] text-white"
                      : ""
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
