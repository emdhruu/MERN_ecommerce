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
import { Edit, Trash2 } from "lucide-react";
import type { Brand } from "../brandApi";

interface BrandTableProps {
  brands: Brand[];
  isLoading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

const BrandTable = ({
  brands,
  isLoading,
  onEdit,
  onDelete,
}: BrandTableProps) => {
  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f05249]"></div>
          <span className="ml-3 text-gray-500">Loading brands...</span>
        </div>
      </Card>
    );
  }

  if (brands.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No brands found</p>
          <p className="text-sm mt-1">Add your first brand to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead className="font-semibold">Brand</TableHead>
              <TableHead className="font-semibold">Slug</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-8 w-8 rounded object-contain border p-0.5"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{brand.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{brand.slug}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      brand.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(brand.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(brand)}
                      className="p-2 hover:bg-green-50 hover:border-green-200"
                    >
                      <Edit size={14} className="text-green-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(brand)}
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
  );
};

export default BrandTable;
