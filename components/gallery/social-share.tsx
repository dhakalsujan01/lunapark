import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Facebook, Instagram, Youtube, Camera, Hash } from "lucide-react"

export function SocialShare() {
  const socialPlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      handle: "@AdventureParkOfficial",
      followers: "125K",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Instagram",
      icon: Instagram,
      handle: "@adventurepark",
      followers: "89K",
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    },
    {
      name: "TikTok",
      icon: Hash,
      handle: "@adventurepark",
      followers: "156K",
      color: "bg-black hover:bg-gray-800",
    },
    {
      name: "YouTube",
      icon: Youtube,
      handle: "Adventure Park",
      followers: "45K",
      color: "bg-red-600 hover:bg-red-700",
    },
  ]

  const hashtags = [
    "#AdventurePark",
    "#ThrillSeeker",
    "#FamilyFun",
    "#AmusementPark",
    "#Memories",
    "#Adventure",
    "#FunTimes",
    "#Excitement",
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-park-text-primary mb-4">Share Your Adventure</h2>
          <p className="text-lg text-park-text-secondary max-w-2xl mx-auto">
            Connect with us on social media and share your amazing Adventure Park experiences with the world
          </p>
        </div>

        {/* Social Media Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {socialPlatforms.map((platform) => (
            <Card key={platform.name} className="border-0 shadow-lg bg-white park-card-hover">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${platform.color} flex items-center justify-center`}
                >
                  <platform.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-park-text-primary mb-2">{platform.name}</h3>
                <p className="text-park-text-secondary mb-2">{platform.handle}</p>
                <p className="text-sm text-park-primary font-medium mb-4">{platform.followers} followers</p>
                <Button size="sm" className={`${platform.color} text-white border-0`}>
                  Follow Us
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Share Your Photos Section */}
        <Card className="border-0 shadow-lg bg-park-surface">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl park-gradient flex items-center justify-center">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-park-text-primary mb-4">Share Your Photos</h3>
            <p className="text-lg text-park-text-secondary mb-6 max-w-2xl mx-auto">
              Tag us in your Adventure Park photos and use our hashtags to be featured on our social media channels!
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {hashtags.map((hashtag) => (
                <span
                  key={hashtag}
                  className="bg-white px-4 py-2 rounded-full text-park-primary font-medium text-sm border border-park-primary/20"
                >
                  {hashtag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="park-gradient text-white hover:opacity-90">
                <Camera className="w-5 h-5 mr-2" />
                Upload Your Photo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-park-primary text-park-primary hover:bg-park-primary hover:text-white bg-transparent"
              >
                View Featured Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}