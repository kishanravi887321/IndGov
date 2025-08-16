// Enhanced API service layer for MoSPI Survey Platform
// Production-ready with error handling, authentication, and retry logic

interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
}

interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}

interface SurveyQuestion {
  id: string
  type:
    | "text"
    | "textarea"
    | "multiple-choice"
    | "multiple-select"
    | "yes-no"
    | "rating"
    | "scale"
    | "file-upload"
    | "voice-input"
  question: string
  options?: string[]
  scale?: number
  required?: boolean
  helpText?: string
}

interface SurveyResponse {
  id: string
  respondent: string
  surveyId: string
  surveyTitle: string
  completed: boolean
  date: string
  answers: Record<string, any>
  completionTime?: number
  language?: string
}

interface Survey {
  id: string
  title: string
  description: string
  category: string
  questions: SurveyQuestion[]
  isActive: boolean
  createdAt: string
  responses: number
}

class ApiService {
  private config: ApiConfig
  private authToken: string | null = null

  constructor() {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://dummyapi.mygov.in",
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
    }

    // Load auth token from localStorage if available
    if (typeof window !== "undefined") {
      this.authToken = localStorage.getItem("mospi_auth_token")
    }
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token
    if (typeof window !== "undefined") {
      localStorage.setItem("mospi_auth_token", token)
    }
  }

  // Clear authentication token
  clearAuthToken() {
    this.authToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("mospi_auth_token")
    }
  }

  // Generic API request with retry logic and error handling
  async apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    // Add authentication header if token exists
    if (this.authToken) {
      defaultHeaders["Authorization"] = `Bearer ${this.authToken}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    }

    try {
      const response = await fetch(url, config)

      // Handle authentication errors
      if (response.status === 401) {
        this.clearAuthToken()
        throw new Error("Authentication failed. Please login again.")
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
        message: data.message,
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)

      // Retry logic for network errors
      if (retryCount < this.config.retries && this.shouldRetry(error)) {
        console.log(`Retrying request ${retryCount + 1}/${this.config.retries}`)
        await this.delay(this.config.retryDelay * (retryCount + 1))
        return this.apiRequest<T>(endpoint, options, retryCount + 1)
      }

      // Return dummy data for development if real API fails
      if (process.env.NODE_ENV === "development") {
        const dummyData = this.getDummyData(endpoint)
        if (dummyData) {
          return {
            data: dummyData,
            success: true,
            message: "Using dummy data (development mode)",
          }
        }
      }

      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Check if error should trigger a retry
  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === "TypeError" || // Network error
      error.name === "TimeoutError" ||
      (error.message && error.message.includes("fetch"))
    )
  }

  // Delay utility for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Enhanced dummy data for development
  private getDummyData(endpoint: string): any {
    const dummyData: Record<string, any> = {
      "/survey/questions": [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is your age group?",
          options: ["18-25", "26-35", "36-45", "46-55", "55+"],
          required: true,
          helpText: "Please select your current age group",
        },
        {
          id: "2",
          type: "text",
          question: "What is your occupation?",
          required: true,
          helpText: "Please provide your current occupation or profession",
        },
        {
          id: "3",
          type: "rating",
          question: "How satisfied are you with government services?",
          scale: 5,
          required: true,
          helpText: "Rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)",
        },
        {
          id: "4",
          type: "yes-no",
          question: "Do you have access to digital services?",
          required: true,
          helpText: "This includes internet, mobile apps, and online government services",
        },
        {
          id: "5",
          type: "multiple-select",
          question: "Which government services have you used in the past year?",
          options: [
            "Aadhaar Services",
            "PAN Card Services",
            "Passport Services",
            "Driving License",
            "Property Registration",
            "Tax Filing",
            "Banking Services",
            "Healthcare Services",
          ],
          required: false,
          helpText: "Select all that apply",
        },
        {
          id: "6",
          type: "textarea",
          question: "What improvements would you suggest for government services?",
          required: false,
          helpText: "Please provide detailed suggestions for improvement",
        },
      ],
      "/admin/responses": [
        {
          id: "1",
          respondent: "User001",
          surveyId: "survey-1",
          surveyTitle: "National Health Survey",
          completed: true,
          date: "2024-01-15",
          answers: { "1": "26-35", "2": "Software Engineer", "3": 4, "4": "yes" },
          completionTime: 12.5,
          language: "en",
        },
        {
          id: "2",
          respondent: "User002",
          surveyId: "survey-1",
          surveyTitle: "National Health Survey",
          completed: false,
          date: "2024-01-14",
          answers: { "1": "18-25", "2": "Student" },
          completionTime: 5.2,
          language: "hi",
        },
        {
          id: "3",
          respondent: "User003",
          surveyId: "survey-2",
          surveyTitle: "Education Access Survey",
          completed: true,
          date: "2024-01-13",
          answers: { "1": "36-45", "2": "Teacher", "3": 5, "4": "yes" },
          completionTime: 15.8,
          language: "en",
        },
      ],
      "/admin/surveys": [
        {
          id: "survey-1",
          title: "National Health Survey",
          description: "Comprehensive survey on healthcare access and quality",
          category: "health",
          isActive: true,
          createdAt: "2024-01-01",
          responses: 1247,
          questions: [],
        },
        {
          id: "survey-2",
          title: "Education Access Survey",
          description: "Survey on educational opportunities and challenges",
          category: "education",
          isActive: true,
          createdAt: "2024-01-05",
          responses: 892,
          questions: [],
        },
      ],
      "/admin/analytics": {
        totalResponses: 1247,
        activeSurveys: 12,
        completionRate: 89,
        statesCovered: 28,
        responseTrends: [
          { month: "Jan", responses: 120, completed: 108 },
          { month: "Feb", responses: 180, completed: 162 },
          { month: "Mar", responses: 240, completed: 216 },
          { month: "Apr", responses: 200, completed: 178 },
          { month: "May", responses: 280, completed: 252 },
          { month: "Jun", responses: 320, completed: 288 },
        ],
        geographicDistribution: [
          { state: "Maharashtra", responses: 245 },
          { state: "Uttar Pradesh", responses: 198 },
          { state: "Karnataka", responses: 167 },
          { state: "Tamil Nadu", responses: 156 },
          { state: "Gujarat", responses: 134 },
          { state: "West Bengal", responses: 123 },
          { state: "Rajasthan", responses: 112 },
          { state: "Others", responses: 312 },
        ],
        demographics: {},
        deviceUsage: {},
      },
    }

    return dummyData[endpoint] || null
  }
}

// Create singleton instance
const apiService = new ApiService()

// Survey API functions
export const surveyApi = {
  // Fetch survey questions
  fetchSurveyQuestions: async (surveyId?: string): Promise<SurveyQuestion[]> => {
    const endpoint = surveyId ? `/survey/${surveyId}/questions` : "/survey/questions"
    const response = await apiService.apiRequest<SurveyQuestion[]>(endpoint)

    if (!response.success) {
      // In development, return dummy data if API fails
      if (process.env.NODE_ENV === "development") {
        console.warn("API request failed, using dummy data:", response.error)
        const dummyData = apiService["getDummyData"](endpoint)
        if (dummyData) {
          return dummyData
        }
      }
      throw new Error(response.error || "Failed to fetch survey questions")
    }

    return response.data
  },

  // Submit survey answers
  submitSurveyAnswers: async (payload: {
    answers: Record<string, any>
    language?: string
    completedAt?: string
    totalQuestions?: number
    surveyId?: string
  }): Promise<{ success: boolean; responseId?: string }> => {
    const response = await apiService.apiRequest("/survey/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!response.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn("API request failed, simulating success:", response.error)
        return {
          success: true,
          responseId: "dummy-response-" + Date.now(),
        }
      }
      throw new Error(response.error || "Failed to submit survey")
    }

    return response.data
  },

  // Get survey progress
  getSurveyProgress: async (
    sessionId: string,
  ): Promise<{
    currentQuestion: number
    totalQuestions: number
    answers: Record<string, any>
  }> => {
    const response = await apiService.apiRequest(`/survey/progress/${sessionId}`)

    if (!response.success) {
      throw new Error(response.error || "Failed to get survey progress")
    }

    return response.data
  },

  // Save survey progress
  saveSurveyProgress: async (
    sessionId: string,
    progress: {
      currentQuestion: number
      answers: Record<string, any>
    },
  ): Promise<void> => {
    const response = await apiService.apiRequest(`/survey/progress/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(progress),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to save survey progress")
    }
  },

  // Generate survey using AI
  generateSurvey: async (payload: {
    description: string
    question_count: number
    target_audience?: string
    survey_type?: string
  }): Promise<{
    questions: SurveyQuestion[]
    suggested_title?: string
    estimated_duration?: number
  }> => {
    const response = await apiService.apiRequest<{
      questions: SurveyQuestion[]
      suggested_title?: string
      estimated_duration?: number
    }>("/api/accounts/generate-survey/", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to generate survey")
    }

    return response.data
  },

  // Create new survey
  createSurvey: async (surveyData: {
    title: string
    description: string
    category: string
    questions: Omit<SurveyQuestion, "id">[]
    isActive?: boolean
  }): Promise<Survey> => {
    const response = await apiService.apiRequest<Survey>("/admin/surveys", {
      method: "POST",
      body: JSON.stringify(surveyData),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to create survey")
    }

    return response.data
  },
}

