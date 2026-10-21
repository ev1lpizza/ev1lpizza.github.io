import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE, url } from '../data/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('devlog', ({ data }) => !data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: `${SITE.name} devlog`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({ title: p.data.title, pubDate: p.data.date, description: p.data.summary, link: url(`devlog/${p.id}/`) })),
  });
}
