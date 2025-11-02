---
description: 'SEO optimization and technical SEO best practices for web applications'
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js, app/**/page.tsx, app/**/layout.tsx'
---

# SEO Optimization Instructions

Guidelines for implementing search engine optimization best practices in web applications, focusing on technical SEO, structured data, performance optimization, and content discoverability.

## Project Context

- Target audience: Web developers implementing SEO strategies
- Framework: Next.js with App Router (supports built-in SEO features)
- Focus areas: Technical SEO, structured data, performance, accessibility
- Goal: Improve organic search visibility and user experience

## General Instructions

- Implement SEO as a core feature, not an afterthought
- Follow search engine guidelines (Google, Bing) strictly
- Prioritize user experience alongside search optimization
- Use white-hat SEO techniques only
- Validate all structured data before deployment
- Monitor Core Web Vitals continuously
- Ensure mobile-first optimization
- Maintain crawlability and indexability

## Technical SEO Standards

### Meta Tags Implementation

Always include essential meta tags in page components:

```typescript
// ✅ Good Example - Complete metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Planning | LiTHePlan',
  description: 'Plan your Linköping University civil engineering courses across terms 7-9. Filter 339 curated courses, track credits, and validate your academic profile.',
  keywords: ['course planning', 'Linköping University', 'civil engineering', 'academic planner'],
  openGraph: {
    title: 'Course Planning | LiTHePlan',
    description: 'Plan your courses for Linköping University',
    type: 'website',
    url: 'https://litheplan.tech',
    siteName: 'LiTHePlan',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'LiTHePlan Course Planner',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Course Planning | LiTHePlan',
    description: 'Plan your courses for Linköping University',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

```typescript
// ❌ Bad Example - Missing critical metadata
export const metadata = {
  title: 'My Page',
};
```

### URL Structure

- Use descriptive, keyword-rich URLs
- Keep URLs short and readable
- Use hyphens for word separation (not underscores)
- Avoid special characters and parameters when possible
- Implement proper canonical URLs

```typescript
// ✅ Good URL structure
/courses/advanced-programming-tsbk03
/profile/john-doe-engineering-2024

// ❌ Bad URL structure
/courses?id=123&type=adv
/profile/user?name=john
```

### Robots.txt Configuration

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: 'https://litheplan.tech/sitemap.xml',
  };
}
```

