// src/app/page.tsx or your page component file
"use client";

import { useState } from "react";
import { Carousel3D } from "./Carousel3D";
import { TextType } from "./TextType";
import { useTranslations } from "next-intl";

export default function NewGal() {
  const t = useTranslations('gallery.attractionsCarousel')
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carousel data with translations
  const carouselItems = [
    { id: 1, title: t('items.thrillingRollerCoaster.title'), image: "/thrilling-roller-coaster.png", description: t('items.thrillingRollerCoaster.description') },
    { id: 2, title: t('items.ferrisWheelSunset.title'), image: "/ferris-wheel-at-sunset.png", description: t('items.ferrisWheelSunset.description') },
    { id: 3, title: t('items.colorfulCarouselHorses.title'), image: "/colorful-carousel-horses.png", description: t('items.colorfulCarouselHorses.description') },
    { id: 4, title: t('items.waterRideSplashZone.title'), image: "/water-ride-splash-zone.png", description: t('items.waterRideSplashZone.description') },
    { id: 5, title: t('items.amusementParkAerialView.title'), image: "/amusement-park-aerial-view.png", description: t('items.amusementParkAerialView.description') },
  ];

  const currentItem = carouselItems[currentIndex];

  return (
    <section className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <Carousel3D 
            items={carouselItems} 
            currentIndex={currentIndex} 
            onIndexChange={setCurrentIndex} 
          />
        </div>

        <div className="mt-12 text-center max-w-3xl mx-auto h-48">
          {/* Using the currentItem.id as a `key` is crucial. */}
          {/* It tells React to create a NEW TextType instance when the item changes, */}
          {/* which correctly resets the animation from the beginning. */}
          <TextType
            key={`${currentItem.id}-title`}
            as="h3"
            text={currentItem.title}
            typingSpeed={70}
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
          />
          <TextType
            key={`${currentItem.id}-desc`}
            as="p"
            text={currentItem.description}
            typingSpeed={20}
            initialDelay={500} // Start description typing slightly after title
            className="text-base sm:text-lg text-gray-600 leading-relaxed"
          />
        </div>
      </div>
    </section>
  );
}