import React, { useState } from "react";
import { FileText, RefreshCw, Download } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ToolPanel,
  LoadingOverlay,
  IconButton,
  FlashcardsGeneratePanel,
  FlashcardsList,
  FlashcardsStudyPage,
} from "@/assets/Components";

const MATERIALS = [
  {
    id: "psy",
    name: "Introduction to Psychology.pdf",
    size: "2.4 MB",
    icon: FileText,
  },
  {
    id: "bio",
    name: "Biology Chapter 5 Notes.docx",
    size: "1.1 MB",
    icon: FileText,
  },
];

// مولد بسيط تجريبي
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const TERMS = {
  definition: [
    [
      "Photosynthesis",
      "The process by which plants convert light energy into chemical energy",
    ],
    [
      "Mitochondria",
      "The powerhouse of the cell, responsible for cellular respiration",
    ],
    ["DNA", "Deoxyribonucleic acid — carries genetic information"],
    ["Enzyme", "A protein that catalyzes biochemical reactions"],
    ["Osmosis", "Movement of water across a semipermeable membrane"],
  ],
  qa: [
    [
      "What is homeostasis?",
      "The maintenance of a stable internal environment",
    ],
    ["Who proposed the theory of classical conditioning?", "Ivan Pavlov"],
  ],
  concept: [
    [
      "Neuroplasticity",
      "The brain's ability to reorganize by forming new neural connections",
    ],
    ["Entropy", "Measure of disorder in a system"],
  ],
};

function fakeGenerate({ count, type, difficulty }) {
  const pool = TERMS[type] || TERMS.definition;
  return Array.from({ length: count }).map(() => {
    const [front, back] = pick(pool);
    return {
      head:
        type === "qa" ? "Q&A" : type === "concept" ? "Concept" : "Definition",
      type,
      front,
      back,
      diff: difficulty[0].toUpperCase() + difficulty.slice(1),
    };
  });
}

export default function FlashcardsPage() {
  // ----------------- State -----------------
  const [materialId, setMaterialId] = useState(MATERIALS[0].id);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("definition");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const [deck, setDeck] = useState([]);
  const [view, setView] = useState("form"); // "form" | "list" | "study"

  // ----------------- Actions -----------------
  const runGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const generated = fakeGenerate({ count, type, difficulty });
    setDeck(generated);
    setView("list");
    setLoading(false);
  };

  const exportJSON = () => {
    if (!deck.length) return;
    const blob = new Blob(
      [JSON.stringify({ deck, difficulty, type }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashcards_${type}_${difficulty}_${deck.length}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----------------- UI -----------------
  return (
    <div className="grid grid-cols-1 gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title="Flashcards Generator"
          subtitle="Create interactive flashcards for active recall and spaced repetition"
          actions={
            <>
              <Link
                to="/dashboard/tools"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Back to Tools
              </Link>

              <IconButton
                title="Regenerate"
                onClick={() => deck.length && runGenerate()}
                disabled={!deck.length || loading}
              >
                <RefreshCw className="h-4 w-4" />
              </IconButton>
              <IconButton
                title="Export JSON"
                onClick={exportJSON}
                disabled={!deck.length || loading}
              >
                <Download className="h-4 w-4" />
              </IconButton>
            </>
          }
        >
          <LoadingOverlay show={loading} text="Generating your flashcards…" />

          <div className="p-6">
            {/* FORM */}
            {view === "form" && (
              <FlashcardsGeneratePanel
                materials={MATERIALS}
                materialId={materialId}
                onMaterial={setMaterialId}
                difficulty={difficulty}
                onDifficulty={setDifficulty}
                type={type}
                onType={setType}
                count={count}
                onCount={setCount}
                onGenerate={runGenerate}
              />
            )}

            {/* LIST */}
            {view === "list" && (
              <FlashcardsList
                deck={deck}
                onStart={() => setView("study")}
                onGenerateNew={() => setView("form")}
              />
            )}

            {/* STUDY */}
            {view === "study" && (
              <FlashcardsStudyPage
                deck={deck}
                onClose={() => setView("list")}
              />
            )}
          </div>
        </ToolPanel>
      </section>
    </div>
  );
}
