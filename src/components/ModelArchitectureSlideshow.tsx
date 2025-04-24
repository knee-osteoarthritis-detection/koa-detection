import React, { useState, useEffect } from 'react';

const ModelArchitectureSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: "public/images/model1.jpg",
      title: "Complete Model Architecture",
      description: "Overview of the complete neural network architecture for knee OA detection"
    },
    {
      image: "public/images/model2.jpg",
      title: "Inception Module",
      description: "Detailed view of the inception module used in our architecture"
    },
    {
      image: "public/images/model3.jpg",
      title: "Residual Separable Block",
      description: "Structure of the residual separable block for feature extraction"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-white rounded-lg shadow-md p-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-contain bg-white"
              onError={(e) => {
                console.error(`Error loading image: ${slide.image}`);
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />
          </div>
        ))}
        
        {/* Navigation buttons */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              currentSlide === index ? 'bg-medical-600 w-4' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Slide info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium text-gray-800">{slides[currentSlide].title}</h3>
        <p className="text-sm text-gray-600 mt-1">{slides[currentSlide].description}</p>
      </div>
    </div>
  );
};

export default ModelArchitectureSlideshow; 