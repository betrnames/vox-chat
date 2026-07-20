/** TCPA-style consent under contact / lead forms */
export default function ConsentNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/50 ${className}`}
    >
      By submitting, you agree Vox.chat may contact you by call, text, or email about this inquiry. Msg &amp; data
      rates may apply. Reply <span className="font-medium text-foreground/80">STOP</span> to opt out of texts.{' '}
      <a href="/legal.html#sms" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
        SMS policy
      </a>
      {' · '}
      <a href="/legal.html#recording" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
        Recording policy
      </a>
      .
    </p>
  )
}
