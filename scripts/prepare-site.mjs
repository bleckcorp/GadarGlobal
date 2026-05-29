import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const pages = [
  {
    src: 'src/index.html',
    out: 'public/index.html',
    title: 'Gadar Global Solutions | AI Automation, Web, Mobile and Enterprise Software',
    description:
      'Gadar Global Solutions designs and builds AI automation, web applications, mobile apps, and enterprise software that help teams launch faster and grow revenue.',
    path: '/',
    image: '/assets/company.jpg',
  },
  {
    src: 'src/about.html',
    out: 'public/about.html',
    title: 'About Gadar Global Solutions | AI and Software Engineering Partner',
    description:
      'Learn about Gadar Global Solutions, a software and AI delivery partner helping startups and enterprises turn business goals into secure, scalable digital products.',
    path: '/about',
    image: '/assets/company.jpg',
  },
  {
    src: 'src/services.html',
    out: 'public/services.html',
    title: 'Software Development and AI Automation Services | Gadar Global Solutions',
    description:
      'Explore Gadar Global services across AI automation, full-stack development, mobile applications, enterprise systems, cloud architecture, and sector-specific platforms.',
    path: '/services',
    image: '/assets/ai-automation.jpg',
  },
  {
    src: 'src/portfolio.html',
    out: 'public/portfolio.html',
    title: 'Portfolio and Case Studies | Gadar Global Solutions',
    description:
      'See selected Gadar Global software and AI case studies across healthcare, fintech, commerce, education, logistics, and enterprise operations.',
    path: '/portfolio',
    image: '/assets/healthtech-ehr.jpg',
  },
  {
    src: 'src/contact.html',
    out: 'public/contact.html',
    title: 'Contact Gadar Global Solutions | Start Your Software or AI Project',
    description:
      'Contact Gadar Global Solutions to discuss AI automation, software development, mobile app, or enterprise platform projects.',
    path: '/contact',
    image: '/assets/company.jpg',
  },
  {
    src: 'src/privacy.html',
    out: 'public/privacy.html',
    title: 'Privacy Policy | Gadar Global Solutions',
    description:
      'Read the Gadar Global Solutions privacy policy covering what information we collect, how we use it, cookies, data sharing, retention, security, and your privacy rights.',
    path: '/privacy',
    image: '/assets/company.jpg',
  },
  {
    src: 'src/terms.html',
    out: 'public/terms.html',
    title: 'Terms and Conditions | Gadar Global Solutions',
    description:
      'Read the Gadar Global Solutions terms and conditions for website use, services, intellectual property, refunds, liability, privacy, and contact information.',
    path: '/terms',
    image: '/assets/company.jpg',
  },
];

function logoSvg(size = 34) {
  return `<img class="brand-mark" src="assets/gadar-logo.svg" width="${size}" height="${size}" alt="Gadar Global Solutions logo">`;
}

function seoTags({ title, description, path, image }) {
  const url = `https://gadar-global.vercel.app${path}`;
  return `
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0c1810">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.svg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Gadar Global Solutions">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gadar Global Solutions',
    url,
    logo: 'https://gadar-global.vercel.app/assets/gadar-logo.svg',
    description,
    sameAs: [],
  })}</script>`;
}

function injectSeo(html, page) {
  html = html.replace(/<title>.*?<\/title>/s, `<title>${page.title}</title>`);
  return html.replace('</head>', `${seoTags(page)}\n</head>`);
}

// Layout template loader
const headLayout = readFileSync('src/layout/head.html', 'utf8').trim();
const navLayout = readFileSync('src/layout/nav.html', 'utf8').trim();
const footerLayout = readFileSync('src/layout/footer.html', 'utf8').trim();

function normalize(html, page) {
  // 1. Inject Head layout
  html = html.replace('<!-- INJECT_HEAD -->', headLayout);

  // 2. Inject Nav layout with Active Page indication
  let nav = navLayout;
  const pageFilename = page.src.replace('src/', ''); // e.g. 'index.html', 'about.html'
  
  // Set the correct class="active" based on current page
  if (pageFilename === 'index.html') {
    nav = nav.replace('href="index.html"', 'href="index.html" class="active"');
  } else {
    nav = nav.replace(`href="${pageFilename}"`, `href="${pageFilename}" class="active"`);
  }
  html = html.replace('<!-- INJECT_NAV -->', nav);

  // 3. Inject Footer layout
  html = html.replace('<!-- INJECT_FOOTER -->', footerLayout);

  // 4. Normalize SVG logo images inside header and footer
  html = html.replace(/<svg width="34" height="34" viewBox="0 0 34 34" fill="none"(?: xmlns="http:\/\/www\.w3\.org\/2000\/svg")?>[\s\S]*?<\/svg>/g, logoSvg(34));
  html = html.replace(/<svg width="30" height="30" viewBox="0 0 34 34" fill="none">[\s\S]*?<\/svg>/g, logoSvg(30));

  // 5. Inject SEO tags
  html = injectSeo(html, page);

  // 6. Inject the site.js script and defer
  html = html.replace('</body>', '<script src="site.js" defer></script>\n</body>');

  return html;
}

