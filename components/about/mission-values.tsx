import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Leaf, Users, Star, Zap } from "lucide-react"

export function MissionValues() {
  const values = [
    {
      icon: Heart,
      title: "Family First",
      description: "Creating magical experiences that bring families together and create lasting memories.",
    },
    {
      icon: Shield,
      title: "Safety Always",
      description: "Maintaining the highest safety standards while delivering thrilling and exciting experiences.",
    },
    {
      icon: Leaf,
      title: "Environmental Care",
      description: "Protecting our planet through sustainable practices and environmental responsibility.",
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Supporting our local community and contributing to economic growth and development.",
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Striving for excellence in every aspect of our operations and guest experiences.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously innovating to create new and exciting attractions and experiences.",
    },
  ]

  return (
    <section className="py-16 bg-park-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-park-text-primary mb-4">Our Mission & Values</h2>
          <p className="text-lg text-park-text-secondary max-w-3xl mx-auto leading-relaxed">
            At Adventure Park, our mission is to create extraordinary experiences that inspire joy, wonder, and
            connection. Our values guide everything we do, from the attractions we build to the service we provide.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="border-0 shadow-xl bg-white mb-16 park-card-hover">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl park-gradient flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-park-text-primary mb-6">Our Mission</h3>
            <p className="text-lg text-park-text-secondary leading-relaxed max-w-4xl mx-auto">
              "To create a world where families can escape the ordinary and immerse themselves in extraordinary
              adventures. We believe that the magic of shared experiences has the power to strengthen bonds, create
              lasting memories, and inspire wonder in people of all ages."
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white park-card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl park-gradient flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-park-text-primary mb-3">{value.title}</h3>
                <p className="text-park-text-secondary leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}