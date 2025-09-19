import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export default function Legend({ items = [], className = "" }) {
  return (
    <div
      className={cx(
        "rounded-xl bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 flex items-center gap-4 shadow-sm",
        className
      )}
    >
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block rounded-full"
            style={{ width: 10, height: 10, background: color }}
          />
          <span className="text-slate-700">{label}</span>
        </div>
      ))}
    </div>
  );
}
