import { DollarSign, ShoppingBag, AlertTriangle, Package } from "lucide-react";
import { useGetDashboardStatsQuery } from "../dashboardApi";

const StatsCards = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();
  const stats = data?.data;

  const cardsDetails = [
    {
      title: "Total Revenue",
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0",
      icon: <DollarSign className="w-8 h-8 text-blue-600" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      title: "Total Orders",
      value: stats ? stats.totalOrders.toString() : "0",
      icon: <ShoppingBag className="w-8 h-8 text-green-600" />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      title: "Pending Orders",
      value: stats ? stats.pendingOrders.toString() : "0",
      icon: <Package className="w-8 h-8 text-orange-600" />,
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100"
    },
    {
      title: "Low Stock Alerts",
      value: stats ? stats.lowStockCount.toString() : "0",
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      bgColor: "bg-red-50",
      iconBg: "bg-red-100"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm px-6 py-4 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardsDetails.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgColor} bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 px-6 py-4 border border-gray-100`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.iconBg} p-2 rounded-lg`}>
              {card.icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{card.title}</h3>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
