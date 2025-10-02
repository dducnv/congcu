'use client'

import { event } from '@/components/google-analytics'

export const useAnalytics = () => {
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    event(action, category, label, value)
  }

  // Predefined tracking functions for common events
  const trackToolUsage = (toolName: string) => {
    trackEvent('tool_used', 'Tools', toolName)
  }

  const trackFileUpload = (fileType: string, toolName: string) => {
    trackEvent('file_upload', 'File Operations', `${toolName}_${fileType}`)
  }

  const trackDownload = (downloadType: string, toolName: string) => {
    trackEvent('download', 'Downloads', `${toolName}_${downloadType}`)
  }

  const trackSearch = (searchTerm: string) => {
    trackEvent('search', 'Search', searchTerm)
  }

  const trackError = (errorType: string, toolName: string) => {
    trackEvent('error', 'Errors', `${toolName}_${errorType}`)
  }

  return {
    trackEvent,
    trackToolUsage,
    trackFileUpload,
    trackDownload,
    trackSearch,
    trackError,
  }
}

export default useAnalytics