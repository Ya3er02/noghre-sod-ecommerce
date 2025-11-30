import { Suspense, ComponentType } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LazyRouteProps {
  Component: React.LazyExoticComponent<ComponentType<any>>;
}

export function LazyRoute({ Component }: LazyRouteProps) {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Component />
    </Suspense>
  );
}