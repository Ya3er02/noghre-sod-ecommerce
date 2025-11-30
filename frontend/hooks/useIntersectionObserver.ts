import { useEffect, useRef, useState, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onChange?: (isIntersecting: boolean) => void;
}

/**
 * Intersection Observer hook for lazy loading & scroll animations
 * Perfect for scroll-triggered animations in luxury e-commerce
 * 
 * @example
 * ```tsx
 * const [ref, isVisible] = useIntersectionObserver({
 *   threshold: 0.5,
 *   freezeOnceVisible: true,
 * });
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    onChange,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Don't observe if already visible and frozen
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);
        
        // Call onChange callback
        onChange?.(isIntersecting);

        // Unobserve if visible and should freeze
        if (isIntersecting && freezeOnceVisible) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onChange, isVisible]);

  return [ref, isVisible];
}

/**
 * Multiple elements intersection observer
 * Useful for stagger animations
 */
export function useIntersectionObserverMultiple<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: IntersectionObserverOptions = {}
): [RefObject<T>[], boolean[]] {
  const [refs] = useState<RefObject<T>[]>(() =>
    Array.from({ length: count }, () => useRef<T>(null))
  );
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    Array(count).fill(false)
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.findIndex((ref) => ref.current === entry.target);
          if (index !== -1) {
            setVisibleStates((prev) => {
              const next = [...prev];
              next[index] = entry.isIntersecting;
              return next;
            });
          }
        });
      },
      options
    );

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [refs, options]);

  return [refs, visibleStates];
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteScroll(
  callback: () => void,
  options: IntersectionObserverOptions = {}
) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    ...options,
  });

  useEffect(() => {
    if (isVisible) {
      callback();
    }
  }, [isVisible, callback]);

  return ref;
}
