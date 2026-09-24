export function Splat({
  color,
  className,
  spread = false,
}: {
  color: string
  className: string
  spread?: boolean
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute z-0 h-40 w-full max-w-[42rem] ${className}`}>
      <div className={`absolute left-0 top-2 -rotate-6 rounded-[46%_54%_38%_62%] ${color} ${spread ? 'h-36 w-[150%] blur-[110px]' : 'h-16 w-[78%] blur-3xl'}`} />
      <div className={`absolute left-[12%] top-0 rotate-[14deg] rounded-[62%_38%_55%_45%] ${color} ${spread ? 'h-28 w-[96%] blur-[90px]' : 'h-14 w-[46%] blur-2xl'}`} />
      <div className={`absolute right-0 top-6 -rotate-12 rounded-[40%_60%_70%_30%] opacity-80 ${color} ${spread ? 'h-24 w-[72%] blur-[90px]' : 'h-12 w-[34%] blur-2xl'}`} />
    </div>
  )
}
