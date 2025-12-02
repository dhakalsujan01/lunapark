const mongoose = require('mongoose');

// Sample rides data
const sampleRides = [
  {
    title: "Thunder Bolt Extreme",
    description: "Experience the ultimate adrenaline rush on our most extreme roller coaster. With multiple inversions, steep drops, and speeds reaching 80 mph, this is not for the faint of heart.",
    shortDescription: "Ultimate adrenaline rush with multiple inversions and 80 mph speeds",
    price: 25,
    image: "/roller-coaster-thunder-mountain.png",
    images: ["/roller-coaster-thunder-mountain.png"],
    restrictions: {
      minHeight: 54,
      minAge: 12,
      healthWarnings: ["Not recommended for people with heart conditions", "Avoid if pregnant", "Secure loose items"]
    },
    isPublished: true,
    category: "Thrill Rides",
    duration: 4,
    capacity: 24,
    thrillLevel: 5,
    seo: {
      metaTitle: "Thunder Bolt Extreme - Luna Amusement Park",
      metaDescription: "Experience the ultimate adrenaline rush on our most extreme roller coaster",
      keywords: ["roller coaster", "thrill ride", "extreme", "adrenaline"]
    },
    translations: {
      en: {
        title: "Thunder Bolt Extreme",
        description: "Experience the ultimate adrenaline rush on our most extreme roller coaster",
        shortDescription: "Ultimate adrenaline rush with multiple inversions and 80 mph speeds"
      },
      ru: {
        title: "Громовой Болт Экстрим",
        description: "Испытайте максимальный выброс адреналина на наших самых экстремальных американских горках",
        shortDescription: "Максимальный выброс адреналина с множественными переворотами и скоростью 130 км/ч"
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  },
  {
    title: "Family Carousel",
    description: "A classic carousel perfect for the whole family. Beautiful hand-carved horses and gentle music create a magical experience for all ages.",
    shortDescription: "Classic carousel with hand-carved horses for the whole family",
    price: 8,
    image: "/carousel-family.png",
    images: ["/carousel-family.png"],
    restrictions: {
      minHeight: 36,
      minAge: 2
    },
    isPublished: true,
    category: "Family Rides",
    duration: 3,
    capacity: 32,
    thrillLevel: 1,
    seo: {
      metaTitle: "Family Carousel - Luna Amusement Park",
      metaDescription: "Classic carousel perfect for the whole family",
      keywords: ["carousel", "family ride", "gentle", "classic"]
    },
    translations: {
      en: {
        title: "Family Carousel",
        description: "A classic carousel perfect for the whole family",
        shortDescription: "Classic carousel with hand-carved horses for the whole family"
      },
      ru: {
        title: "Семейная Карусель",
        description: "Классическая карусель идеально подходит для всей семьи",
        shortDescription: "Классическая карусель с резными лошадками для всей семьи"
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  },
  {
    title: "Aqua Rapids",
    description: "Splash through thrilling water rapids on this exciting water ride. Get ready to get wet as you navigate through rushing currents and unexpected waterfalls.",
    shortDescription: "Thrilling water rapids with rushing currents and waterfalls",
    price: 18,
    image: "/water-rapids.png",
    images: ["/water-rapids.png"],
    restrictions: {
      minHeight: 48,
      minAge: 8,
      healthWarnings: ["You will get wet", "Secure all belongings"]
    },
    isPublished: true,
    category: "Water Rides",
    duration: 6,
    capacity: 8,
    thrillLevel: 3,
    seo: {
      metaTitle: "Aqua Rapids - Luna Amusement Park",
      metaDescription: "Splash through thrilling water rapids on this exciting water ride",
      keywords: ["water ride", "rapids", "splash", "waterfall"]
    },
    translations: {
      en: {
        title: "Aqua Rapids",
        description: "Splash through thrilling water rapids on this exciting water ride",
        shortDescription: "Thrilling water rapids with rushing currents and waterfalls"
      },
      ru: {
        title: "Аква Пороги",
        description: "Промчитесь через захватывающие водные пороги на этом захватывающем водном аттракционе",
        shortDescription: "Захватывающие водные пороги с бурными течениями и водопадами"
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  },
  {
    title: "Sky Ferris Wheel",
    description: "Take in breathtaking panoramic views of the entire park from our giant Ferris wheel. Perfect for a romantic evening or family bonding time.",
    shortDescription: "Giant Ferris wheel with panoramic views of the entire park",
    price: 12,
    image: "/ferris-wheel.png",
    images: ["/ferris-wheel.png"],
    restrictions: {
      minHeight: 42,
      minAge: 6
    },
    isPublished: true,
    category: "Family Rides",
    duration: 8,
    capacity: 6,
    thrillLevel: 2,
    seo: {
      metaTitle: "Sky Ferris Wheel - Luna Amusement Park",
      metaDescription: "Take in breathtaking panoramic views from our giant Ferris wheel",
      keywords: ["ferris wheel", "panoramic views", "family", "romantic"]
    },
    translations: {
      en: {
        title: "Sky Ferris Wheel",
        description: "Take in breathtaking panoramic views from our giant Ferris wheel",
        shortDescription: "Giant Ferris wheel with panoramic views of the entire park"
      },
      ru: {
        title: "Небесное Колесо Обозрения",
        description: "Полюбуйтесь захватывающими панорамными видами с нашего гигантского колеса обозрения",
        shortDescription: "Гигантское колесо обозрения с панорамным видом на весь парк"
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  },
  {
    title: "Dragon's Flight",
    description: "Soar through the air like a dragon on this suspended roller coaster. Experience the sensation of flying as you navigate through loops and corkscrews.",
    shortDescription: "Suspended roller coaster that makes you feel like you're flying",
    price: 22,
    image: "/suspended-coaster.png",
    images: ["/suspended-coaster.png"],
    restrictions: {
      minHeight: 52,
      minAge: 10,
      healthWarnings: ["Secure all loose items", "Not recommended for people with back problems"]
    },
    isPublished: true,
    category: "Thrill Rides",
    duration: 5,
    capacity: 20,
    thrillLevel: 4,
    seo: {
      metaTitle: "Dragon's Flight - Luna Amusement Park",
      metaDescription: "Soar through the air like a dragon on this suspended roller coaster",
      keywords: ["suspended coaster", "dragon", "flying", "thrill"]
    },
    translations: {
      en: {
        title: "Dragon's Flight",
        description: "Soar through the air like a dragon on this suspended roller coaster",
        shortDescription: "Suspended roller coaster that makes you feel like you're flying"
      },
      ru: {
        title: "Полет Дракона",
        description: "Парите в воздухе как дракон на этих подвесных американских горках",
        shortDescription: "Подвесные американские горки, которые заставляют вас чувствовать, что вы летите"
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  }
];

// Add more rides to test pagination (25 total)
for (let i = 6; i <= 25; i++) {
  const categories = ["Thrill Rides", "Family Rides", "Water Rides", "Kiddie Rides"];
  const thrillLevels = [1, 2, 3, 4, 5];
  const prices = [8, 12, 15, 18, 22, 25];
  
  sampleRides.push({
    title: `Adventure Ride ${i}`,
    description: `This is sample ride ${i} for testing pagination. It features exciting adventures and fun for everyone.`,
    shortDescription: `Sample ride ${i} with exciting adventures and fun`,
    price: prices[Math.floor(Math.random() * prices.length)],
    image: `/placeholder-ride-${i}.png`,
    images: [`/placeholder-ride-${i}.png`],
    restrictions: {
      minHeight: Math.floor(Math.random() * 30) + 36,
      minAge: Math.floor(Math.random() * 8) + 3
    },
    isPublished: true,
    category: categories[Math.floor(Math.random() * categories.length)],
    duration: Math.floor(Math.random() * 8) + 2,
    capacity: Math.floor(Math.random() * 20) + 10,
    thrillLevel: thrillLevels[Math.floor(Math.random() * thrillLevels.length)],
    seo: {
      metaTitle: `Adventure Ride ${i} - Luna Amusement Park`,
      metaDescription: `Sample ride ${i} for testing pagination`,
      keywords: ["sample", "ride", "test", "pagination"]
    },
    translations: {
      en: {
        title: `Adventure Ride ${i}`,
        description: `Sample ride ${i} for testing pagination`,
        shortDescription: `Sample ride ${i} with exciting adventures and fun`
      },
      ru: {
        title: `Приключенческий Аттракцион ${i}`,
        description: `Образцовый аттракцион ${i} для тестирования пагинации`,
        shortDescription: `Образцовый аттракцион ${i} с захватывающими приключениями и весельем`
      }
    },
    analytics: {
      views: 0,
      bookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0
    },
    status: {
      isActive: true,
      maintenanceMode: false
    }
  });
}

async function seedRides() {
  try {
    // Connect to MongoDB - use environment variable or default
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luna-park';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at:', mongoUri);

    // Define the Ride schema inline since we can't import the model directly
    const rideSchema = new mongoose.Schema({
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      shortDescription: { type: String, required: true, maxlength: 200 },
      price: { type: Number, required: true, min: 0 },
      image: { type: String, required: true },
      images: [String],
      restrictions: {
        minHeight: Number,
        maxHeight: Number,
        minAge: Number,
        maxAge: Number,
        healthWarnings: [String]
      },
      isPublished: { type: Boolean, default: false },
      category: { type: String, required: true },
      duration: { type: Number, required: true },
      capacity: { type: Number, required: true },
      thrillLevel: { type: Number, required: true, min: 1, max: 5 },
      seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        slug: String,
        canonicalUrl: String,
        ogTitle: String,
        ogDescription: String,
        ogImage: String,
        twitterTitle: String,
        twitterDescription: String,
        twitterImage: String,
        structuredData: mongoose.Schema.Types.Mixed
      },
      translations: {
        en: {
          title: String,
          description: String,
          shortDescription: String
        },
        ru: {
          title: String,
          description: String,
          shortDescription: String
        }
      },
      analytics: {
        views: { type: Number, default: 0 },
        bookings: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
      },
      status: {
        isActive: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false },
        lastMaintenance: Date,
        nextMaintenance: Date
      }
    }, {
      timestamps: true
    });

    const Ride = mongoose.model('Ride', rideSchema);
    
    // Clear existing rides
    await Ride.deleteMany({});
    console.log('Cleared existing rides');

    // Insert sample rides
    const result = await Ride.insertMany(sampleRides);
    console.log(`Successfully inserted ${result.length} rides`);

    // Display some stats
    const totalRides = await Ride.countDocuments();
    const publishedRides = await Ride.countDocuments({ isPublished: true });
    const thrillRides = await Ride.countDocuments({ category: "Thrill Rides" });
    const familyRides = await Ride.countDocuments({ category: "Family Rides" });

    console.log('\n=== Rides Summary ===');
    console.log(`Total Rides: ${totalRides}`);
    console.log(`Published: ${publishedRides}`);
    console.log(`Thrill Rides: ${thrillRides}`);
    console.log(`Family Rides: ${familyRides}`);
    console.log('=====================\n');

    console.log('Sample rides seeded successfully!');
    console.log('You can now test the pagination system with 25 rides.');
    
  } catch (error) {
    console.error('Error seeding rides:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedRides();
