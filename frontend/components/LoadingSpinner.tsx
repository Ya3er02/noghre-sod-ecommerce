interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({
  fullScreen = false,
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${
        sizeClasses[size]
      } border-primary border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
}
