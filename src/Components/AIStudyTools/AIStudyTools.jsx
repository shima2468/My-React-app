import React, { useMemo, useState } from "react";
import {
  BookOpen,
  GitBranch,
  Network,
  Brain,
  Square,
  Mic,
  Search,
  Filter,
  X,
} from "lucide-react";
import ToolCard from "../ToolsComponents/ToolCard/ToolCard";

const defaultTools = [
  {
    title: "AI Summarizer",
    desc: "Get concise summaries of your study materials",
    icon: BookOpen,
    to: "/dashboard/tools/summarizer",
    color: "bg-gray-900",
    category: "Reading",
  },
  {
    title: "Mind Maps",
    desc: "Visualize concepts and their relationships",
    icon: GitBranch,
    to: "/dashboard/tools/mind-maps",
    color: "bg-gray-800",
    category: "Visualization",
  },
  {
    title: "Knowledge Graph",
    desc: "Explore interconnected topics and ideas",
    icon: Network,
    to: "/dashboard/tools/knowledge-graph",
    color: "bg-gray-700",
    category: "Visualization",
  },
  {
    title: "Quiz Generator",
    desc: "Create practice tests from your materials",
    icon: Brain,
    to: "/dashboard/tools/quiz-generator",
    color: "bg-gray-600",
    category: "Practice",
  },
  {
    title: "Flashcards",
    desc: "Create interactive flashcards for recall",
    icon: Square,
    to: "/dashboard/tools/flashcards",
    color: "bg-gray-500",
    category: "Practice",
  },
  {
    title: "Voice Mode",
    desc: "Record, transcribe, and interact with your",
    icon: Mic,
    to: "/dashboard/tools/voice-mode",
    color: "bg-black",
    category: "Reading",
    badge: "New",
  },
];

export default function AIStudyTools({
  mt = 0,
  cardPadding = "p-6",
  title = "",
  items = defaultTools,
  showToolbar = true,
}) {
  const mtStyle = typeof mt === "number" ? { marginTop: `${mt}px` } : undefined;
  const mtClass = typeof mt === "string" ? mt : "";

  const [query, setQuery] = useState("");
  const categories = useMemo(() => {
    const all = Array.from(
      new Set((items || []).map((i) => i.category).filter(Boolean))
    );
    return ["All", ...all];
  }, [items]);
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || [])
      .filter((i) => (category === "All" ? true : i.category === category))
      .filter((i) =>
        q.length
          ? i.title.toLowerCase().includes(q) ||
            (i.desc || "").toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, query, category]);

  return (
    <section style={mtStyle} className={mtClass}>
      {title && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            {title}
          </h2>
          {showToolbar && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400" />{" "}
                {filtered.length} tools
              </span>
            </div>
          )}
        </div>
      )}

      {showToolbar && (
        <div className="mb-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/60"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/60"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
            </div>

            {(category !== "All" || query) && (
              <button
                onClick={() => {
                  setCategory("All");
                  setQuery("");
                }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="grid place-items-center h-40 rounded-2xl border border-dashed border-gray-200 text-center">
          <div>
            <p className="text-sm font-medium text-gray-800">No tools found</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Try clearing filters or changing your search.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 items-stretch">
          {filtered.map(({ title, desc, icon, to, color }) => (
            <div key={to} className="h-full">
              <ToolCard
                title={title}
                desc={desc}
                icon={icon}
                to={to}
                color={color || "bg-black"}
                padding={cardPadding}
                className="h-full"
                descLines={2}
                minHeight={152}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