// Admin API functions
export const adminApi = {
  // Admin login
  login: async (
    username: string,
    password: string,
  ): Promise<{
    success: boolean
    token?: string
    user?: { id: string; username: string; role: string }
  }> => {
    try {
      const response = await apiService.apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      if (response.success && response.data.token) {
        apiService.setAuthToken(response.data.token)
      }

      return response.data
    } catch (error) {
      // Dummy authentication for development
      if (username === "admin" && password === "admin123") {
        const dummyToken = "dummy-jwt-token-" + Date.now()
        apiService.setAuthToken(dummyToken)
        return {
          success: true,
          token: dummyToken,
          user: { id: "1", username: "admin", role: "administrator" },
        }
      }

      throw new Error("Invalid credentials")
    }
  },

  // Admin logout
  logout: async (): Promise<void> => {
    try {
      await apiService.apiRequest("/admin/logout", { method: "POST" })
    } finally {
      apiService.clearAuthToken()
    }
  },

  // Fetch survey responses
  fetchResponses: async (filters?: {
    surveyId?: string
    status?: "completed" | "incomplete"
    dateFrom?: string
    dateTo?: string
    limit?: number
    offset?: number
  }): Promise<SurveyResponse[]> => {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/admin/responses${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiService.apiRequest<SurveyResponse[]>(endpoint)

    if (!response.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn("API request failed, using dummy data:", response.error)
        const dummyData = apiService["getDummyData"]("/admin/responses")
        if (dummyData) {
          return dummyData
        }
      }
      throw new Error(response.error || "Failed to fetch responses")
    }

    return response.data
  },

  // Get single response details
  getResponseDetails: async (responseId: string): Promise<SurveyResponse> => {
    const response = await apiService.apiRequest<SurveyResponse>(`/admin/responses/${responseId}`)

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch response details")
    }

    return response.data
  },

  // Create new survey
  createSurvey: async (surveyData: {
    title: string
    description: string
    category: string
    questions: Omit<SurveyQuestion, "id">[]
    isActive?: boolean
  }): Promise<Survey> => {
    const response = await apiService.apiRequest<Survey>("/admin/surveys", {
      method: "POST",
      body: JSON.stringify(surveyData),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to create survey")
    }

    return response.data
  },

  // Generate survey using AI
  generateSurvey: async (payload: {
    description: string
    question_count: number
    target_audience?: string
    survey_type?: string
  }): Promise<{
    questions: SurveyQuestion[]
    suggested_title?: string
    estimated_duration?: number
  }> => {
    const response = await apiService.apiRequest<{
      questions: SurveyQuestion[]
      suggested_title?: string
      estimated_duration?: number
    }>("/api/accounts/generate-survey/", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to generate survey")
    }

    return response.data
  },

  // Update survey
  updateSurvey: async (surveyId: string, updates: Partial<Survey>): Promise<Survey> => {
    const response = await apiService.apiRequest<Survey>(`/admin/surveys/${surveyId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to update survey")
    }

    return response.data
  },

  // Delete survey
  deleteSurvey: async (surveyId: string): Promise<void> => {
    const response = await apiService.apiRequest(`/admin/surveys/${surveyId}`, {
      method: "DELETE",
    })

    if (!response.success) {
      throw new Error(response.error || "Failed to delete survey")
    }
  },

  // Get all surveys
  getSurveys: async (filters?: {
    category?: string
    isActive?: boolean
    limit?: number
    offset?: number
  }): Promise<Survey[]> => {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/admin/surveys${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiService.apiRequest<Survey[]>(endpoint)

    if (!response.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn("API request failed, using dummy data:", response.error)
        const dummyData = apiService["getDummyData"]("/admin/surveys")
        if (dummyData) {
          return dummyData
        }
      }
      throw new Error(response.error || "Failed to fetch surveys")
    }

    return response.data
  },

  // Get analytics data
  getAnalytics: async (dateRange?: {
    from: string
    to: string
  }): Promise<{
    totalResponses: number
    activeSurveys: number
    completionRate: number
    statesCovered: number
    responseTrends: Array<{ month: string; responses: number; completed: number }>
    geographicDistribution: Array<{ state: string; responses: number }>
    demographics: any
    deviceUsage: any
  }> => {
    const queryParams = new URLSearchParams()
    if (dateRange) {
      queryParams.append("from", dateRange.from)
      queryParams.append("to", dateRange.to)
    }

    const endpoint = `/admin/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await apiService.apiRequest(endpoint)

    if (!response.success) {
      if (process.env.NODE_ENV === "development") {
        console.warn("API request failed, using dummy data:", response.error)
        const dummyData = apiService["getDummyData"]("/admin/analytics")
        if (dummyData) {
          return dummyData
        }
      }
      throw new Error(response.error || "Failed to fetch analytics")
    }

    return response.data
  },

  // Export data
  exportData: async (
    format: "csv" | "xlsx" | "json",
    filters?: {
      surveyId?: string
      dateFrom?: string
      dateTo?: string
    },
  ): Promise<Blob> => {
    const queryParams = new URLSearchParams({ format })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value)
        }
      })
    }

    const response = await fetch(`${apiService["config"].baseURL}/admin/export?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiService["authToken"]}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to export data")
    }

    return response.blob()
  },
}

// Utility functions
export const apiUtils = {
  // Check if API is available
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await apiService.apiRequest("/health")
      return response.success
    } catch {
      return false
    }
  },

  // Get API configuration
  getConfig: () => apiService["config"],

  // Check authentication status
  isAuthenticated: (): boolean => {
    return apiService["authToken"] !== null
  },

  // Get current auth token
  getAuthToken: (): string | null => {
    return apiService["authToken"]
  },
}

export default apiService
