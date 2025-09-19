import React from "react";

const cx = (...a) => a.filter(Boolean).join(" ");

export default function IconButton({
  children,
  title,
  onClick,
  disabled = false,
  className = "",
  variant = "ghost", // "ghost" | "solid"
}) {
  const base =
    variant === "solid"
      ? "rounded-md bg-blue-500 text-white p-2 hover:bg-blue-600 disabled:opacity-50"
      : "rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50 disabled:opacity-50";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cx(base, className)}
    >
      {children}
    </button>
  );
}
