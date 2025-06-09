import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  structuredData?: any;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

function SEOHead({
  title = "RecruiterCopilot.live - AI-Powered Resume Matching & Candidate Analysis Tool",
  description = "Free AI tool that instantly matches resumes to job descriptions with 90%+ accuracy. Save 10+ hours per hire with automated candidate screening, skills analysis, and match scoring.",
  keywords = "AI recruiter tool, resume matching software, candidate screening AI, recruitment automation, HR technology, talent acquisition, resume parser, job matching algorithm, hiring software, recruitment AI, ATS software, AI hiring tools, automated recruiting, resume screening software, AI candidate matching",
  canonical,
  ogImage = "https://recruitercopilot.live/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  structuredData,
  author = "RecruiterCopilot.live",
  publishedTime,
  modifiedTime
}: SEOHeadProps) {
  const fullTitle = title.includes('RecruiterCopilot.live') ? title : `${title} | RecruiterCopilot.live`;
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://recruitercopilot.live');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"} />
      
      {/* Language and Location */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="RecruiterCopilot.live" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:image:alt" content={title} />
      
      {/* Article specific tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEOHead; 