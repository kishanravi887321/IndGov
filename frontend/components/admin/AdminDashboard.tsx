"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { surveyApi } from "@/services/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Sample data for analytics - updates in real-time
const responseTrendsData = [
  { date: "2024-12-01", responses: 120, completed: 108 },
  { date: "2024-12-02", responses: 180, completed: 162 },
  { date: "2024-12-03", responses: 240, completed: 216 },
  { date: "2024-12-04", responses: 200, completed: 178 },
  { date: "2024-12-05", responses: 280, completed: 252 },
  { date: "2024-12-06", responses: 320, completed: 288 },
  { date: "2024-12-07", responses: 350, completed: 315 },
]

const geographicData = [
  { state: "Maharashtra", responses: 245 },
  { state: "Uttar Pradesh", responses: 198 },
  { state: "Karnataka", responses: 167 },
  { state: "Tamil Nadu", responses: 156 },
  { state: "Gujarat", responses: 134 },
  { state: "West Bengal", responses: 123 },
  { state: "Rajasthan", responses: 112 },
  { state: "Others", responses: 312 },
]

const completionRatesData = [
  { name: "Completed", value: 89, color: "#138808" },
  { name: "Incomplete", value: 11, color: "#FF9933" },
]

interface Question {
  id: string
  type: 'multiple-choice' | 'text' | 'rating' | 'yes-no' | 'textarea' | 'multiple-select' | 'scale' | 'file-upload' | 'voice-input'
  question: string
  options?: string[]
  required: boolean
}

interface ManualQuestion {
  id: string
  type: 'multiple-choice' | 'text' | 'rating' | 'yes-no' | 'textarea' | 'multiple-select' | 'scale' | 'file-upload' | 'voice-input'
  question: string
  options?: string[]
  required: boolean
}

interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
  status: 'draft' | 'published' | 'completed'
  responseCount: number
  createdAt: string
  aiGenerated: boolean
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Survey Creation States
  const [surveyCreationType, setSurveyCreationType] = useState<'manual' | 'ai'>('manual')
  const [aiDescription, setAiDescription] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([])
  const [manualSurvey, setManualSurvey] = useState<{
    title: string
    description: string
    questions: ManualQuestion[]
  }>({
    title: '',
    description: '',
    questions: [{ id: '1', type: 'text', question: '', required: true, options: [] }]
  })

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockSurveys: Survey[] = [
        {
          id: '1',
          title: 'Digital India Survey 2024',
          description: 'Survey about digital infrastructure adoption',
          questions: [
            {
              id: '1',
              type: 'multiple-choice',
              question: 'How would you rate digital services in your area?',
              options: ['Excellent', 'Good', 'Average', 'Poor'],
              required: true
            }
          ],
          status: 'published',
          responseCount: 1234,
          createdAt: '2024-12-01',
          aiGenerated: false
        },
        {
          id: '2',
          title: 'Healthcare Access Study',
          description: 'AI-generated survey about healthcare accessibility',
          questions: [],
          status: 'draft',
          responseCount: 0,
          createdAt: '2024-12-05',
          aiGenerated: true
        }
      ]
      setSurveys(mockSurveys)
    } catch (error) {
      console.error("Failed to load surveys:", error)
      toast({
        title: "Error",
        description: "Failed to load surveys.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAIQuestions = async () => {
    try {
      setLoading(true)
      
      // Call the backend API for AI generation
      const response = await surveyApi.generateSurvey({
        description: aiDescription,
        question_count: questionCount,
        target_audience: "general_public",
        survey_type: "government_feedback"
      })
      
      // Convert API response to our Question format
      const generatedQuestions: Question[] = response.questions.map((q, index) => ({
        id: (index + 1).toString(),
        type: q.type as Question['type'],
        question: q.question,
        options: q.options,
        required: q.required !== false // Default to true if not specified
      }))
      
      setAiGeneratedQuestions(generatedQuestions)
      toast({
        title: "Success",
        description: "AI generated survey questions successfully!",
      })
    } catch (error) {
      console.error("Failed to generate AI questions:", error)
      
      // Fallback to mock data if API fails
      const mockQuestions: Question[] = [
        {
          id: '1',
          type: 'multiple-choice' as const,
          question: `Based on "${aiDescription}", how would you rate the current situation?`,
          options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
          required: true
        },
        {
          id: '2',
          type: 'yes-no' as const,
          question: `Do you think improvements are needed in this area?`,
          required: true
        },
        {
          id: '3',
          type: 'rating' as const,
          question: `Rate your overall satisfaction (1-5)`,
          required: true
        },
        {
          id: '4',
          type: 'text' as const,
          question: `What specific improvements would you suggest?`,
          required: false
        },
        {
          id: '5',
          type: 'multiple-choice' as const,
          question: `What is your primary concern in this area?`,
          options: ['Accessibility', 'Quality', 'Cost', 'Availability', 'Other'],
          required: true
        }
      ].slice(0, questionCount)
      
      setAiGeneratedQuestions(mockQuestions)
      
      toast({
        title: "Warning",
        description: "Using fallback questions. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const publishSurvey = async (survey: Survey) => {
    try {
      setLoading(true)
      
      // Update survey status
      setSurveys(prev => prev.map(s => 
        s.id === survey.id ? { ...s, status: 'published' as const } : s
      ))

      toast({
        title: "Survey Published!",
        description: "Survey published successfully and sent to all engines (WhatsApp, Mobile App, Web Portal)!",
      })
    } catch (error) {
      console.error("Failed to publish survey:", error)
      toast({
        title: "Error",
        description: "Failed to publish survey.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addManualQuestion = () => {
    const newQuestion: ManualQuestion = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: true,
      options: []
    }
    setManualSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateManualQuestion = (index: number, field: string, value: any) => {
    setManualSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeManualQuestion = (index: number) => {
    setManualSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const createManualSurvey = async () => {
    try {
      setLoading(true)
      
      // Call backend API to create survey
      const createdSurvey = await surveyApi.createSurvey({
        title: manualSurvey.title,
        description: manualSurvey.description,
        category: "government_survey",
        questions: manualSurvey.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options,
          required: q.required
        })),
        isActive: false // Start as draft
      })

      // Convert to our Survey format and add to local state
      const newSurvey: Survey = {
        id: createdSurvey.id,
        title: createdSurvey.title,
        description: createdSurvey.description,
        questions: (createdSurvey.questions || manualSurvey.questions).map(q => ({
          id: q.id || Date.now().toString(),
          type: q.type as Question['type'],
          question: q.question,
          options: q.options,
          required: q.required !== false // Default to true if undefined
        })),
        status: 'draft',
        responseCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        aiGenerated: false
      }

      setSurveys(prev => [newSurvey, ...prev])
      
      toast({
        title: "Success",
        description: "Manual survey created successfully!",
      })

      // Reset form
      setManualSurvey({
        title: '',
        description: '',
        questions: [{ id: '1', type: 'text', question: '', required: true, options: [] }]
      })
    } catch (error) {
      console.error("Failed to create survey:", error)
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createAISurvey = async () => {
    try {
      setLoading(true)
      
      // Call backend API to create AI-generated survey
      const createdSurvey = await surveyApi.createSurvey({
        title: `AI Survey: ${aiDescription.substring(0, 50)}...`,
        description: aiDescription,
        category: "ai_generated_survey",
        questions: aiGeneratedQuestions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options,
          required: q.required
        })),
        isActive: false // Start as draft
      })

      // Convert to our Survey format and add to local state
      const newSurvey: Survey = {
        id: createdSurvey.id,
        title: createdSurvey.title,
        description: createdSurvey.description,
        questions: aiGeneratedQuestions, // Use the AI generated questions
        status: 'draft',
        responseCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        aiGenerated: true
      }

      setSurveys(prev => [newSurvey, ...prev])
      
      toast({
        title: "Success",
        description: "AI survey created successfully!",
      })

      // Reset form
      setAiDescription('')
      setQuestionCount(5)
      setAiGeneratedQuestions([])
    } catch (error) {
      console.error("Failed to create AI survey:", error)
      toast({
        title: "Error",
        description: "Failed to create AI survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">MoSPI Survey Engine</h1>
            <p className="text-gray-600">Admin Dashboard & Analytics Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🟢 System Active
            </Badge>
            <Button variant="outline" size="sm">
              👤 Admin User
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex">
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-2">
            <Button
              variant={activeSection === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("overview")}
            >
              📊 Overview
            </Button>
            <Button
              variant={activeSection === "survey-engine" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("survey-engine")}
            >
              🔧 Survey Engine
            </Button>
            <Button
              variant={activeSection === "manage-surveys" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("manage-surveys")}
            >
              📋 Manage Surveys
            </Button>
            <Button
              variant={activeSection === "analytics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("analytics")}
            >
              📈 Real-time Analytics
            </Button>
            <Button
              variant={activeSection === "engines" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("engines")}
            >
              🚀 Deploy Engines
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                        <p className="text-2xl font-bold text-navy">{surveys.length}</p>
                      </div>
                      <div className="ml-auto text-2xl">📊</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Surveys</p>
                        <p className="text-2xl font-bold text-green-600">{surveys.filter(s => s.status === 'published').length}</p>
                      </div>
                      <div className="ml-auto text-2xl">🟢</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Responses</p>
                        <p className="text-2xl font-bold text-blue-600">{surveys.reduce((acc, s) => acc + s.responseCount, 0)}</p>
                      </div>
                      <div className="ml-auto text-2xl">💬</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-600">AI Generated</p>
                        <p className="text-2xl font-bold text-purple-600">{surveys.filter(s => s.aiGenerated).length}</p>
                      </div>
                      <div className="ml-auto text-2xl">🤖</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Analytics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Survey Response Trends</CardTitle>
                  <p className="text-sm text-gray-600">Updates automatically as users complete surveys</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="responses" stroke="#8884d8" strokeWidth={2} name="Survey Starts" />
                      <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} name="Completed" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "survey-engine" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-navy">Survey Creation Engine</h2>
                <Badge className="bg-blue-100 text-blue-800">
                  🤖 AI-Powered Survey Generation
                </Badge>
              </div>

              <Tabs value={surveyCreationType} onValueChange={(value) => setSurveyCreationType(value as 'manual' | 'ai')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">📝 Manual Creation</TabsTrigger>
                  <TabsTrigger value="ai">🤖 AI Generation</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Survey Manually</CardTitle>
                      <CardDescription>Design your survey questions step by step</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Survey Title</Label>
                          <Input
                            id="title"
                            value={manualSurvey.title}
                            onChange={(e) => setManualSurvey(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter survey title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={manualSurvey.description}
                            onChange={(e) => setManualSurvey(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your survey purpose"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">Questions</h4>
                          <Button onClick={addManualQuestion} variant="outline" size="sm">
                            + Add Question
                          </Button>
                        </div>

                        {manualSurvey.questions.map((question, index) => (
                          <Card key={question.id} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Question Type</Label>
                                <Select
                                  value={question.type}
                                  onValueChange={(value) => updateManualQuestion(index, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text Input</SelectItem>
                                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                    <SelectItem value="rating">Rating (1-5)</SelectItem>
                                    <SelectItem value="yes-no">Yes/No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                <Label>Question Text</Label>
                                <Input
                                  value={question.question}
                                  onChange={(e) => updateManualQuestion(index, 'question', e.target.value)}
                                  placeholder="Enter your question"
                                />
                              </div>
                              {question.type === 'multiple-choice' && (
                                <div className="md:col-span-3">
                                  <Label>Options (comma-separated)</Label>
                                  <Input
                                    value={question.options?.join(', ') || ''}
                                    onChange={(e) => updateManualQuestion(index, 'options', e.target.value.split(', ').filter(Boolean))}
                                    placeholder="Option 1, Option 2, Option 3"
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between md:col-span-3">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateManualQuestion(index, 'required', e.target.checked)}
                                  />
                                  <span>Required</span>
                                </label>
                                {manualSurvey.questions.length > 1 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeManualQuestion(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Button
                        onClick={createManualSurvey}
                        disabled={!manualSurvey.title || !manualSurvey.description || loading}
                        className="w-full"
                      >
                        {loading ? <LoadingSpinner /> : "Create Manual Survey"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Powered Survey Generation</CardTitle>
                      <CardDescription>Describe your survey needs and let AI create the questions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="ai-description">Survey Description</Label>
                        <Textarea
                          id="ai-description"
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                          placeholder="Describe what you want to survey about. Be specific about the topic, target audience, and what insights you're looking for. Example: 'I want to survey citizens about their experience with digital government services, focusing on accessibility, satisfaction, and areas for improvement.'"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="question-count">Number of Questions</Label>
                        <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Questions</SelectItem>
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="8">8 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={generateAIQuestions}
                        disabled={!aiDescription || loading}
                        className="w-full"
                      >
                        {loading ? <LoadingSpinner /> : "🤖 Generate AI Questions"}
                      </Button>

                      {aiGeneratedQuestions.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold">Generated Questions Preview</h4>
                          {aiGeneratedQuestions.map((question, index) => (
                            <Card key={question.id} className="p-4 bg-blue-50 border-blue-200">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">
                                    {question.type.replace('-', ' ').toUpperCase()}
                                  </Badge>
                                  {question.required && <Badge className="bg-red-100 text-red-800">Required</Badge>}
                                </div>
                                <p className="font-medium">{question.question}</p>
                                {question.options && (
                                  <div className="text-sm text-gray-600">
                                    Options: {question.options.join(', ')}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                          
                          <div className="flex space-x-4">
                            <Button onClick={createAISurvey} className="flex-1">
                              ✅ Approve & Create Survey
                            </Button>
                            <Button onClick={generateAIQuestions} variant="outline" className="flex-1">
                              🔄 Regenerate Questions
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeSection === "manage-surveys" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-navy">Manage Surveys</h2>
                <Button onClick={() => setActiveSection("survey-engine")}>
                  + Create New Survey
                </Button>
              </div>

              <div className="grid gap-6">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{survey.title}</h3>
                          <Badge variant={survey.status === 'published' ? 'default' : 'secondary'}>
                            {survey.status}
                          </Badge>
                          {survey.aiGenerated && (
                            <Badge className="bg-purple-100 text-purple-800">🤖 AI Generated</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{survey.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 Created: {survey.createdAt}</span>
                          <span>👥 Responses: {survey.responseCount}</span>
                          <span>❓ Questions: {survey.questions.length}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">👁️ Preview</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{survey.title}</DialogTitle>
                              <DialogDescription>{survey.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {survey.questions.map((question, index) => (
                                <Card key={question.id} className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Question {index + 1}</span>
                                      <Badge variant="outline">{question.type}</Badge>
                                    </div>
                                    <p className="font-medium">{question.question}</p>
                                    {question.options && (
                                      <div className="text-sm text-gray-600">
                                        Options: {question.options.join(', ')}
                                      </div>
                                    )}
                                    {question.required && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {survey.status === 'draft' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm">🚀 Publish</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Publish Survey to All Engines</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will make the survey live and deploy it to all distribution engines:
                                  <br />• 💬 WhatsApp Business API
                                  <br />• 📱 Mobile Application  
                                  <br />• 🌐 Web Portal
                                  <br />• 🤖 AI Avatar Assistant
                                  <br /><br />
                                  Users will be able to respond to this survey immediately.
                                  <br /><br />
                                  <strong>Note:</strong> Survey will request user location when started.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => publishSurvey(survey)}>
                                  🚀 Deploy to All Engines
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {survey.status === 'published' && (
                          <Button variant="outline" size="sm" onClick={() => setActiveSection("analytics")}>
                            📊 View Analytics
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-navy">Real-time Analytics Dashboard</h2>
              <p className="text-gray-600">Live updates as users complete surveys</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>📈 Response Trends (Updates Live)</CardTitle>
                    <p className="text-sm text-gray-600">Real-time data updates every 30 seconds</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={responseTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="responses" stackId="1" stroke="#8884d8" fill="#8884d8" name="Survey Started" />
                        <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Completed" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>🗺️ Geographic Distribution</CardTitle>
                    <p className="text-sm text-gray-600">Based on user location data</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={geographicData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="state" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="responses" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>✅ Completion Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={completionRatesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {completionRatesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "engines" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-navy">Deployment Engines</h2>
              <p className="text-gray-600">Manage survey distribution across all platforms</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="text-center p-0">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 text-2xl">💬</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">WhatsApp Engine</h3>
                    <p className="text-gray-600 mb-4">Deploy surveys via WhatsApp Business API</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-green-100 text-green-800">🟢 Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sent Today:</span>
                        <span>1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Rate:</span>
                        <span>78%</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Configure Engine
                    </Button>
                  </CardContent>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="text-center p-0">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-600 text-2xl">📱</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Mobile App Engine</h3>
                    <p className="text-gray-600 mb-4">Native mobile application deployment</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-blue-100 text-blue-800">🔧 Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>App Downloads:</span>
                        <span>2,456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span>1,892</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Configure Engine
                    </Button>
                  </CardContent>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="text-center p-0">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-purple-600 text-2xl">🤖</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Avatar Engine</h3>
                    <p className="text-gray-600 mb-4">AI-powered virtual assistant</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-purple-100 text-purple-800">🧪 Beta</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Interactions:</span>
                        <span>567</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfaction:</span>
                        <span>92%</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Configure Engine
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle>🚀 Engine Performance Metrics</CardTitle>
                  <p className="text-sm text-gray-600">Real-time deployment statistics</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { engine: 'WhatsApp', sent: 1234, completed: 962, location_captured: 945 },
                      { engine: 'Mobile App', sent: 856, completed: 734, location_captured: 712 },
                      { engine: 'Web Portal', sent: 645, completed: 578, location_captured: 534 },
                      { engine: 'AI Avatar', sent: 234, completed: 215, location_captured: 210 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="engine" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" fill="#8884d8" name="Surveys Sent" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                      <Bar dataKey="location_captured" fill="#ffc658" name="Location Captured" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
