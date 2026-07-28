export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-carbon/15 border-t-carbon" />
        <p className="text-sm text-gray">Cargando…</p>
      </div>
    </div>
  );
}
