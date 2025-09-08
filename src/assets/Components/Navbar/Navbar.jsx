import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext"; 

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout(); 
      toast.success("Signed out successfully.");
      navigate("/signIn", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <nav className="w-full shadow-sm bg-white">
      <div className="flex items-center justify-between px-7 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
            <Brain className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold font-serif text-gray-900">
            Revisily
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-sm text-slate-600">
              {user.displayName || user.email}
            </span>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {authLoading ? "Signing out..." : "Sign Out"}
            </button>
          ) : (
            <Link
              to="/signIn"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
