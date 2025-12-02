import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react"

export function SafetyRules() {
  const rules = [
    {
      category: "Height & Age Requirements",
      icon: Users,
      items: [
        'Children under 36" must be accompanied by an adult on all rides',
        "Height restrictions are strictly enforced for safety reasons",
        "Age recommendations are guidelines for optimal enjoyment",
        "Pregnant guests should avoid thrill rides and water attractions",
      ],
    },
    {
      category: "Ride Safety",
      icon: AlertTriangle,
      items: [
        "Follow all posted ride instructions and operator directions",
        "Secure all loose articles before boarding rides",
        "Keep hands, arms, and legs inside ride vehicles at all times",
        "Do not attempt to exit rides until completely stopped",
      ],
    },
    {
      category: "Health Conditions",
      icon: CheckCircle,
      items: [
        "Guests with heart conditions should consult physicians before riding",
        "Those with back, neck, or other medical conditions should use caution",
        "Inform ride operators of any medical devices or conditions",
        "Take breaks and stay hydrated throughout your visit",
      ],
    },
  ]

  const prohibited = [
    "Outside food and beverages (except for medical/dietary needs)",
    "Weapons of any kind, including toy weapons",
    "Glass containers and breakable items",
    "Pets (except certified service animals)",
    "Professional photography equipment without permit",
    "Smoking in non-designated areas",
    "Alcohol consumption (except in designated areas)",
    "Inappropriate clothing or offensive language",
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-park-text-primary mb-4">Park Rules & Guidelines</h2>
          <p className="text-lg text-park-text-secondary max-w-2xl mx-auto">
            Please familiarize yourself with our safety rules to ensure a fun and safe experience for everyone
          </p>
        </div>

        {/* Safety Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {rules.map((rule, index) => (
            <Card key={index} className="border-0 shadow-lg bg-park-surface">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl park-gradient flex items-center justify-center">
                  <rule.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-park-text-primary">{rule.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {rule.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-park-success mt-0.5 flex-shrink-0" />
                      <span className="text-park-text-secondary text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prohibited Items */}
        <Card className="border-0 shadow-lg bg-red-50 border-red-200">
          <CardHeader className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-600 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-red-700">Prohibited Items</CardTitle>
            <p className="text-red-600">The following items are not permitted in the park</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibited.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}