// src/components/common/SmartImage.tsx
import React, { useEffect, useRef, useState } from 'react';

export type SmartImageProps = {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
};

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  placeholderSrc,
  className,
  width,
  height,
  eager = false,
  sizes,
  onLoad,
  onError,
}) => {
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (eager || shouldLoad) return;
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin: '200px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, shouldLoad]);

  const effectiveSrc = shouldLoad ? src : (placeholderSrc || src);
  const loadingAttr: 'eager' | 'lazy' = eager ? 'eager' : 'lazy';

  return (
    <div ref={wrapperRef} className={`relative ${className || ''}`} style={{ width, height }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        </div>
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        loading={loadingAttr}
        width={width}
        height={height}
        sizes={sizes}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        onError={(e) => {
          // Avoid error loops
          if (!errored && placeholderSrc && (e.currentTarget as HTMLImageElement).src !== placeholderSrc) {
            setErrored(true);
            const img = e.currentTarget as HTMLImageElement;
            (img as unknown as { onerror: null }).onerror = null;
            img.src = placeholderSrc;
          }
          onError?.();
        }}
        decoding="async"
      />
    </div>
  );
};

export default SmartImage;
