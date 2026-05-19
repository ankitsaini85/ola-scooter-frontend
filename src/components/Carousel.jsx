import React, { useEffect, useState } from 'react';

const Carousel = ({ slides = [] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return <div className="hero-carousel hero-carousel--empty" />;
  }

  return (
    <div className="hero-carousel">
      {slides.map((slide, slideIndex) => (
        <div
          key={`${slide}-${slideIndex}`}
          className={`hero-slide ${slideIndex === index ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}
      <div className="hero-carousel__dots" aria-hidden="true">
        {slides.map((slide, slideIndex) => (
          <button
            key={`${slide}-dot-${slideIndex}`}
            className={slideIndex === index ? 'is-active' : ''}
            onClick={() => setIndex(slideIndex)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
