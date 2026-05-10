import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetTopProductsQuery } from "../dashboardApi";

const TopProducts = () => {
  const { data, isLoading } = useGetTopProductsQuery({ limit: 7 });
  const products = data?.data || [];

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <p className="text-gray-400 text-sm text-center py-8">No sales data available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Units Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="text-center">{item.totalSold}</TableCell>
              <TableCell className="text-right font-semibold">
                ${item.totalRevenue.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TopProducts;
