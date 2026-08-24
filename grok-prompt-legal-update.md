# Grok CLI Prompt — Add Fair Use & Compliance Sections to legal.html

Copy and paste the prompt below into your Grok CLI:

---

```
Update legal.html with two new sections. Match the existing markup patterns exactly — same Tailwind classes, same section/div/h2/h3/p/ul structure used by the Privacy Policy, Terms of Service, and other sections already on the page.

**Change 1: Add nav links**

Find the navigation anchor links at the top of the legal page (Privacy Policy, Terms of Service, SMS & TCPA, Call & chat recording, Disclaimer). Add two new links after Disclaimer:

- "Fair Use Policy" linking to #fair-use
- "Compliance Add-Ons" linking to #compliance

Use the same element type and classes as the existing nav links.

**Change 2: Add Fair Use Policy section**

After the #disclaimer section, add a new section with id="fair-use" using class="scroll-mt-24". Use the same heading, paragraph, and list patterns as existing sections. Content:

Section title: "Fair Use Policy"
Last updated: July 23, 2026

Subsections:

1. "Flat-Rate Promise" — Vox.chat services are offered at a flat monthly rate with no per-minute or per-message charges. This Fair Use Policy ensures every customer gets reliable, high-quality service without a small number of accounts driving costs that affect everyone.

2. "Included Usage" — Each package includes generous monthly allowances designed to cover the vast majority of small and mid-size businesses:
   - Reviews — up to 5,000 SMS messages
   - Receptionist — up to 5,000 web chat sessions
   - Voice — up to 2,500 voice minutes
   - Bundle — up to 2,500 voice minutes, 5,000 SMS messages, and 5,000 web chat sessions
   These allowances are not hard caps. Occasional spikes — a busy week, a seasonal rush — are expected and will never trigger a surprise charge.

3. "Exceeding the Allowance" — If your account regularly exceeds the included allowance for two or more consecutive billing cycles, we will notify you with your actual usage data and work together to find the right fit. Options may include moving to a higher-tier plan, a custom volume agreement, or optimizing your setup to reduce unnecessary usage. We will never silently add per-minute or per-message charges to your invoice. Any pricing change requires mutual written agreement.

4. "What Counts as Usage" — bullet list:
   - Voice minutes are measured from call pickup to hangup, rounded to the nearest minute.
   - SMS messages count each sent and received message as one unit.
   - Web chat sessions count each unique visitor conversation as one session.

5. "What Doesn't Count" — bullet list:
   - Calls that go unanswered or hit voicemail before the AI engages
   - System-generated alerts or notifications to you (the business owner)
   - Test calls and setup/configuration activity

6. "Prohibited Use" — This service is for your business's customer-facing communications. It may not be used for bulk or automated outbound telemarketing or robocalling, reselling Vox.chat services to third parties, artificially inflating usage, or any use that violates applicable telecommunications law (TCPA, etc.). Violation of prohibited use may result in immediate suspension.

7. "Changes to This Policy" — We may update usage allowances or thresholds with 30 days' written notice. Any changes apply to the next billing cycle, never retroactively.

**Change 3: Add Compliance Add-Ons section**

After the #fair-use section, add a new section with id="compliance" using class="scroll-mt-24". Content:

Section title: "Compliance & Security Add-Ons"
Last updated: July 23, 2026

Opening paragraph: For businesses in healthcare, finance, or other regulated industries, Vox.chat offers optional compliance add-ons billed monthly in addition to your package price.

Subsections:

1. "HIPAA Compliance — $2,500/mo" — Required for any business handling Protected Health Information (PHI) over voice or messaging. Includes:
   - HIPAA-compliant voice AI infrastructure
   - Business Associate Agreement (BAA) execution
   - Encrypted call handling and storage meeting HIPAA technical safeguards
   - Compliance configuration and ongoing monitoring
   - Annual compliance review and documentation
   Who needs this: Medical and dental practices, behavioral health providers, home health agencies, telehealth services, medical billing companies, or any business where callers may disclose health information.

2. "Zero Data Retention (ZDR) — $1,500/mo" — For businesses that require no call data, transcripts, or recordings to be stored after processing. Includes:
   - Real-time processing with no persistent storage of call content
   - No transcripts, recordings, or conversation logs retained
   - Immediate purge of all call data after the session ends
   - Compliance documentation confirming zero-retention architecture
   Who needs this: Legal firms, financial advisors, businesses with strict data minimization policies, or any organization where retaining customer conversation data poses regulatory or liability risk.

3. "Compliance Bundle — $3,500/mo" — Both HIPAA Compliance and Zero Data Retention together, saving $500/mo versus purchasing separately. Recommended for healthcare organizations that need the highest level of data protection.

4. "Important Notes" — bullet list:
   - Compliance add-ons apply to your entire Vox.chat account — they cannot be enabled per-assistant or per-phone-number.
   - Activation requires a brief compliance intake (typically 1–2 business days) to configure your environment correctly.
   - HIPAA compliance requires a signed BAA before activation. We will provide the BAA for your review.
   - Compliance add-ons are billed month-to-month with no long-term commitment, same as your core package.
   - Removing a compliance add-on requires 30 days' written notice and confirmation that you no longer handle regulated data through Vox.chat.

Do not change any existing sections. Only add the nav links and the two new sections.
```
