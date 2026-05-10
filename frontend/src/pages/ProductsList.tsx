import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStoreProductsQuery, useGetStoreCategoriesQuery, useGetStoreBrandsQuery } from "@/features/store/storeApi";
import ProductCard from "@/features/store/components/ProductCard";
import TablePagination from "@/features/adminPanel/common/TablePagination";

const ProductsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useGetStoreProductsQuery({
    page,
    limit: 12,
    search: search || undefined,
    category: category || undefined,
    brand: brand || undefined,
    sort: sort || undefined,
    order: sort ? order : undefined,
  });

  const { data: categoriesData } = useGetStoreCategoriesQuery();
  const { data: brandsData } = useGetStoreBrandsQuery();

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;
  const categories = categoriesData?.data?.filter((c) => c.isActive) || [];
  const brands = brandsData?.data || [];

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId === category ? "" : catId);
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
    setBrand("");
    setSort("");
    setOrder("asc");
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <p className="text-sm text-gray-500 mt-1">{totalCount} products found</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    category === cat._id
                      ? "bg-[#D54F47]/10 text-[#D54F47] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Brands</h3>
            <div className="space-y-1">
              {brands.map((b) => (
                <button
                  key={b._id}
                  onClick={() => { setBrand(brand === b._id ? "" : b._id); setPage(1); }}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    brand === b._id
                      ? "bg-[#D54F47]/10 text-[#D54F47] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sort By</h3>
            <div className="space-y-1">
              {[
                { field: "price", label: "Price" },
                { field: "createdAt", label: "Newest" },
                { field: "name", label: "Name" },
              ].map((s) => (
                <button
                  key={s.field}
                  onClick={() => handleSortChange(s.field)}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    sort === s.field
                      ? "bg-[#D54F47]/10 text-[#D54F47] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s.label} {sort === s.field && (order === "asc" ? "↑" : "↓")}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {(search || category || brand || sort) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-72" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="mt-8">
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={totalCount}
                  limit={12}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
