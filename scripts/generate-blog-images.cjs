const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '..', 'public', 'blog')

const bgs = [
  { bg: '#FF6B4A', text: '#FFFFFF', sub: '#FFFFFFCC', label: '#FFFFFFAA', brand: '#FFFFFF' },
  { bg: '#4A9EFF', text: '#FFFFFF', sub: '#FFFFFFCC', label: '#FFFFFFAA', brand: '#FFFFFF' },
  { bg: '#FFB84A', text: '#0A0A0F', sub: '#0A0A0FCC', label: '#0A0A0FAA', brand: '#0A0A0F' },
]

const posts = [
  {
    slug: 'manteca-contractors-double-google-reviews',
    stat: '25 → 80+',
    label: 'Google reviews in 90 days',
    headline: 'Double Your Reviews',
    sub: 'Manteca Contractors',
  },
  {
    slug: 'turlock-missed-calls-costing-thousands',
    stat: '$10K',
    label: 'lost per month to missed calls',
    headline: 'Missed Calls = Lost Revenue',
    sub: 'Turlock Service Businesses',
  },
  {
    slug: 'ai-automation-guide-central-valley-contractors',
    stat: '3 Tools',
    label: 'voice · chat · reviews',
    headline: 'The AI Automation Guide',
    sub: 'Central Valley Contractors',
  },
  {
    slug: 'automation-roi',
    stat: '+67%',
    label: 'revenue from same ad spend',
    headline: 'Automation ROI',
    sub: 'Close the Leads You Already Pay For',
  },
  {
    slug: 'missed-calls',
    stat: '$2,500',
    label: 'lost per week to voicemail',
    headline: 'Stop Losing Calls',
    sub: 'HVAC Companies',
  },
  {
    slug: 'chatbots-vs-forms',
    stat: '3×',
    label: 'more leads captured',
    headline: 'AI Receptionist vs. Forms',
    sub: '50 Contractor Websites Tested',
  },
  {
    slug: 'plumber-after-hours',
    stat: '$50K',
    label: 'per year in after-hours calls',
    headline: 'The Overnight Opportunity',
    sub: 'Plumbers',
  },
  {
    slug: 'electrician-leads',
    stat: '30%',
    label: 'of leads lost before first contact',
    headline: 'Stop Losing Leads',
    sub: 'Electricians',
  },
  {
    slug: 'google-reviews',
    stat: '5×',
    label: 'more reviews with automation',
    headline: 'The 2-Hour Window',
    sub: 'Automated Review Requests',
  },
  {
    slug: 'modesto-hvac-never-lose-customer-voicemail',
    stat: '100%',
    label: 'of calls answered — 24/7',
    headline: 'Never Hit Voicemail Again',
    sub: 'Modesto HVAC Companies',
  },
  {
    slug: 'stockton-plumbers-emergency-calls',
    stat: '$800',
    label: 'per emergency call — lost to voicemail',
    headline: 'Emergency Calls Recovered',
    sub: 'Stockton Plumbers',
  },
  {
    slug: 'tracy-contractors-rank-google-maps',
    stat: '#1',
    label: 'on Google Maps in 90 days',
    headline: 'Dominate Local Search',
    sub: 'Tracy Contractors',
  },
  {
    slug: 'modesto-roofers-storm-season-calls',
    stat: '100+',
    label: 'calls in 48 hours during storms',
    headline: 'Handle the Storm Surge',
    sub: 'Modesto Roofers',
  },
]

function makeSvg({ stat, label, headline, sub }, theme) {
  const dotColors = theme.bg === '#FFB84A'
    ? ['#FF6B4A', '#4A9EFF', '#0A0A0F']
    : theme.bg === '#FF6B4A'
      ? ['#FFB84A', '#4A9EFF', '#FFFFFF']
      : ['#FF6B4A', '#FFB84A', '#FFFFFF']

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" rx="0" fill="${theme.bg}"/>
  <!-- accent line -->
  <rect x="80" y="80" width="4" height="120" rx="2" fill="${theme.text}"/>
  <!-- headline -->
  <text x="100" y="128" font-family="system-ui,-apple-system,sans-serif" font-size="32" font-weight="600" fill="${theme.text}" letter-spacing="-0.5">${headline}</text>
  <!-- sub -->
  <text x="100" y="170" font-family="monospace" font-size="16" fill="${theme.sub}" letter-spacing="2">${sub.toUpperCase()}</text>
  <!-- stat -->
  <text x="100" y="400" font-family="system-ui,-apple-system,sans-serif" font-size="140" font-weight="800" fill="${theme.text}" letter-spacing="-4">${stat}</text>
  <!-- label -->
  <text x="104" y="460" font-family="system-ui,-apple-system,sans-serif" font-size="28" fill="${theme.label}" letter-spacing="0">${label}</text>
  <!-- brand -->
  <circle cx="1060" cy="560" r="8" fill="${dotColors[0]}"/>
  <circle cx="1084" cy="560" r="8" fill="${dotColors[1]}"/>
  <circle cx="1108" cy="560" r="8" fill="${dotColors[2]}"/>
  <text x="950" y="566" font-family="monospace" font-size="14" fill="${theme.label}" text-anchor="end">vox.chat</text>
</svg>`
}

for (let i = 0; i < posts.length; i++) {
  const theme = bgs[i % bgs.length]
  const svg = makeSvg(posts[i], theme)
  fs.writeFileSync(path.join(OUT, `${posts[i].slug}.svg`), svg)
  console.log(`  ✓ ${posts[i].slug}.svg (${theme.bg})`)
}

console.log(`\nGenerated ${posts.length} images in public/blog/`)
