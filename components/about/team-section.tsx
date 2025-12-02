import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, Mail } from "lucide-react"

export function TeamSection() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Chief Executive Officer",
      bio: "With over 20 years in the entertainment industry, Sarah leads Adventure Park's vision for creating magical experiences.",
      image: "/placeholder.svg?height=300&width=300&text=Sarah+Johnson",
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      bio: "Michael ensures every aspect of park operations runs smoothly, from ride maintenance to guest services.",
      image: "/placeholder.svg?height=300&width=300&text=Michael+Chen",
    },
    {
      name: "Emily Rodriguez",
      role: "Creative Director",
      bio: "Emily brings imagination to life, designing new attractions and experiences that captivate our guests.",
      image: "/placeholder.svg?height=300&width=300&text=Emily+Rodriguez",
    },
    {
      name: "David Thompson",
      role: "Safety Director",
      bio: "David's expertise in safety engineering ensures that every thrill comes with the highest safety standards.",
      image: "/placeholder.svg?height=300&width=300&text=David+Thompson",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-park-text-primary mb-4">Meet <span style={{ color: '#155dfc' }}>Our Team</span></h2>
          <p className="text-lg text-park-text-secondary max-w-2xl mx-auto">
            The passionate individuals behind Adventure Park who work tirelessly to create extraordinary experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white park-card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-park-surface">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-park-text-primary mb-1">{member.name}</h3>
                <p className="text-park-primary font-medium mb-3">{member.role}</p>
                <p className="text-park-text-secondary text-sm leading-relaxed mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <button className="w-8 h-8 bg-park-primary/10 hover:bg-park-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 bg-park-primary/10 hover:bg-park-primary hover:text-white rounded-full flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}