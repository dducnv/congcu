import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools4u.vercel.app';
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }[] = [
    // Homepage
    { path: '', priority: 1.0, changeFrequency: 'daily' },

    // Primary High-Intent Tools (Priority: 0.9)
    { path: '/create-qr', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/dev-tools/read-json', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/dev-tools/generate-secret-key', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/image-to-text', priority: 0.9, changeFrequency: 'weekly' },

    // Developer Utilities (Priority: 0.8)
    { path: '/dev-tools/base64', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/dev-tools/regex', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/dev-tools/url-encode', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/dev-tools/csv-viewer', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/dev-tools/timestamp', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/dev-tools/color-converter', priority: 0.8, changeFrequency: 'monthly' },

    // Productivity & Media Tools (Priority: 0.7 - 0.8)
    { path: '/quicknote', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/quick-image-editor', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/color-picker-from-image', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/color-tools', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/currency-exchange', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/pomodoro', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/draw', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/percentity', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/emoji', priority: 0.7, changeFrequency: 'monthly' },

    // Informational
    { path: '/about', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return routes.map((item) => ({
    url: item.path ? `${baseUrl}${item.path}` : baseUrl,
    lastModified,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
