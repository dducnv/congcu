import PomodoroView from "@/components/pomodoro/pomodoro_view";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomodoro Timer Online - Focus Timer with Tasks | MultiTools",
  description:
    "Free online Pomodoro timer with task management, customizable focus & break intervals, audio notifications, and daily productivity tracking. 100% free and client-side.",
  keywords: [
    "pomodoro timer",
    "focus timer",
    "pomodoro online",
    "productivity timer",
    "study timer",
    "task timer",
    "pomodoro technique",
    "work timer",
  ],
  authors: [{ name: "MultiTools" }],
  creator: "MultiTools",
  publisher: "MultiTools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://tools4u.vercel.app/pomodoro",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tools4u.vercel.app/pomodoro",
    title: "Pomodoro Timer Online - Focus Timer with Tasks | MultiTools",
    description:
      "Free online Pomodoro timer with task management and productivity tracking.",
    siteName: "MultiTools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomodoro Timer Online - Focus Timer with Tasks | MultiTools",
    description:
      "Free online Pomodoro timer with task management and productivity tracking.",
  },
  category: "productivity",
  classification: "Productivity Tools",
};

const pomodoroSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Pomodoro Focus Timer",
  "url": "https://tools4u.vercel.app/pomodoro",
  "description":
    "Free online Pomodoro timer with customizable focus & break durations, audio alarms, task checklist, and daily streak tracking.",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5 Audio.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "featureList": [
    "Customizable focus and break durations",
    "Task checklist with completion tracking",
    "Audio alarm alerts",
    "Client-side local storage persistence",
    "Daily completed sessions counter",
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={pomodoroSchema} />
      <PomodoroView />
    </>
  );
}