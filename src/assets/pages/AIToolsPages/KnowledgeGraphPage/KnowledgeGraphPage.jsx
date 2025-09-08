// src/assets/pages/KnowledgeGraphPage/KnowledgeGraphPage.jsx
import React, { useMemo, useRef, useState } from "react";
import { FileText, ZoomIn, ZoomOut, RefreshCw, Maximize2 } from "lucide-react";

import {
  IconButton,
  ToolPanel,
  Legend,
  LoadingOverlay,
  ToolSidebar,
} from "@/assets/Components";

import GraphCanvas from "@/assets/Components/ToolsComponents/Graph/GraphCanvas.jsx";

const SIZE = { w: 950, h: 460 };

const COLORS = {
  concept: "#06B6D4",
  entity: "#F59E0B",
  relation: "#EF4444",
  root: "#3B82F6",
};

const MATERIALS = [
  { id: "psy", name: "Introduction to Psychology.pdf", size: "2.4 MB" },
  { id: "bio", name: "Biology Chapter 5 Notes.docx", size: "1.1 MB" },
];

export default function KnowledgeGraphPage() {
  // ---------- State ----------
  const [material, setMaterial] = useState(MATERIALS[0]);

  const [layout, setLayout] = useState("hier"); // المطبّق
  const [filter, setFilter] = useState("All");

  const [pendingLayout, setPendingLayout] = useState("hier"); // المختار بالسايدبار
  const [pendingFilter, setPendingFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [hasGraph, setHasGraph] = useState(false); // لإظهار البلايسهولدر قبل Generate

  const canvasRef = useRef(null);

  const layoutOptions = useMemo(
    () => [
      {
        id: "force",
        title: "Force-Directed",
        desc: "Dynamic layout with natural clustering",
      },
      {
        id: "circular",
        title: "Circular",
        desc: "Nodes arranged in circular pattern",
      },
      {
        id: "hier",
        title: "Hierarchical",
        desc: "Layered structure showing relationships",
      },
    ],
    []
  );

  const [counts, setCounts] = useState({
    All: 0,
    Concepts: 0,
    Entities: 0,
    Relationships: 0,
  });
  const [visibleCount, setVisibleCount] = useState(0);

  const canGenerate = !!material && !loading;
  const hasUnapplied = pendingLayout !== layout || pendingFilter !== filter;

  const runGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLayout(pendingLayout);
    setFilter(pendingFilter);
    setHasGraph(true);
    canvasRef.current?.regenerate?.({
      materialId: material.id,
      layout: pendingLayout,
      filter: pendingFilter,
    });
    setLoading(false);
  };

  const zoomIn = () => canvasRef.current?.zoomIn?.();
  const zoomOut = () => canvasRef.current?.zoomOut?.();
  const resetView = () => canvasRef.current?.resetView?.();
  const toggleFullscreen = () => canvasRef.current?.toggleFullscreen?.();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      {/* LEFT: Sidebar */}
      <ToolSidebar
        loading={loading}
        onGenerate={runGenerate}
        generateLabel="Generate Knowledge Graph"
        materials={MATERIALS.map((m) => ({ ...m, icon: FileText }))}
        selectedMaterialId={material.id}
        onSelectMaterial={(id) =>
          setMaterial(MATERIALS.find((m) => m.id === id))
        }
        layouts={layoutOptions}
        selectedLayoutId={pendingLayout}
        onSelectLayout={setPendingLayout}
        filters={[
          { id: "All", title: "All", count: counts.All },
          { id: "Concepts", title: "Concept", count: counts.Concepts },
          { id: "Entities", title: "Entity", count: counts.Entities },
          {
            id: "Relationships",
            title: "Relationship",
            count: counts.Relationships,
          },
        ]}
        selectedFilterId={pendingFilter}
        onSelectFilter={setPendingFilter}
        countsNote={{ visible: visibleCount, total: counts.All }}
        showUnapplied={hasUnapplied}
        generateDisabled={!canGenerate}
      />
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title="Knowledge Graph"
          subtitle={
            hasGraph
              ? `Interactive ${
                  layout === "force"
                    ? "force"
                    : layout === "circular"
                    ? "circular"
                    : "hierarchical"
                } knowledge graph`
              : "Select a material, layout and filter, then click generate"
          }
          actions={
            <>
              {hasGraph && (
                <>
                  <IconButton
                    title="Zoom in"
                    onClick={zoomIn}
                    disabled={loading}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Zoom out"
                    onClick={zoomOut}
                    disabled={loading}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Reset view"
                    onClick={resetView}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Fullscreen"
                    onClick={toggleFullscreen}
                    disabled={loading}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </IconButton>
                </>
              )}
            </>
          }
        >
          <div className="relative min-h-[360px] p-4">
            <LoadingOverlay
              show={loading}
              text="Generating your knowledge graph…"
            />

            {!hasGraph && !loading && (
              <div className="h-[320px] grid place-items-center text-center text-slate-500">
                <div>
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg border border-dashed border-slate-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Ready to Generate</p>
                  <p className="mt-0.5 text-xs">
                    Select a material, layout and filter, then click generate
                  </p>
                </div>
              </div>
            )}

            {hasGraph && !loading && (
              <div className="mt-1">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] text-slate-700">
                    {layout} layout
                    <span className="text-slate-400">•</span>
                    {filter} filter
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Generated just now</span>
                  </span>
                </div>

                {/* الكارد الحاوي للغراف — relative لتثبيت الليجند بداخله */}
                <div className="relative bg-slate-50 rounded-xl border border-slate-200">
                  {/* ✅ Legend داخل الكارد وأسفله */}
                  <Legend
                    className="absolute left-4 bottom-4 z-10"
                    items={[
                      { label: "Concepts", color: COLORS.concept },
                      { label: "Entities", color: COLORS.entity },
                      { label: "Relationships", color: COLORS.relation },
                    ]}
                  />

                  <div
                    style={{ height: SIZE.h }}
                    className="rounded-xl overflow-hidden"
                  >
                    <GraphCanvas
                      ref={canvasRef}
                      size={SIZE}
                      colors={COLORS}
                      materialId={material.id}
                      layout={layout}
                      filter={filter}
                      onCounts={(c) => setCounts(c)}
                      onVisibleCount={(n) => setVisibleCount(n)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ToolPanel>
      </section>
    </div>
  );
}
