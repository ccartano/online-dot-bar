import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

interface StructuredData {
  [key: string]: any;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  ogType?: string;
  twitterCard?: string;
  additionalMetaTags?: MetaTag[];
  structuredData?: StructuredData;
}

export const SEO = ({
  title = 'The Online.Bar - Cocktail Recipes & Mixology Guide',
  description = 'Your comprehensive cocktail and mixology resource. Search and discover cocktail recipes, ingredients, and bartending techniques.',
  image = 'https://theonline.bar/og-image.jpg',
  noindex = false,
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  additionalMetaTags = [],
  structuredData
}: SEOProps) => {
  const location = useLocation();
  const canonicalUrl = customCanonicalUrl || `https://theonline.bar${location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta
          key={index}
          {...(tag.name ? { name: tag.name } : {})}
          {...(tag.property ? { property: tag.property } : {})}
          content={tag.content}
        />
      ))}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}; 