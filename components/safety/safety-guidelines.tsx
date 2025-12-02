import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Users, Clock } from "lucide-react"

export function SafetyGuidelines() {
  const emergencyInfo = [
    {
      icon: Phone,
      title: "Emergency Contact",
      content: "Call 911 or use emergency phones located throughout the park",
      action: "Emergency phones are marked with red signs",
    },
    {
      icon: MapPin,
      title: "First Aid Stations",
      content: "Located at Main Entrance, Central Plaza, and Water Park",
      action: "Look for the red cross symbols on park maps",
    },
    {
      icon: Users,
      title: "Lost Children",
      content: "Report to any team member or visit Guest Services immediately",
      action: "Child identification wristbands available at entrance",
    },
    {
      icon: Clock,
      title: "Weather Policy",
      content: "Rides may close during severe weather for safety",
      action: "Check our app for real-time ride status updates",
    },
  ]

  return (
    <section className="py-16 bg-park-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-park-text-primary mb-4">Emergency Information</h2>
          <p className="text-lg text-park-text-secondary max-w-2xl mx-auto">
            Important information for emergencies and safety situations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {emergencyInfo.map((info, index) => (
            <Card key={index} className="border-0 shadow-md bg-white park-card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl park-gradient flex items-center justify-center">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-park-text-primary mb-2">{info.title}</h3>
                <p className="text-park-text-secondary text-sm mb-3 leading-relaxed">{info.content}</p>
                <p className="text-xs text-park-primary font-medium">{info.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Safety Tips */}
        <Card className="border-0 shadow-lg bg-blue-50 border-blue-200">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Additional Safety Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">Before You Ride</h4>
                <ul className="space-y-2 text-blue-600 text-sm">
                  <li>• Read all posted safety information</li>
                  <li>• Secure loose items in lockers or with non-riders</li>
                  <li>• Follow height and health restrictions</li>
                  <li>• Listen carefully to ride operator instructions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">During Your Visit</h4>
                <ul className="space-y-2 text-blue-600 text-sm">
                  <li>• Stay hydrated and take breaks in shade</li>
                  <li>• Keep your group together, especially children</li>
                  <li>• Report any safety concerns to team members</li>
                  <li>• Follow all posted signs and barriers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}