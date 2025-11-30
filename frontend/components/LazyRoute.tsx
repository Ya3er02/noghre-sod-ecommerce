import { Suspense, ComponentType } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LazyRouteProps {
  Component: React.LazyExoticComponent<ComponentType<any>>;
}

export function LazyRoute({ Component }: LazyRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner fullScreen />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}