// Clean and prepare build folders
rmSync('public', { recursive: true, force: true });
mkdirSync('public/assets', { recursive: true });

// Compile all structured page templates
for (const page of pages) {
  if (!existsSync(page.src)) {
    throw new Error(`Missing source file: ${page.src}`);
  }
  writeFileSync(page.out, normalize(readFileSync(page.src, 'utf8'), page));
}

// Generate Blog overview page
const blogPageSource = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | Gadar Global Solutions</title>
  <!-- INJECT_HEAD -->
</head>
<body>
<!-- INJECT_NAV -->
<main>
  <section class="page-hero">
    <div class="page-hero-bg"><div class="page-hero-dots"></div></div>
    <div class="container" style="position:relative; z-index:1;">
      <div class="reveal" style="max-width:760px;">
        <span class="label">Blog</span>
        <h1 class="display" style="margin-bottom:1.25rem;">The Gadar Global<br><span class="green">Blog.</span></h1>
        <p class="body-lg" style="max-width:560px;">Insights, updates, and practical articles on AI automation, product delivery, cloud systems, and digital transformation.</p>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="grid-3 blog-grid" data-blog-list>
        <article class="blog-card reveal">
          <div class="blog-meta">AI Strategy</div>
          <h2>How AI Automation Turns Operational Drag Into Revenue Momentum</h2>
          <p>Most automation projects fail when they start with tools instead of process. The best results come from mapping repeated handoffs, deciding what should be automated, and keeping humans in the loop for judgment-heavy decisions.</p>
          <a class="blog-link" href="contact.html">Discuss an automation project</a>
        </article>
      </div>
    </div>
  </section>
</main>
<!-- INJECT_FOOTER -->
</body>
</html>`;

writeFileSync(
  'public/blog.html',
  normalize(blogPageSource, {
    src: 'src/blog.html',
    title: 'Blog | Gadar Global Solutions',
    description: 'Insights from Gadar Global Solutions on AI automation, product strategy, software engineering, and enterprise digital transformation.',
    path: '/blog.html',
    image: '/assets/ai-automation.jpg',
  })
);

// Generate Blog Post detail page
const blogPostPageSource = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Post | Gadar Global Solutions</title>
  <!-- INJECT_HEAD -->
</head>
<body>
<!-- INJECT_NAV -->
<main>
  <article class="section blog-detail-section">
    <div class="container">
      <div class="blog-detail reveal" data-blog-post>
        <div class="blog-detail-meta">Loading article</div>
        <h1 class="display">Loading blog post...</h1>
        <p class="blog-detail-excerpt">Fetching the latest article...</p>
      </div>
    </div>
  </article>
</main>
<!-- INJECT_FOOTER -->
</body>
</html>`;

writeFileSync(
  'public/blog-post.html',
  normalize(blogPostPageSource, {
    src: 'src/blog-post.html',
    title: 'Blog Post | Gadar Global Solutions',
    description: 'Read Gadar Global Solutions articles on AI automation, product delivery, cloud systems, and digital transformation.',
    path: '/blog-post.html',
    image: '/assets/ai-automation.jpg',
  })
);

// Process & Inject Environment Variables into site.js
let siteJsContent = readFileSync('src/site.js', 'utf8');
const staticFormsKey = process.env.STATIC_FORMS_ACCESS_KEY || '';
siteJsContent = siteJsContent.replace('__STATIC_FORMS_ACCESS_KEY__', staticFormsKey);
writeFileSync('public/site.js', siteJsContent);

// Copy styles, icons, and logo assets directly to public
cpSync('src/gadar-styles.css', 'public/gadar-styles.css');
cpSync('src/favicon.svg', 'public/favicon.svg');

for (const asset of [
  'ai-automation.jpg',
  'enterprise-software.jpg',
  'logistics-fleet.jpg',
  'company.jpg',
  'mobile-apps.jpg',
  'healthtech-ehr.jpg',
  'fintech-fraud.jpg',
  'edtech-lms.jpg',
  'ecommerce-platform.jpg',
  'fullstack-dev.jpg',
  'gadar-logo.svg',
  'apple-touch-icon.svg',
]) {
  cpSync(`assets/${asset}`, `public/assets/${asset}`);
}

console.log('Site successfully prepared under public/');
