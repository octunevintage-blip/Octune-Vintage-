import api from '@/lib/api';

export default async function sitemap() {
  const baseUrl = 'https://octunevintage.com'; // Replace with actual production URL

  // Base static routes
  const routes = ['', '/shop', '/about', '/terms', '/privacy', '/shipping'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch all products (including sold ones to keep URLs valid until deleted)
    const res = await api.get('/products?limit=1000');
    const products = res.data.products || [];

    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'never', // since they are 1-of-1 and don't change
      priority: 0.9,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return routes;
  }
}
