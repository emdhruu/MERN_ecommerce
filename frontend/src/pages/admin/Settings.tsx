import { useState, useEffect } from "react";
import Header from "@/features/adminPanel/common/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Store, Bell } from "lucide-react";
import { useAppSelector } from "@/app/hook";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/features/auth/authApi";
import {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/features/adminPanel/settings/settingsApi";
import toast from "react-hot-toast";

const currencyOptions = [
  { value: "USD", symbol: "$", label: "USD ($)" },
  { value: "EUR", symbol: "€", label: "EUR (€)" },
  { value: "INR", symbol: "₹", label: "INR (₹)" },
  { value: "GBP", symbol: "£", label: "GBP (£)" },
];

const Settings = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [profileName, setProfileName] = useState(user?.name || "");
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Store Settings
  const { data: storeData, isLoading: isLoadingStore } = useGetStoreSettingsQuery();
  const [updateStoreSettings, { isLoading: isUpdatingStore }] = useUpdateStoreSettingsMutation();
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    currency: "INR",
    currencySymbol: "₹",
    lowStockThreshold: 10,
    contactEmail: "",
    contactPhone: "",
  });

  // Notification Preferences
  const { data: notifData, isLoading: isLoadingNotif } = useGetNotificationPreferencesQuery();
  const [updateNotifPrefs, { isLoading: isUpdatingNotif }] = useUpdateNotificationPreferencesMutation();

  // Sync store form when data loads
  useEffect(() => {
    if (storeData?.data) {
      setStoreForm({
        storeName: storeData.data.storeName,
        currency: storeData.data.currency,
        currencySymbol: storeData.data.currencySymbol,
        lowStockThreshold: storeData.data.lowStockThreshold,
        contactEmail: storeData.data.contactEmail || "",
        contactPhone: storeData.data.contactPhone || "",
      });
    }
  }, [storeData]);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "password", label: "Password", icon: <Lock size={16} /> },
    { id: "store", label: "Store", icon: <Store size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  ];

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      await updateProfile({ name: profileName.trim() }).unwrap();
      toast.success("Profile updated successfully.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password.");
    }
  };

  const handleUpdateStore = async () => {
    if (!storeForm.storeName.trim()) {
      toast.error("Store name is required.");
      return;
    }
    if (storeForm.lowStockThreshold < 1) {
      toast.error("Low stock threshold must be at least 1.");
      return;
    }
    try {
      await updateStoreSettings(storeForm).unwrap();
      toast.success("Store settings updated. Threshold synced to all inventory.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update store settings.");
    }
  };

  const handleToggleNotif = async (key: string, value: boolean) => {
    try {
      await updateNotifPrefs({ [key]: value }).unwrap();
      toast.success("Notification preference updated.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update preference.");
    }
  };

  const handleCurrencyChange = (currency: string) => {
    const option = currencyOptions.find((c) => c.value === currency);
    setStoreForm({
      ...storeForm,
      currency,
      currencySymbol: option?.symbol || "₹",
    });
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <Header heading="Settings" subheading="Manage your account and store preferences." />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#D54F47]/10 text-[#D54F47]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      defaultValue={user?.role || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "password" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "store" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Settings</h3>
                {isLoadingStore ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        value={storeForm.storeName}
                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={storeForm.currency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20"
                      >
                        {currencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold (default)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={storeForm.lowStockThreshold}
                        onChange={(e) => setStoreForm({ ...storeForm, lowStockThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Changing this will update the threshold for all existing inventory records.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={storeForm.contactEmail}
                        onChange={(e) => setStoreForm({ ...storeForm, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                        placeholder="store@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={storeForm.contactPhone}
                        onChange={(e) => setStoreForm({ ...storeForm, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D54F47]/20 focus:border-[#D54F47]"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleUpdateStore}
                      disabled={isUpdatingStore}
                      className="bg-[#D54F47] hover:bg-[#b8433c] text-white"
                    >
                      {isUpdatingStore ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Email notifications are sent to your registered email address. Daily summary is sent at 11:00 PM.
                </p>
                {isLoadingNotif ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { key: "lowStockAlerts", label: "Low stock alerts", description: "Get notified when products fall below the threshold" },
                      { key: "newOrders", label: "New orders", description: "Receive email when a new order is placed" },
                      { key: "paymentFailures", label: "Payment failures", description: "Alert when a payment fails and stock is released" },
                      { key: "dailySummary", label: "Daily summary", description: "Receive a daily sales summary email at 11:00 PM" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifData?.data?.[item.key as keyof typeof notifData.data] as boolean ?? true}
                            onChange={(e) => handleToggleNotif(item.key, e.target.checked)}
                            disabled={isUpdatingNotif}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D54F47]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
