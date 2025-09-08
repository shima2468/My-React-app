// src/assets/Components/ToolsUI/Flashcards/FlashcardsList.jsx
import React from "react";

const tagColor = (t) =>
  t === "definition" ? "text-blue-600" : t === "qa" ? "text-indigo-600" : "text-teal-600";
const diffColor = (d) =>
  d === "Easy" ? "text-blue-700" : d === "Medium" ? "text-blue-700" : "text-rose-700";
const cardBorder = "border border-blue-200 bg-blue-50/40";

export default function FlashcardsList({
  deck = [],
  onStart,          
  onGenerateNew,   
}) {
  const hasDeck = Array.isArray(deck) && deck.length > 0;

  const handleStart = () => {
    if (typeof onStart === "function") onStart(deck);
  };

  if (!hasDeck) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900">No flashcards yet</h3>
        <p className="mt-1 text-sm text-slate-600">Generate flashcards to see them here.</p>
        {typeof onGenerateNew === "function" && (
          <button
            onClick={onGenerateNew}
            className="mt-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            Generate Flashcards
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Generated Flashcards</h3>
          <p className="text-slate-600">{deck.length} cards ready for study</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStart}
            disabled={!hasDeck}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              hasDeck
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
            aria-label="Start studying flashcards"
          >
            Start Studying
          </button>

          <button
            onClick={onGenerateNew}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Generate New
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deck.map((c, i) => (
          <div key={i} className={`rounded-2xl p-5 ${cardBorder}`}>
            <div className="flex items-start justify-between">
              <span className={`text-sm font-semibold ${tagColor(c.type)}`}>{c.head}</span>
              <span className={`text-sm ${diffColor(c.diff)}`}>{c.diff}</span>
            </div>
            <h4 className="mt-2 font-serif font-bold text-slate-900">{c.front}</h4>
            <p className="mt-2 text-slate-700">{c.back}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
