import React, { useMemo, useState } from "react";
import { FileText, RefreshCw, Download } from "lucide-react";
import { Link } from "react-router-dom";
import {
  IconButton,
  ToolPanel,
  Legend,
  LoadingOverlay,
  ToolSidebar,
} from "@/assets/Components";
import { QuizPreview } from "../../../Components";

const MATERIALS = [
  { id: "psy", name: "Introduction to Psychology.pdf", size: "2.4 MB" },
  { id: "bio", name: "Biology Chapter 5 Notes.docx", size: "1.1 MB" },
];

const BRAND = {
  main: "#3B82F6",
  tagMCQ: "text-sky-600",
  tagTF: "text-blue-600",
  tagShort: "text-cyan-600",
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const BANK = {
  psy: {
    topics: [
      "Cognition",
      "Learning",
      "Memory",
      "Perception",
      "Attention",
      "Behavior",
      "Development",
      "Mental Health",
      "Social Influence",
    ],
    facts: [
      { q: "Classical conditioning was pioneered by Pavlov.", tf: true },
      { q: "Working memory has unlimited capacity.", tf: false },
      { q: "Reinforcement increases the likelihood of a behavior.", tf: true },
      { q: "Top-down processing ignores prior knowledge.", tf: false },
      { q: "Schemas help organize knowledge in memory.", tf: true },
    ],
  },
  bio: {
    topics: [
      "Genetics",
      "Cell Biology",
      "Ecology",
      "Evolution",
      "DNA",
      "Organelles",
      "Metabolism",
      "Ecosystems",
      "Adaptation",
    ],
    facts: [
      { q: "DNA is found in the nucleus of eukaryotic cells.", tf: true },
      { q: "Photosynthesis occurs in mitochondria.", tf: false },
      { q: "Natural selection drives evolutionary change.", tf: true },
      { q: "Ribosomes are responsible for lipid synthesis.", tf: false },
      { q: "Organelles are membrane-bound structures.", tf: true },
    ],
  },
};

function makeMCQ(materialId, difficulty) {
  const topics = BANK[materialId]?.topics || BANK.psy.topics;
  const t = pick(topics);
  const stem =
    difficulty === "easy"
      ? `Which statement best describes ${t}?`
      : difficulty === "hard"
      ? `Which of the following is most accurate about ${t} in contemporary research?`
      : `What is a key characteristic of ${t}?`;
  const correct = `The most appropriate description of ${t}`;
  const distractors = [
    `An unrelated aspect of ${pick(topics)}`,
    `A historical misconception about ${t}`,
    `A partial detail that ignores context`,
  ];
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return {
    type: "mcq",
    question: stem,
    options,
    answerIndex: options.indexOf(correct),
  };
}
function makeTF(materialId, difficulty) {
  const facts = BANK[materialId]?.facts || BANK.psy.facts;
  const f = pick(facts);
  const twist =
    difficulty === "hard" && Math.random() < 0.3
      ? { q: f.q.replace(/\.$/, " under all conditions."), tf: false }
      : f;
  return { type: "tf", statement: twist.q, answer: twist.tf };
}
function makeShort(materialId, difficulty) {
  const topics = BANK[materialId]?.topics || BANK.psy.topics;
  const t = pick(topics);
  const prompt =
    difficulty === "easy"
      ? `Define ${t} in your own words.`
      : difficulty === "hard"
      ? `Critically evaluate two competing perspectives on ${t}.`
      : `Explain how ${t} relates to another core concept in this material.`;
  return {
    type: "short",
    prompt,
    sampleAnswer:
      difficulty === "easy"
        ? `A concise definition of ${t}.`
        : difficulty === "hard"
        ? `Compare arguments and decide which is stronger.`
        : `Describe ${t} and link it to a related idea.`,
  };
}
function generateQuestions({ materialId, type, difficulty, count }) {
  const q = [];
  for (let i = 0; i < count; i++) {
    if (type === "mcq") q.push(makeMCQ(materialId, difficulty));
    else if (type === "tf") q.push(makeTF(materialId, difficulty));
    else q.push(makeShort(materialId, difficulty));
  }
  return q;
}

export default function QuizGeneratorPage() {
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [type, setType] = useState("mcq");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);

  const [pendingType, setPendingType] = useState("mcq");
  const [pendingDifficulty, setPendingDifficulty] = useState("medium");
  const [pendingCount, setPendingCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const layoutOptions = useMemo(
    () => [
      { id: "easy", title: "Easy", desc: "Beginner-friendly" },
      { id: "medium", title: "Medium", desc: "Balanced" },
      { id: "hard", title: "Hard", desc: "Challenging" },
    ],
    []
  );
  const typeOptions = useMemo(
    () => [
      { id: "mcq", title: "Multiple Choice" },
      { id: "tf", title: "True / False" },
      { id: "short", title: "Short Answer" },
    ],
    []
  );

  const hasUnapplied =
    pendingType !== type ||
    pendingDifficulty !== difficulty ||
    pendingCount !== count;

  const runGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const generated = generateQuestions({
      materialId: material.id,
      type: pendingType,
      difficulty: pendingDifficulty,
      count: pendingCount,
    });
    setType(pendingType);
    setDifficulty(pendingDifficulty);
    setCount(pendingCount);
    setQuiz(generated);
    setLoading(false);
  };

  const onExportJSON = () => {
    if (!quiz?.length) return;
    const data = {
      material: material.name,
      type,
      difficulty,
      count: quiz.length,
      questions: quiz,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_${material.id}_${type}_${difficulty}_${quiz.length}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      {/* LEFT: ToolSidebar */}
      <div className="space-y-4">
        <ToolSidebar
          loading={loading}
          onGenerate={runGenerate}
          generateLabel="Generate Quiz"
          materials={MATERIALS.map((m) => ({ ...m, icon: FileText }))}
          selectedMaterialId={material.id}
          onSelectMaterial={(id) =>
            setMaterial(MATERIALS.find((m) => m.id === id))
          }
          layouts={layoutOptions}
          selectedLayoutId={pendingDifficulty}
          onSelectLayout={setPendingDifficulty}
          filters={typeOptions}
          selectedFilterId={pendingType}
          onSelectFilter={setPendingType}
          countsNote={{ visible: quiz?.length || 0, total: pendingCount }}
          showUnapplied={hasUnapplied}
          titles={{
            materials: "Select Material",
            materialsSub: "Choose a document for quiz generation",
            layouts: "Difficulty Level",
            layoutsSub: "Pick how challenging the quiz is",
            filters: "Question Types",
            filtersSub: "Choose one type",
          }}
        />

        {/* Number of Questions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="text-lg font-serif font-semibold text-slate-900">
            Quiz Settings
          </h4>
          <p className="mt-1 text-sm text-slate-600">Number of Questions</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setPendingCount(n)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  pendingCount === n
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: ToolPanel + Preview فقط */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title="Quiz Generator"
          subtitle={
            quiz?.length
              ? `Generated: ${
                  quiz.length
                } • Type: ${type.toUpperCase()} • Difficulty: ${difficulty}`
              : "Select a material and configure settings to generate a quiz"
          }
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
                onClick={() => quiz && runGenerate()}
                disabled={!quiz || loading}
              >
                <RefreshCw className="h-4 w-4" />
              </IconButton>
              <IconButton
                title="Export JSON"
                onClick={onExportJSON}
                disabled={!quiz || loading}
              >
                <Download className="h-4 w-4" />
              </IconButton>
            </>
          }
        >
          <div className="px-4 pt-3">
            <Legend
              items={[
                { label: "MCQ", color: "#0EA5E9" },
                { label: "True/False", color: "#2563EB" },
                { label: "Short Answer", color: "#06B6D4" },
              ]}
            />
          </div>

          <LoadingOverlay show={loading} text="Generating your quiz…" />

          <div className="p-6 min-h-[420px] bg-slate-50">
            {quiz?.length ? (
              <QuizPreview
                quiz={quiz}
                brand={BRAND}
                browse
                difficulty={difficulty}
              />
            ) : (
              <div className="grid place-items-center h-[420px]">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-xl border border-slate-300 grid place-items-center text-slate-400">
                    ?
                  </div>
                  <h4 className="mt-4 text-slate-800 font-semibold">
                    Ready to Quiz
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Configure your settings and click generate to create a quiz
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Type: {pendingType} • Difficulty: {pendingDifficulty} •
                    Questions: {pendingCount}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ToolPanel>
      </section>
    </div>
  );
}
