// src/components/Carousel3D.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface CarouselItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function Carousel3D({ items, currentIndex, onIndexChange, className = "" }: Carousel3DProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [radius, setRadius] = useState(300); // Default radius
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const angleStep = 360 / items.length;
  const dragThreshold = 50; // Increased threshold for better user experience

  // Make carousel responsive by adjusting radius based on container width
  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Adjust radius based on screen size for better responsiveness
        if (width < 640) {
          setRadius(width * 0.7);
        } else if (width < 1024) {
          setRadius(width * 0.45);
        } else {
          setRadius(400);
        }
      }
    };

    updateRadius();
    const resizeObserver = new ResizeObserver(updateRadius);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (carouselRef.current) carouselRef.current.style.cursor = "grabbing";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setDragOffset(deltaX);
  }, [isDragging, startX]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (carouselRef.current) carouselRef.current.style.cursor = "grab";

    if (Math.abs(dragOffset) > dragThreshold) {
      const direction = dragOffset < 0 ? 1 : -1;
      const newIndex = (currentIndex + direction + items.length) % items.length;
      onIndexChange(newIndex);
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, currentIndex, items.length, onIndexChange, dragThreshold]);

  const handleCardClick = useCallback((index: number) => {
    if (index !== currentIndex) {
      onIndexChange(index);
    }
  }, [currentIndex, onIndexChange]);

  const handleTransitionEnd = () => {
    setIsAnimating(false);
  };
  
  useEffect(() => {
    setIsAnimating(true);
  }, [currentIndex]);


  const getCardStyle = (index: number) => {
    const baseRotation = currentIndex * angleStep;
    const dragRotation = isDragging ? dragOffset * 0.25 : 0;
    const angle = index * angleStep - baseRotation - dragRotation;
    const isCenter = index === currentIndex;
    
    return {
      transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${isCenter ? 1.15 : 0.85})`,
      opacity: isCenter ? 1 : 0.4,
      zIndex: isCenter ? items.length : items.length - Math.abs(index - currentIndex),
      transition: isDragging ? "none" : `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)`,
      filter: `brightness(${isCenter ? 1 : 0.7})`,
    };
  };

  return (
    <div ref={containerRef} className={`relative w-full h-[400px] sm:h-[450px] md:h-[500px] flex items-center justify-center ${className}`}>
      <div
        ref={carouselRef}
        className="relative w-full h-full cursor-grab select-none"
        style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp} // Handle cases where pointer is lost
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="absolute left-1/2 top-1/2 w-52 h-72 sm:w-60 sm:h-80 md:w-72 md:h-96 -ml-[104px] -mt-[144px] sm:-ml-30 sm:-mt-40 md:-ml-36 md:-mt-48 rounded-xl overflow-hidden shadow-2xl"
            style={getCardStyle(index)}
            onClick={() => handleCardClick(index)}
            onTransitionEnd={handleTransitionEnd}
          >
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 288px"
              priority={Math.abs(index - currentIndex) < 2} // Prioritize loading nearby images
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg drop-shadow-md">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}