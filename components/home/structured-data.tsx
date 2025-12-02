export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AmusementPark",
    "name": "Luna Amusement Park",
    "description": "Experience the magic at Luna Amusement Park - 20+ thrilling rides, family attractions, and unforgettable memories await!",
    "url": "https://lunapark.com",
    "logo": "https://lunapark.com/placeholder-logo.png",
    "image": "https://lunapark.com/amusement-park-aerial-view.png",
    "telephone": "(555) 123-4567",
    "email": "info@lunapark.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fun Street",
      "addressLocality": "Entertainment City",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": [
      "Mo-Th 10:00-21:00",
      "Fr-Sa 10:00-23:00", 
      "Su 10:00-21:00"
    ],
    "priceRange": "€€",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Luna Park Tickets",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Single Ride Ticket"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "All-Day Pass"
          }
        }
      ]
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking"
      },
      {
        "@type": "LocationFeatureSpecification", 
        "name": "Wheelchair Accessible"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Food Court"
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}
