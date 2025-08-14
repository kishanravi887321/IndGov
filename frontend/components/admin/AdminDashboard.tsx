"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
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

const responseTrendsData = [
  { month: "Jan", responses: 120, completed: 108 },
  { month: "Feb", responses: 180, completed: 162 },
  { month: "Mar", responses: 240, completed: 216 },
  { month: "Apr", responses: 200, completed: 178 },
  { month: "May", responses: 280, completed: 252 },
  { month: "Jun", responses: 320, completed: 288 },
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

const demographicsData = [
  { age: "18-25", male: 45, female: 55 },
  { age: "26-35", male: 52, female: 48 },
  { age: "36-45", male: 48, female: 52 },
  { age: "46-55", male: 44, female: 56 },
  { age: "55+", male: 42, female: 58 },
]

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    questions: [{ type: "text", question: "", required: true }],
  })
  const { toast } = useToast()

  useEffect(() => {
    if (activeSection === "responses") {
      loadResponses()
    }
  }, [activeSection])

  const loadResponses = async () => {
    try {
      setLoading(true)
      const data = await adminApi.fetchResponses()
      setResponses(data)
    } catch (error) {
      console.error("Failed to load responses:", error)
      toast({
        title: "Error",
        description: "Failed to load survey responses.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await adminApi.createSurvey(newSurvey)
      toast({
        title: "Survey Created",
        description: "New survey has been created successfully.",
      })
      setNewSurvey({
        title: "",
        description: "",
        questions: [{ type: "text", question: "", required: true }],
      })
    } catch (error) {
      console.error("Failed to create survey:", error)
      toast({
        title: "Error",
        description: "Failed to create survey.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setNewSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, { type: "text", question: "", required: true }],
    }))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }))
  }

  const removeQuestion = (index: number) => {
    setNewSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const handleLogout = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-saffron shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">GOI</span>
              </div>
              <div>
                <h1 className="text-navy font-bold text-xl">MoSPI Admin Dashboard</h1>
                <p className="text-grey text-sm">Ministry of Statistics & Programme Implementation</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-grey text-grey hover:bg-grey hover:text-white bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection("overview")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSection === "overview"
                        ? "bg-saffron/10 text-saffron border-r-2 border-saffron"
                        : "text-grey"
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveSection("create-survey")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSection === "create-survey"
                        ? "bg-saffron/10 text-saffron border-r-2 border-saffron"
                        : "text-grey"
                    }`}
                  >
                    ➕ Create Survey
                  </button>
                  <button
                    onClick={() => setActiveSection("responses")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSection === "responses"
                        ? "bg-saffron/10 text-saffron border-r-2 border-saffron"
                        : "text-grey"
                    }`}
                  >
                    📋 View Responses
                  </button>
                  <button
                    onClick={() => setActiveSection("analytics")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSection === "analytics"
                        ? "bg-saffron/10 text-saffron border-r-2 border-saffron"
                        : "text-grey"
                    }`}
                  >
                    📈 Analytics
                  </button>
                  <button
                    onClick={() => setActiveSection("settings")}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSection === "settings"
                        ? "bg-saffron/10 text-saffron border-r-2 border-saffron"
                        : "text-grey"
                    }`}
                  >
                    ⚙️ Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-6">Dashboard Overview</h2>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-saffron mb-2">1,247</div>
                      <div className="text-grey text-sm">Total Responses</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green mb-2">12</div>
                      <div className="text-grey text-sm">Active Surveys</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-navy mb-2">89%</div>
                      <div className="text-grey text-sm">Completion Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-grey mb-2">28</div>
                      <div className="text-grey text-sm">States Covered</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-navy">New survey response received</p>
                          <p className="text-sm text-grey">National Health Survey - 2 minutes ago</p>
                        </div>
                        <Badge className="bg-green text-white">New</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-navy">Survey published</p>
                          <p className="text-sm text-grey">Education Access Survey - 1 hour ago</p>
                        </div>
                        <Badge className="bg-saffron text-white">Published</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-navy">Data export completed</p>
                          <p className="text-sm text-grey">Rural Development Survey - 3 hours ago</p>
                        </div>
                        <Badge className="bg-navy text-white">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "create-survey" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-6">Create New Survey</h2>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy">Survey Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSurvey} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Survey Title *</Label>
                          <Input
                            id="title"
                            value={newSurvey.title}
                            onChange={(e) => setNewSurvey((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter survey title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="employment">Employment</SelectItem>
                              <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              <SelectItem value="social">Social Welfare</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newSurvey.description}
                          onChange={(e) => setNewSurvey((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter survey description"
                          rows={3}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-lg font-semibold">Questions</Label>
                          <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                            Add Question
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {newSurvey.questions.map((question, index) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">Question {index + 1}</Label>
                                  {newSurvey.questions.length > 1 && (
                                    <Button
                                      type="button"
                                      onClick={() => removeQuestion(index)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                    >
                                      Remove
                                    </Button>
                                  )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <Label>Question Type</Label>
                                    <Select
                                      value={question.type}
                                      onValueChange={(value) => updateQuestion(index, "type", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="text">Text Input</SelectItem>
                                        <SelectItem value="textarea">Long Text</SelectItem>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="yes-no">Yes/No</SelectItem>
                                        <SelectItem value="rating">Rating Scale</SelectItem>
                                        <SelectItem value="file-upload">File Upload</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2 pt-6">
                                    <input
                                      type="checkbox"
                                      id={`required-${index}`}
                                      checked={question.required}
                                      onChange={(e) => updateQuestion(index, "required", e.target.checked)}
                                    />
                                    <Label htmlFor={`required-${index}`}>Required</Label>
                                  </div>
                                </div>

                                <div>
                                  <Label>Question Text</Label>
                                  <Input
                                    value={question.question}
                                    onChange={(e) => updateQuestion(index, "question", e.target.value)}
                                    placeholder="Enter your question"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-grey text-grey hover:bg-grey hover:text-white bg-transparent"
                        >
                          Save as Draft
                        </Button>
                        <Button type="submit" className="bg-green hover:bg-green/90 text-white" disabled={loading}>
                          {loading ? "Creating..." : "Create Survey"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "responses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-navy">Survey Responses</h2>
                  <Button
                    onClick={loadResponses}
                    variant="outline"
                    className="border-saffron text-saffron hover:bg-saffron hover:text-white bg-transparent"
                  >
                    Refresh
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-8">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Response ID</TableHead>
                            <TableHead>Respondent</TableHead>
                            <TableHead>Survey</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((response: any) => (
                            <TableRow key={response.id}>
                              <TableCell className="font-medium">#{response.id}</TableCell>
                              <TableCell>{response.respondent}</TableCell>
                              <TableCell>National Health Survey</TableCell>
                              <TableCell>
                                <Badge className={response.completed ? "bg-green text-white" : "bg-saffron text-white"}>
                                  {response.completed ? "Completed" : "In Progress"}
                                </Badge>
                              </TableCell>
                              <TableCell>{response.date}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-navy mb-6">Analytics Dashboard</h2>
                  <div className="flex space-x-2">
                    <Select defaultValue="last-6-months">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="border-saffron text-saffron hover:bg-saffron hover:text-white bg-transparent"
                    >
                      Export Report
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">Response Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={responseTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#555555" />
                          <YAxis stroke="#555555" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="responses"
                            stroke="#FF9933"
                            strokeWidth={3}
                            name="Total Responses"
                          />
                          <Line type="monotone" dataKey="completed" stroke="#138808" strokeWidth={3} name="Completed" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">Geographic Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={geographicData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#555555" />
                          <YAxis dataKey="state" type="category" width={80} stroke="#555555" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="responses" fill="#000080" name="Responses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">Completion Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={completionRatesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {completionRatesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                            formatter={(value) => [`${value}%`, "Percentage"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-center">
                        <p className="text-2xl font-bold text-green">89%</p>
                        <p className="text-sm text-grey">Average Completion Rate</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">Demographics by Age Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={demographicsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="age" stroke="#555555" />
                          <YAxis stroke="#555555" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="male"
                            stackId="1"
                            stroke="#000080"
                            fill="#000080"
                            fillOpacity={0.7}
                            name="Male"
                          />
                          <Area
                            type="monotone"
                            dataKey="female"
                            stackId="1"
                            stroke="#FF9933"
                            fill="#FF9933"
                            fillOpacity={0.7}
                            name="Female"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy text-lg">Response Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-grey">Complete Responses</span>
                          <span className="font-semibold text-green">89%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Partial Responses</span>
                          <span className="font-semibold text-saffron">8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Abandoned</span>
                          <span className="font-semibold text-red-600">3%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy text-lg">Average Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-grey">Survey Duration</span>
                          <span className="font-semibold text-navy">12.5 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Per Question</span>
                          <span className="font-semibold text-navy">2.1 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Drop-off Point</span>
                          <span className="font-semibold text-saffron">Q7</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy text-lg">Device Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-grey">Mobile</span>
                          <span className="font-semibold text-green">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Desktop</span>
                          <span className="font-semibold text-navy">28%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-grey">Tablet</span>
                          <span className="font-semibold text-saffron">5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-6">System Settings</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Default Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिंदी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Survey Timeout (minutes)</Label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      <div>
                        <Label>Max File Upload Size (MB)</Label>
                        <Input type="number" defaultValue="5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-navy">Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="email-notifications" defaultChecked />
                        <Label htmlFor="email-notifications">Email notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="sms-notifications" />
                        <Label htmlFor="sms-notifications">SMS notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="daily-reports" defaultChecked />
                        <Label htmlFor="daily-reports">Daily reports</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
