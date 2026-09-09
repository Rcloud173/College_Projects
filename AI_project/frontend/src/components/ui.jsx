export function Alert({ tone = "info", children }) {
  if (!children) return null;

  const styles = {
    error: "border-accent bg-[#f7eeee] text-accent",
    ok: "border-ok bg-ok-bg text-ok",
    info: "border-line bg-surface text-muted",
  };

  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mt-4 border px-3 py-2 text-sm ${styles[tone]}`}>
      {children}
    </p>
  );
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="mb-8 border-b border-line pb-5">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-[1.85rem] font-semibold leading-tight tracking-tight">{title}</h1>
      {children ? <div className="mt-2 max-w-2xl text-sm leading-6 text-muted">{children}</div> : null}
    </header>
  );
}

export function SectionTitle({ title, action }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
