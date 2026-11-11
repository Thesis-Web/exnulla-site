import type { APIRoute } from 'astro';
import { FILMS, PUBLIC_ORIGIN, FILM_PUBLISHED } from '../data/films';

const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!,
  );

export const GET: APIRoute = () => {
  const entries = (['cortex', 'neuron'] as const)
    .map((id) => {
      const item = FILMS[id];
      return `<url><loc>${PUBLIC_ORIGIN}/lab/${id}/</loc><video:video>
<video:thumbnail_loc>${PUBLIC_ORIGIN}/assets/films/${id}-poster.jpg</video:thumbnail_loc>
<video:title>${xml(`${item.name} — ${item.title}`)}</video:title>
<video:description>${xml(`${item.description} Recorded from the live engine; narrated in English with captions.`)}</video:description>
<video:content_loc>${PUBLIC_ORIGIN}/assets/films/${id}.mp4</video:content_loc>
<video:duration>${item.duration}</video:duration><video:publication_date>${FILM_PUBLISHED}</video:publication_date>
</video:video></url>`;
    })
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
