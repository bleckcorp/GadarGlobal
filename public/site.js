const STATIC_FORMS_ACCESS_KEY = '';

const fallbackConfig = {
  email: 'hello@gadar.io',
  phone: '+1 (234) 567-890',
  phoneHref: '+12345678900',
  location: 'Global Remote Team',
};

const fallbackPosts = [
  {
    title: 'How AI Automation Turns Operational Drag Into Revenue Momentum',
    excerpt:
      'Most automation projects fail when they start with tools instead of process. The best results come from mapping repeated handoffs, deciding what should be automated, and keeping humans in the loop for judgment-heavy decisions.',
    date: '2026-05-18',
    category: 'AI Strategy',
    featuredImage: '/assets/ai-automation.jpg',
    slug: 'ai-automation-operational-drag-revenue-momentum',
    link: '/blog/ai-automation-operational-drag-revenue-momentum',
    detailUrl: '/blog/ai-automation-operational-drag-revenue-momentum',
    content: `
      <p>Most automation projects fail when they begin with tools instead of operations. The useful starting point is the work itself: repeated handoffs, approval delays, data entry loops, reporting bottlenecks, and the decisions that slow a team down.</p>
      <p>A practical AI automation roadmap starts by separating routine work from judgment-heavy work. Routine work can often be automated directly. Judgment-heavy work should be supported with recommendations, summaries, alerts, or draft outputs that keep a human in control.</p>
    `,
  },
];

const themeStates = ['system', 'light', 'dark'];
const themeIcons = {
  system: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15h-11A2.5 2.5 0 0 1 4 12.5z"/><path d="M9 21h6"/><path d="M12 15v6"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  dark: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z"/>',
};

