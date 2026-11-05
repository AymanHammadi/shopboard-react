import { useState } from 'react';
import { ProductImage } from '../../../shared/components/ProductImage';

interface Props {
  images: readonly [string, ...string[]];
  title: string;
}

export function ProductGallery({ images, title }: Props) {
  const [selected, setSelected] = useState(images[0]);
  return (
    <div className="product-gallery">
      <ProductImage
        key={selected}
        src={selected}
        alt={title}
        loading="eager"
        className="gallery-main"
      />
      {images.length > 1 ? (
        <div
          className="gallery-thumbnails"
          role="group"
          aria-label="Product images"
        >
          {images.map((src) => (
            <button
              key={src}
              type="button"
              aria-label={`View image ${String(images.indexOf(src) + 1)} of ${title}`}
              aria-pressed={src === selected}
              onClick={() => setSelected(src)}
            >
              <ProductImage src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
