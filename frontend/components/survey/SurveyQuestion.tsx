"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SurveyQuestionProps {
  question: {
    id: string
    type: string
    question: string
    options?: string[]
    scale?: number
    required?: boolean
    helpText?: string
  }
  answer: any
  onAnswer: (questionId: string, answer: any) => void
  hasError?: boolean
  language?: string
}

export function SurveyQuestion({ question, answer, onAnswer, hasError, language }: SurveyQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState(answer || "")
  const [isRecording, setIsRecording] = useState(false)

  const handleAnswerChange = (value: any) => {
    setLocalAnswer(value)
    onAnswer(question.id, value)
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    // Placeholder for voice input functionality
    setTimeout(() => {
      setIsRecording(false)
      alert("Voice input feature will be available in the next update. Please use text input for now.")
    }, 2000)
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Input
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              className={`mt-4 ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
              aria-describedby={hasError ? `${question.id}-error` : undefined}
            />
            {hasError && (
              <p id={`${question.id}-error`} className="text-red-600 text-sm">
                This field is required
              </p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your detailed answer..."
              className={`mt-4 ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
              rows={4}
              aria-describedby={hasError ? `${question.id}-error` : undefined}
            />
            <div className="flex justify-between items-center text-sm text-grey">
              <span>{localAnswer.length} characters</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className="border-saffron text-saffron hover:bg-saffron hover:text-white bg-transparent"
              >
                {isRecording ? "🔴 Recording..." : "🎤 Voice Input"}
              </Button>
            </div>
            {hasError && (
              <p id={`${question.id}-error`} className="text-red-600 text-sm">
                This field is required
              </p>
            )}
          </div>
        )

      case "multiple-choice":
        return (
          <div className="space-y-2">
            <RadioGroup
              value={localAnswer}
              onValueChange={handleAnswerChange}
              className={`mt-4 ${hasError ? "border border-red-500 rounded-lg p-4" : ""}`}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && <p className="text-red-600 text-sm">Please select an option</p>}
          </div>
        )

      case "multiple-select":
        return (
          <div className="space-y-2">
            <div className={`mt-4 space-y-2 ${hasError ? "border border-red-500 rounded-lg p-4" : ""}`}>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={Array.isArray(localAnswer) && localAnswer.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentAnswers = Array.isArray(localAnswer) ? localAnswer : []
                      if (checked) {
                        handleAnswerChange([...currentAnswers, option])
                      } else {
                        handleAnswerChange(currentAnswers.filter((a) => a !== option))
                      }
                    }}
                  />
                  <Label htmlFor={`checkbox-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-red-600 text-sm">Please select at least one option</p>}
          </div>
        )

      case "yes-no":
        return (
          <div className="space-y-2">
            <RadioGroup
              value={localAnswer}
              onValueChange={handleAnswerChange}
              className={`mt-4 ${hasError ? "border border-red-500 rounded-lg p-4" : ""}`}
            >
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">
                  {language === "hi" ? "हाँ" : "Yes"}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">
                  {language === "hi" ? "नहीं" : "No"}
                </Label>
              </div>
            </RadioGroup>
            {hasError && <p className="text-red-600 text-sm">Please select Yes or No</p>}
          </div>
        )

      case "rating":
        return (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: question.scale || 5 }, (_, i) => (
                <Button
                  key={i + 1}
                  type="button"
                  variant={localAnswer === i + 1 ? "default" : "outline"}
                  onClick={() => handleAnswerChange(i + 1)}
                  className={`w-12 h-12 ${
                    localAnswer === i + 1
                      ? "bg-saffron hover:bg-saffron/90 text-white"
                      : "border-grey hover:border-saffron hover:text-saffron"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-grey">
              <span>1 = Very Poor</span>
              <span>{question.scale || 5} = Excellent</span>
            </div>
            {hasError && <p className="text-red-600 text-sm">Please select a rating</p>}
          </div>
        )

      case "scale":
        return (
          <div className="mt-4 space-y-4">
            <div className="px-4">
              <Slider
                value={[localAnswer || 0]}
                onValueChange={(value) => handleAnswerChange(value[0])}
                max={question.scale || 10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-grey">
              <span>0</span>
              <span className="font-medium">Current: {localAnswer || 0}</span>
              <span>{question.scale || 10}</span>
            </div>
            {hasError && <p className="text-red-600 text-sm">Please select a value on the scale</p>}
          </div>
        )

      case "file-upload":
        return (
          <div className="mt-4 space-y-2">
            <Input
              type="file"
              onChange={(e) => handleAnswerChange(e.target.files?.[0])}
              className="mb-2"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <p className="text-sm text-grey">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max size: 5MB)</p>
            {localAnswer && <p className="text-sm text-green font-medium">File selected: {localAnswer.name}</p>}
          </div>
        )

      case "voice-input":
        return (
          <div className="mt-4 space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-grey rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleVoiceInput}
                className={`border-saffron text-saffron hover:bg-saffron hover:text-white bg-transparent ${
                  isRecording ? "bg-red-100 border-red-500 text-red-600" : ""
                }`}
              >
                {isRecording ? "🔴 Recording... Click to stop" : "🎤 Start Voice Recording"}
              </Button>
              <p className="text-sm text-grey mt-4">
                {isRecording
                  ? "Recording in progress. Speak clearly into your microphone."
                  : "Click the button above to start recording your response"}
              </p>
            </div>
            {localAnswer && (
              <Alert>
                <AlertDescription>
                  Voice recording completed. Duration: {localAnswer.duration || "Unknown"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Input
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              className={`mt-4 ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {hasError && <p className="text-red-600 text-sm">This field is required</p>}
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-navy mb-2 leading-relaxed">{question.question}</h3>
        {question.helpText && <p className="text-sm text-grey mb-4 italic">{question.helpText}</p>}
      </div>
      {renderQuestionInput()}
    </div>
  )
}
