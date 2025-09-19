import React from "react"; 

export default function FlashcardsGeneratePanel({
  materials = [],
  materialId,
  onMaterial,
  difficulty,
  onDifficulty,
  type,
  onType,
  count,
  onCount,
  onGenerate,
}) {
  return (
    <div className="space-y-12">
      {/* Select Material */}
      <div>
        <h3 className="text-lg font-serif font-semibold text-slate-900">
          Select Study Material
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Choose a file to extract flashcards
        </p>
        <select
          value={materialId}
          onChange={(e) => onMaterial(e.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
        >
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Card Type + Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Type */}
        <div>
          <h4 className="text-base font-semibold text-slate-800">Card Type</h4>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                checked={type === "definition"}
                onChange={() => onType("definition")}
              />
              <span className="text-sm">
                Definition Cards <span className="text-slate-500">Term → Definition</span>
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                checked={type === "qa"}
                onChange={() => onType("qa")}
              />
              <span className="text-sm">
                Q&A Cards <span className="text-slate-500">Question → Answer</span>
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                checked={type === "concept"}
                onChange={() => onType("concept")}
              />
              <span className="text-sm">
                Concept Cards <span className="text-slate-500">Concept → Explanation</span>
              </span>
            </label>
          </div>
        </div>

        {/* Difficulty + Count */}
        <div>
          <h4 className="text-base font-semibold text-slate-800">Difficulty & Count</h4>
          <div className="mt-4 flex flex-wrap gap-3">
            {["easy", "medium", "hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => onDifficulty(lvl)}
                className={`min-w-[100px] rounded-full px-6 py-2 text-sm border transition ${
                  difficulty === lvl
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {lvl[0].toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="text-sm text-slate-700">
              Number of Cards: {count}
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={count}
              onChange={(e) => onCount(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div>
        <button
          onClick={onGenerate}
          className="w-full rounded-xl bg-blue-500 hover:bg-blue-700 text-white py-3 font-medium"
        >
          Generate Flashcards
        </button>
      </div>
    </div>
  );
}
