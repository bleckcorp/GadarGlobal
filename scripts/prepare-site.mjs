import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const replacements = [
  [/Gadar Global\.html/g, 'index.html'],
  [/Gadar About\.html/g, 'about.html'],
  [/Gadar Services\.html/g, 'services.html'],
  [/Gadar Portfolio\.html/g, 'portfolio.html'],
  [/Gadar Contact\.html/g, 'contact.html'],
  [/index\.html#blog/g, 'blog.html'],
  [/https:\/\/linkedin\.com/g, '#'],
  [/https:\/\/twitter\.com/g, '#'],
  [/https:\/\/github\.com/g, '#'],
];

const pages = [
  {
    src: 'Gadar Global.html',
    out: 'index.html',
    title: 'Gadar Global Solutions | AI Automation, Web, Mobile and Enterprise Software',
    description:
      'Gadar Global Solutions designs and builds AI automation, web applications, mobile apps, and enterprise software that help teams launch faster and grow revenue.',
    path: '/',
    image: '/assets/company.jpg',
  },
  {
    src: 'Gadar About.html',
    out: 'about.html',
    title: 'About Gadar Global Solutions | AI and Software Engineering Partner',
    description:
      'Learn about Gadar Global Solutions, a software and AI delivery partner helping startups and enterprises turn business goals into secure, scalable digital products.',
    path: '/about.html',
    image: '/assets/company.jpg',
  },
  {
    src: 'Gadar Services.html',
    out: 'services.html',
    title: 'Software Development and AI Automation Services | Gadar Global Solutions',
    description:
      'Explore Gadar Global services across AI automation, full-stack development, mobile applications, enterprise systems, cloud architecture, and sector-specific platforms.',
    path: '/services.html',
    image: '/assets/ai-automation.jpg',
  },
  {
    src: 'Gadar Portfolio.html',
    out: 'portfolio.html',
    title: 'Portfolio and Case Studies | Gadar Global Solutions',
    description:
      'See selected Gadar Global software and AI case studies across healthcare, fintech, commerce, education, logistics, and enterprise operations.',
    path: '/portfolio.html',
    image: '/assets/healthtech-ehr.jpg',
  },
  {
    src: 'Gadar Contact.html',
    out: 'contact.html',
    title: 'Contact Gadar Global Solutions | Start Your Software or AI Project',
    description:
      'Contact Gadar Global Solutions to discuss AI automation, software development, mobile app, or enterprise platform projects.',
    path: '/contact.html',
    image: '/assets/company.jpg',
  },
];

function applyReplacements(html) {
  return replacements.reduce((acc, [from, to]) => acc.replace(from, to), html);
}

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

function cleanupHome(html) {
  const blog = `
<!-- BLOG -->
<section class="section" id="blog" style="background:var(--bg-2); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="container">
    <div class="section-header" style="display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1.5rem; margin-bottom:3rem;">
      <div class="reveal">
        <span class="label">Insights</span>
        <h2 class="headline">Latest from the blog</h2>
        <p class="body-lg" style="margin-top:1rem; max-width:520px;">Practical notes on AI, automation, product delivery, and enterprise software.</p>
      </div>
      <a href="blog.html" class="btn btn-ghost reveal" style="transition-delay:.1s; flex-shrink:0;">Read the blog</a>
    </div>
    <div class="grid-3 blog-grid" data-blog-preview>
      <article class="blog-card reveal">
        <div class="blog-meta">AI Strategy</div>
        <h3>How AI Automation Turns Operational Drag Into Revenue Momentum</h3>
        <p>See how intelligent workflows remove bottlenecks, improve handoffs, and give teams more time for customer-facing work.</p>
        <a href="blog.html" class="blog-link">Read article</a>
      </article>
    </div>
  </div>
</section>`;
  html = html.replace('<!-- ── CTA ───────────────────────────────────────────────────── -->', `${blog}\n\n<!-- ── CTA ───────────────────────────────────────────────────── -->`);
  html = html.replace(/<!-- ── TWEAKS PANEL[\s\S]*?applyTweaks\(\);\n<\/script>/, '');
  return html;
}

function cleanupContact(html) {
  html = html.replace('<form id="contactForm" style="display:flex; flex-direction:column; gap:1.25rem;" novalidate>', '<form id="contactForm" style="display:flex; flex-direction:column; gap:1.25rem;" novalidate>');
  html = html.replace(/<input type="text" class="form-input" placeholder="Your name" required>/, '<input name="name" type="text" class="form-input" placeholder="Your name" required>');
  html = html.replace(/<input type="email" class="form-input" placeholder="you@company.com" required>/, '<input name="email" type="email" class="form-input" placeholder="you@company.com" required>');
  html = html.replace(/<input type="text" class="form-input" placeholder="Your company name">/, '<input name="company" type="text" class="form-input" placeholder="Your company name">');
  html = html.replace(/<select class="form-select">/, '<select name="service" class="form-select">');
  html = html.replace(/<select class="form-select">/, '<select name="budget" class="form-select">');
  html = html.replace(/<textarea class="form-textarea" placeholder="Tell us about your project, goals, and timeline\.\.\." required><\/textarea>/, '<textarea name="message" class="form-textarea" placeholder="Tell us about your project, goals, and timeline..." required></textarea>');
  html = html.replace(/<select class="form-select">/, '<select name="source" class="form-select">');
  html = html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, '</body>');
  return html;
}

