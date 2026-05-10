import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Tag } from "lucide-react";
import { useGetCartQuery, useGetUserAddressesQuery, useAddAddressMutation, useCreateOrderMutation, useClearCartMutation, useApplyCouponMutation } from "@/features/store/storeApi";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading: loadingCart } = useGetCartQuery();
  const { data: addressData, isLoading: loadingAddr, refetch: refetchAddr } = useGetUserAddressesQuery();
  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();
  const [clearCart] = useClearCartMutation();
  const [addAddress, { isLoading: isAddingAddr }] = useAddAddressMutation();

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<{ discountApplied: number; payableValue: number; couponDetails: any } | null>(null);
  const [applyCoupon, { isLoading: isApplying }] = useApplyCouponMutation();
  const [addressForm, setAddressForm] = useState({
    street: "", city: "", state: "", postalCode: "", phoneNumber: "", country: "", type: "home" as "home" | "work" | "other", isDefault: false,
  });

  const cartItems = cartData?.cartItems?.items || [];
  const addresses = addressData?.data?.items || [];

  const formatPrice = (price: { $numberDecimal: string } | number): number => {
    if (typeof price === "object" && "$numberDecimal" in price) return parseFloat(price.$numberDecimal);
    return Number(price);
  };

  const getItemPrice = (item: any): number => {
    if (item.product.salesPrice) return formatPrice(item.product.salesPrice);
    return formatPrice(item.product.price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  // Auto-select default address
  if (!selectedAddress && addresses.length > 0) {
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr) setSelectedAddress(defaultAddr._id);
  }

  const handleAddAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode || !addressForm.phoneNumber || !addressForm.country) {
      toast.error("All address fields are required.");
      return;
    }
    try {
      await addAddress(addressForm).unwrap();
      toast.success("Address added.");
      setShowAddressForm(false);
      setAddressForm({ street: "", city: "", state: "", postalCode: "", phoneNumber: "", country: "", type: "home", isDefault: false });
      refetchAddr();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add address.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return;
    }

    const items = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    try {
      await createOrder({ items, address: selectedAddress, paymentMethod, couponCode: couponResult?.couponDetails?.code || undefined }).unwrap();
      toast.success("Order placed successfully!");
      await clearCart().unwrap();
      navigate("/profile");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to place order.");
    }
  };

  if (loadingCart || loadingAddr) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
        <p className="text-gray-500 text-lg">Your cart is empty. Add items before checkout.</p>
        <Button onClick={() => navigate("/products")} className="mt-4 bg-[#D54F47] hover:bg-[#b8433c] text-white">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={18} /> Delivery Address
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                <Plus size={14} className="mr-1" /> Add New
              </Button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === addr._id ? "border-[#D54F47] bg-[#D54F47]/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1 accent-[#D54F47]"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{addr.street}</p>
                      <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-gray-500">{addr.country} • {addr.phoneNumber}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">{addr.type}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No addresses found. Add one below.</p>
            )}

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                  <input type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                  <input type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                  <input type="text" placeholder="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                  <input type="text" placeholder="Phone Number" value={addressForm.phoneNumber} onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                  <input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20" />
                </div>
                <Button size="sm" onClick={handleAddAddress} disabled={isAddingAddr} className="bg-[#D54F47] hover:bg-[#b8433c] text-white">
                  {isAddingAddr ? "Adding..." : "Save Address"}
                </Button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {[
                { value: "cash_on_delivery", label: "Cash on Delivery" },
                { value: "credit_card", label: "Credit Card (Pay Later)" },
                { value: "paypal", label: "PayPal (Pay Later)" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === method.value ? "border-[#D54F47] bg-[#D54F47]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="accent-[#D54F47]"
                  />
                  <span className="text-sm font-medium text-gray-900">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="bg-white border border-gray-100 rounded-lg p-6 h-fit sticky top-24">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate max-w-[180px]">{item.product.name} × {item.quantity}</span>
                <span className="font-medium">₹{(getItemPrice(item) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            {couponResult && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Discount</span>
                <span className="font-medium">-₹{couponResult.discountApplied.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-[#D54F47]">
                ₹{couponResult ? couponResult.payableValue.toFixed(2) : subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <label className="block text-xs font-medium text-gray-700 mb-2">Coupon Code</label>
            {!couponResult ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!couponInput.trim()) { toast.error("Enter a coupon code."); return; }
                    try {
                      const result = await applyCoupon({ code: couponInput.trim().toUpperCase() }).unwrap();
                      setCouponResult(result.data);
                      toast.success(`Coupon applied! You save ₹${result.data.discountApplied.toFixed(2)}`);
                    } catch (error: any) {
                      setCouponResult(null);
                      toast.error(error?.data?.message || "Invalid coupon code.");
                    }
                  }}
                  disabled={isApplying}
                  className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                >
                  {isApplying ? "..." : "Apply"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">{couponResult.couponDetails.code}</span>
                </div>
                <button onClick={() => { setCouponResult(null); setCouponInput(""); }} className="text-xs text-red-500 hover:text-red-600 font-medium">
                  Remove
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isOrdering || !selectedAddress}
            className="w-full mt-4 bg-[#D54F47] hover:bg-[#b8433c] text-white"
          >
            {isOrdering ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
