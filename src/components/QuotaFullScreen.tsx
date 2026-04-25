export function QuotaFullScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[70vh] p-6 text-center">
      <span className="text-9xl" aria-hidden>
        ✅
      </span>
      <h1 className="text-4xl font-semibold tracking-tight">
        Heute wurden bereits alle Stimmen abgegeben.
      </h1>
      <p className="text-xl text-muted-foreground">
        Vielen Dank! Schau morgen gerne wieder vorbei.
      </p>
    </div>
  )
}
