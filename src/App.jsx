import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  SignIn,
  SignUp,
  Overview,
  Materials,
  AITools,
  SummarizerPage,
  MindMapsPage,
  KnowledgeGraphPage,
  QuizGeneratorPage,
  FlashcardsPage,
} from "./assets/pages";
import { AuthLayout, DashboardLayout, ToolsLayout } from "./assets/Components";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <SignIn /> },
      { path: "signIn", element: <SignIn /> },
      { path: "signUp", element: <SignUp /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: "overview", element: <Overview /> }, 
      { path: "materials", element: <Materials /> },

      {
        path: "tools",
        children: [
          { index: true, element: <AITools /> },
          {
            element: <ToolsLayout />,
            children: [
              { path: "summarizer", element: <SummarizerPage /> },
              { path: "mind-maps", element: <MindMapsPage /> },
              { path: "knowledge-graph", element: <KnowledgeGraphPage /> },
              { path: "quiz-generator", element: <QuizGeneratorPage /> },
              { path: "flashcards", element: <FlashcardsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
