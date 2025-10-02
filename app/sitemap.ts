import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools4u.vercel.app'

  // Use a fixed date to avoid constant changes
  const lastModified = new Date('2025-10-02')

  return [
    // Homepage
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },

    // Conversion Tools
    {
      url: `${baseUrl}/image-to-text`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // Tools
    {
      url: `${baseUrl}/quicknote`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/emoji`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/percentity`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/color-picker-from-image`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quick-image-editor`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/draw`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/file-converter`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/remove-bg`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/currency-exchange`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Developer Tools
    {
      url: `${baseUrl}/dev-tools/read-json`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dev-tools/generate-secret-key`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dev-tools/color-converter`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dev-tools/csv-viewer`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // About page
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
