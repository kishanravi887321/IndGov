"use client"

// Custom React hooks for API integration with loading states and error handling

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showToast?: boolean
}

// Generic hook for API calls
export function useApi<T>(apiCall: () => Promise<T>, options: UseApiOptions = {}): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { immediate = true, onSuccess, onError, showToast = true } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiCall()
      setData(result)

      if (onSuccess) {
        onSuccess(result)
      }

      if (showToast) {
        toast({
          title: "Success",
          description: "Data loaded successfully",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)

      if (onError) {
        onError(errorMessage)
      }

      if (showToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [apiCall, onSuccess, onError, showToast, toast])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(mutationFn: (params: P) => Promise<T>, options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { onSuccess, onError, showToast = true } = options

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)

        const result = await mutationFn(params)

        if (onSuccess) {
          onSuccess(result)
        }

        if (showToast) {
          toast({
            title: "Success",
            description: "Operation completed successfully",
          })
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)

        if (onError) {
          onError(errorMessage)
        }

        if (showToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [mutationFn, onSuccess, onError, showToast, toast],
  )

  return {
    mutate,
    loading,
    error,
  }
}

// Specific hooks for common API operations
export function useSurveyQuestions(surveyId?: string) {
  return useApi(() => import("@/services/api").then(({ surveyApi }) => surveyApi.fetchSurveyQuestions(surveyId)), {
    showToast: false,
  })
}

export function useSurveyResponses(filters?: any) {
  return useApi(() => import("@/services/api").then(({ adminApi }) => adminApi.fetchResponses(filters)), {
    immediate: false,
    showToast: false,
  })
}

export function useAnalytics(dateRange?: { from: string; to: string }) {
  return useApi(() => import("@/services/api").then(({ adminApi }) => adminApi.getAnalytics(dateRange)), {
    immediate: false,
    showToast: false,
  })
}
