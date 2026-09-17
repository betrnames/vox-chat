# Reviews Configuration — {{business_name}}

## Google Review Link
{{google_review_link}}

## Text Templates

### First Text ({{first_text_delay_hours}} hours after job completion)
Hi {{customer_first_name}}, thanks for choosing {{business_name}}! If you had a good experience, we'd really appreciate a quick Google review — it helps other homeowners find us. {{google_review_link}}

### Follow-up Text ({{followup_delay_hours}} hours after first text, if no response)
Hey {{customer_first_name}}, just a quick follow-up from {{business_name}}. If you have 30 seconds, a Google review would mean a lot to us: {{google_review_link}} Thanks again!

## Negative Review Alert

### Threshold
Reviews rated {{negative_threshold}} stars or below trigger an owner alert.

### Alert Message
ALERT: {{customer_name}} left a {{star_rating}}-star review for {{business_name}}. Review text: "{{review_text}}". Respond within 24 hours.

## Settings
- **owner_phone**: {{owner_phone}}
- **owner_email**: {{owner_email}}
- **first_text_delay**: {{first_text_delay_hours}} hours
- **followup_delay**: {{followup_delay_hours}} hours
- **negative_threshold**: {{negative_threshold}} stars
- **active**: true
