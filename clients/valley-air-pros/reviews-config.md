# Reviews Configuration — Valley Air Pros

## Google Review Link
https://g.page/r/valley-air-pros/review

## Text Templates

### First Text (2 hours after job completion)
Hi {{customer_first_name}}, thanks for choosing Valley Air Pros! If you had a good experience, we'd really appreciate a quick Google review — it helps other homeowners find us. https://g.page/r/valley-air-pros/review

### Follow-up Text (48 hours after first text, if no response)
Hey {{customer_first_name}}, just a quick follow-up from Valley Air Pros. If you have 30 seconds, a Google review would mean a lot to us: https://g.page/r/valley-air-pros/review Thanks again!

## Negative Review Alert

### Threshold
Reviews rated 3 stars or below trigger an owner alert.

### Alert Message
ALERT: {{customer_name}} left a {{star_rating}}-star review for Valley Air Pros. Review text: "{{review_text}}". Respond within 24 hours.

## Settings
- **owner_phone**: +12095550147
- **owner_email**: mike@valleyairpros.com
- **first_text_delay**: 2 hours
- **followup_delay**: 48 hours
- **negative_threshold**: 3 stars
- **active**: true
