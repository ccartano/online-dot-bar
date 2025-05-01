import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Ingredient } from '../types/ingredient.types';
import { Cocktail } from '../types/cocktail.types';
import { titleize } from '../utils/formatting';
import { getIngredientTypeLabel } from '../utils/ingredientUtils';

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
  ingredient?: Ingredient;
  cocktail?: Cocktail;
}

export const SEO = ({
  title,
  description,
  image,
  noindex = false,
  canonicalUrl: customCanonicalUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  additionalMetaTags = [],
  structuredData,
  ingredient,
  cocktail
}: SEOProps) => {
  const location = useLocation();
  const canonicalUrl = customCanonicalUrl || `https://theonline.bar${location.pathname}`;

  // If ingredient is provided, use its data for SEO
  if (ingredient) {
    title = `${titleize(ingredient.name)} | The Online.Bar`;
    description = ingredient.description ? 
      `${ingredient.name}: ${ingredient.description}` : 
      `Learn about ${ingredient.name} in cocktails. Discover its characteristics, common uses, and cocktail recipes that feature this ingredient.`;
    image = ingredient.imageUrl || 'https://theonline.bar/og-image.jpg';
    ogType = 'article';
    additionalMetaTags = [
      { name: 'keywords', content: `cocktail ingredients, ${ingredient.name}, mixology, bartending, ${getIngredientTypeLabel(ingredient.type)}` },
      { property: 'article:published_time', content: ingredient.createdAt || new Date().toISOString() },
      { property: 'article:modified_time', content: ingredient.updatedAt || new Date().toISOString() },
      { property: 'article:section', content: 'Cocktail Ingredients' },
      { property: 'article:tag', content: getIngredientTypeLabel(ingredient.type) }
    ];
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': titleize(ingredient.name),
      'description': description,
      'image': image,
      'datePublished': ingredient.createdAt || new Date().toISOString(),
      'dateModified': ingredient.updatedAt || new Date().toISOString(),
      'author': {
        '@type': 'Organization',
        'name': 'The Online.Bar'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'The Online.Bar',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://theonline.bar/logo.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://theonline.bar/ingredients/${ingredient.slug}`
      }
    };
  }

  // If cocktail is provided, use its data for SEO
  if (cocktail) {
    title = `${titleize(cocktail.name)} | The Online.Bar`;
    description = cocktail.description ? 
      `${titleize(cocktail.name)}: ${cocktail.description}. Learn how to make this ${cocktail.category?.name || 'cocktail'} with step-by-step instructions, ingredients, and measurements.` : 
      `Learn how to make the perfect ${cocktail.name}. Get ingredients, measurements, and step-by-step instructions for this ${cocktail.category?.name || 'cocktail'}.`;
    image = cocktail.imageUrl || 'https://theonline.bar/og-image.jpg';
    ogType = 'article';
    additionalMetaTags = [
      { name: 'keywords', content: `cocktail recipe, ${cocktail.name}, ${cocktail.category?.name || ''}, mixology, bartending` },
      { property: 'article:published_time', content: cocktail.createdAt || cocktail.created || new Date().toISOString() },
      { property: 'article:modified_time', content: cocktail.updatedAt || new Date().toISOString() },
      { property: 'article:section', content: 'Cocktail Recipes' },
      { property: 'article:tag', content: cocktail.category?.name || 'Cocktail' }
    ];
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      'name': titleize(cocktail.name),
      'description': description,
      'image': image,
      'datePublished': cocktail.createdAt || cocktail.created || new Date().toISOString(),
      'dateModified': cocktail.updatedAt || new Date().toISOString(),
      'author': {
        '@type': 'Organization',
        'name': 'The Online.Bar'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'The Online.Bar',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://theonline.bar/logo.png'
        }
      },
      'recipeCategory': cocktail.category?.name || 'Cocktail',
      'recipeCuisine': 'Cocktail',
      'recipeIngredient': cocktail.ingredients.map(ing => 
        `${ing.amount ? `${ing.amount} ` : ''}${ing.unit ? `${ing.unit} ` : ''}${ing.ingredient.name}${ing.notes ? ` (${ing.notes})` : ''}`
      ),
      'recipeInstructions': cocktail.instructions ? cocktail.instructions.split('\n').filter(Boolean) : [],
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://theonline.bar/cocktails/${cocktail.slug}`
      }
    };
  }

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