function normalize(html, page) {
  html = applyReplacements(html);
  html = html.replace(/<svg width="34" height="34" viewBox="0 0 34 34" fill="none"(?: xmlns="http:\/\/www\.w3\.org\/2000\/svg")?>[\s\S]*?<\/svg>/g, logoSvg(34));
  html = html.replace(/<svg width="30" height="30" viewBox="0 0 34 34" fill="none">[\s\S]*?<\/svg>/g, logoSvg(30));
  html = html.replace(/<li><a href="blog\.html">Blog<\/a><\/li>/g, '<li><a href="blog.html">Blog</a></li>');
  html = html.replace(/<a href="#"([^>]*)>Privacy Policy<\/a>/g, '<a href="privacy.html"$1>Privacy Policy</a>');
  html = html.replace(/<a href="#"([^>]*)>Terms of Service<\/a>/g, '<a href="terms.html"$1>Terms and Conditions</a>');
  html = injectSeo(html, page);
  if (page.out === 'index.html') html = cleanupHome(html);
  if (page.out === 'contact.html') html = cleanupContact(html);
  html = html.replace(/<script>\s*const nav[\s\S]*?<\/script>\s*<\/body>/, '</body>');
  html = html.replace(/<li><a href="#">Blog<\/a><\/li>/g, '<li><a href="blog.html">Blog</a></li>');
  html = html.replace('</body>', '<script src="site.js" defer></script>\n</body>');
  return html;
}

for (const page of pages) {
  if (!existsSync(page.src)) {
    throw new Error(`Missing source file: ${page.src}`);
  }
  writeFileSync(page.out, normalize(readFileSync(page.src, 'utf8'), page));
}

const blogPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | Gadar Global Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="gadar-styles.css">
  ${seoTags({
    title: 'Blog | Gadar Global Solutions',
    description: 'Insights from Gadar Global Solutions on AI automation, product strategy, software engineering, and enterprise digital transformation.',
    path: '/blog.html',
    image: '/assets/ai-automation.jpg',
  })}
</head>
<body>
<nav class="nav scrolled" id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">${logoSvg(34)}<span class="nav-wordmark">Gadar<span class="dot">.</span></span></a>
      <ul class="nav-links">
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="index.html#solutions">Solutions</a></li>
        <li><a href="portfolio.html">Portfolio</a></li>
        <li><a href="blog.html" class="active">Blog</a></li>
      </ul>
      <a href="contact.html" class="btn btn-primary nav-cta-desktop">Get Started</a>
      <button class="nav-mobile-btn" id="mobileToggle" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="6" x2="20" y2="6"/><line x1="2" y1="11" x2="20" y2="11"/><line x1="2" y1="16" x2="20" y2="16"/></svg></button>
    </div>
    <div class="nav-mobile-menu" id="mobileMenu">
      <a href="about.html">About</a><a href="services.html">Services</a><a href="portfolio.html">Portfolio</a><a href="blog.html">Blog</a><a href="contact.html">Contact</a>
    </div>
  </div>
