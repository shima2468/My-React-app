// src/assets/Components/ToolsUI/Flashcards/FlashcardsStudyPage.jsx
import React, { useMemo, useState } from "react";
import { ArrowLeft, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_DECK = [
  { head: "Definition", type: "definition", front: "Photosynthesis", back: "The process by which plants convert light energy into chemical energy", diff: "Easy" },
  { head: "Definition", type: "definition", front: "Mitochondria", back: "Powerhouse of the cell; cellular respiration", diff: "Medium" },
  { head: "Q&A",       type: "qa",        front: "What is the primary function of chloroplasts?", back: "Photosynthesis (converting light energy to chemical energy)", diff: "Medium" },
  { head: "Definition", type: "definition", front: "DNA", back: "Deoxyribonucleic acid - carries genetic information", diff: "Easy" },
  { head: "Definition", type: "definition", front: "Osmosis", back: "Movement of water across a semipermeable membrane", diff: "Hard" },
];

const diffColor = (d) => d === "Easy" ? "text-emerald-700" : d === "Medium" ? "text-amber-700" : "text-rose-700";
const diffDot   = (d) => d === "Easy" ? "bg-emerald-500"  : d === "Medium" ? "bg-amber-500"  : "bg-rose-500";

export default function FlashcardsStudyPage({ deck: deckProp, onClose }) {

  const deck = useMemo(() => (deckProp?.length ? deckProp : FALLBACK_DECK), [deckProp]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);

  const remaining = deck.length - (correct + incorrect);
  const card = deck[idx];

  const reset = () => { setIdx(0); setRevealed(false); setCorrect(0); setIncorrect(0); };
  const mark  = (ok) => {
    if (ok) setCorrect((c) => c + 1);
    else    setIncorrect((c) => c + 1);
    setRevealed(false);
    setIdx((i) => Math.min(deck.length - 1, i + 1));
  };
  const next = () => { setIdx((i) => Math.min(deck.length - 1, i + 1)); setRevealed(false); };
  const prev = () => { setIdx((i) => Math.max(0, i - 1)); setRevealed(false); };

  return (
    <div className="space-y-6">
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onClose?.()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cards
          </button>
          <span className="text-sm text-slate-600">Card {idx + 1} of {deck.length}</span>
        </div>
        <button
          onClick={() => onClose?.()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Correct"   value={correct}   className="text-emerald-600" />
        <StatCard title="Incorrect" value={incorrect} className="text-rose-600" />
        <StatCard title="Remaining" value={remaining} className="text-indigo-600" />
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-10 text-center">
            <p className="text-xs font-semibold text-orange-700">
              {card.head} •{" "}
              <span className={`inline-flex items-center gap-2 ${diffColor(card.diff)}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${diffDot(card.diff)}`} />
                {card.diff}
              </span>
            </p>

            <h3 className="mt-4 text-2xl font-serif font-bold text-slate-900">
              {revealed ? card.back : card.front}
            </h3>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="mt-6 text-sm text-slate-600 underline underline-offset-4"
              >
                Click to reveal answer
              </button>
            ) : (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => mark(true)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm"
                >
                  I got it right
                </button>
                <button
                  onClick={() => mark(false)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-sm"
                >
                  I got it wrong
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={next}
              disabled={idx === deck.length - 1}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, className = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <div className={`text-3xl font-bold ${className}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-600">{title}</div>
    </div>
  );
}
