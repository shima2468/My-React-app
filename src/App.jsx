import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth, { RequireGuest } from "@/guards/RequireAuth";
import { AuthLayout, DashboardLayout, ToolsLayout } from "./assets/Components";

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

// Router
const router = createBrowserRouter([
  // ------- Public (guest-only) -------
  {
    element: <RequireGuest />,
    children: [
      {
        path: "/",
        element: <AuthLayout />,
        children: [
          { index: true, element: <SignIn /> },
          { path: "signIn", element: <SignIn /> },
          { path: "signUp", element: <SignUp /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
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
    ],
  },

  // ------- Fallback -------
  { path: "*", element: <Navigate to="/signIn" replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        closeOnClick
        pauseOnHover={false}
        newestOnTop
        theme="colored"
      />
    </AuthProvider>
  );
}
