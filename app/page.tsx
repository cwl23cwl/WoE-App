import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo />
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Learn English with
              <span className="text-orange-500 block">Pictures & Stories</span>
            </h1>
            <p className="text-xl leading-8 text-gray-600 mb-12 max-w-3xl mx-auto">
              Write on English helps ESL students learn through drawing and writing. 
              Teachers create fun assignments, students express ideas with pictures and words.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4">
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  Sign In to Classroom
                </Button>
              </Link>
            </div>

            {/* Quick Access */}
            <div className="flex justify-center mb-16">
              <Link href="/access">
                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  📝 Have an assignment code? Quick access →
                </Button>
              </Link>
            </div>

            {/* Demo Account Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3">Try Demo Accounts:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Teacher:</strong> teacher@example.com / teacher123
                </div>
                <div>
                  <strong>Student:</strong> student1@example.com / student123
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for ESL Learning
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple tools that help teachers create engaging assignments and students express their ideas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Draw & Write</h3>
              <p className="text-gray-600">
                Students use pictures to tell stories and practice writing in English
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Teaching</h3>
              <p className="text-gray-600">
                Create assignments, track progress, and give feedback all in one place
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">See Progress</h3>
              <p className="text-gray-600">
                Watch students improve their English writing skills over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center">
            <Logo showText={false} />
            <span className="ml-3 text-gray-600">
              © 2024 Write on English. Making English learning fun.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}