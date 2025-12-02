import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Ride from '@/models/Ride'
import Package from '@/models/Package'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  try {
    await connectDB()
    
    // Get all published rides and packages for dynamic pages
    const [rides, packages] = await Promise.all([
      Ride.find({ isPublished: true }).select('_id title updatedAt').lean(),
      Package.find({ isPublished: true }).select('_id title updatedAt').lean()
    ])

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/attractions`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/tickets`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/safety`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/auth/signin`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ]

    // Dynamic ride pages
    const ridePages = rides.map((ride) => ({
      url: `${baseUrl}/attractions/${ride._id}`,
      lastModified: new Date(ride.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Dynamic package pages  
    const packagePages = packages.map((pkg) => ({
      url: `${baseUrl}/tickets/${pkg._id}`,
      lastModified: new Date(pkg.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...ridePages, ...packagePages]
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if database connection fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
