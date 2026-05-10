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
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { Category } from "../categoryApi";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

const CategoryTable = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoryTableProps) => {
  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f05249]"></div>
          <span className="ml-3 text-gray-500">Loading categories...</span>
        </div>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No categories found</p>
          <p className="text-sm mt-1">Add your first category to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Slug</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {category.imageUrl && (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-8 w-8 rounded object-cover border"
                      />
                    )}
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{category.slug}</TableCell>
                <TableCell>
                  <span className="text-gray-700 text-sm line-clamp-2">
                    {category.description}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      category.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(category)}
                      className={`p-2 ${
                        category.isActive
                          ? "hover:bg-yellow-50 hover:border-yellow-200"
                          : "hover:bg-green-50 hover:border-green-200"
                      }`}
                      title={category.isActive ? "Deactivate" : "Activate"}
                    >
                      {category.isActive ? (
                        <ToggleRight size={14} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={14} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="p-2 hover:bg-green-50 hover:border-green-200"
                    >
                      <Edit size={14} className="text-green-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(category)}
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

export default CategoryTable;
