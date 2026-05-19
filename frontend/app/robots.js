export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/cart/', '/checkout/'],
    },
    sitemap: 'https://octunevintage.com/sitemap.xml', // Replace with actual production URL
  };
}
