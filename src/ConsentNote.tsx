/** TCPA-style consent under contact / lead forms */
export default function ConsentNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] text-muted-foreground/70 leading-relaxed ${className}`}>
      By submitting, you agree Vox.chat may contact you by call, text, or email about this inquiry. Msg &amp; data
      rates may apply. Reply STOP to opt out of texts. View{' '}
      <a href="/legal.html#sms" className="underline underline-offset-2 hover:text-foreground transition-colors">
        SMS policy
      </a>
      {' · '}
      <a href="/legal.html#recording" className="underline underline-offset-2 hover:text-foreground transition-colors">
        Recording policy
      </a>
      .
    </p>
  )
}
