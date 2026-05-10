import { Link } from "react-router-dom";
import type { StoreProduct } from "../storeApi";

interface ProductCardProps {
  product: StoreProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: { $numberDecimal: string } | number): string => {
    if (typeof price === "object" && "$numberDecimal" in price) {
      return parseFloat(price.$numberDecimal).toFixed(2);
    }
    return Number(price).toFixed(2);
  };

  const hasDiscount = product.salesPrice && product.discountPercentage > 0;

  return (
    <Link to={`/product/${product._id}`} className="group">
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.thumbnail || product.images[0] || ""}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-[#D54F47] text-white text-xs font-medium px-2 py-0.5 rounded">
              -{product.discountPercentage}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-[#D54F47] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.brand?.name}</p>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-[#D54F47]">
                  ₹{formatPrice(product.salesPrice!)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                ₹{formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
