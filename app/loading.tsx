export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="space-y-4 text-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-ink-500 font-mono">
          Hydrating Manhattan Coffee network telemetry...
        </p>
      </div>
    </div>
  );
}
