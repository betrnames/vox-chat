# Prompt for Claude CLI — vox.chat SERP fixes

Copy everything below the line into Claude Code from inside your vox.chat project directory.

---

I need you to fix how my site vox.chat appears in Google search results. Right now Google shows a generic globe icon instead of my logo, shows my site name as the bare lowercase domain, and truncates my description. Work through the following in order.

First, figure out what this project is built with — check package.json, the config files, and the folder structure — and tell me the framework and where the public/static assets and the HTML head live before you start editing. Follow whatever conventions this codebase already uses. Do not introduce a new metadata system if one already exists.

**Task 1 — Fix the favicon.**

Right now https://vox.chat/favicon.ico returns a 404 and https://vox.chat/favicon.png returns a 404. Only /favicon.svg and /apple-touch-icon.png exist. Google's favicon crawler falls back to /favicon.ico when the declared icon fails, and there's nothing there, so it gives up and shows a globe.

Find the existing favicon.svg in the public/static assets folder and open it. Check for three specific things that make Google silently reject an SVG favicon: a viewBox that isn't square (width and height must be equal), any use of fill="currentColor", and any embedded CSS media query for prefers-color-scheme. If you find any of those, fix them — make the viewBox square, replace currentColor with the actual hex color, and remove the color-scheme media query so the icon renders one fixed way.

Then generate the missing raster icons from that SVG. Use a tool that's already available or install one (sharp, or ImageMagick, or rsvg-convert — your call, tell me which you used). I need these files in the public/static root:

- favicon.ico — 32x32 and 48x48 multi-resolution
- icon-192.png — 192x192
- icon-512.png — 512x512

Every one of these must be square and must have a solid background color, not transparency. My brand's dark color is #0A0A0F, so if the logo mark is dark, put it on a white or light background — a dark mark on a transparent background disappears against Google's white results page. Use your judgment on which looks right and tell me what you chose.

Confirm the existing apple-touch-icon.png is 180x180 and square. Regenerate it if it isn't.

Then add these four tags to the HTML head, on every page, in whatever way this framework handles global head tags:

    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">

If a site.webmanifest doesn't already exist, create one at the public root referencing icon-192.png and icon-512.png, with the site name "Vox.chat", short name "Vox", theme_color #0A0A0F, and background_color #0A0A0F.

**Task 2 — Add structured data so Google shows a proper site name.**

Google ignores og:site_name for this. It reads WebSite structured data, and only from the homepage. Without it, Google guesses from the domain, which is why my result says lowercase "vox.chat" with the raw URL underneath it.

Add a JSON-LD script block to the homepage only — not to the blog posts, not to the other pages, not to a shared layout that renders everywhere. It must be a script tag with type="application/ld+json" containing a WebSite object with name "Vox.chat", alternateName "Vox", and url "https://vox.chat/".

In the same block or a second one, add an Organization object with name "Vox.chat", url "https://vox.chat/", and a logo pointing at a square PNG of at least 112x112 on the same domain. If no suitable logo file exists, generate one from the favicon SVG at 512x512 and reference that.

Before you write it, check whether the homepage already has any application/ld+json script tags. If it does, show me what's there and extend it rather than adding a duplicate block.

**Task 3 — Fix the canonical URL inconsistency.**

My canonical tag says https://vox.chat with no trailing slash, but my sitemap.xml lists https://vox.chat/ with one. Pick the trailing-slash version as the standard and make it consistent everywhere — the canonical tag, the og:url tag, the sitemap entry, and the url field in the JSON-LD I asked for above. Search the whole codebase for other places the bare domain is hardcoded and fix those too. Show me every file you changed.

**Task 4 — Tighten the meta description and align the titles.**

Replace the homepage meta description with exactly this:

    AI answers your phone, captures website leads, and gets you more Google reviews — 24/7 for HVAC, plumbing, and electrical contractors.

The old one was too long and Google was cutting it off mid-sentence.

I also have three different positioning statements across my tags, which dilutes the brand. The title tag says "AI Phone, Chat & Reviews for Contractors", og:title says "AI Automation for Service Businesses", and twitter:description says something different again. Standardize on the contractor angle. Set og:title and twitter:title both to "Vox.chat — AI Phone, Chat & Reviews for Contractors" to match the title tag, and set og:description and twitter:description to the same description text above.

**Task 5 — Verify before you tell me you're done.**

Build the site locally and confirm all of the following, then report the results back to me as a checklist:

- favicon.ico, icon-192.png, icon-512.png, favicon.svg, apple-touch-icon.png all exist in the build output and are served at the site root
- every raster icon is square, with the dimensions I asked for, and has a non-transparent background — verify this by actually inspecting the files, not by assuming
- the four link tags appear in the rendered HTML head
- the JSON-LD is valid JSON and appears on the homepage only — verify by parsing it, and confirm it does not appear on a blog post page
- the canonical, og:url, sitemap entry, and JSON-LD url all use the identical trailing-slash form
- the meta description in the rendered HTML matches the text I gave you exactly, character for character

Do not commit or push anything. Show me the full diff when you're finished and let me review it.

Two constraints: don't touch robots.txt, it's configured correctly. And don't change any blog post content, routes, or frontmatter — this work is limited to head metadata, static icon assets, and the sitemap.
