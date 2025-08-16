"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

// Google OAuth script
declare global {
  interface Window {
    google: any
  }
}

interface SignupFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
  role: "user" | "admin"
  orgSecret: string
  otp: string
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    orgSecret: "",
    otp: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOtpField, setShowOtpField] = useState(false)
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
            document.getElementById("google-signup-btn"),
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signup_with",
              shape: "rectangular",
            }
          )
          
          console.log('Google OAuth initialized successfully for signup')
        } catch (error) {
          console.error('Error initializing Google OAuth:', error)
        }
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
        setError('Failed to load Google OAuth. Please use email signup.')
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleOAuth()
    }
  }, [])

  // Handle Google OAuth callback for signup
  const handleGoogleCallback = async (response: any) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Google OAuth response:', response)
      
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
        
        if (data && data.user) {
          login({
            id: data.user.id || Date.now().toString(),
            email: data.user.email || 'unknown@example.com',
            role: data.user.role || 'user',
            name: data.user.name || data.user.email
          }, data.token || '')
          
          toast({ title: "Google signup successful!" })
          router.push(data.user.role === 'admin' ? "/admin" : "/survey")
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

  // Handle initial signup - Step 1: Request OTP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    // Validate orgSecret for admin accounts
    if (formData.role === "admin" && !formData.orgSecret.trim()) {
      setError("Organization Secret is required for admin accounts")
      setIsLoading(false)
      return
    }

    try {
      // Step 1: Request OTP for registration
      const response = await fetch(`${API_BASE_URL}/api/users/auth/register/`, {
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
      console.error('Signup error:', err)
      setError(err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification and final registration
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate all fields are present
    if (!formData.email || !formData.password || !formData.otp) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    // Validate orgSecret for admin accounts
    if (formData.role === "admin" && !formData.orgSecret.trim()) {
      setError("Organization Secret is required for admin accounts")
      setIsLoading(false)
      return
    }

    // Validate OTP format
    if (formData.otp.length !== 6 || !/^\d{6}$/.test(formData.otp)) {
      setError("OTP must be 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const requestData = {
        email: formData.email,
        username: formData.username || undefined, // Let backend generate if empty
        password: formData.password,
        role: formData.role,
        otp: formData.otp,
        ...(formData.role === "admin" && { orgSecret: formData.orgSecret })
      }
      
      console.log('Sending registration request with data:', requestData)

      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log('Registration API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Registration API response data:', data)
        
        toast({ 
          title: "Registration successful!", 
          description: "Please login with your credentials" 
        })
        
        // Redirect to login page
        router.push("/login")
      } else {
        const errorData = await response.json()
        console.log('Registration error response:', errorData)
        
        // Handle Django validation errors
        let errorMessage = "Registration failed"
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          errorMessage = errorData.non_field_errors[0]
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`
        } else if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`
        } else if (errorData.otp) {
          errorMessage = `OTP: ${errorData.otp[0]}`
        }
        
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error('Registration verification error:', err)
      setError(err.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Clear orgSecret when switching from admin to user
      if (field === 'role' && value === 'user') {
        newData.orgSecret = ""
      }
      
      return newData
    })
    if (error) setError(null)
  }

  const resetSignupFlow = () => {
    setShowOtpField(false)
    setError(null)
    setFormData(prev => ({ ...prev, otp: "" }))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up for MoSPI Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <div className="space-y-2">
            <div id="google-signup-btn" className="w-full min-h-[44px] flex items-center justify-center border border-gray-300 rounded">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (!window.google) {
                    setError('Google OAuth not available. Please use email signup.')
                  }
                }}
              >
                Sign up with Google
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

          {/* Signup Form */}
          {!showOtpField ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value as "user" | "admin")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User Account</SelectItem>
                    <SelectItem value="admin">Admin Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Username (Optional) */}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username (optional - will be auto-generated)"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                />
              </div>

              {/* Organization Secret (Only for Admin) */}
              {formData.role === "admin" && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Organization Secret Key"
                    value={formData.orgSecret}
                    onChange={(e) => handleInputChange("orgSecret", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Required for admin account verification
                  </p>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending OTP..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Enter the OTP sent to {formData.email}
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
              
              {/* Role Display */}
              <div className="space-y-2">
                <Input
                  type="text"
                  value={`Account Type: ${formData.role}`}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              {/* OTP field */}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              
              {error && <div className="text-red-500 text-sm">{error}</div>}
              
              <div className="space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating Account..." : "Complete Registration"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetSignupFlow}
                  className="w-full"
                >
                  Back to Form
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
