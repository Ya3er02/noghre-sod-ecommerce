import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description?: string;
}

interface ProductCarouselProps {
  products: Product[];
  autoplay?: boolean;
  autoplayDelay?: number;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  autoplay = true,
  autoplayDelay = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [currentIndex, autoplay, autoplayDelay]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!products || products.length === 0) {
    return <div className="carousel-empty">No products available</div>;
  }

  return (
    <div className="product-carousel">
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="carousel-slide">
              <div className="carousel-product-card">
                <div className="carousel-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="carousel-product-info">
                  <h3>{product.name}</h3>
                  {product.description && <p>{product.description}</p>}
                  <div className="carousel-product-price">{product.price}</div>
                  <button className="carousel-view-button">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          className="carousel-nav carousel-nav-prev"
          onClick={prevSlide}
          disabled={isTransitioning}
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          className="carousel-nav carousel-nav-next"
          onClick={nextSlide}
          disabled={isTransitioning}
          aria-label="Next slide"
        >
          →
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="carousel-dots">
        {products.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .product-carousel {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .carousel-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .carousel-track {
          display: flex;
          width: 100%;
        }

        .carousel-slide {
          flex: 0 0 100%;
          min-width: 100%;
          padding: 3rem;
        }

        .carousel-product-card {
          display: flex;
          gap: 3rem;
          align-items: center;
          justify-content: center;
        }

        .carousel-product-image {
          flex: 0 0 400px;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          background: #f9f9f9;
        }

        .carousel-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .carousel-product-card:hover .carousel-product-image img {
          transform: scale(1.02);
        }

        .carousel-product-info {
          flex: 1;
          max-width: 500px;
        }

        .carousel-product-info h3 {
          font-size: 2.5rem;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .carousel-product-info p {
          font-size: 1rem;
          color: #4a4a4a;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .carousel-product-price {
          font-size: 1.75rem;
          color: #C9A961;
          font-weight: 400;
          margin-bottom: 2rem;
        }

        .carousel-view-button {
          padding: 0.875rem 2rem;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-view-button:hover {
          background: #C9A961;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          color: #1a1a1a;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .carousel-nav:hover:not(:disabled) {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }

        .carousel-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .carousel-nav-prev {
          left: 1.5rem;
        }

        .carousel-nav-next {
          right: 1.5rem;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .carousel-dot:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .carousel-dot.active {
          background: #C9A961;
          width: 32px;
          border-radius: 5px;
        }

        .carousel-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: #4a4a4a;
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .carousel-product-card {
            flex-direction: column;
            gap: 2rem;
          }

          .carousel-product-image {
            flex: 0 0 300px;
            height: 300px;
          }

          .carousel-product-info h3 {
            font-size: 2rem;
          }

          .carousel-nav {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .carousel-nav-prev {
            left: 0.5rem;
          }

          .carousel-nav-next {
            right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;
