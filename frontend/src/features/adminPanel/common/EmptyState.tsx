import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState = ({
  title = "No data found",
  description = "Try adjusting your filters or check back later.",
  icon,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4">
        {icon || <Inbox size={48} />}
      </div>
      <p className="text-lg font-medium text-gray-600">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
};

export default EmptyState;
