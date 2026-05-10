import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCartQuery, useUpdateCartQuantityMutation, useClearCartMutation } from "@/features/store/storeApi";
import toast from "react-hot-toast";

const Cart = () => {
  const { data, isLoading, refetch } = useGetCartQuery();
  const [updateQuantity] = useUpdateCartQuantityMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const cartItems = data?.cartItems?.items || [];

  const formatPrice = (price: { $numberDecimal: string } | number): number => {
    if (typeof price === "object" && "$numberDecimal" in price) {
      return parseFloat(price.$numberDecimal);
    }
    return Number(price);
  };

  const getItemPrice = (item: any): number => {
    const product = item.product;
    if (product.salesPrice) return formatPrice(product.salesPrice);
    return formatPrice(product.price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const handleUpdateQty = async (productId: string, quantity: number) => {
    try {
      await updateQuantity({ productId, quantity }).unwrap();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update quantity.");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await updateQuantity({ productId, quantity: 0 }).unwrap();
      toast.success("Item removed.");
      refetch();
    } catch (error: any) {
      toast.error("Failed to remove item.");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared.");
      refetch();
    } catch (error: any) {
      toast.error("Failed to clear cart.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/products">
          <Button className="bg-[#D54F47] hover:bg-[#b8433c] text-white">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.product._id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-lg">
              <img
                src={item.product.thumbnail || item.product.images?.[0] || ""}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="flex-1">
                <Link to={`/product/${item.product._id}`} className="text-sm font-medium text-gray-900 hover:text-[#D54F47]">
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.product.brand?.name}</p>
                <p className="text-sm font-semibold text-[#D54F47] mt-1">
                  ₹{getItemPrice(item).toFixed(2)}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded">
                  <button
                    onClick={() => handleUpdateQty(item.product._id, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQty(item.product._id, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.product._id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={handleClearCart} disabled={isClearing} className="text-red-500 hover:text-red-600">
            Clear Cart
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-lg p-6 h-fit sticky top-24">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-[#D54F47]">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout">
            <Button className="w-full mt-6 bg-[#D54F47] hover:bg-[#b8433c] text-white">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
