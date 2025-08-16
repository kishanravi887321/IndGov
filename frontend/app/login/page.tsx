"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { adminApi } from "@/services/api"
import Link from "next/link"

// Google OAuth script
declare global {
  interface Window {
    google: any
    googleCallback: (response: any) => void
  }
}

interface FormData {
  email: string
  password: string
  otp: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    otp: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOtpField, setShowOtpField] = useState(false)
  const [loginType, setLoginType] = useState<"admin" | "user">("user")
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' })
      console.log('Backend health check:', response.status)
    } catch (error) {
      console.warn('Backend not available:', error)
    }
  }

  useEffect(() => {
    testBackendConnection()
  }, [])

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleOAuth = () => {
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular",
            }
          )
          
          console.log('Google OAuth initialized successfully')
        } catch (error) {
          console.error('Error initializing Google OAuth:', error)
        }
      } else {
        console.warn('Google OAuth not available or client ID missing')
      }
    }

    // Load Google OAuth script
    if (!window.google) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initializeGoogleOAuth
      script.onerror = () => {
        console.error('Failed to load Google OAuth script')
        setError('Failed to load Google OAuth. Please try email login.')
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleOAuth()
    }
  }, [])

  // Handle Google OAuth callback
  const handleGoogleCallback = async (response: any) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Google OAuth response:', response)
      
      // Check if we have the credential token
      if (!response.credential) {
        setError("Google authentication failed - no credential received")
        return
      }

      // Send the ID token to your backend
      const backendResponse = await fetch(`${API_BASE_URL}/api/users/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential,
        }),
      })

      console.log('Google auth API response status:', backendResponse.status)

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        console.log('Google auth API response data:', data)
        
        // Check if user data exists
        if (data && data.user) {
          // Login user in context
          login({
            id: data.user.id || Date.now().toString(),
            email: data.user.email || 'unknown@example.com',
            role: data.user.role || 'user',
            name: data.user.name || data.user.email
          }, data.token || '')
          
          toast({ title: "Google login successful!" })
          
          // Redirect based on user role
          if (data.user.role === 'admin') {
            router.push("/admin")
          } else {
            router.push("/survey")
          }
        } else {
          setError("Invalid response from authentication server")
        }
      } else {
        const errorData = await backendResponse.json()
        setError(errorData.message || "Google authentication failed")
      }
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(err.message || "Google authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle regular login - First step: Send email to get OTP (for both admin and user)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Request OTP using the correct endpoint (same for both admin and user)
      const response = await fetch(`${API_BASE_URL}/api/users/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      console.log('OTP request API response status:', response.status)

      if (response.ok) {
        // Show OTP field for second step
        setShowOtpField(true)
        toast({ 
          title: "OTP Sent", 
          description: "Please check your email for the OTP code" 
        })
      } else {
        const errorData = await response.json()
        console.log('OTP request error:', errorData)
        setError(errorData.message || errorData.detail || "Failed to send OTP")
      }
    } catch (err: any) {
      console.error('Login error:', err)
      // If OTP request fails, still show OTP field as fallback
      setShowOtpField(true)
      toast({ 
        title: "Enter Details", 
        description: "Please enter your password and OTP to continue" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification - Final step: Submit email + password + OTP
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate all fields are present
    if (!formData.email || !formData.password || !formData.otp) {
      setError("Please fill in all fields: email, password, and OTP")
      setIsLoading(false)
      return
    }

    // Validate OTP format (assuming it's 6 digits)
    if (formData.otp.length !== 6 || !/^\d{6}$/.test(formData.otp)) {
      setError("OTP must be 6 digits")
      setIsLoading(false)
      return
    }

    try {
      // Log what we're about to send
      const requestData = {
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      }
      console.log('Sending login request with data:', requestData)
      
      // Send all three fields as your backend expects: email, password, otp
      const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log('Final login API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Final login API response data:', data)
        
        // Check if user data exists
        if (data && data.user) {
          // Login user in context
          login({
            id: data.user.id.toString(),
            email: data.user.email,
            role: data.user.role || loginType, // Use the role from backend or fallback to loginType
            name: data.user.name || data.user.username || data.user.email
          }, data.access || data.access_token || '')
          
          toast({ title: "Login successful!" })
          
          // Redirect based on user role
          if (data.user.role === 'admin' || loginType === 'admin') {
            router.push("/admin")
          } else {
            router.push("/survey")
          }
        } else if (data && (data.access || data.access_token)) {
          // Handle case where user data might be in a different format
          login({
            id: Date.now().toString(),
            email: formData.email,
            role: loginType, // Use the selected login type
            name: data.username || formData.email
          }, data.access || data.access_token)
          
          toast({ title: "Login successful!" })
          
          // Redirect based on login type
          if (loginType === 'admin') {
            router.push("/admin")
          } else {
            router.push("/survey")
          }
        } else {
          console.log('Invalid response structure:', data)
          setError("Invalid response from server - missing user data")
        }
      } else {
        const errorData = await response.json()
        console.log('Login error response:', errorData)
        
        // Handle Django validation errors
        let errorMessage = "Login failed"
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          errorMessage = errorData.non_field_errors[0]
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`
        } else if (errorData.otp) {
          errorMessage = `OTP: ${errorData.otp[0]}`
        }
        
        console.log('Parsed error message:', errorMessage)
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error('Login verification error:', err)
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const resetLoginFlow = () => {
    setShowOtpField(false)
    setError(null)
    setFormData(prev => ({ ...prev, otp: "" }))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to MoSPI Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login Type Tabs */}
          <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "admin" | "user")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4">
              {/* Google OAuth Button */}
              <div className="space-y-2">
                <div id="google-signin-btn" className="w-full min-h-[44px] flex items-center justify-center border border-gray-300 rounded">
                  {/* Fallback button if Google OAuth fails to load */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (!window.google) {
                        setError('Google OAuth not available. Please use email login.')
                      }
                    }}
                  >
                    Sign in with Google
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form for User */}
              {!showOtpField ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                      Sign up here
                    </Link>
                  </div>
                </form>
              ) : (
                /* OTP Verification Form - All fields required */
                <form onSubmit={handleOtpVerification} className="space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Enter your password and the OTP sent to {formData.email}
                  </div>
                  
                  {/* Email field (read-only) */}
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  {/* Password field */}
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* OTP field */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="space-y-2">
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Logging in..." : "Login with OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetLoginFlow}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              {/* Admin Login Form with OTP */}
              {!showOtpField ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Admin Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Admin Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                /* Admin OTP Verification Form */
                <form onSubmit={handleOtpVerification} className="space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Enter your password and the OTP sent to {formData.email}
                  </div>
                  
                  {/* Email field (read-only) */}
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Admin Email"
                      value={formData.email}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  {/* Password field */}
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Admin Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* OTP field */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="space-y-2">
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Logging in..." : "Admin Login with OTP"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetLoginFlow}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
