export default function Header({
  title = "Welcome back, Student!",
  subtitle = "Ready to supercharge your studying with AI-powered tools?",
  right = null,
  children = null,
}) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-3xl md:text-2xl font-extrabold font-serif text-slate-900 truncate">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        {right ? (
          <div className="mt-1 sm:mt-0 flex w-full sm:w-auto flex-wrap items-center gap-2">
            {right}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}
