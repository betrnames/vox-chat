/**
 * Build-time SSG: render each multi-page entry to static HTML inside dist/
 * so crawlers see full content without executing JS.
 *
 * Run after `vite build`. Uses Vite SSR to load the same React components.
 */
import { createServer as createViteServer } from 'vite'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')

/** @type {{ out: string, module: string, props?: Record<string, unknown> }[]} */
const pages = [
  { out: 'index.html', module: '/src/App.tsx' },
  { out: 'faq.html', module: '/src/FaqPage.tsx' },
  { out: 'blog.html', module: '/src/BlogIndex.tsx' },
  { out: 'legal.html', module: '/src/LegalPage.tsx' },
  { out: 'setup.html', module: '/src/SetupPage.tsx' },
  { out: 'blog/automation-roi.html', module: '/src/BlogPost.tsx', props: { slug: 'automation-roi' } },
  { out: 'blog/missed-calls.html', module: '/src/BlogPost.tsx', props: { slug: 'missed-calls' } },
  { out: 'blog/chatbots-vs-forms.html', module: '/src/BlogPost.tsx', props: { slug: 'chatbots-vs-forms' } },
  { out: 'blog/google-reviews.html', module: '/src/BlogPost.tsx', props: { slug: 'google-reviews' } },
  { out: 'blog/plumber-after-hours.html', module: '/src/BlogPost.tsx', props: { slug: 'plumber-after-hours' } },
  { out: 'blog/electrician-leads.html', module: '/src/BlogPost.tsx', props: { slug: 'electrician-leads' } },
  {
    out: 'blog/manteca-contractors-double-google-reviews.html',
    module: '/src/BlogPost.tsx',
    props: { slug: 'manteca-contractors-double-google-reviews' },
  },
  {
    out: 'blog/turlock-missed-calls-costing-thousands.html',
    module: '/src/BlogPost.tsx',
    props: { slug: 'turlock-missed-calls-costing-thousands' },
  },
  {
    out: 'blog/ai-automation-guide-central-valley-contractors.html',
    module: '/src/BlogPost.tsx',
    props: { slug: 'ai-automation-guide-central-valley-contractors' },
  },
]

function injectAppHtml(template, appHtml) {
  if (!template.includes('<div id="root"></div>') && !template.includes('<div id="root">')) {
    throw new Error('Could not find #root in template')
  }
  // Prefer empty root shell; also handle already-prerendered re-runs
  return template
    .replace(/<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`)
    .replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<script)/, `<div id="root">${appHtml}</div>\n    `)
}

async function main() {
  if (!fs.existsSync(dist)) {
    console.error('dist/ not found — run vite build first')
    process.exit(1)
  }

  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    // Match production build for class names / env
    mode: 'production',
  })

  let ok = 0
  try {
    for (const page of pages) {
      const outPath = path.join(dist, page.out)
      if (!fs.existsSync(outPath)) {
        console.warn(`skip missing ${page.out}`)
        continue
      }

      const mod = await vite.ssrLoadModule(page.module)
      const Component = mod.default
      if (!Component) throw new Error(`No default export: ${page.module}`)

      const appHtml = renderToString(createElement(Component, page.props || null))
      if (!appHtml || appHtml.length < 200) {
        throw new Error(`Prerender produced empty/short HTML for ${page.out} (${appHtml?.length || 0} chars)`)
      }
      if (appHtml.includes('Post not found')) {
        throw new Error(`Prerender failed for ${page.out}: post slug not found in blog-data`)
      }

      const template = fs.readFileSync(outPath, 'utf8')
      const html = injectAppHtml(template, appHtml)
      fs.writeFileSync(outPath, html, 'utf8')

      // Quick SEO checks
      const hasHeading = /<h1[\s>]/.test(appHtml)
      console.log(`✓ ${page.out} (${appHtml.length} chars${hasHeading ? ', has h1' : ''})`)
      ok++
    }
  } finally {
    await vite.close()
  }

  console.log(`\nPrerendered ${ok}/${pages.length} pages into dist/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
