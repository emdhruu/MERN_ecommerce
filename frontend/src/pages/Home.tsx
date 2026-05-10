import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProductsQuery, useGetStoreCategoriesQuery } from "@/features/store/storeApi";
import ProductCard from "@/features/store/components/ProductCard";

const Home = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useGetFeaturedProductsQuery();
  const { data: categoriesData } = useGetStoreCategoriesQuery();

  const featured = featuredData?.data || [];
  const categories = categoriesData?.data?.filter((c) => c.isActive) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#D54F47]/5 to-[#D54F47]/10 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop Quality Products
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our curated collection of products at great prices. Fast delivery, easy returns.
          </p>
          <Link to="/products">
            <Button className="bg-[#D54F47] hover:bg-[#b8433c] text-white px-8 py-3 text-base">
              Browse All Products <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#D54F47] hover:text-[#D54F47] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-[#D54F47] hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-72" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No featured products available.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
