const fallbackPosts = [
  {
    id: 'default-ai-automation',
    slug: 'ai-automation-operational-drag-revenue-momentum',
    title: 'How AI Automation Turns Operational Drag Into Revenue Momentum',
    excerpt:
      'Most automation projects fail when they start with tools instead of process. The best results come from mapping repeated handoffs, deciding what should be automated, and keeping humans in the loop for judgment-heavy decisions.',
    date: '2026-05-18',
    category: 'AI Strategy',
    featuredImage: '/assets/ai-automation.jpg',
    link: '/blog/ai-automation-operational-drag-revenue-momentum',
    detailUrl: '/blog/ai-automation-operational-drag-revenue-momentum',
  },
];

function endpoint() {
  const base = process.env.WORDPRESS_API_URL || process.env.WP_API_URL || '';
  if (!base) return null;
  const clean = base.replace(/\/$/, '');
  return clean.includes('/wp-json/') ? `${clean}/posts?per_page=6&_embed=1` : `${clean}/wp-json/wp/v2/posts?per_page=6&_embed=1`;
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function category(post) {
  const terms = post?._embedded?.['wp:term']?.flat?.() || [];
  return terms.find((term) => term.taxonomy === 'category')?.name || 'Insights';
}

function featuredImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
}

function normalizePost(post) {
  const slug = post.slug || String(post.id);
  return {
    id: post.id,
    slug,
    title: stripHtml(post.title?.rendered || post.title),
    excerpt: stripHtml(post.excerpt?.rendered || post.excerpt),
    date: post.date,
    category: category(post),
    featuredImage: featuredImage(post),
    sourceUrl: post.link,
    link: `/blog/${slug}`,
    detailUrl: `/blog/${slug}`,
  };
}

export default async function handler(request, response) {
  const url = endpoint();
  if (!url) return response.status(200).json(fallbackPosts);

  try {
    const wp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!wp.ok) throw new Error(`WordPress returned ${wp.status}`);
    const posts = await wp.json();
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return response.status(200).json(posts.map(normalizePost));
  } catch {
    return response.status(200).json(fallbackPosts);
  }
}
