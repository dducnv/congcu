'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Replace with your actual Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

interface GoogleAnalyticsProps {
  measurementId?: string
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

const GoogleAnalytics = ({ measurementId = GA_MEASUREMENT_ID }: GoogleAnalyticsProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      pageview(url)
    }
  }, [pathname, searchParams])

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null // Don't render if no valid measurement ID
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: false
          });
        `}
      </Script>
    </>
  )
}

export default GoogleAnalytics