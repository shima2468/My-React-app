import React from "react";
import { FileText, Check, Loader2 } from "lucide-react";

function OptionCard({
  selected,
  title,
  desc,
  rightBadge,
  icon: Icon,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-black bg-gray-100"
          : "border-slate-200 bg-white hover:bg-slate-50"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-1 rounded-lg border border-slate-200 p-2">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">{title}</p>
            {rightBadge !== undefined ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {rightBadge}
              </span>
            ) : selected ? (
              <Check className="h-5 w-5 text-black" />
            ) : null}
          </div>

          {desc ? <p className="text-sm text-slate-600 mt-1">{desc}</p> : null}
        </div>
      </div>
    </button>
  );
}

export default function ToolSidebar({
  loading = false,
  onGenerate,
  generateLabel = "Generate",

  materials = [],
  selectedMaterialId,
  onSelectMaterial,

  layouts = [],
  selectedLayoutId,
  onSelectLayout,

  filters = [],
  selectedFilterId,
  onSelectFilter,
  countsNote,
  showUnapplied = false,
  generateDisabled = false,
  titles = {
    materials: "Select Material",
    materialsSub: "Choose a document to analyze",
    layouts: "Graph Layout",
    layoutsSub: "Choose visualization style",
    filters: "Node Filter",
    filtersSub: "Filter by node type",
  },
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
      {materials.length > 0 && (
        <section className={loading ? "opacity-60 pointer-events-none" : ""}>
          <h3 className="text-lg font-serif font-semibold text-slate-900">
            {titles.materials}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{titles.materialsSub}</p>
          <div className="mt-3 space-y-3">
            {materials.map((m) => (
              <OptionCard
                key={m.id}
                selected={selectedMaterialId === m.id}
                title={m.name}
                desc={m.size}
                icon={m.icon || FileText}
                onClick={() => onSelectMaterial?.(m.id)}
                disabled={loading}
              />
            ))}
          </div>
        </section>
      )}

      {layouts.length > 0 && (
        <section className={loading ? "opacity-60 pointer-events-none" : ""}>
          <h3 className="text-lg font-serif font-semibold text-slate-900">
            {titles.layouts}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{titles.layoutsSub}</p>
          <div className="mt-3 space-y-3">
            {layouts.map((opt) => (
              <OptionCard
                key={opt.id}
                selected={selectedLayoutId === opt.id}
                title={opt.title}
                desc={opt.desc}
                onClick={() => onSelectLayout?.(opt.id)}
                disabled={loading}
              />
            ))}
          </div>
        </section>
      )}

      {filters.length > 0 && (
        <section className={loading ? "opacity-60 pointer-events-none" : ""}>
          <h3 className="text-lg font-serif font-semibold text-slate-900">
            {titles.filters}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{titles.filtersSub}</p>
          <div className="mt-3 space-y-3">
            {filters.map((opt) => (
              <OptionCard
                key={opt.id}
                selected={selectedFilterId === opt.id}
                title={opt.title}
                rightBadge={opt.count}
                onClick={() => onSelectFilter?.(opt.id)}
                disabled={loading}
              />
            ))}
          </div>

          {countsNote && (
            <p className="mt-2 text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {countsNote.visible ?? 0}
              </span>{" "}
              nodes / {countsNote.total ?? 0}
            </p>
          )}

          {showUnapplied && (
            <p className="mt-2 text-xs text-amber-600">
              You have unapplied changes. Click{" "}
              <span className="font-medium">Generate</span> to apply.
            </p>
          )}
        </section>
      )}
{onGenerate && (
  <div className="sticky bottom-0 pt-3 bg-white">
    <button
      onClick={onGenerate}
      disabled={loading || generateDisabled}
      className={`w-full rounded-xl text-white py-3 font-medium inline-flex items-center justify-center gap-2
        ${loading
          ? "bg-slate-300 cursor-not-allowed"
          : generateDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating…
        </>
      ) : (
        generateLabel
      )}
    </button>
  </div>
)}

    </aside>
  );
}
