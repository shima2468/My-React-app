import React, { useMemo, useState } from "react";
import { FileText, Download, RefreshCw } from "lucide-react";

import {
  ToolSidebar,
  ToolPanel,
  IconButton,
  LoadingOverlay,
} from "@/Components";

const DUMMY_MATERIALS = [
  { id: "psy101", name: "Introduction to Psychology.pdf", size: "2.4 MB" },
  { id: "bio5", name: "Biology Chapter 5 Notes.docx", size: "1.1 MB" },
];

const SUMMARY_TYPES = [
  {
    id: "brief",
    title: "Brief Summary",
    desc: "Concise overview of main points",
  },
  {
    id: "detailed",
    title: "Detailed Summary",
    desc: "Comprehensive analysis with sections",
  },
  {
    id: "bullets",
    title: "Bullet Points",
    desc: "Key points in easy-to-scan format",
  },
];

function buildSummary(material, type) {
  const base =
    type === "brief"
      ? `This document covers the fundamental concepts of Introduction. Key topics include theoretical frameworks, research methodologies, and practical applications. The material emphasizes evidence-based approaches and critical thinking.`
      : type === "detailed"
      ? `# Overview
This document provides a comprehensive exploration of core topics.

## Key Concepts
- Definitions and scope
- Historical background
- Modern applications

## Methods
- Research designs
- Data interpretation

## Takeaways
- Evidence-based thinking
- Practical relevance`
      : `• Core concepts and definitions
• Main models and frameworks
• Practical applications and examples
• Study tips and exam focus areas`;
  return base;
}

export default function SummarizerPage() {
  const [material, setMaterial] = useState(null);
  const [type, setType] = useState("brief");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const headerTitle = useMemo(() => "AI Summarizer", []);
  const canGenerate = !!material && !!type && !loading;

  const handleGenerate = async () => {
    if (!material || !type) return;
    setLoading(true);
    setSummary("");
    await new Promise((r) => setTimeout(r, 500));
    setSummary(buildSummary(material, type));
    setLoading(false);
  };

  const handleExport = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${material?.name || "summary"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <ToolSidebar
        loading={loading}
        generateLabel="Generate Summary"
        onGenerate={handleGenerate}
        materials={DUMMY_MATERIALS.map((m) => ({ ...m, icon: FileText }))}
        selectedMaterialId={material?.id || null}
        onSelectMaterial={(id) =>
          setMaterial(DUMMY_MATERIALS.find((m) => m.id === id) || null)
        }
        layouts={SUMMARY_TYPES}
        selectedLayoutId={type}
        onSelectLayout={setType}
        filters={[]}
        selectedFilterId={null}
        onSelectFilter={() => {}}
        countsNote={null}
        showUnapplied={false}
        generateDisabled={!canGenerate}
      />

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title={headerTitle}
          subtitle={
            summary
              ? `AI-generated ${
                  type === "brief"
                    ? "brief summary"
                    : type === "detailed"
                    ? "detailed summary"
                    : "bullet points"
                }`
              : "Select a material and summary type, then click generate"
          }
          actions={
            <>
              {summary && (
                <>
                  <IconButton title="Export" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Regenerate"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </IconButton>
                </>
              )}
            </>
          }
        >
          <div className="relative min-h-[360px] p-4">
            <LoadingOverlay show={loading} text="Generating your summary…" />

            {!summary && !loading && (
              <div className="h-[320px] grid place-items-center text-center text-slate-500">
                <div>
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg border border-dashed border-slate-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Ready to Summarize</p>
                  <p className="mt-0.5 text-xs">
                    Select a material and summary type, then click generate
                  </p>
                </div>
              </div>
            )}

            {!!summary && !loading && (
              <div className="mt-1">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-0.5 text-[11px] text-slate-700">
                    {type === "brief"
                      ? "brief summary"
                      : type === "detailed"
                      ? "detailed summary"
                      : "bullet points"}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Generated just now</span>
                  </span>
                </div>
                <article className="max-w-none">
                  <pre className="whitespace-pre-wrap text-[13px] leading-6 text-slate-800">
                    {summary}
                  </pre>
                </article>
              </div>
            )}
          </div>
        </ToolPanel>
      </section>
    </div>
  );
}
