import React, { useMemo, useRef, useState } from "react";
import { FileText, ZoomIn, ZoomOut, RefreshCw, Maximize2 } from "lucide-react";

import {
  IconButton,
  ToolPanel,
  LoadingOverlay,
  ToolSidebar,
} from "@/assets/Components";
import { MindMapCanvas } from "../../../Components";

const SIZE = { w: 980, h: 520 };

const MATERIALS = [
  { id: "psy", name: "Introduction to Psychology.pdf", size: "2.4 MB" },
  { id: "bio", name: "Biology Chapter 5 Notes.docx", size: "1.1 MB" },
];

export default function MindMapsPage() {
  // --------- State ---------
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [styleId, setStyleId] = useState("radial");
  const [pendingStyle, setPendingStyle] = useState("radial");

  const [loading, setLoading] = useState(false);
  const [hasMap, setHasMap] = useState(false);

  const canvasRef = useRef(null);

  const styleOptions = useMemo(
    () => [
      {
        id: "radial",
        title: "Radial",
        desc: "Central topic with branches radiating outward",
      },
      {
        id: "hierarchical",
        title: "Hierarchical",
        desc: "Tree-like structure with clear levels",
      },
      {
        id: "organic",
        title: "Organic",
        desc: "Natural, flowing connections between concepts",
      },
    ],
    []
  );

  const canGenerate = !!material && !!pendingStyle && !loading;

  const runGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setStyleId(pendingStyle);
    setHasMap(true);
    canvasRef.current?.regenerate?.({
      materialId: material.id,
      styleId: pendingStyle,
    });
    setLoading(false);
  };

  // أدوات التحكّم
  const zoomIn = () => canvasRef.current?.zoomIn?.();
  const zoomOut = () => canvasRef.current?.zoomOut?.();
  const resetView = () => canvasRef.current?.resetView?.();
  const toggleFullscreen = () => canvasRef.current?.toggleFullscreen?.();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <ToolSidebar
        loading={loading}
        onGenerate={runGenerate}
        generateLabel="Generate Mind Map"
        materials={MATERIALS.map((m) => ({ ...m, icon: FileText }))}
        selectedMaterialId={material.id}
        onSelectMaterial={(id) =>
          setMaterial(MATERIALS.find((m) => m.id === id))
        }
        layouts={styleOptions}
        selectedLayoutId={pendingStyle}
        onSelectLayout={setPendingStyle}
        filters={[]}
        selectedFilterId={null}
        onSelectFilter={() => {}}
        countsNote={null}
        showUnapplied={pendingStyle !== styleId}
        generateDisabled={!canGenerate}
      />

      {/* RIGHT: اللوحة + الكنترولز بنفس بنية ToolPanel */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title="Mind Map"
          subtitle={
            hasMap
              ? `Interactive ${styleId} mind map`
              : "Select a material and mind-map style, then click generate"
          }
          actions={
            <>
              {hasMap && (
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
          {/* نفس ارتفاع/مساحة المحتوى الموجودة بالسامرَيزر */}
          <div className="relative min-h-[360px] p-4">
            <LoadingOverlay show={loading} text="Generating your mind map…" />

            {!hasMap && !loading && (
              <div className="h-[320px] grid place-items-center text-center text-slate-500">
                <div>
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg border border-dashed border-slate-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Ready to Generate</p>
                  <p className="mt-0.5 text-xs">
                    Select a material and mind-map style, then click generate
                  </p>
                </div>
              </div>
            )}

            {hasMap && !loading && (
              <div className="mt-1">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] text-slate-700">
                    {styleId} mind map
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Generated just now</span>
                  </span>
                </div>

                <div className="relative bg-slate-50 rounded-xl border border-slate-200">
                  <div
                    style={{ height: SIZE.h }}
                    className="rounded-xl overflow-hidden"
                  >
                    <MindMapCanvas
                      ref={canvasRef}
                      size={SIZE}
                      materialId={material.id}
                      styleId={styleId}
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