### XML Sitemap Generation

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://litheplan.tech';
  
  // Fetch dynamic course data
  const courses = await fetchCourses();
  
  const courseUrls = courses.map((course) => ({
    url: `${baseUrl}/course/${course.id}`,
    lastModified: course.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...courseUrls,
  ];
}
```

## Structured Data (Schema.org)

### Organization Schema

Implement at the root layout level:

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'LiTHePlan',
    url: 'https://litheplan.tech',
    description: 'Course planning tool for Linköping University students',
    sameAs: [
      'https://github.com/yourusername/litheplan',
    ],
  };
  
  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Course Schema

```typescript
// ✅ Good Example - Rich course structured data
export function CourseSchema({ course }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Linköping University',
    },
    courseCode: course.id,
    numberOfCredits: {
      '@type': 'QuantitativeValue',
      value: course.credits,
      unitText: 'HP',
    },
    educationalLevel: course.level,
    availableLanguage: 'sv',
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### BreadcrumbList Schema

```typescript
export function BreadcrumbSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

## Performance Optimization for SEO

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to First Byte (TTFB)**: < 600ms

### Image Optimization

```typescript
// ✅ Good Example - Optimized images for SEO
import Image from 'next/image';

export function CourseImage({ course }) {
  return (
    <Image
      src={course.imageUrl}
      alt={`${course.name} - ${course.id} course at Linköping University`}
      width={1200}
      height={630}
      priority={course.isFeatured}
      loading={course.isFeatured ? 'eager' : 'lazy'}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// ❌ Bad Example - Missing alt text and optimization
<img src={course.imageUrl} />
```

### Font Optimization

```typescript
// ✅ Good Example - Using Next.js font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

## Content Optimization

### Heading Hierarchy

```typescript
// ✅ Good Example - Proper heading structure
export function CoursePage({ course }) {
  return (
    <article>
      <h1>{course.name}</h1>
      <section>
        <h2>Course Details</h2>
        <h3>Examination Methods</h3>
        <p>...</p>
        <h3>Prerequisites</h3>
        <p>...</p>
      </section>
      <section>
        <h2>Related Courses</h2>
        <p>...</p>
      </section>
    </article>
  );
}

// ❌ Bad Example - Skipping heading levels
<h1>Title</h1>
<h3>Subtitle</h3> {/* Skipped h2 */}
```

### Internal Linking

```typescript
// ✅ Good Example - Descriptive anchor text
import Link from 'next/link';

<Link href="/courses/advanced-programming">
  Learn more about Advanced Programming (TSBK03)
</Link>

// ❌ Bad Example - Generic anchor text
<Link href="/courses/123">Click here</Link>
```

## Mobile-First Optimization

- Design for mobile viewports first
- Ensure touch targets are at least 48x48px
- Avoid horizontal scrolling
- Use responsive images
- Test on real devices
- Implement responsive meta viewport tag

```html
<!-- Always include in root layout -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Accessibility and SEO

Accessibility improvements directly benefit SEO:

```typescript
// ✅ Good Example - Accessible navigation
<nav aria-label="Main navigation">
  <ul>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/courses">Courses</Link></li>
  </ul>
</nav>

// ✅ Good Example - Semantic HTML
<main>
  <article>
    <header>
      <h1>Course Title</h1>
      <time dateTime="2025-01-15">January 15, 2025</time>
    </header>
    <section>...</section>
  </article>
</main>

// ❌ Bad Example - Non-semantic markup
<div>
  <div>Course Title</div>
  <div>January 15, 2025</div>
</div>
```

## Security and SEO

- Always use HTTPS in production
- Implement proper CSP headers
- Avoid mixed content warnings
- Set secure cookie flags
- Implement HSTS headers

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

## SEO Anti-Patterns to Avoid

### Content Issues

- ❌ Duplicate content across pages
- ❌ Thin content (< 300 words for important pages)
- ❌ Keyword stuffing
- ❌ Hidden text or links
- ❌ Cloaking (showing different content to crawlers)
- ❌ Auto-generated content without value

### Technical Issues

- ❌ Blocking resources in robots.txt that affect rendering
- ❌ Slow server response times (> 1s)
- ❌ Broken internal links
- ❌ Redirect chains
- ❌ Missing canonical tags on duplicate content
- ❌ Non-descriptive page titles ("Page 1", "Untitled")

### Mobile Issues

- ❌ Intrusive interstitials
- ❌ Unplayable content on mobile
- ❌ Faulty redirects to mobile site
- ❌ Text too small to read
- ❌ Touch elements too close together

## Validation and Testing

### Required Pre-Deployment Checks

```powershell
# Build and verify no errors
npm run build

# Check for broken links (if Screaming Frog available)
# screaming-frog crawl http://localhost:3000

# Validate structured data
# Visit: https://validator.schema.org/
# Or use: https://search.google.com/test/rich-results
```

### Lighthouse CI Integration

```json
// .github/workflows/lighthouse.yml
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/courses"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

### Monitoring Tools

- **Google Search Console**: Index coverage, search performance
- **Google Analytics 4**: Organic traffic, user behavior
- **PageSpeed Insights**: Core Web Vitals monitoring
- **Bing Webmaster Tools**: Bing search visibility
- **Schema Markup Validator**: Structured data validation

## International SEO (If Applicable)

```typescript
// app/[lang]/layout.tsx
export async function generateMetadata({ params }) {
  const lang = params.lang;
  
  return {
    alternates: {
      languages: {
        'en': 'https://litheplan.tech/en',
        'sv': 'https://litheplan.tech/sv',
      },
    },
  };
}
```

## Content Strategy Guidelines

- Write for users first, search engines second
- Target one primary keyword per page
- Include related keywords naturally
- Update content regularly (freshness signal)
- Create comprehensive, authoritative content
- Answer user questions directly
- Include relevant internal links
- Optimize for featured snippets

## Quality Checklist

Before considering SEO implementation complete:

- [ ] All pages have unique, descriptive titles (50-60 characters)
- [ ] Meta descriptions are compelling (150-160 characters)
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] All images have descriptive alt text
- [ ] Structured data validated with no errors
- [ ] Core Web Vitals meet targets
- [ ] Mobile-friendly test passes
- [ ] No broken links (internal or external)
- [ ] Sitemap.xml generated and submitted
- [ ] Robots.txt configured correctly
- [ ] HTTPS enabled with no mixed content
- [ ] Canonical URLs implemented
- [ ] Social media meta tags present
- [ ] Analytics tracking configured

## Additional Resources

- [Google Search Central Documentation](https://developers.google.com/search/docs)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev SEO Guidance](https://web.dev/learn/seo/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google Search Console](https://search.google.com/search-console)

## Maintenance

- Review and update SEO strategy quarterly
- Monitor Core Web Vitals monthly
- Audit structured data after schema.org updates
- Update sitemaps when adding new routes
- Refresh content annually for freshness
- Track algorithm updates and adapt accordingly
- Analyze competitor SEO strategies
- Update meta descriptions based on CTR performance
