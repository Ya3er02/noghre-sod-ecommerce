import { Suspense, ComponentType, LazyExoticComponent } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LazyRouteProps {
  Component: LazyExoticComponent<ComponentType<any>>;
}

export function LazyRoute({ Component }: LazyRouteProps) {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Component />
    </Suspense>
  );
}