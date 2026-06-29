/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ethiotourguider.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.5,
  autoLastmod: true,
  exclude: [],
  transform: async (config, path) => {
    const lastmod = new Date().toISOString()

    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod }
    }
    if (path.startsWith('/operator') || path.startsWith('/guide')) {
      return { loc: path, changefreq: 'weekly', priority: 0.6, lastmod }
    }

    return { loc: path, changefreq: config.changefreq, priority: config.priority, lastmod }
  },
  additionalPaths: async (config) => [
    { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() },
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [
      'https://ethiotourguider.com/sitemap.xml',
    ],
  },
}
