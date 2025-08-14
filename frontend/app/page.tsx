import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Government Bar */}
      <div className="bg-navy text-white py-2">
        <div className="container mx-auto px-4 text-center text-sm">
          <span>भारत सरकार | Government of India</span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b-4 border-saffron shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center border-2 border-saffron">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-saffron rounded-full mx-auto mb-1"></div>
                    <div className="w-3 h-1 bg-white rounded mx-auto mb-1"></div>
                    <div className="w-3 h-3 bg-green rounded-full mx-auto"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-navy font-bold text-xl leading-tight">
                    Ministry of Statistics & Programme Implementation
                  </h1>
                  <p className="text-grey text-sm font-medium">सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय</p>
                  <p className="text-grey text-xs">Government of India</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-right text-sm text-grey">
              <p>Helpline: 1800-11-1234</p>
              <p>Email: support@mospi.gov.in</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-navy mb-4 leading-tight">
              Smart AI-Powered Survey Platform
            </h1>
            <div className="w-24 h-1 bg-saffron mx-auto mb-6"></div>
            <p className="text-xl text-grey mb-4 leading-relaxed max-w-3xl mx-auto">
              Empowering data collection and analysis for informed policy decisions. Participate in national surveys or
              manage survey operations with our advanced AI-driven platform.
            </p>
            <p className="text-lg text-navy font-semibold mb-8">
              "सबका साथ, सबका विकास, सबका विश्वास" - Building India Through Data
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/survey">
              <Button className="bg-saffron hover:bg-saffron/90 text-white px-10 py-4 text-lg font-semibold rounded-lg shadow-lg">
                Start Survey
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-2 border-green text-green hover:bg-green hover:text-white px-10 py-4 text-lg font-semibold bg-transparent rounded-lg"
              >
                Admin Login
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="border-l-4 border-l-saffron">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-navy mb-2">10M+</div>
                <div className="text-grey">Citizens Surveyed</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-navy mb-2">500+</div>
                <div className="text-grey">Districts Covered</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-navy">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-navy mb-2">99.9%</div>
                <div className="text-grey">Data Accuracy</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center p-0">
                <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 bg-saffron rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">AI-Powered Analytics</h3>
                <p className="text-grey leading-relaxed">
                  Advanced artificial intelligence for smart survey design, real-time analysis, and predictive insights
                  for policy making.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center p-0">
                <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">भा</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Multilingual Support</h3>
                <p className="text-grey leading-relaxed">
                  Support for 22 official Indian languages ensuring inclusive participation across all demographics and
                  regions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center p-0">
                <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Real-time Dashboard</h3>
                <p className="text-grey leading-relaxed">
                  Comprehensive data visualization and analytics dashboard for monitoring survey progress and generating
                  insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">Supporting National Initiatives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-saffron/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-saffron text-2xl font-bold">DI</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Digital India</h4>
              <p className="text-sm text-grey">Digitizing survey processes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green text-2xl font-bold">SB</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Swachh Bharat</h4>
              <p className="text-sm text-grey">Cleanliness surveys</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-navy text-2xl font-bold">AB</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Atmanirbhar Bharat</h4>
              <p className="text-sm text-grey">Self-reliance metrics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-grey/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-grey text-2xl font-bold">SDG</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">SDG Monitoring</h4>
              <p className="text-sm text-grey">Sustainable development goals</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-navy mb-8">Security & Privacy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-green text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Data Protection</h4>
              <p className="text-grey text-sm">End-to-end encryption and secure data handling</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-saffron text-2xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Privacy Compliant</h4>
              <p className="text-grey text-sm">Adheres to Indian data protection laws</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-navy text-2xl">✓</span>
              </div>
              <h4 className="font-semibold text-navy mb-2">Government Certified</h4>
              <p className="text-grey text-sm">Approved by cybersecurity standards</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-saffron">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/survey" className="hover:text-saffron transition-colors">
                    Take Survey
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-saffron transition-colors">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link href="/results" className="hover:text-saffron transition-colors">
                    Survey Results
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-saffron">Government</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://mospi.gov.in" className="hover:text-saffron transition-colors">
                    MoSPI Website
                  </a>
                </li>
                <li>
                  <a href="https://india.gov.in" className="hover:text-saffron transition-colors">
                    India Portal
                  </a>
                </li>
                <li>
                  <a href="https://digitalindia.gov.in" className="hover:text-saffron transition-colors">
                    Digital India
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-saffron">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>Helpline: 1800-11-1234</li>
                <li>Email: support@mospi.gov.in</li>
                <li>Hours: 9 AM - 6 PM (Mon-Fri)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-saffron">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-saffron transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-saffron transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-saffron transition-colors">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-grey/30 pt-8 text-center">
            <p className="mb-2">© 2024 Government of India, Ministry of Statistics and Programme Implementation</p>
            <p className="text-sm text-gray-300">
              Last Updated: December 2024 | Website Content Managed by MoSPI, Government of India
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
