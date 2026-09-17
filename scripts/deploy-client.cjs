/**
 * Deploy client — reads a client config.md and generates ready-to-use prompts.
 *
 * Usage:
 *   node scripts/deploy-client.cjs valley-air-pros
 *   node scripts/deploy-client.cjs clients/valley-air-pros/config.md
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CLIENTS_DIR = path.join(ROOT, 'clients')
const TEMPLATES_DIR = path.join(ROOT, 'templates')

function parseConfig(md) {
  const config = {}
  const lines = md.split('\n')

  let currentSection = ''
  let listKey = ''
  let listItems = []

  function flushList() {
    if (listKey && listItems.length) {
      config[listKey] = listItems
      listItems = []
      listKey = ''
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      flushList()
      currentSection = trimmed.replace('## ', '').toLowerCase().replace(/\s+/g, '_')
      continue
    }

    if (trimmed.startsWith('# ') || trimmed === '---' || trimmed.startsWith('> ') || trimmed.startsWith('<!--')) {
      continue
    }

    const kvMatch = trimmed.match(/^-\s+\*\*(\w+)\*\*:\s*(.+)/)
    if (kvMatch) {
      flushList()
      const key = kvMatch[1]
      let val = kvMatch[2].trim()
      if (val === 'true') val = true
      else if (val === 'false') val = false
      else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      config[key] = val
      continue
    }

    const listMatch = trimmed.match(/^-\s+(.+)/)
    if (listMatch && currentSection) {
      const val = listMatch[1].trim()
      if (val.startsWith('**')) continue
      if (!listKey) listKey = currentSection
      if (listKey === currentSection) {
        listItems.push(val)
      }
      continue
    }

    if (trimmed === '' && listItems.length) {
      flushList()
    }
  }
  flushList()

  return config
}

function renderTemplate(template, config) {
  let result = template

  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    const val = config[key]
    if (!val || val === 'false' || (Array.isArray(val) && !val.length)) return ''
    return content
  })

  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, content) => {
    const items = config[key]
    if (!Array.isArray(items)) return ''
    return items.map(item => content.replace(/\{\{this\}\}/g, item).trim()).join('\n')
  })

  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (config[key] !== undefined) return String(config[key])
    return match
  })

  return result
}

function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Usage: node scripts/deploy-client.cjs <client-slug>')
    console.error('       node scripts/deploy-client.cjs <path-to-config.md>')
    process.exit(1)
  }

  let configPath
  if (arg.endsWith('.md')) {
    configPath = path.resolve(arg)
  } else {
    configPath = path.join(CLIENTS_DIR, arg, 'config.md')
  }

  if (!fs.existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(configPath, 'utf-8')
  const config = parseConfig(raw)

  const slug = config.slug || arg.replace(/[/\\]/g, '').replace('.md', '')
  const outDir = path.join(CLIENTS_DIR, slug)
  fs.mkdirSync(outDir, { recursive: true })

  const spanish = (config.languages || []).some(l => l.toLowerCase().includes('spanish'))
    || (config.Languages || []).some?.(l => l.toLowerCase().includes('spanish'))

  const services = config.services_offered || config.services || []
  const servicesSummary = services.slice(0, 5).join(', ')
  const businessDescription = `${config.name} is a professional ${config.trade} company serving ${config.service_area}. Owned by ${config.owner_name}, based in ${config.city}.`

  const pricing = config.service_call
    ? `Service call: ${config.service_call}${config.ac_tune_up ? `. Tune-up: ${config.ac_tune_up}` : ''}${config.duct_cleaning ? `. Duct cleaning: ${config.duct_cleaning}` : ''}${config.free_estimates ? '. Free estimates for installations.' : ''}`
    : ''

  const tplConfig = {
    ...config,
    business_name: config.name,
    ai_name: config.ai_name || 'Vox',
    owner_name: config.owner_name,
    city: config.city,
    trade: config.trade,
    service_area: config.service_area,
    services: services,
    services_summary: servicesSummary,
    business_description: businessDescription,
    pricing: pricing,
    hours_regular: config.regular || '',
    hours_emergency: config.emergency || '',
    spanish: spanish,
    scheduling_instructions: config.scheduling_instructions || '',
    greeting_en: config.greeting_en || `Thanks for calling ${config.name}, this is ${config.ai_name || 'Vox'}. How can I help you?`,
    greeting_es: config.greeting_es || `Gracias por llamar a ${config.name}, soy ${config.ai_name || 'Vox'}. ¿En qué le puedo ayudar?`,
    google_review_link: config.google_review_link || '',
    first_text_delay_hours: config.first_text_delay_hours || '2',
    followup_delay_hours: config.followup_delay_hours || '48',
    negative_threshold: config.negative_threshold || '3',
    owner_phone: config.owner_phone || '',
    owner_email: config.owner_email || '',
  }

  const generated = []

  if (config.voice === true || config.voice === 'true') {
    const voiceTpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'voice-prompt.md'), 'utf-8')
    const voicePrompt = renderTemplate(voiceTpl, tplConfig)
    const voicePath = path.join(outDir, 'voice-prompt.md')
    fs.writeFileSync(voicePath, voicePrompt)
    generated.push('voice-prompt.md')
  }

  if (config.receptionist === true || config.receptionist === 'true') {
    const chatTpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'chat-prompt.md'), 'utf-8')
    const chatPrompt = renderTemplate(chatTpl, tplConfig)
    const chatPath = path.join(outDir, 'chat-prompt.md')
    fs.writeFileSync(chatPath, chatPrompt)
    generated.push('chat-prompt.md')
  }

  if (config.reviews === true || config.reviews === 'true') {
    const reviewsTpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'reviews-config.md'), 'utf-8')
    const reviewsOut = renderTemplate(reviewsTpl, tplConfig)
    const reviewsPath = path.join(outDir, 'reviews-config.md')
    fs.writeFileSync(reviewsPath, reviewsOut)
    generated.push('reviews-config.md')
  }

  console.log(`\n  Client: ${config.name}`)
  console.log(`  Slug:   ${slug}`)
  console.log(`  Output: clients/${slug}/`)
  console.log(`  Generated:`)
  generated.forEach(f => console.log(`    - ${f}`))
  console.log(`\n  Next steps:`)
  if (generated.includes('voice-prompt.md')) {
    console.log(`    1. Copy voice-prompt.md content into Vapi dashboard assistant`)
  }
  if (generated.includes('chat-prompt.md')) {
    console.log(`    2. Wire chat-prompt.md into the receptionist widget config`)
  }
  if (generated.includes('reviews-config.md')) {
    console.log(`    3. Set up review automation with the google review link`)
  }
  console.log(`    4. Set env vars: REVIEW_OWNER_PHONE=${config.owner_phone || 'TBD'}`)
  console.log(`    5. Test all channels\n`)
}

main()
