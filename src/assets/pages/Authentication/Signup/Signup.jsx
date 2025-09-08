import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="student@university.edu"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
          required
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-semibold">
          Confirm Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
          required
        />
      </div>
      <button
        type="submit"
        className="mt-2 h-11 w-full rounded-xl border border-black bg-black text-sm font-semibold text-white hover:opacity-90"
      >
        Create Account
      </button>
    </form>
  );
}
