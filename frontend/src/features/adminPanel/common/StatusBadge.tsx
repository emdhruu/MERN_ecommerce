interface StatusBadgeProps {
  status: string;
  variant?: "default" | "order" | "payment" | "stock" | "ledger";
}

const statusColors: Record<string, string> = {
  // Order statuses
  PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  DELIVERED: "bg-blue-100 text-blue-800",
  // Payment statuses
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  // PO statuses
  PARTIAL: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  // Ledger types
  IN: "bg-green-100 text-green-800",
  OUT: "bg-red-100 text-red-800",
  RESERVE: "bg-blue-100 text-blue-800",
  RELEASE: "bg-purple-100 text-purple-800",
  ADJUST: "bg-gray-100 text-gray-800",
  // Stock
  "Low Stock": "bg-orange-100 text-orange-800",
  "In Stock": "bg-green-100 text-green-800",
  "Out of Stock": "bg-red-100 text-red-800",
  // Generic
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
