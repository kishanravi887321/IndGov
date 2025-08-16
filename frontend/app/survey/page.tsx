"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { surveyApi } from "@/services/api"
import { SurveyQuestion } from "@/components/survey/SurveyQuestion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Type definitions
interface SurveyQuestionType {
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

interface Answers {
  [questionId: string]: any
}

interface ValidationErrors {
  [questionId: string]: boolean
}

export default function SurveyPage() {
  const [questions, setQuestions] = useState<SurveyQuestionType[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [language, setLanguage] = useState("en")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    loadSurveyQuestions()
  }, [])

  const loadSurveyQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await surveyApi.fetchSurveyQuestions()
      setQuestions(data)
      toast({
        title: "Survey Loaded",
        description: "Survey questions have been loaded successfully.",
      })
    } catch (error) {
      console.error("Failed to load survey questions:", error)
      setError("Failed to load survey questions. Please refresh the page and try again.")
      toast({
        title: "Error",
        description: "Failed to load survey questions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    // Clear validation error for this question
    setValidationErrors((prev) => ({ ...prev, [questionId]: false }))
  }

  const validateCurrentQuestion = () => {
    const currentQ = questions[currentQuestion]
    const answer = answers[currentQ?.id]

    if (!answer || (typeof answer === "string" && answer.trim() === "")) {
      setValidationErrors((prev) => ({ ...prev, [currentQ.id]: true }))
      toast({
        title: "Required Field",
        description: "Please answer this question before proceeding.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateCurrentQuestion()) return

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmitClick = () => {
    if (!validateCurrentQuestion()) return
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true)
      setShowConfirmModal(false)

      await surveyApi.submitSurveyAnswers({
        answers,
        language,
        completedAt: new Date().toISOString(),
        totalQuestions: questions.length,
      })

      toast({
        title: "Survey Submitted Successfully!",
        description: "Thank you for your participation. Your responses have been recorded.",
      })

      // Redirect to thank you page or home
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (error) {
      console.error("Failed to submit survey:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0
  const answeredQuestions = Object.keys(answers).length

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Alert className="mb-6">
            <AlertDescription className="text-lg">{error}</AlertDescription>
          </Alert>
          <Button onClick={loadSurveyQuestions} className="bg-saffron hover:bg-saffron/90 text-white">
            Retry Loading Survey
          </Button>
          <div className="mt-4">
            <Link href="/" className="text-navy hover:text-saffron">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-saffron shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-navy hover:text-saffron">
                ← Back to Home
              </Link>
              <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">GOI</span>
              </div>
              <div>
                <h1 className="text-navy font-bold text-lg">National Survey Platform</h1>
                <p className="text-grey text-sm">Ministry of Statistics & Programme Implementation</p>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="bn">বাংলা</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
                <SelectItem value="gu">ગુજરાતી</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-navy">Survey Progress</h2>
            <div className="text-sm text-grey">
              {answeredQuestions} of {questions.length} questions answered
            </div>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-grey">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        {questions.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-navy/5">
              <CardTitle className="text-navy flex items-center justify-between">
                <span>Question {currentQuestion + 1}</span>
                {questions[currentQuestion]?.required && (
                  <span className="text-sm text-red-600 font-normal">* Required</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <SurveyQuestion
                question={questions[currentQuestion]}
                answer={answers[questions[currentQuestion]?.id]}
                onAnswer={handleAnswer}
                hasError={validationErrors[questions[currentQuestion]?.id]}
                language={language}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="border-grey text-grey hover:bg-grey hover:text-white bg-transparent px-6 py-3"
          >
            ← Previous
          </Button>

          <div className="text-center text-sm text-grey">
            <p>Your responses are automatically saved</p>
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmitClick}
              className="bg-green hover:bg-green/90 text-white px-8 py-3"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Survey"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-saffron hover:bg-saffron/90 text-white px-6 py-3">
              Next →
            </Button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-navy mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-grey mb-1">Technical Support</p>
              <p className="text-navy">1800-11-1234</p>
            </div>
            <div>
              <p className="font-medium text-grey mb-1">Email Support</p>
              <p className="text-navy">survey-help@mospi.gov.in</p>
            </div>
            <div>
              <p className="font-medium text-grey mb-1">Survey Duration</p>
              <p className="text-navy">Approximately 10-15 minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Survey"
        description="Are you sure you want to submit your survey responses? Once submitted, you cannot make changes."
        confirmText="Submit Survey"
        cancelText="Review Answers"
      />
    </div>
  )
}
