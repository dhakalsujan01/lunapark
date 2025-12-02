'use client'

import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Using local amusement park images from the public folder
const imageData = [
    { id: 1, src: '/amusement-park-aerial-view.png', altKey: 'home.gallery.aerial' },
    { id: 2, src: '/amusement-park-entrance-gate.png', altKey: 'home.gallery.entrance' },
    { id: 3, src: '/colorful-amusement-park-sunset.png', altKey: 'home.gallery.sunsetPark' },
    { id: 4, src: '/thrilling-roller-coaster.png', altKey: 'home.gallery.coaster' },
    { id: 5, src: '/ferris-wheel-at-sunset.png', altKey: 'home.gallery.ferris' },
    { id: 6, src: '/colorful-carousel.png', altKey: 'home.gallery.carousel' },
    { id: 7, src: '/family-water-rapids.png', altKey: 'home.gallery.rapids' },
    { id: 8, src: '/amusement-park-tech.png', altKey: 'home.gallery.tech' },
    { id: 9, src: '/dark-dragon-coaster.png', altKey: 'home.gallery.darkCoaster' },
    { id: 10, src: '/colorful-water-park.png', altKey: 'home.gallery.waterPark' },
    { id: 11, src: '/roller-coaster-thunder-mountain.png', altKey: 'home.gallery.thunder' },
    { id: 12, src: '/kids-playing-carnival-games.png', altKey: 'home.gallery.kids' },
];

// Reusable Arrow SVG Icon Component
const ArrowIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m15 18-6-6 6-6" />
    </svg>
);


const ImageCarousel = () => {
    const t = useTranslations();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to handle manual scrolling
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const firstItem = scrollContainerRef.current.children[0] as HTMLElement;
            if (!firstItem) return;
            // The scroll amount is the width of one item plus the gap (space-x-4 -> 1rem -> 16px)
            const scrollAmount = firstItem.offsetWidth + 16;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const startAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 1) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll('right');
                }
            }
        }, 3000);
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">{t('home.gallery.title')}</h2>
            <div 
                className="relative"
                onMouseEnter={stopAutoScroll}
                onMouseLeave={startAutoScroll}
            >
                {/* Left Arrow Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 transition-colors duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('home.gallery.left')}
                >
                    <ArrowIcon className="w-6 h-6 text-gray-700" />
                </button>

                {/* The main scrollable container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {imageData.map((image) => (
                        <div key={image.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 snap-start transition-transform duration-300 hover:scale-105">
                             <div className="h-80 w-full rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={image.src}
                                    alt={t(image.altKey as any)}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                             </div>
                             <p className="mt-2 text-center text-sm text-gray-600 truncate">{t(image.altKey as any)}</p>
                        </div>
                    ))}
                </div>

                {/* Right Arrow Button */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 transition-colors duration-300 shadow-md"
                    aria-label={t('home.gallery.right')}
                >
                    <ArrowIcon className="w-6 h-6 text-gray-700 transform rotate-180" />
                </button>
            </div>
        </div>
    );
};

export default ImageCarousel;

