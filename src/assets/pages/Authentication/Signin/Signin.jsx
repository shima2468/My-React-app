export default function SignIn() {
  return (
    <form className="space-y-4">
      {/* Email */}
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
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 h-11 w-full rounded-xl border border-black bg-black text-sm font-semibold text-white hover:opacity-90"
      >
        Sign In
      </button>
    </form>
  );
}
