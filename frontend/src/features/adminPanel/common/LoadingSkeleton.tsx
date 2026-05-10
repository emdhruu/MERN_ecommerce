interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

const LoadingSkeleton = ({ rows = 5, columns = 5 }: LoadingSkeletonProps) => {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 bg-gray-200 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
