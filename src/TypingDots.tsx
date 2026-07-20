export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Typing">
      <span className="w-1.5 h-1.5 rounded-full bg-voice vox-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-chat vox-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-review vox-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  )
}
