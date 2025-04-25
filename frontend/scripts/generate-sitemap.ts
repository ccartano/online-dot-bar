import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface Cocktail {
  id: number;
  slug: string;
}

interface Ingredient {
  id: number;
  slug: string;
}

const fetchCocktails = async (): Promise<Cocktail[]> => {
  const response = await fetch('http://localhost:3000/api/cocktails');
  if (!response.ok) {
    throw new Error('Failed to fetch cocktails');
  }
  return response.json();
};

const fetchIngredients = async (): Promise<Ingredient[]> => {
  const response = await fetch('http://localhost:3000/api/ingredients');
  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }
  return response.json();
};

const generateSitemap = async () => {
  try {
    // Fetch all cocktails and ingredients
    const cocktails = await fetchCocktails();
    const ingredients = await fetchIngredients();

    // Start building the sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://theonline.bar/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://theonline.bar/cocktails</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://theonline.bar/ingredients</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://theonline.bar/products</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add all cocktail pages
    cocktails.forEach(cocktail => {
      sitemap += `
  <url>
    <loc>https://theonline.bar/cocktails/${cocktail.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add all ingredient pages
    ingredients.forEach(ingredient => {
      sitemap += `
  <url>
    <loc>https://theonline.bar/ingredients/${ingredient.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Close the sitemap
    sitemap += '\n</urlset>';

    // Write the sitemap to the public directory
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

generateSitemap(); 