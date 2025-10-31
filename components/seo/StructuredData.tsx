'use client';

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://litheplan.tech';
  
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": "LiTHePlan",
        "url": baseUrl,
        "description": "Unofficial student-created course planning tool for Linköping University students. Not affiliated with or sponsored by Linköping University.",
        "creator": {
          "@type": "Person",
          "name": "Student Developer",
          "alumniOf": {
            "@type": "EducationalOrganization",
            "name": "Linköping University"
          }
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "disclaimer": "This is an unofficial student project. Course data is manually curated and may not reflect current university offerings. Always verify with official Linköping University sources."
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/#courselist`,
        "name": "Linköping University Course Catalog",
        "description": "339 curated master's level courses for Linköping University civil engineering students",
        "numberOfItems": 339,
        "itemListElement": {
          "@type": "ListItem",
          "name": "Course Pages",
          "url": `${baseUrl}/course/`
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
