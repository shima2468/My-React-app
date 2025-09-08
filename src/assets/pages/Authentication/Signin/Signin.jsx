import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-toastify";

export default function SignIn() {
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (v) => {
    const e = {};
    const email = v.email.trim();
    if (!email) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email.";

    if (!v.password) e.password = "Password is required.";
    return e;
  };

  const onChange = (name) => (e) => {
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // طبّعي الإيميل قبل الإرسال
      const email = values.email.trim().toLowerCase();

      await signInWithEmailAndPassword(auth, email, values.password);

      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const COMMON_MSG = "Email or password is incorrect.";

      const MAP = {
        "auth/invalid-credential": COMMON_MSG,
        "auth/wrong-password": COMMON_MSG,
        "auth/user-not-found": COMMON_MSG,
        "auth/invalid-email": "Enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please try again.",
      };

      const msg = MAP[err?.code] || COMMON_MSG;

      toast.error(msg);
      if (err?.code === "auth/invalid-email") {
        setErrors((p) => ({ ...p, email: msg }));
      } else if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        setErrors((p) => ({ ...p, password: msg }));
      } else {
        setErrors((p) => ({ ...p, email: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasErr) =>
    `h-11 w-full rounded-xl border bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none
     ${
       hasErr
         ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20"
         : "border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
     }`;

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="student@university.edu"
          className={inputCls(!!errors.email)}
          value={values.email}
          onChange={onChange("email")}
        />
        {submitted && errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={inputCls(!!errors.password)}
          value={values.password}
          onChange={onChange("password")}
        />
        {submitted && errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-11 w-full rounded-xl border border-black bg-black text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
