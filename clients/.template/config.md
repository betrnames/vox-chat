# Client Configuration Template

> Copy this file to `clients/<business-slug>/config.md` and fill in all fields.
> The deploy script reads this config to generate voice, chat, and review prompts.

---

## Business

- **name**: 
- **slug**: 
- **trade**: hvac | plumbing | electrical | roofing | general
- **website**: 
- **phone**: 
- **owner_name**: 
- **owner_phone**: 
- **owner_email**: 

## Location

- **city**: 
- **service_area**: 
- **timezone**: America/Los_Angeles

## Services Offered

<!-- List the services this business provides to their customers -->
- 
- 
- 

## Pricing

<!-- Key pricing the AI should know. Use spoken-word format for voice prompts. -->
- **service_call**: 
- **other**: 

## Hours

- **regular**: 
- **emergency**: 

## Vox Package

<!-- Which Vox services this client subscribes to -->
- **voice**: true | false
- **receptionist**: true | false
- **reviews**: true | false

## Voice Settings

- **ai_name**: Vox
- **vapi_assistant_id**: 
- **greeting_en**: "Thanks for calling {{name}}, this is {{ai_name}}. How can I help you?"
- **greeting_es**: "Gracias por llamar a {{name}}, soy {{ai_name}}. ¿En qué le puedo ayudar?"

## Chat Settings

- **widget_greeting**: "Hi! I'm the AI assistant for {{name}}. How can I help?"

## Reviews Settings

- **google_review_link**: 
- **first_text_delay_hours**: 2
- **followup_delay_hours**: 48
- **negative_threshold**: 3

## Languages

- English
- Spanish

## Notes

<!-- Anything specific to this client: special instructions, exclusions, quirks -->

