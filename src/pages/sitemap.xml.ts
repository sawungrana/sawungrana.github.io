import type { APIRoute } from "astro";

const routes = ["/", "/cv/", "/work/", "/colophon/"];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://sawungrana.github.io");
  const urls = routes
    .map((route) => `  <url><loc>${new URL(route, base).href}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
