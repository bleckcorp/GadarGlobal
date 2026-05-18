const fallbackPost = {
  id: 'default-ai-automation',
  slug: 'ai-automation-operational-drag-revenue-momentum',
  title: 'How AI Automation Turns Operational Drag Into Revenue Momentum',
  excerpt:
    'Most automation projects fail when they start with tools instead of process. The best results come from mapping repeated handoffs, deciding what should be automated, and keeping humans in the loop for judgment-heavy decisions.',
  date: '2026-05-18',
  category: 'AI Strategy',
  featuredImage: '/assets/ai-automation.jpg',
  sourceUrl: null,
  link: '/blog/ai-automation-operational-drag-revenue-momentum',
  detailUrl: '/blog/ai-automation-operational-drag-revenue-momentum',
  content: `
    <p>Most automation projects fail when they begin with tools instead of operations. The useful starting point is the work itself: repeated handoffs, approval delays, data entry loops, reporting bottlenecks, and the decisions that slow a team down.</p>
    <p>A practical AI automation roadmap starts by separating routine work from judgment-heavy work. Routine work can often be automated directly. Judgment-heavy work should be supported with recommendations, summaries, alerts, or draft outputs that keep a human in control.</p>
    <h2>Start with the workflow</h2>
    <p>Before choosing a model, map the workflow from request to result. Identify who owns each step, which systems hold the data, where errors happen, and what a good outcome looks like. This keeps automation tied to measurable business value.</p>
    <h2>Measure the business impact</h2>
    <p>The best automation programs track cycle time, cost per task, error rate, conversion lift, and customer response time. These metrics make it clear whether AI is improving the business or only adding another layer of software.</p>
  `,
};

function baseUrl() {
  return (process.env.WORDPRESS_API_URL || process.env.WP_API_URL || '').replace(/\/$/, '');
}

function postEndpoint(slug) {
  const base = baseUrl();
  if (!base || !slug) return null;
  const api = base.includes('/wp-json/') ? base : `${base}/wp-json/wp/v2`;
  return `${api}/posts?slug=${encodeURIComponent(slug)}&_embed=1`;
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
    content: post.content?.rendered || '',
  };
}

export default async function handler(request, response) {
  const slug = request.query?.slug || fallbackPost.slug;
  const url = postEndpoint(slug);
  if (!url) return response.status(200).json({ ...fallbackPost, slug });

  try {
    const wp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!wp.ok) throw new Error(`WordPress returned ${wp.status}`);
    const posts = await wp.json();
    if (!Array.isArray(posts) || !posts.length) return response.status(404).json({ error: 'Post not found' });
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return response.status(200).json(normalizePost(posts[0]));
  } catch {
    return response.status(200).json({ ...fallbackPost, slug });
  }
}
