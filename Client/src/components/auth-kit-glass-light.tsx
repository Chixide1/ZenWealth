import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Laptop } from 'lucide-react'

export function AuthKitGlassLight() {
  const [email, setEmail] = useState('')

  return (
    <div className="w-full bg-gradient-to-br from-gray-100 to-white flex flex-col items-center justify-center relative px-4 py-12">
      {/* Grid background */}
      <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] gap-0.5 opacity-[0.15]">
        {Array.from({ length: 1600 }).map((_, i) => (
          <div key={i} className="bg-gray-300" />
        ))}
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200 rounded-full blur-[100px] opacity-50" />

      {/* Content */}
      <div className="bg-white/0 relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-6xl font-bold text-gray-800 drop-shadow-sm">ZenWealth</h1>
          <p className="text-gray-600">
            Take control of your finances.
          </p>
        </div>
        
        {/* Main card */}
        <Card className="w-full bg-white/0.03 border-gray-200 backdrop-blur-[1px] shadow-xl p-6 relative">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-gray-800">Sign in to SuperApp</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white/80 transition-all duration-300"
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300">
                Continue
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full border-gray-300 bg-white/50 hover:bg-white/80 text-gray-800 transition-all duration-300">
                  <Laptop className="mr-2 h-4 w-4" />
                  Continue with Windows
                </Button>
                <Button variant="outline" className="w-full border-gray-300 bg-white/50 hover:bg-white/80 text-gray-800 transition-all duration-300">
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Office 365
                </Button>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don&apos;t have an account? </span>
              <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 transition-all duration-300">
                Sign up
              </Button>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}