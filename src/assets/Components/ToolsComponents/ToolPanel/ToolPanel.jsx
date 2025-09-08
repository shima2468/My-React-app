import React from "react";
export default function ToolPanel({
  title,
  subtitle,
  actions,
  header,
  footer,
  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  padded = true,
  stickyHeader = false,
  divider = true,
  children,
}) {
  const padClass = typeof padded === "string" ? padded : padded ? "p-4" : "";

  const hasHeader = !!header || !!title || !!subtitle || !!actions;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white overflow-hidden ${className}`}
    >
      {hasHeader &&
        (header ? (
          <div
            className={`${
              stickyHeader ? "sticky top-0 z-10 bg-white/90 backdrop-blur" : ""
            } ${headerClassName}`}
          >
            {header}
          </div>
        ) : (
          <div
            className={`${
              stickyHeader ? "sticky top-0 z-10 bg-white/90 backdrop-blur" : ""
            } ${headerClassName}`}
          >
            <div className={`flex items-center justify-between ${padClass}`}>
              <div>
                {title && (
                  <h3 className="text-lg font-serif font-semibold text-slate-900">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">{actions}</div>
            </div>

            {divider && <div className="border-t border-slate-200" />}
          </div>
        ))}

      <div className={`${padClass} ${contentClassName}`}>{children}</div>

      {footer && (
        <>
          <div className="border-t border-slate-200" />
          <div className={`p-4 ${footerClassName}`}>{footer}</div>
        </>
      )}
    </section>
  );
}
