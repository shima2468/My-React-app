import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
