import { Outlet, Link, useLocation } from "react-router-dom";
import { ToolHeader } from "../..";

const titles = {
  summarizer: "AI Summarizer",
  "mind-maps": "Mind Maps",
  "knowledge-graph": "Knowledge Graph",
  "quiz-generator": "Quiz Generator",
  flashcards: "Flashcards",
};
export default function ToolsLayout() {
  const { pathname } = useLocation();
  const onList = pathname.endsWith("/tools") || pathname.endsWith("/tools/");
  const toolKey = pathname.split("/").pop();
  const dynamicTitle = titles[toolKey] || "AI-Powered Study Tools";

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <ToolHeader
        title={dynamicTitle}
        subtitle="Transform your materials with intelligent study aids"
        right={
          !onList && (
            <Link
              to="/dashboard/tools"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to Tools
            </Link>
          )
        }
      />
      <Outlet />
    </div>
  );
}
