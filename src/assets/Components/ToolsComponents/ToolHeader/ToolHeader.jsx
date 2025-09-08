import React from "react";
const cx = (...cls) => cls.filter(Boolean).join(" ");

const ToolHeader = ({
  title,
  subtitle,
  right = null,     
  className = "",
  align = "between", 
}) => {
  return (
    <div
      className={cx(
        "mb-4 sm:mb-6 flex items-start",
        align === "between" ? "justify-between" : "justify-start gap-4",
        className
      )}
      data-slot="tool-header"
    >
      <div>
        {title && (
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-slate-900">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        )}
      </div>

      {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
    </div>
  );
};

export default ToolHeader;
