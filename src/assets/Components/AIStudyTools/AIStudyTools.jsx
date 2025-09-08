// src/assets/Components/AIStudyTools/AIStudyTools.jsx
import { BookOpen, GitBranch, Network, Brain, Square } from "lucide-react";
import ToolCard from "../ToolsComponents/ToolCard/ToolCard";

const defaultTools = [
  {
    title: "AI Summarizer",
    desc: "Get concise summaries of your study materials",
    icon: BookOpen,
    to: "/dashboard/tools/summarizer",
  },
  {
    title: "Mind Maps",
    desc: "Visualize concepts and their relationships",
    icon: GitBranch,
    to: "/dashboard/tools/mind-maps",
  },
  {
    title: "Knowledge Graph",
    desc: "Explore interconnected topics and ideas",
    icon: Network,
    to: "/dashboard/tools/knowledge-graph",
  },
  {
    title: "Quiz Generator",
    desc: "Create practice tests from your materials",
    icon: Brain,
    to: "/dashboard/tools/quiz-generator",
  },
  {
    title: "Flashcards",
    desc: "Create interactive flashcards for recall",
    icon: Square,
    to: "/dashboard/tools/flashcards",
  },
];

export default function AIStudyTools({
  mt = 0,
  cardPadding = "p-6",
  title = "",
  items = defaultTools,
}) {
  const mtStyle = typeof mt === "number" ? { marginTop: `${mt}px` } : undefined;
  const mtClass = typeof mt === "string" ? mt : "";

  return (
    <section style={mtStyle} className={mtClass}>
      {title && (
        <h2 className="mb-6 text-2xl font-serif font-bold text-gray-900">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map(({ title, desc, icon, to }) => (
          <ToolCard
            key={to}
            title={title}
            desc={desc}
            icon={icon}
            to={to}
            color="bg-blue-500"
            padding={cardPadding}
          />
        ))}
      </div>
    </section>
  );
}
