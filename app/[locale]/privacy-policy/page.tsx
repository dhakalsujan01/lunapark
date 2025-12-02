import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Cookie, Mail, Phone, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Luna Amusement Park's privacy policy and data protection information. Learn how we protect your personal information.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-muted">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-blue-800 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-serif font-black mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Quick Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold">Secure</h3>
                <p className="text-sm text-muted-foreground">Your data is encrypted and stored securely</p>
              </div>
              <div className="text-center">
                <Cookie className="h-8 w-8 text-blue-800 mx-auto mb-2" />
                <h3 className="font-semibold">Transparent</h3>
                <p className="text-sm text-muted-foreground">Clear information about what we collect</p>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Your Control</h3>
                <p className="text-sm text-muted-foreground">You control your data and privacy settings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                When you visit Luna Amusement Park or use our services, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name, email address, and phone number when you create an account</li>
                <li>Payment information when purchasing tickets (processed securely through Stripe)</li>
                <li>Emergency contact information for safety purposes</li>
                <li>Communication preferences and language settings</li>
                <li>Photos and videos you choose to share with us</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 mt-6">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referral source and search terms used</li>
                <li>Location data (if you grant permission)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Process ticket purchases and manage your bookings</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send important updates about your visit or account</li>
                <li>Improve our website and services</li>
                <li>Ensure safety and security of all visitors</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Cookies and Tracking</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Necessary Cookies (Required)</h4>
                  <p className="text-sm text-muted-foreground">
                    Essential for website functionality, authentication, and security.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Analytics Cookies (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors use our website to improve our services.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Marketing Cookies (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Used to show you relevant ads and measure campaign effectiveness.
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4">
                You can manage your cookie preferences at any time using our cookie settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Service Providers:</strong> Payment processors (Stripe), email services, hosting providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Emergency Situations:</strong> To protect safety of visitors and staff</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights and Choices</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your personal data</li>
                <li><strong>Restrict:</strong> Limit how we process your data</li>
                <li><strong>Object:</strong> Opt out of certain data processing</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Opt out of marketing communications</li>
              </ul>
              
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us using the information below.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground mb-4">
                We implement robust security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and staff training</li>
                <li>Secure data storage with encryption at rest</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                We are committed to protecting children's privacy. We do not knowingly collect personal 
                information from children under 13 without parental consent. If you believe we have 
                collected information from a child under 13, please contact us immediately.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance 
                with applicable privacy laws.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Updates to This Policy</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any 
                material changes by posting the new policy on our website and updating the 
                "Last updated" date at the top of this page.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  If you have any questions about this privacy policy or our data practices, 
                  please contact us:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-sm text-muted-foreground">privacy@lunapark.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Address</h4>
                      <p className="text-sm text-muted-foreground">
                        123 Fun Street<br />
                        Entertainment City, EC 12345
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                  <p className="text-sm text-muted-foreground">
                    For specific privacy concerns or to exercise your rights, you can also contact 
                    our Data Protection Officer at: <strong>dpo@lunapark.com</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
