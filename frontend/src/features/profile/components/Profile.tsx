import { useState } from "react";
import { Package, MapPin, User, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/app/hook";
import {
  useGetMyOrdersQuery,
  useGetUserAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} from "@/features/store/storeApi";
import StatusBadge from "@/features/adminPanel/common/StatusBadge";
import toast from "react-hot-toast";

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  country: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

const emptyAddressForm: AddressFormData = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
  phoneNumber: "",
  country: "",
  type: "home",
  isDefault: false,
};

const Profile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("orders");
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddressForm);

  const { data: ordersData, isLoading: loadingOrders } = useGetMyOrdersQuery({ page: orderPage, limit: 5 });
  const { data: addressData, isLoading: loadingAddr, refetch: refetchAddr } = useGetUserAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const orders = ordersData?.data || [];
  const addresses = addressData?.data?.items || [];

  const formatPrice = (price: { $numberDecimal: string } | number): string => {
    if (typeof price === "object" && "$numberDecimal" in price) return `₹${parseFloat(price.$numberDecimal).toFixed(2)}`;
    return `₹${Number(price).toFixed(2)}`;
  };

  const resetForm = () => {
    setAddressForm(emptyAddressForm);
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowAddressForm(true);
  };

  const handleEdit = (addr: any) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phoneNumber: addr.phoneNumber,
      country: addr.country,
      type: addr.type || "home",
      isDefault: addr.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleSubmitAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode || !addressForm.phoneNumber || !addressForm.country) {
      toast.error("All fields are required.");
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress({ addressId: editingAddressId, updateData: addressForm }).unwrap();
        toast.success("Address updated successfully.");
      } else {
        await addAddress(addressForm).unwrap();
        toast.success("Address added successfully.");
      }
      resetForm();
      refetchAddr();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save address.");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress({ addressId }).unwrap();
      toast.success("Default address updated.");
      refetchAddr();
    } catch (error: any) {
      toast.error("Failed to set default address.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress({ addressId }).unwrap();
      toast.success("Address deleted.");
      refetchAddr();
    } catch (error: any) {
      toast.error("Failed to delete address.");
    }
  };

  const tabs = [
    { id: "orders", label: "My Orders", icon: <Package size={16} /> },
    { id: "addresses", label: "Addresses", icon: <MapPin size={16} /> },
    { id: "account", label: "Account", icon: <User size={16} /> },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "bg-[#D54F47]/10 text-[#D54F47]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
              {loadingOrders ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <>
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-100 rounded-lg p-4 cursor-pointer hover:border-[#D54F47]/30 transition-colors" onClick={() => setSelectedOrder(order)}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs font-mono text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.orderStatus} />
                          <StatusBadge status={order.paymentStatus} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.product?.thumbnail || ""}
                              alt=""
                              className="w-10 h-10 rounded border object-cover"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
                          )}
                        </div>
                        <div className="text-right">
                          {order.couponCode && (
                            <span className="text-xs text-green-600 block">Coupon: {order.couponCode}</span>
                          )}
                          <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {ordersData && ordersData.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setOrderPage(orderPage - 1)} disabled={orderPage === 1}>
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">Page {orderPage} of {ordersData.totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setOrderPage(orderPage + 1)} disabled={orderPage === ordersData.totalPages}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No orders yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                <Button
                  size="sm"
                  onClick={handleAddNew}
                  className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                >
                  <Plus size={14} className="mr-1" /> Add Address
                </Button>
              </div>

              {/* Address Form (Add / Edit) */}
              {showAddressForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Street"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={addressForm.phoneNumber}
                      onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                    <select
                      value={addressForm.type}
                      onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as "home" | "work" | "other" })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="accent-[#D54F47] w-4 h-4"
                      />
                      Set as default address
                    </label>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Button
                      size="sm"
                      onClick={handleSubmitAddress}
                      disabled={isAdding || isUpdating}
                      className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                    >
                      {isAdding || isUpdating ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {loadingAddr ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`bg-white border rounded-lg p-4 transition-colors ${
                        addr.isDefault ? "border-[#D54F47]/30 bg-[#D54F47]/5" : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{addr.street}</p>
                          <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="text-gray-500">{addr.country} • {addr.phoneNumber}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{addr.type}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Default</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!addr.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(addr._id)}
                              className="text-gray-500 hover:text-[#D54F47] h-8 w-8 p-0"
                              title="Set as default"
                            >
                              <Star size={15} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(addr)}
                            className="text-gray-500 hover:text-blue-600 h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-gray-500 hover:text-red-600 h-8 w-8 p-0"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <div className="text-center py-12">
                    <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-3">No saved addresses.</p>
                    <Button size="sm" onClick={handleAddNew} className="bg-[#D54F47] hover:bg-[#b8433c] text-white">
                      <Plus size={14} className="mr-1" /> Add Your First Address
                    </Button>
                  </div>
                )
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <p className="text-xs font-mono text-gray-500">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedOrder.orderStatus} />
                <StatusBadge status={selectedOrder.paymentStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Date</span>
                <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Payment</span>
                <p className="font-medium capitalize">{selectedOrder.paymentMethod.replace("_", " ")}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 mb-4">
              {selectedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.product?.thumbnail || ""}
                    alt=""
                    className="w-12 h-12 rounded border object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product?.name || "Product"}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              {selectedOrder.couponCode && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedOrder.couponCode})</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-[#D54F47]">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
