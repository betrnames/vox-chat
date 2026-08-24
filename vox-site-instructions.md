# Vox.chat Site Update — Fair Use & Compliance Add-Ons

Your site is static HTML + Vite. Two changes needed in `legal.html`.

---

## Step 1: Add nav links

Find the existing nav anchor links in `legal.html` (the jump-to section at the top). They look like this:

```html
<a href="#disclaimer">Disclaimer</a>
```

**Add these two links after the Disclaimer link:**

```html
<a href="#fair-use">Fair Use Policy</a>
<a href="#compliance">Compliance Add-Ons</a>
```

---

## Step 2: Add the Fair Use section

Paste this **after** the `#disclaimer` section's closing `</section>` tag:

```html
<!-- ── Fair Use Policy ── -->
<section id="fair-use" class="scroll-mt-24">
  <h2 class="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Fair Use Policy</h2>
  <p class="text-xs text-muted-foreground mb-6">Last updated: July 23, 2026</p>
  <div class="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Flat-Rate Promise</h3>
      <p>Vox.chat services are offered at a flat monthly rate with no per-minute or per-message charges. This Fair Use Policy ensures every customer gets reliable, high-quality service without a small number of accounts driving costs that affect everyone.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Included Usage</h3>
      <p>Each package includes generous monthly allowances designed to cover the vast majority of small and mid-size businesses:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li><strong>Reviews</strong> — up to 5,000 SMS messages</li>
        <li><strong>Receptionist</strong> — up to 5,000 web chat sessions</li>
        <li><strong>Voice</strong> — up to 2,500 voice minutes</li>
        <li><strong>Bundle</strong> — up to 2,500 voice minutes, 5,000 SMS messages, and 5,000 web chat sessions</li>
      </ul>
      <p class="mt-2">These allowances are not hard caps. Occasional spikes — a busy week, a seasonal rush — are expected and will never trigger a surprise charge.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Exceeding the Allowance</h3>
      <p>If your account regularly exceeds the included allowance for two or more consecutive billing cycles, we will notify you with your actual usage data and work together to find the right fit. Options may include moving to a higher-tier plan, a custom volume agreement, or optimizing your setup to reduce unnecessary usage. We will never silently add per-minute or per-message charges to your invoice. Any pricing change requires mutual written agreement.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">What Counts as Usage</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Voice minutes</strong> are measured from call pickup to hangup, rounded to the nearest minute.</li>
        <li><strong>SMS messages</strong> count each sent and received message as one unit.</li>
        <li><strong>Web chat sessions</strong> count each unique visitor conversation as one session.</li>
      </ul>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">What Doesn't Count</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li>Calls that go unanswered or hit voicemail before the AI engages</li>
        <li>System-generated alerts or notifications to you (the business owner)</li>
        <li>Test calls and setup/configuration activity</li>
      </ul>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Prohibited Use</h3>
      <p>This service is for your business's customer-facing communications. It may not be used for bulk or automated outbound telemarketing or robocalling, reselling Vox.chat services to third parties, artificially inflating usage, or any use that violates applicable telecommunications law (TCPA, etc.). Violation of prohibited use may result in immediate suspension.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Changes to This Policy</h3>
      <p>We may update usage allowances or thresholds with 30 days' written notice. Any changes apply to the next billing cycle, never retroactively.</p>
    </div>

  </div>
</section>
```

---

## Step 3: Add the Compliance Add-Ons section

Paste this **immediately after** the Fair Use section:

```html
<!-- ── Compliance Add-Ons ── -->
<section id="compliance" class="scroll-mt-24">
  <h2 class="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Compliance &amp; Security Add-Ons</h2>
  <p class="text-xs text-muted-foreground mb-6">Last updated: July 23, 2026</p>
  <div class="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">

    <div>
      <p>For businesses in healthcare, finance, or other regulated industries, Vox.chat offers optional compliance add-ons billed monthly in addition to your package price.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">HIPAA Compliance — $2,500/mo</h3>
      <p>Required for any business handling Protected Health Information (PHI) over voice or messaging. Includes:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>HIPAA-compliant voice AI infrastructure</li>
        <li>Business Associate Agreement (BAA) execution</li>
        <li>Encrypted call handling and storage meeting HIPAA technical safeguards</li>
        <li>Compliance configuration and ongoing monitoring</li>
        <li>Annual compliance review and documentation</li>
      </ul>
      <p class="mt-2"><strong>Who needs this:</strong> Medical and dental practices, behavioral health providers, home health agencies, telehealth services, medical billing companies, or any business where callers may disclose health information.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Zero Data Retention (ZDR) — $1,500/mo</h3>
      <p>For businesses that require no call data, transcripts, or recordings to be stored after processing. Includes:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>Real-time processing with no persistent storage of call content</li>
        <li>No transcripts, recordings, or conversation logs retained</li>
        <li>Immediate purge of all call data after the session ends</li>
        <li>Compliance documentation confirming zero-retention architecture</li>
      </ul>
      <p class="mt-2"><strong>Who needs this:</strong> Legal firms, financial advisors, businesses with strict data minimization policies, or any organization where retaining customer conversation data poses regulatory or liability risk.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Compliance Bundle — $3,500/mo</h3>
      <p>Both HIPAA Compliance and Zero Data Retention together, saving $500/mo versus purchasing separately. Recommended for healthcare organizations that need the highest level of data protection.</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-foreground mb-2">Important Notes</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li>Compliance add-ons apply to your entire Vox.chat account — they cannot be enabled per-assistant or per-phone-number.</li>
        <li>Activation requires a brief compliance intake (typically 1–2 business days) to configure your environment correctly.</li>
        <li>HIPAA compliance requires a signed BAA before activation. We will provide the BAA for your review.</li>
        <li>Compliance add-ons are billed month-to-month with no long-term commitment, same as your core package.</li>
        <li>Removing a compliance add-on requires 30 days' written notice and confirmation that you no longer handle regulated data through Vox.chat.</li>
      </ul>
    </div>

  </div>
</section>
```

---

## Deployment

Once you've saved the changes to `legal.html`, deploy with your normal process. If you're using Vite:

```bash
npm run build
```

Then push/deploy however you normally ship (Vercel, Netlify, manual upload, etc.).

---

## Quick checklist

- [ ] Added `#fair-use` and `#compliance` nav links at top of legal page
- [ ] Added Fair Use section after Disclaimer section
- [ ] Added Compliance Add-Ons section after Fair Use
- [ ] Ran `npm run build` (or your build command)
- [ ] Deployed
- [ ] Verified links work: `vox.chat/legal#fair-use` and `vox.chat/legal#compliance`

---

## DO NOT publish on the site (internal only)

The internal margin analysis and pricing floors from the fair-use-terms doc stay off the site. Those are for your pricing.md and sales conversations only.
