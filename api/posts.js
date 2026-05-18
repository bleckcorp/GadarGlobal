const fallbackPosts = [
  {
    title: 'How AI Automation Turns Operational Drag Into Revenue Momentum',
    excerpt:
      'Most automation projects fail when they start with tools instead of process. The best results come from mapping repeated handoffs, deciding what should be automated, and keeping humans in the loop for judgment-heavy decisions.',
    date: '2026-05-18',
    category: 'AI Strategy',
    link: '/blog.html',
  },
];

function endpoint() {
  const base = process.env.WORDPRESS_API_URL || process.env.WP_API_URL || '';
  if (!base) return null;
  const clean = base.replace(/\/$/, '');
  return clean.includes('/wp-json/') ? `${clean}/posts?per_page=6&_embed=1` : `${clean}/wp-json/wp/v2/posts?per_page=6&_embed=1`;
}

export default async function handler(request, response) {
  const url = endpoint();
  if (!url) return response.status(200).json(fallbackPosts);

  try {
    const wp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!wp.ok) throw new Error(`WordPress returned ${wp.status}`);
    const posts = await wp.json();
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return response.status(200).json(posts);
  } catch {
    return response.status(200).json(fallbackPosts);
  }
}