function getSavedTheme() {
  const saved = localStorage.getItem('gadar-theme');
  return themeStates.includes(saved) ? saved : 'system';
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.dataset.theme = theme;
  }
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.dataset.themeState = theme;
    button.setAttribute('aria-label', `Theme: ${theme}. Click to change.`);
    button.title = `Theme: ${theme}`;
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${themeIcons[theme]}</svg>`;
  });
}

applyTheme(getSavedTheme());

function stripHtml(value = '') {
  const div = document.createElement('div');
  div.innerHTML = value;
  return div.textContent || div.innerText || '';
}

function renderPost(post, heading = 'h3') {
  const title = stripHtml(post.title?.rendered || post.title || fallbackPosts[0].title);
  const excerpt = stripHtml(post.excerpt?.rendered || post.excerpt || fallbackPosts[0].excerpt).replace(/\s+/g, ' ').trim();
  const category = post.category || post.categories?.[0]?.name || 'Insights';
  const link = post.detailUrl || post.link || `/blog/${post.slug || fallbackPosts[0].slug}`;
  return `<article class="blog-card reveal">
    <div class="blog-meta">${category}</div>
    <${heading}>${title}</${heading}>
    <p>${excerpt}</p>
    <a class="blog-link" href="${link}">Read article</a>
  </article>`;
}

async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Config unavailable');
    return { ...fallbackConfig, ...(await response.json()) };
  } catch {
    return fallbackConfig;
  }
}

async function loadPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Posts unavailable');
    const posts = await response.json();
    return Array.isArray(posts) && posts.length ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

async function loadPost(slug) {
  try {
    const response = await fetch(`/api/post?slug=${encodeURIComponent(slug || fallbackPosts[0].slug)}`);
    if (!response.ok) throw new Error('Post unavailable');
    return await response.json();
  } catch {
    return { ...fallbackPosts[0], slug: slug || fallbackPosts[0].slug };
  }
}

function activePostSlug() {
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('slug');
  if (querySlug) return querySlug;
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] === 'blog' && parts[1] ? parts[1] : fallbackPosts[0].slug;
}

function updateContactLinks(config) {
  const replaceText = (from, to) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.textContent.includes(from)) node.textContent = node.textContent.replaceAll(from, to);
    });
  };

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${config.email}`;
  });

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${config.phoneHref}`;
  });

  replaceText('hello@gadar.io', config.email);
  replaceText('+1 (234) 567-890', config.phone);
  replaceText('Global Remote Team', config.location);
}

function initHomeDynamicSections() {
  const track = document.getElementById('marqueeTrack');
  if (track && !track.children.length) {
    [
      'AI & Automation', 'Full-Stack Development', 'Mobile Apps', 'Enterprise Software',
      'Healthcare', 'Finance', 'E-commerce', 'Education', 'Logistics', 'Manufacturing',
      'AI & Automation', 'Full-Stack Development', 'Mobile Apps', 'Enterprise Software',
      'Healthcare', 'Finance', 'E-commerce', 'Education', 'Logistics', 'Manufacturing',
    ].forEach((txt) => {
      const span = document.createElement('span');
      span.className = 'marquee-item';
      span.innerHTML = `<span class="marquee-sep"></span>${txt}`;
      track.appendChild(span);
    });
  }

  const industryGrid = document.getElementById('industryGrid');
  if (industryGrid && !industryGrid.children.length) {
    [
      ['Healthcare', '🏥'], ['Finance', '📈'], ['E-commerce', '🛒'], ['Education', '📚'],
      ['Real Estate', '🏢'], ['Logistics', '🚛'], ['Manufacturing', '⚙️'], ['More', '→'],
    ].forEach(([name, mark], index) => {
      const card = document.createElement('div');
      card.className = 'card card-green reveal visible';
      card.style.transitionDelay = `${index * 0.05}s`;
      card.style.padding = '1.5rem';
      card.innerHTML = `<div style="font-size:1.6rem; margin-bottom:0.75rem; line-height:1;">${mark}</div><div style="font-family:var(--ff-display); font-size:0.95rem; font-weight:700; letter-spacing:-0.01em;">${name}</div>`;
      industryGrid.appendChild(card);
    });
  }

  const techGrid = document.getElementById('techGrid');
  if (techGrid && !techGrid.children.length) {
    [
      ['React', 'Frontend'], ['Next.js', 'Frontend'], ['TypeScript', 'Frontend'], ['Node.js', 'Backend'],
      ['Python', 'Backend'], ['PostgreSQL', 'Database'], ['AWS', 'Cloud'], ['Docker', 'DevOps'],
      ['OpenAI', 'AI'], ['MongoDB', 'Database'], ['TensorFlow', 'AI'], ['Kubernetes', 'DevOps'],
      ['Shopify', 'Commerce'], ['Zapier', 'Automation'],
    ].forEach(([name, cat], index) => {
      const card = document.createElement('div');
      card.className = 'tech-item reveal visible';
      card.style.transitionDelay = `${index * 0.04}s`;
      card.innerHTML = `<div style="font-family:var(--ff-display); font-size:1rem; font-weight:800; color:var(--green);">${name.slice(0, 2)}</div><div class="tech-name">${name}</div><div class="tech-cat">${cat}</div>`;
      techGrid.appendChild(card);
    });
  }
}

function initCommon() {
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  }
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && !document.querySelector('.theme-toggle')) {
    const themeButton = document.createElement('button');
    themeButton.type = 'button';
    themeButton.className = 'theme-toggle';
    mobileToggle.insertAdjacentElement('beforebegin', themeButton);
    applyTheme(getSavedTheme());
  }
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const current = getSavedTheme();
      const next = themeStates[(themeStates.indexOf(current) + 1) % themeStates.length];
      localStorage.setItem('gadar-theme', next);
      applyTheme(next);
    });
  });
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => revealObs.observe(el));
}

async function initBlog() {
  const preview = document.querySelector('[data-blog-preview]');
  const list = document.querySelector('[data-blog-list]');
  if (!preview && !list) return;
  const posts = await loadPosts();
  if (preview) preview.innerHTML = posts.slice(0, 3).map((post) => renderPost(post, 'h3')).join('');
  if (list) list.innerHTML = posts.map((post) => renderPost(post, 'h2')).join('');
  document.querySelectorAll('.blog-card').forEach((card) => card.classList.add('visible'));
}

async function initBlogPost() {
  const shell = document.querySelector('[data-blog-post]');
  if (!shell) return;
  const post = await loadPost(activePostSlug());
  const title = stripHtml(post.title || fallbackPosts[0].title);
  const excerpt = stripHtml(post.excerpt || fallbackPosts[0].excerpt);
  const date = post.date ? new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  document.title = `${title} | Gadar Global Blog`;
  shell.innerHTML = `
    <div class="blog-detail-meta">${post.category || 'Insights'}${date ? ` · ${date}` : ''}</div>
    <h1 class="display">${title}</h1>
    ${excerpt ? `<p class="blog-detail-excerpt">${excerpt}</p>` : ''}
    ${post.featuredImage ? `<img class="blog-detail-image" src="${post.featuredImage}" alt="">` : ''}
    <div class="blog-detail-content">${post.content || fallbackPosts[0].content}</div>
    <div class="blog-detail-actions">
      <a class="btn btn-outline" href="/blog">Back to Blog</a>
      ${post.sourceUrl ? `<a class="btn btn-ghost" href="${post.sourceUrl}" target="_blank" rel="noopener">View source</a>` : ''}
    </div>
  `;
  shell.classList.add('visible');
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    const original = btn.innerHTML;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    if (STATIC_FORMS_ACCESS_KEY && STATIC_FORMS_ACCESS_KEY !== '__STATIC_FORMS_ACCESS_KEY__') {
      try {
        const payload = {
          ...data,
          accessKey: STATIC_FORMS_ACCESS_KEY,
          subject: 'New Gadar Global website inquiry',
          replyTo: data.email,
        };
        const response = await fetch('https://api.staticforms.xyz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Static Forms submission failed');
        form.style.display = 'none';
        const success = document.getElementById('successMsg');
        if (success) success.style.display = 'block';
      } catch (err) {
        console.error('Frontend Submit Error:', err);
        btn.textContent = 'Try again';
        btn.disabled = false;
        setTimeout(() => { btn.innerHTML = original; }, 1800);
      }
    } else {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Submit failed');
        form.style.display = 'none';
        const success = document.getElementById('successMsg');
        if (success) success.style.display = 'block';
      } catch (err) {
        console.error('Backend Submit Error:', err);
        btn.textContent = 'Try again';
        btn.disabled = false;
        setTimeout(() => { btn.innerHTML = original; }, 1800);
      }
    }
  });
}

function initPortfolioFilter() {
  const filterBar = document.getElementById('filterBar');
  const projectsGrid = document.getElementById('projectsGrid');
  if (!filterBar || !projectsGrid) return;
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('#projectsGrid [data-industry]').forEach((card) => {
        const show = filter === 'all' || card.dataset.industry === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommon();
  initContactForm();
  initHomeDynamicSections();
  initBlog();
  initBlogPost();
  initPortfolioFilter();
  updateContactLinks(await loadConfig());
});
