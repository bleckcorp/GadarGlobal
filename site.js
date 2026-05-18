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
    link: 'contact.html',
  },
];

function stripHtml(value = '') {
  const div = document.createElement('div');
  div.innerHTML = value;
  return div.textContent || div.innerText || '';
}

function renderPost(post, heading = 'h3') {
  const title = stripHtml(post.title?.rendered || post.title || fallbackPosts[0].title);
  const excerpt = stripHtml(post.excerpt?.rendered || post.excerpt || fallbackPosts[0].excerpt).replace(/\s+/g, ' ').trim();
  const category = post.category || post.categories?.[0]?.name || 'Insights';
  const link = post.link || 'blog.html';
  return `<article class="blog-card reveal">
    <div class="blog-meta">${category}</div>
    <${heading}>${title}</${heading}>
    <p>${excerpt}</p>
    <a class="blog-link" href="${link}" target="${/^https?:/.test(link) ? '_blank' : '_self'}" rel="noopener">Read article</a>
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
      ['Healthcare', 'HL'], ['Finance', 'FN'], ['E-commerce', 'EC'], ['Education', 'ED'],
      ['Real Estate', 'RE'], ['Logistics', 'LG'], ['Manufacturing', 'MF'], ['More', '++'],
    ].forEach(([name, mark], index) => {
      const card = document.createElement('div');
      card.className = 'card card-green reveal visible';
      card.style.transitionDelay = `${index * 0.05}s`;
      card.style.padding = '1.5rem';
      card.innerHTML = `<div class="industry-mark">${mark}</div><div style="font-family:var(--ff-display); font-size:0.95rem; font-weight:700; letter-spacing:-0.01em;">${name}</div>`;
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

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    const original = btn.innerHTML;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error('Submit failed');
      form.style.display = 'none';
      const success = document.getElementById('successMsg');
      if (success) success.style.display = 'block';
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
      setTimeout(() => {
        btn.innerHTML = original;
      }, 1800);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommon();
  initContactForm();
  initHomeDynamicSections();
  initBlog();
  updateContactLinks(await loadConfig());
});
