import { useEffect, useRef, useState, useMemo, RefObject } from 'react';

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
 * 
 * @example
 * ```tsx
 * const [setRef, visibleStates] = useIntersectionObserverMultiple(5);
 * 
 * return items.map((item, i) => (
 *   <div 
 *     key={item.id} 
 *     ref={setRef(i)}
 *     className={visibleStates[i] ? 'visible' : 'hidden'}
 *   >
 *     {item.content}
 *   </div>
 * ));
 * ```
 */
export function useIntersectionObserverMultiple<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: IntersectionObserverOptions = {}
): [(index: number) => (node: T | null) => void, boolean[]] {
  // Single container ref for all elements
  const nodesRef = useRef<Array<T | null>>(Array(count).fill(null));
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    Array(count).fill(false)
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Create stable callback refs using useMemo
  const setRef = useMemo(
    () => (index: number) => (node: T | null) => {
      // Store the node at the given index
      const oldNode = nodesRef.current[index];
      nodesRef.current[index] = node;

      // If we have an observer, manage observations
      if (observerRef.current) {
        // Unobserve old node if it exists
        if (oldNode) {
          observerRef.current.unobserve(oldNode);
        }
        // Observe new node if it exists
        if (node) {
          observerRef.current.observe(node);
        }
      }
    },
    [] // Empty deps - function is stable
  );

  useEffect(() => {
    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Find index of the entry target
          const index = nodesRef.current.findIndex(
            (node) => node === entry.target
          );
          
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

    // Observe all existing nodes
    nodesRef.current.forEach((node) => {
      if (node && observerRef.current) {
        observerRef.current.observe(node);
      }
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [options]);

  return [setRef, visibleStates];
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
