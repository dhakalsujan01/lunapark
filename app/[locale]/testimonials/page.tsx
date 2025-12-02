import { Metadata } from "next"
import { TestimonialForm } from "@/components/testimonial-form"

export const metadata: Metadata = {
  title: "Share Your Experience - Luna Park Testimonials",
  description: "Share your Luna Park experience with other visitors. Only verified ticket holders can submit reviews.",
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Share Your Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help future visitors by sharing your honest review of Luna Park. 
            Only verified ticket holders can submit testimonials.
          </p>
        </div>
        
        <TestimonialForm />
      </div>
    </div>
  )
}