</nav>
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
<footer class="footer">
  <div class="container">
    <div class="footer-bottom">
      <span>© 2026 Gadar Global Solutions. All rights reserved.</span>
      <div class="footer-legal"><a href="index.html">Home</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms and Conditions</a></div>
    </div>
  </div>
</footer>
<script src="site.js" defer></script>
</body>
</html>`;
writeFileSync('blog.html', blogPage);

const blogPostPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Post | Gadar Global Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/gadar-styles.css">
  ${seoTags({
    title: 'Blog Post | Gadar Global Solutions',
    description: 'Read Gadar Global Solutions articles on AI automation, product delivery, cloud systems, and digital transformation.',
    path: '/blog-post.html',
    image: '/assets/ai-automation.jpg',
  })}
</head>
<body>
<nav class="nav scrolled" id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="/index.html" class="nav-logo"><img class="brand-mark" src="/assets/gadar-logo.svg" width="34" height="34" alt="Gadar Global Solutions logo"><span class="nav-wordmark">Gadar<span class="dot">.</span></span></a>
      <ul class="nav-links">
        <li><a href="/about.html">About</a></li>
        <li><a href="/services.html">Services</a></li>
        <li><a href="/index.html#solutions">Solutions</a></li>
        <li><a href="/portfolio.html">Portfolio</a></li>
        <li><a href="/blog.html" class="active">Blog</a></li>
      </ul>
      <a href="/contact.html" class="btn btn-primary nav-cta-desktop">Get Started</a>
      <button class="nav-mobile-btn" id="mobileToggle" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="6" x2="20" y2="6"/><line x1="2" y1="11" x2="20" y2="11"/><line x1="2" y1="16" x2="20" y2="16"/></svg></button>
    </div>
    <div class="nav-mobile-menu" id="mobileMenu">
      <a href="/about.html">About</a><a href="/services.html">Services</a><a href="/portfolio.html">Portfolio</a><a href="/blog.html">Blog</a><a href="/contact.html">Contact</a>
    </div>
  </div>
</nav>
<main>
  <article class="section blog-detail-section">
    <div class="container">
      <div class="blog-detail reveal" data-blog-post>
        <div class="blog-detail-meta">Loading article</div>
        <h1 class="display">Loading blog post...</h1>
        <p class="blog-detail-excerpt">Fetching the latest article from WordPress.</p>
      </div>
    </div>
  </article>
</main>
<footer class="footer">
  <div class="container">
    <div class="footer-bottom">
      <span>© 2026 Gadar Global Solutions. All rights reserved.</span>
      <div class="footer-legal"><a href="/blog.html">Blog</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms and Conditions</a></div>
    </div>
  </div>
</footer>
<script src="/site.js" defer></script>
</body>
</html>`;
writeFileSync('blog-post.html', blogPostPage);

rmSync('public', { recursive: true, force: true });
mkdirSync('public/assets', { recursive: true });

for (const file of ['index.html', 'about.html', 'services.html', 'portfolio.html', 'contact.html', 'blog.html', 'blog-post.html', 'privacy.html', 'terms.html', 'gadar-styles.css', 'site.js', 'favicon.svg']) {
  cpSync(file, `public/${file}`);
}
for (const asset of ['ai-automation.jpg', 'enterprise-software.jpg', 'logistics-fleet.jpg', 'company.jpg', 'mobile-apps.jpg', 'healthtech-ehr.jpg', 'fintech-fraud.jpg', 'edtech-lms.jpg', 'ecommerce-platform.jpg', 'fullstack-dev.jpg', 'gadar-logo.svg', 'apple-touch-icon.svg']) {
  cpSync(`assets/${asset}`, `public/assets/${asset}`);
}
