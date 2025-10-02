export default function JsonToolStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JSON Tool - Fix, Format, Validate & Compare JSON Online",
    "description": "Công cụ JSON miễn phí - Sửa lỗi JSON, format đẹp, validate, tìm kiếm và so sánh JSON. Hỗ trợ JSON không đúng format như {key: value}. Tool JSON online tốt nhất cho developer.",
    "url": "https://multitools.dev/dev-tools/read-json",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "MultiTools",
      "url": "https://multitools.dev"
    },
    "featureList": [
      "Fix JSON không đúng format",
      "Format JSON đẹp với indent tùy chỉnh",
      "Validate JSON hợp lệ",
      "Tìm kiếm trong JSON",
      "So sánh 2 JSON",
      "JSON Editor trực quan",
      "Copy/Paste dễ dàng",
      "Real-time validation"
    ],
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "inLanguage": "vi-VN",
    "isAccessibleForFree": true,
    "keywords": [
      "JSON tool",
      "JSON formatter",
      "JSON validator",
      "JSON fixer",
      "JSON compare",
      "JSON search",
      "JSON online",
      "JSON editor",
      "developer tools"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
