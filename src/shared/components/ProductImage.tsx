import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function ProductImage({
  src,
  alt,
  loading = 'lazy',
  className = '',
}: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`product-image ${className}`}>
      {failed ? (
        <div
          className="image-unavailable"
          role="img"
          aria-label={`${alt}: image unavailable`}
        >
          <ImageOff aria-hidden="true" size={28} />
          <span>Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={480}
          height={480}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
