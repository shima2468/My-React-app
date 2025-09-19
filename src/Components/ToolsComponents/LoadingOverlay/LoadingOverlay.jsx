import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingOverlay({ show = false, text = "Loading…" }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 grid place-items-center text-slate-600 z-10">
      <span className="inline-flex items-center gap-2 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        {text}
      </span>
    </div>
  );
}
