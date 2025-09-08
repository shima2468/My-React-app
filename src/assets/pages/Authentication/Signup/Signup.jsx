import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../../../utils/validation/validation";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  reload,
} from "firebase/auth";
import { auth, db } from "../../../../lib/firebase";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (values) => {
    try {
      // 1) إنشاء الحساب
      const { user } = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // 2) تحديث الاسم المعروض في Auth
      if (values.fullName?.trim()) {
        await updateProfile(user, { displayName: values.fullName.trim() });
        await reload(auth.currentUser);
      }

      // 3) حفظ بروفايل المستخدم في Firestore (users/{uid})
      try {
        await setDoc(doc(db, "users", user.uid), {
          ownerId: user.uid, // مهم مع قواعد Firestore
          displayName: values.fullName?.trim() || "",
          email: user.email,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        // الحساب انعمل، لكن فشل حفظ البروفايل — مننبّه فقط
        console.error(e);
        toast.warn("Account created, but saving profile failed. You can continue.");
      }

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const MAP = {
        "auth/email-already-in-use": "Email is already in use.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password is too weak (min 6 characters).",
        "auth/network-request-failed": "Network error. Please try again.",
      };
      const msg = MAP[err.code] || err.message;

      if (
        err.code === "auth/email-already-in-use" ||
        err.code === "auth/invalid-email"
      ) {
        setError("email", { type: "server", message: msg });
      } else if (err.code === "auth/weak-password") {
        setError("password", { type: "server", message: msg });
      }
      toast.error(msg);
    }
  };

  const inputCls = (hasErr) =>
    `h-11 w-full rounded-xl border bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none
     ${hasErr ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20"
              : "border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          className={inputCls(!!errors.fullName)}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="student@university.edu"
          className={inputCls(!!errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-semibold">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          className={inputCls(!!errors.confirm)}
          {...register("confirm")}
        />
        {errors.confirm && (
          <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-11 w-full rounded-xl border border-black bg-black text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
