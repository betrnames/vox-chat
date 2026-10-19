export default function LeadSuccess() {
  return (
    <div role="status" aria-live="polite" className="rounded-xl border border-primary/25 bg-primary/5 p-6 text-center">
      <p className="font-semibold mb-1">Thanks — we got it.</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        We&apos;ll reach out within one business day. Need us sooner? Call{' '}
        <a href="tel:+12099967102" className="font-medium text-primary hover:text-primary/70">(209) 996-7102</a>.
      </p>
    </div>
  )
}
