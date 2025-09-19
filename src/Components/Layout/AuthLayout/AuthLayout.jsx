import {
  Outlet,
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { Brain } from "lucide-react";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const isSignIn = pathname.endsWith("/signIn") || pathname === "/signIn";
    const isSignUp = pathname.endsWith("/signUp") || pathname === "/signUp";
    if (!isSignIn && !isSignUp) {
      navigate("/signIn", { replace: true });
    }
  }, [pathname, navigate]);

  const tabClass = ({ isActive }) =>
    [
      "w-1/2 rounded-xl px-4 py-2 text-center text-sm font-semibold transition",
      isActive
        ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
        : "text-slate-600 hover:text-slate-900",
    ].join(" ");

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-50 to-white">
      <header className="mx-auto max-w-5xl px-4 pt-14 pb-8 text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Brain className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-gray-900">
            Revisily
          </h1>
        </Link>
        <p className="mt-2 text-sm text-slate-500">
          Transform your study materials with AI-powered tools
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <h2 className="mb-1 text-center text-2xl font-bold font-serif text-gray-900">
            Welcome Back
          </h2>
          <p className="mb-5 text-center text-sm text-slate-500">
            Sign in to access your study materials and AI tools
          </p>

          <div className="mb-5">
            <div className="flex rounded-xl bg-[#f9f9f9] p-1">
              <NavLink to="/signIn" end className={tabClass}>
                Sign In
              </NavLink>
              <NavLink to="/signUp" end className={tabClass}>
                Sign Up
              </NavLink>
            </div>
          </div>

          <Outlet />
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Revisily
      </footer>
    </div>
  );
}
