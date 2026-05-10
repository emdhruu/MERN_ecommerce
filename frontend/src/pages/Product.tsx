import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStoreProductByIdQuery, useAddToCartMutation, useGetProductReviewsQuery } from "@/features/store/storeApi";
import { useAppSelector } from "@/app/hook";
import toast from "react-hot-toast";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  const { data, isLoading } = useGetStoreProductByIdQuery(id || "");
  const { data: reviewsData } = useGetProductReviewsQuery({ productId: id || "", limit: 10 });
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = data?.data;
  const reviews = reviewsData?.data || [];

  const formatPrice = (price: { $numberDecimal: string } | number): string => {
    if (typeof price === "object" && "$numberDecimal" in price) {
      return parseFloat(price.$numberDecimal).toFixed(2);
    }
    return Number(price).toFixed(2);
  };

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      toast.error("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    if (user?.role === "admin") {
      toast.error("Admin accounts cannot add to cart.");
      return;
    }
    try {
      await addToCart({ productId: product!._id, quantity }).unwrap();
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add to cart.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 text-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
      </div>
    );
  }

  const hasDiscount = product.salesPrice && product.discountPercentage > 0;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border">
            <img
              src={product.images[selectedImage] || product.thumbnail || ""}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded border overflow-hidden ${
                    selectedImage === idx ? "border-[#D54F47] ring-2 ring-[#D54F47]/20" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.brand?.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">{product.category?.name}</p>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-[#D54F47]">
                  ₹{formatPrice(product.salesPrice!)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ₹{formatPrice(product.price)}
                </span>
                <span className="bg-[#D54F47]/10 text-[#D54F47] text-xs font-medium px-2 py-1 rounded">
                  -{product.discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ₹{formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="text-sm text-green-600 font-medium">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.inStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="bg-[#D54F47] hover:bg-[#b8433c] text-white flex items-center gap-2 px-6"
              >
                <ShoppingCart size={18} />
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          {/* Description */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{review.user?.name || "User"}</span>
                  <span className="text-xs text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </div>
                {review.comment?.length > 0 && (
                  <p className="text-sm text-gray-600">{review.comment[review.comment.length - 1]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
